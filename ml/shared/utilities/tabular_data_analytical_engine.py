"""
SYNAPSE - Controlled Python Analytical & Spreadsheet Execution Engine
=====================================================================
Performs verified mathematical, statistical, and comparative calculations on
Excel (.xlsx, .xls) and CSV datasets without LLM hallucination or estimation.
"""

import io
import re
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd


class TabularDataAnalyzer:
    """
    Executes sandboxed data queries and statistical comparisons across sheets and tables.
    """

    @classmethod
    def analyze_dataset(
        cls,
        file_bytes: bytes,
        filename: str,
        user_query: str = "",
        sheet_name: Optional[str] = None
    ) -> Dict[str, Any]:
        ext = filename.split(".")[-1].lower() if "." in filename else "csv"
        stream = io.BytesIO(file_bytes)

        try:
            if ext in ["xlsx", "xls"]:
                excel_file = pd.ExcelFile(stream)
                target_sheet = sheet_name or excel_file.sheet_names[0]
                df = pd.read_excel(excel_file, sheet_name=target_sheet)
                all_sheets = excel_file.sheet_names
            else:
                df = pd.read_csv(stream)
                all_sheets = [filename]
                target_sheet = filename

            return cls.evaluate_dataframe(df, user_query, sheet_name=target_sheet, all_sheets=all_sheets)
        except Exception as e:
            return {
                "success": False,
                "error": f"Tabular analysis error: {str(e)}",
                "answer": f"Unable to analyze dataset {filename}: {str(e)}"
            }

    @classmethod
    def evaluate_dataframe(
        cls,
        df: pd.DataFrame,
        user_query: str = "",
        sheet_name: str = "Sheet1",
        all_sheets: List[str] = None
    ) -> Dict[str, Any]:
        if df.empty:
            return {
                "success": False,
                "error": "Dataset is empty.",
                "answer": "The selected sheet contains no data rows."
            }

        q_lower = user_query.lower()
        num_rows, num_cols = df.shape
        columns = df.columns.tolist()
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "string", "category"]).columns.tolist()

        result = {
            "success": True,
            "sheet": sheet_name,
            "allSheets": all_sheets or [sheet_name],
            "rowCount": num_rows,
            "colCount": num_cols,
            "columns": [str(c) for c in columns],
            "numericColumns": [str(c) for c in numeric_cols],
            "categoricalColumns": [str(c) for c in categorical_cols],
            "calculations": {},
            "answer": "",
            "summaryTable": "",
            "chartData": None
        }

        # 1. Compute Base Descriptive Statistics
        desc_stats = {}
        for col in numeric_cols:
            col_series = df[col].dropna()
            if not col_series.empty:
                desc_stats[col] = {
                    "sum": float(col_series.sum()),
                    "mean": float(col_series.mean()),
                    "median": float(col_series.median()),
                    "min": float(col_series.min()),
                    "max": float(col_series.max()),
                    "std": float(col_series.std()) if len(col_series) > 1 else 0.0
                }
        result["calculations"]["descriptive"] = desc_stats

        # 2. Answer-Specific Logic based on Query Intent
        answered = False

        # Intent: Highest / Maximum
        if any(w in q_lower for w in ["highest", "max", "maximum", "top", "greatest", "most"]):
            for col in numeric_cols:
                if col.lower() in q_lower or not answered:
                    max_idx = df[col].idxmax()
                    max_val = df.loc[max_idx, col]
                    id_label = ""
                    if categorical_cols:
                        id_label = str(df.loc[max_idx, categorical_cols[0]])

                    result["answer"] = (
                        f"**Highest {col}**: **{id_label}** with **{max_val:,.2f}** "
                        f"(Dataset Range: {desc_stats[col]['min']:,.2f} to {desc_stats[col]['max']:,.2f})."
                    )
                    answered = True
                    break

        # Intent: Lowest / Minimum
        elif any(w in q_lower for w in ["lowest", "min", "minimum", "least", "smallest"]):
            for col in numeric_cols:
                if col.lower() in q_lower or not answered:
                    min_idx = df[col].idxmin()
                    min_val = df.loc[min_idx, col]
                    id_label = ""
                    if categorical_cols:
                        id_label = str(df.loc[min_idx, categorical_cols[0]])

                    result["answer"] = (
                        f"**Lowest {col}**: **{id_label}** with **{min_val:,.2f}** "
                        f"(Average across all items: {desc_stats[col]['mean']:,.2f})."
                    )
                    answered = True
                    break

        # Intent: Compare two columns (e.g. Q1 and Q2)
        elif "compare" in q_lower and len(numeric_cols) >= 2:
            col1 = numeric_cols[0]
            col2 = numeric_cols[1]
            # Match columns mentioned in query if possible
            for c in numeric_cols:
                if c.lower() in q_lower:
                    col1 = c
                    break
            for c in numeric_cols:
                if c.lower() in q_lower and c != col1:
                    col2 = c
                    break

            sum1 = desc_stats[col1]["sum"]
            sum2 = desc_stats[col2]["sum"]
            diff = sum2 - sum1
            pct_change = (diff / sum1 * 100) if sum1 != 0 else 0

            comparison_rows = []
            for _, r in df.head(10).iterrows():
                label = str(r[categorical_cols[0]]) if categorical_cols else f"Row {_+1}"
                v1 = r[col1]
                v2 = r[col2]
                row_diff = v2 - v1
                comparison_rows.append(f"| {label} | {v1:,.2f} | {v2:,.2f} | {row_diff:+,.2f} |")

            result["summaryTable"] = (
                f"| Item / Category | {col1} | {col2} | Variance |\n"
                f"|---|---|---|---|\n" + "\n".join(comparison_rows)
            )

            result["answer"] = (
                f"### Comparative Analysis: {col1} vs. {col2}\n"
                f"* **Total {col1}**: **{sum1:,.2f}**\n"
                f"* **Total {col2}**: **{sum2:,.2f}**\n"
                f"* **Net Variance**: **{diff:+,.2f}** ({pct_change:+.2f}% change)\n\n"
                f"{result['summaryTable']}"
            )
            answered = True

        # Intent: Average / Mean / Sum / Total
        elif any(w in q_lower for w in ["average", "mean", "sum", "total"]):
            stat_lines = []
            for col in numeric_cols:
                st = desc_stats[col]
                stat_lines.append(f"* **{col}**: Total = **{st['sum']:,.2f}**, Average = **{st['mean']:,.2f}**, Median = **{st['median']:,.2f}**")
            result["answer"] = "### Statistical Totals & Averages:\n" + "\n".join(stat_lines)
            answered = True

        # Default overview if general question
        if not answered:
            stat_lines = []
            for col in numeric_cols[:5]:
                st = desc_stats[col]
                stat_lines.append(f"* **{col}**: Total = {st['sum']:,.2f} | Mean = {st['mean']:,.2f} | Max = {st['max']:,.2f} | Min = {st['min']:,.2f}")

            result["answer"] = (
                f"### Dataset Telemetry: `{sheet_name}`\n"
                f"Contains **{num_rows} records** and **{num_cols} columns**.\n\n"
                f"**Columns**: {', '.join([str(c) for c in columns])}\n\n"
                f"**Computed Numerical Aggregates**:\n" + "\n".join(stat_lines)
            )

        # Prepare Chart Telemetry
        if len(numeric_cols) >= 1 and categorical_cols:
            primary_cat = categorical_cols[0]
            primary_num = numeric_cols[0]
            chart_items = df.head(8)[[primary_cat, primary_num]].to_dict(orient="records")
            result["chartData"] = {
                "chartType": "BAR",
                "xField": str(primary_cat),
                "yField": str(primary_num),
                "data": chart_items
            }

        return result
