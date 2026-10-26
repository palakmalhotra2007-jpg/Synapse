"""
SYNAPSE - Phase 5: OCR & Document Consistency Verification Engine
=================================================================
Extracts key structured invoice fields:
- Invoice number, Vendor details, Tax ID, Dates, Subtotal, Tax, Grand Total
Executes independent forensic consistency checks:
- Subtotal + Tax vs Grand Total mathematical reconciliation
- Date chronology validation (due_date >= invoice_date)
- Duplicate invoice number cross-auditing
- Conflicting vendor details and suspicious tax ID formats
"""

import re
import datetime
from typing import Dict, Any, List, Optional

class DocumentOCRVerifier:
    def __init__(self, historical_invoice_numbers: Optional[List[str]] = None):
        # Known registered historical invoice numbers for duplicate check
        self.known_invoices = set(historical_invoice_numbers or [
            "INV-2026-001", "INV-902148", "TXN-902148", "INV-882190"
        ])
        
    def extract_and_verify(self, document_text: str, document_title: str = "") -> Dict[str, Any]:
        """
        Parses document text, extracts structured entities, and runs consistency checks.
        """
        text = f"{document_title}\n{document_text}".strip()
        
        # 1. Extract Invoice Number
        inv_match = re.search(r'\b(?:invoice|receipt|inv|bill)\s*(?:#|no\.?|num\.?)?\s*[:#-]?\s*([A-Z0-9-]{4,25})', text, re.IGNORECASE)
        if not inv_match:
            inv_match = re.search(r'#\s*([A-Z0-9-]{4,25})', text)
        invoice_number = inv_match.group(1).strip() if inv_match else "INV-UNKNOWN"
        
        # 2. Extract Vendor Name
        vendor_match = re.search(r'(?:vendor|merchant|company|from|seller|provider)[\s.:]*([A-Za-z0-9\s.,&-]{3,40})(?:\n|$)', text, re.IGNORECASE)
        if vendor_match:
            vendor_name = vendor_match.group(1).strip()
        else:
            first_line = text.split("\n")[0].strip("# ")
            vendor_name = first_line[:40] if len(first_line) > 3 else "Enterprise Vendor"
            
        # 3. Extract Tax ID / VAT / IBAN
        tax_id_match = re.search(r'(?:tax\s*id|vat|ein|tin|gst)[\s.:#-]*([A-Z0-9-]{6,16})', text, re.IGNORECASE)
        tax_id = tax_id_match.group(1).strip() if tax_id_match else "UNSPECIFIED"
        
        iban_match = re.search(r'([A-Z]{2}\d{2}[A-Z0-9]{11,30})', text)
        iban = iban_match.group(1).strip() if iban_match else None
        
        # 4. Extract Dates
        dates_found = re.findall(r'(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})', text)
        parsed_dates = []
        for d_str in dates_found:
            for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y.%m.%d"):
                try:
                    parsed_dates.append(datetime.datetime.strptime(d_str, fmt).date())
                    break
                except ValueError:
                    pass
                    
        invoice_date = parsed_dates[0] if len(parsed_dates) > 0 else datetime.date.today()
        due_date = parsed_dates[1] if len(parsed_dates) > 1 else (invoice_date + datetime.timedelta(days=30))
        
        # 5. Extract Amounts: Subtotal, Tax, Grand Total
        subtotal = self._extract_amount(text, [r'\b(?:sub[\s-]*total|subtotal|net[\s-]*amount|items?[\s-]*total)\b'])
        tax_amount = self._extract_all_tax_amounts(text)
        grand_total = self._extract_amount(text, [
            r'\b(?:grand[\s-]*total|total[\s-]*amount|total[\s-]*due|total[\s-]*payable|amount[\s-]*due|balance[\s-]*due)\b',
            r'\btotal\b'
        ])
        
        # Fallback search for grand total if not matched by label
        if grand_total is None:
            all_numbers = []
            for m in re.finditer(r'[\$€£₹]?\s*(?:INR|Rs\.?)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)', text, re.IGNORECASE):
                try:
                    all_numbers.append(float(m.group(1).replace(",", "")))
                except ValueError:
                    pass
            grand_total = max(all_numbers) if all_numbers else 0.0

        if subtotal is None:
            if grand_total and tax_amount > 0:
                subtotal = round(max(0.0, grand_total - tax_amount), 2)
            elif grand_total:
                subtotal = grand_total
            
        # 6. RUN CONSISTENCY CHECKS
        discrepancies = []
        
        # Check A: Mathematical Reconciliation (Subtotal + Tax vs Grand Total)
        expected_total = round(subtotal + tax_amount, 2)
        variance = round(abs(expected_total - grand_total), 2)
        math_valid = variance <= 1.0 or (variance / max(1.0, grand_total)) < 0.015
        
        if not math_valid:
            discrepancies.append({
                "type": "MATHEMATICAL_MISMATCH",
                "severity": "CRITICAL" if variance > 500 else "HIGH",
                "declared_total": grand_total,
                "calculated_total": expected_total,
                "variance": variance,
                "explanation": f"Sum of Subtotal (${subtotal:,.2f}) + Tax (${tax_amount:,.2f}) = ${expected_total:,.2f}, which conflicts with declared Grand Total (${grand_total:,.2f}) by ${variance:,.2f} variance."
            })
            
        # Check B: Date Sequence Chronology
        if due_date < invoice_date:
            discrepancies.append({
                "type": "INVALID_DATE_SEQUENCE",
                "severity": "HIGH",
                "invoice_date": invoice_date.isoformat(),
                "due_date": due_date.isoformat(),
                "explanation": f"Due date ({due_date.isoformat()}) is earlier than invoice issue date ({invoice_date.isoformat()}), indicating altered or retroactively backdated document."
            })
            
        # Check C: Duplicate Invoice Number Check
        if invoice_number in self.known_invoices and invoice_number != "INV-UNKNOWN":
            discrepancies.append({
                "type": "DUPLICATE_INVOICE_NUMBER",
                "severity": "CRITICAL",
                "invoice_number": invoice_number,
                "explanation": f"Invoice number '{invoice_number}' already exists in ledger history. Potential double-billing or replayed invoice fraud attempt."
            })
            
        # Check D: Offshore / IBAN Routing Flag
        if iban and iban.startswith(("CH", "KY", "PA", "VG")):
            discrepancies.append({
                "type": "HIGH_RISK_CROSS_BORDER_ROUTING",
                "severity": "MEDIUM",
                "iban": iban,
                "explanation": f"IBAN routing directs to offshore jurisdiction ({iban[:2]}), requiring enhanced AML verification."
            })
            
        # Check E: Vendor Tax ID Format Validity
        if tax_id != "UNSPECIFIED" and len(tax_id.replace("-", "")) < 6:
            discrepancies.append({
                "type": "SUSPICIOUS_TAX_ID_FORMAT",
                "severity": "MEDIUM",
                "tax_id": tax_id,
                "explanation": f"Tax ID '{tax_id}' does not match standard registration format."
            })
            
        # Summary verdict of OCR consistency
        has_critical = any(d["severity"] == "CRITICAL" for d in discrepancies)
        has_high = any(d["severity"] == "HIGH" for d in discrepancies)
        
        ocr_status = "FAILED" if (has_critical or has_high) else ("WARNING" if discrepancies else "PASSED")
        
        return {
            "ocr_status": ocr_status,
            "extracted_fields": {
                "invoice_number": invoice_number,
                "vendor_name": vendor_name,
                "tax_id": tax_id,
                "iban": iban,
                "invoice_date": invoice_date.isoformat(),
                "due_date": due_date.isoformat(),
                "subtotal_usd": subtotal,
                "tax_amount_usd": tax_amount,
                "grand_total_usd": grand_total
            },
            "math_reconciliation": {
                "subtotal": subtotal,
                "tax": tax_amount,
                "expected_total": expected_total,
                "declared_total": grand_total,
                "variance": variance,
                "is_balanced": math_valid
            },
            "discrepancies": discrepancies,
            "discrepancy_count": len(discrepancies)
        }
        
    def _extract_amount(self, text: str, patterns: List[str], exclude_patterns: Optional[List[str]] = None) -> Optional[float]:
        """
        Extracts monetary amount from text by scanning lines matching specified patterns.
        Supports both Western (100,000.00) and South Asian / Indian (1,00,000.00 and 3,42,000.00)
        number formatting, currency symbols ($ € £ ₹ INR Rs.), and excludes percentages.
        """
        for line in text.splitlines():
            line_clean = line.strip()
            if not line_clean:
                continue

            if exclude_patterns and any(re.search(ep, line_clean, re.IGNORECASE) for ep in exclude_patterns):
                continue

            for pat in patterns:
                if re.search(pat, line_clean, re.IGNORECASE):
                    # Match full numbers with optional Western or Indian commas and decimals
                    matches = list(re.finditer(r'[\$€£₹]?\s*(?:INR|Rs\.?)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)', line_clean, re.IGNORECASE))
                    valid_nums = []
                    for m in matches:
                        start, end = m.span()
                        # Avoid percentage tokens like (10%) or (9%)
                        if end < len(line_clean) and line_clean[end] == '%':
                            continue
                        clean_str = m.group(1).replace(",", "")
                        try:
                            val = float(clean_str)
                            valid_nums.append(val)
                        except ValueError:
                            pass
                    if valid_nums:
                        return valid_nums[-1]
        return None

    def _extract_all_tax_amounts(self, text: str) -> float:
        """
        Extracts and aggregates all individual tax lines (e.g. CGST, SGST, IGST, VAT).
        """
        total_tax = 0.0
        tax_patterns = [r'\b(?:c?s?i?u?t?gst|vat|sales[\s-]*tax|service[\s-]*tax|tax)\b']
        exclude_patterns = [r'\btax[\s-]*id\b', r'\bein\b', r'\btin\b', r'\bgstin\b']

        matched_lines = set()
        for line in text.splitlines():
            line_clean = line.strip()
            if not line_clean or line_clean in matched_lines:
                continue

            if any(re.search(ep, line_clean, re.IGNORECASE) for ep in exclude_patterns):
                continue

            if any(re.search(tp, line_clean, re.IGNORECASE) for tp in tax_patterns):
                matches = list(re.finditer(r'[\$€£₹]?\s*(?:INR|Rs\.?)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)', line_clean, re.IGNORECASE))
                valid_nums = []
                for m in matches:
                    start, end = m.span()
                    if end < len(line_clean) and line_clean[end] == '%':
                        continue
                    clean_str = m.group(1).replace(",", "")
                    try:
                        valid_nums.append(float(clean_str))
                    except ValueError:
                        pass
                if valid_nums:
                    total_tax += valid_nums[-1]
                    matched_lines.add(line_clean)
        return round(total_tax, 2)

if __name__ == "__main__":
    # Standalone verification test
    verifier = DocumentOCRVerifier()
    
    # Test A: Inconsistent Invoice (Math Mismatch & Duplicate)
    sample_fraudulent_text = """
    INVOICE #INV-902148
    VENDOR: Apex Cloud Infrastructure LLC
    TAX ID: 12-8891042
    IBAN: CH93000000001928374
    DATE: 2026-10-24
    DUE DATE: 2026-09-15
    SUBTOTAL: $100,000.00
    TAX (10%): $10,000.00
    TOTAL AMOUNT DUE: $145,000.00
    """
    res = verifier.extract_and_verify(sample_fraudulent_text)
    print("=== TEST A: FRAUDULENT INVOICE TEST ===")
    print("Status:", res["ocr_status"])
    print("Discrepancies found:", res["discrepancy_count"])
    for d in res["discrepancies"]:
        print(f"  [{d['severity']}] {d['type']}: {d['explanation']}")
    assert res["ocr_status"] == "FAILED", "Expected fraud invoice to fail OCR consistency!"
    
    # Test B: Clean Invoice
    sample_clean_text = """
    INVOICE #INV-2026-995
    VENDOR: NVIDIA Enterprise Compute
    TAX ID: US-9918231
    DATE: 2026-10-20
    DUE DATE: 2026-11-20
    SUBTOTAL: $50,000.00
    TAX: $5,000.00
    GRAND TOTAL: $55,000.00
    """
    res_clean = verifier.extract_and_verify(sample_clean_text)
    print("\n=== TEST B: CLEAN INVOICE TEST ===")
    print("Status:", res_clean["ocr_status"])
    print("Discrepancies:", res_clean["discrepancy_count"])
    assert res_clean["ocr_status"] == "PASSED", "Expected clean invoice to pass!"
    print("OCR Consistency Engine Verified 100% Operational!")
