# Implementation Plan: Mobile & Cross-Platform Responsive Design

## Project Context
- **Application**: Next.js 14 + React 18 + Tailwind CSS 3 with glassmorphism aesthetic
- **Current State**: Desktop-first design with fixed layouts, no mobile optimization
- **Goal**: Support mobile (iPhone/Android), tablet, Mac, and Windows responsive views
- **Constraints**: Preserve glassmorphism (backdrop-blur, bg-opacity), maintain Framer Motion animations, keep all business logic unchanged, 44x44px minimum touch targets on mobile

## Implementation Steps

### Phase 1: Global Foundations & Layout Components

- [ ] 1. **Add viewport meta tags and iOS safe-area support**
      - Add viewport meta tag with `width=device-width, initial-scale=1, maximum-scale=5` to `src/app/layout.tsx` in the `<head>` section
      - Add iOS-specific meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style=black-translucent`, `viewport-fit=cover`
      - Files: `src/app/layout.tsx`
      - Verify: Inspect source in browser, confirm meta tags present in `<head>`

- [ ] 2. **Add mobile-first CSS utilities and safe-area variables to globals.css**
      - Add CSS custom properties for safe-area insets: `--safe-area-inset-top: env(safe-area-inset-top, 0px);` (and bottom, left, right)
      - Add mobile touch utilities: `touch-action: manipulation` for buttons, `-webkit-tap-highlight-color: transparent`
      - Add `.touch-target` utility class: `min-height: 44px; min-width: 44px;`
      - Add mobile-friendly scrollbar styles (thin, semi-transparent)
      - Files: `src/app/globals.css`
      - Verify: Run `npm run build`, check compiled CSS includes these rules

- [ ] 3. **Verify Tailwind breakpoints are correctly configured**
      - Check `tailwind.config.js` has standard breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
      - No changes needed if already present; document current configuration
      - Files: `tailwind.config.js`
      - Verify: Read file, confirm breakpoints match mobile-first strategy

- [ ] 4. **Transform Sidebar to responsive hamburger menu on mobile**
      - Current state: Sidebar is always visible with collapse/expand toggle (`w-64` or `w-20` based on `isCollapsed`)
      - Changes:
        - Add `hidden md:flex` to hide Sidebar on mobile (<768px)
        - Create mobile overlay version: when hamburger clicked, Sidebar becomes fixed overlay with `fixed inset-y-0 left-0 z-50 w-64` and slide-in animation
        - Add backdrop div: `fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40` with onClick to close
        - Add state management: `const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)`
        - Close button in mobile overlay must be min 44x44px
        - Desktop collapse/expand toggle remains unchanged
      - Files: `src/components/layout/Sidebar.tsx`
      - Verify: Test at 375px width - Sidebar hidden, verify it slides in when opened

- [ ] 5. **Add hamburger menu trigger to Navbar and make it mobile-responsive**
      - Current state: Navbar displays team badge, notifications, user profile with dropdown; fixed height `h-16`
      - Changes:
        - Add hamburger menu button (Menu icon from lucide-react) on left side, visible only on mobile: `md:hidden`, positioned before team badge
        - Pass `isMobileMenuOpen` state from parent (AuthGuard) or create context/props to communicate with Sidebar
        - Hide user profile text on mobile: use `hidden md:flex` for name/role div, show only avatar on mobile
        - Reduce padding on mobile: `px-3 md:px-6`
        - Ensure notification button and user menu button are min 44x44px: add `min-h-11 min-w-11` or `p-2` classes
        - User dropdown and notification dropdown should not overflow screen on mobile
      - Files: `src/components/layout/Navbar.tsx`, `src/components/auth/AuthGuard.tsx` (for state coordination)
      - Verify: Test at 375px - hamburger visible, notifications and profile menu accessible and don't overflow

- [ ] 6. **Make GlobalSearchModal full-screen on mobile**
      - Current state: Modal positioned with `pt-16 sm:pt-20`, `max-w-2xl`, rounded corners
      - Changes:
        - On mobile: use `inset-0` instead of `pt-*`, `max-w-full md:max-w-2xl`, `rounded-none md:rounded-3xl`
        - Search input and quick shortcut buttons should remain accessible, may need to adjust font sizes or padding for mobile
        - Search results area: `max-h-[60vh]` on mobile may be too restrictive, consider `max-h-[calc(100vh-200px)]` on mobile
      - Files: `src/components/layout/GlobalSearchModal.tsx`
      - Verify: Test at 375px - modal is full-screen; test at 1024px - modal is centered with max-w-2xl

### Phase 2: Auth Components & Modals

- [ ] 7. **Make AuthPortal mobile-responsive**
      - Current state: Form card has `max-w-md`, `p-6 sm:p-8`, demo account buttons in `grid-cols-2`
      - Changes:
        - Adjust padding: `p-4 sm:p-6 md:p-8`
        - Demo account buttons grid: `grid-cols-1 sm:grid-cols-2` to stack on mobile
        - All input fields should have min-h-11 (or py-2.5) for adequate touch target
        - Sign in / Register tabs should remain easy to tap (already adequate size)
        - Face ID button and submit button should be full-width on mobile
      - Files: `src/components/auth/AuthPortal.tsx`
      - Verify: Test at 375px - form fits without horizontal scroll, buttons are tappable, demo cards stack

- [ ] 8. **Make FaceRecognitionModal mobile-responsive**
      - Current state: Modal maxWidth='lg', video viewport `h-[340px] sm:h-[380px]`, multiple action buttons in footer
      - Changes:
        - Video viewport: adjust height `h-[300px] sm:h-[340px] md:h-[380px]` for smaller mobile screens
        - Action button row at bottom should wrap on mobile: add `flex-wrap gap-2` to button container
        - 'Upload Photo', 'Reset Camera', 'Instant Scan', and confirm buttons should stack or wrap to avoid overflow
        - Telemetry/result banner text should use `text-xs` on mobile, readable font sizes
        - Ensure Close button (X) is 44x44px
      - Files: `src/components/auth/FaceRecognitionModal.tsx`
      - Verify: Test at 375px - video area fits, buttons wrap and are tappable, no horizontal overflow

- [ ] 9. **Make PasskeyModal mobile-responsive**
      - Current state: Modal maxWidth='md', buttons in footer
      - Changes:
        - Button row: ensure `flex-wrap` so 'Cancel' and 'Register Biometric Passkey' buttons wrap if needed on narrow screens
        - Long button text may need to be shortened on mobile or allow wrapping: 'Verify with Windows Hello / Touch ID' could wrap
        - Ensure all touch targets are adequate
      - Files: `src/components/auth/PasskeyModal.tsx`
      - Verify: Test at 375px - form fits, buttons are usable, text readable

### Phase 3: Character Components

- [ ] 10. **Make RiggedAnimeCharacter responsive**
       - Current state: Canvas rendering at fixed 558x1263 aspect ratio, container size not responsive
       - Changes:
         - Wrap canvas in responsive container with width/height classes: `w-24 h-52 sm:w-32 sm:h-64 md:w-40 md:h-80` (maintaining aspect ratio ~558/1263 = 0.44)
         - Add `object-contain` to canvas to maintain aspect ratio
         - Consider reducing canvas rendering resolution on mobile for performance: detect viewport width and scale canvas.width/height accordingly
         - Ensure character remains interactive (onClick, onMouseEnter) on mobile
       - Files: `src/components/character/RiggedAnimeCharacter.tsx`
       - Verify: Test at 375px - character scales down proportionally, remains interactive, no performance issues

- [ ] 11. **Make LiveCharacter responsive**
       - Current state: Uses RiggedAnimeCharacter, container classes `w-32 h-64 sm:w-36 sm:h-72`, speech bubble `max-w-xs`
       - Changes:
         - Speech bubble: on mobile use `max-w-[200px] sm:max-w-xs` to prevent overflow
         - Character container: verify dimensions work on mobile, adjust if needed to `w-28 h-56 sm:w-32 sm:h-64`
         - Minimize button and 'Speak' button should have adequate touch targets (already small, ensure min 44x44px for critical buttons)
         - Bottom positioning: ensure character doesn't obscure important content on mobile, adjust `bottom-2 right-2` if needed
       - Files: `src/components/character/LiveCharacter.tsx`
       - Verify: Test at 375px - character and speech bubble fit, buttons are tappable

- [ ] 12. **Make AICompanionCharacter responsive**
       - Current state: Expanded modal `w-80 sm:w-96`, action cards with icons
       - Changes:
         - Expanded modal: add `max-w-[calc(100vw-2rem)]` to prevent overflow on very narrow screens
         - Action cards should remain tappable, already have adequate padding
         - Speech bubble and avatar sizing already reasonable for mobile
       - Files: `src/components/character/AICompanionCharacter.tsx`
       - Verify: Test at 375px - expanded modal fits on screen, action cards are tappable

### Phase 4: Document & Employee Components

- [ ] 13. **Make DocumentUploadModal responsive**
       - Current state: Modal maxWidth='lg', 6-stage progress grid `grid-cols-3 sm:grid-cols-6`, form fields in grid
       - Changes:
         - Progress stage grid already responsive, verify it displays well on mobile
         - Form fields row (Vault / Classification / Clearance): `grid-cols-1 sm:grid-cols-3` to stack on mobile
         - FileDropzone should have adequate touch target and visual area on mobile
         - Action buttons at bottom: ensure 'Cancel' and 'Execute Ingestion Pipeline' don't overflow, may need smaller text or wrap
       - Files: `src/components/documents/DocumentUploadModal.tsx`
       - Verify: Test at 375px - form fields stack, progress indicators visible, buttons accessible

- [ ] 14. **Make DocumentPreviewDrawer responsive**
       - Current state: Drawer `max-w-3xl`, tabs in horizontal row, content area `p-6`
       - Changes:
         - Drawer width: `max-w-full md:max-w-3xl` to go full-width on mobile
         - Header padding: `p-4 sm:p-5` to reduce on mobile
         - Tab navigation: already has `overflow-x-auto`, ensure tabs are readable on mobile (text may need to be smaller or abbreviated)
         - Content area padding: `p-4 sm:p-6` to reduce on mobile
         - Header action buttons ('Download PDF', 'Close'): ensure buttons don't overflow on mobile, may need to hide text and show icon only or stack buttons
         - Metadata card grid: `grid-cols-2 sm:grid-cols-4` already responsive, verify
       - Files: `src/components/documents/DocumentPreviewDrawer.tsx`
       - Verify: Test at 375px - drawer is full-width, tabs scroll horizontally, content readable, buttons accessible

- [ ] 15. **Make EmployeeProfileDrawer responsive**
       - Current state: Drawer `max-w-2xl`, similar structure to DocumentPreviewDrawer
       - Changes:
         - Drawer width: `max-w-full md:max-w-2xl` on mobile
         - Header and content padding adjustments same as DocumentPreviewDrawer: `p-4 sm:p-5` header, `p-4 sm:p-6` content
         - Contact info grid: `grid-cols-1 sm:grid-cols-2` to stack on mobile (currently may be `grid-cols-2`)
         - Tabs: ensure readable on mobile
       - Files: `src/components/employees/EmployeeProfileDrawer.tsx`
       - Verify: Test at 375px - drawer full-width, contact info stacks, readable

### Phase 5: Page Layouts

- [ ] 16. **Make Dashboard page (src/app/page.tsx) responsive**
       - Current state: Welcome banner `p-6 sm:p-8`, telemetry cards `grid-cols-1 sm:grid-cols-3`, main grid `grid-cols-1 lg:grid-cols-3`
       - Changes:
         - Welcome banner padding: `p-4 sm:p-6 lg:p-8`
         - Quick action buttons: add `flex-wrap` to button container to wrap on mobile
         - Telemetry cards grid: already responsive, verify
         - Main content grid: already responsive (action items 2 cols, activity 1 col on large screens; stacks on mobile)
         - Action items cards: ensure adequate touch targets for checkboxes and 'Speak' buttons
       - Files: `src/app/page.tsx`
       - Verify: Test at 375px - banner fits, buttons wrap, cards stack, action items are tappable

- [ ] 17. **Make Documents page responsive**
       - Current state: Header with filters, document grid, comparison mode with side-by-side selectors and table
       - Changes:
         - Page padding: `p-4 sm:p-6` instead of `p-6`
         - Filter row (search, vault selector, classification): should stack on mobile `flex-col gap-3` on mobile, `sm:flex-row` on larger
         - Vault selector and filter dropdowns: full-width on mobile `w-full sm:w-auto`
         - Document cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
         - Comparison mode document selectors: stack on mobile `flex-col` instead of side-by-side
         - Comparison result table: wrap in `<div className="overflow-x-auto"><table className="min-w-[800px]">...</table></div>` to enable horizontal scroll on mobile
       - Files: `src/app/documents/page.tsx`
       - Verify: Test at 375px - filters stack, document grid single column, comparison table scrolls horizontally

- [ ] 18. **Make Employees page responsive**
       - Current state: Header with search and filters, employee cards in grid, team cards
       - Changes:
         - Page padding: `p-4 sm:p-6`
         - Header button row: wrap buttons on mobile with `flex-wrap`
         - Search bar: full-width on mobile
         - Department filter: stack below search on mobile if in same row, or ensure adequate spacing
         - Employee cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
         - Team cards grid: same responsive pattern
       - Files: `src/app/employees/page.tsx`
       - Verify: Test at 375px - search full-width, filters accessible, employee cards stack

- [ ] 19. **Make Fraud page responsive**
       - Current state: Summary cards grid, filter row, transactions table
       - Changes:
         - Page padding: `p-4 sm:p-6`
         - Header actions (upload, download, filters): wrap on mobile
         - Summary cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
         - Filter row: stack on mobile `flex-col sm:flex-row`
         - Transactions table: must have horizontal scroll on mobile - wrap table in `<div className="overflow-x-auto"><table className="min-w-[900px]">...</table></div>`
         - Investigation panel (when transaction selected): on mobile, make it a full-screen modal instead of side panel, or make it slide up from bottom
       - Files: `src/app/fraud/page.tsx`
       - Verify: Test at 375px - summary cards stack, table scrolls horizontally, investigation panel accessible

- [ ] 20. **Make Meetings page responsive**
       - Current state: Meeting cards grid, meeting detail view with MoM sections
       - Changes:
         - Page padding: `p-4 sm:p-6`
         - Header actions: wrap on mobile
         - Meeting cards grid: `grid-cols-1 sm:grid-cols-2`
         - Meeting detail view: stack sections vertically on mobile (executive summary, attendees, action items, decisions)
         - Attendees list and action items: if in table format, ensure horizontal scroll or reformat as cards on mobile
       - Files: `src/app/meetings/page.tsx`
       - Verify: Test at 375px - meeting cards stack, detail view sections stack, content readable

- [ ] 21. **Make Security page responsive**
       - Current state: Passkey cards, biometric enrollment, security settings, audit log
       - Changes:
         - Page padding: `p-4 sm:p-6`
         - Passkey cards and setting cards: stack on mobile `grid-cols-1 sm:grid-cols-2`
         - Forms: full-width with adequate input field sizing
         - Security log table: horizontal scroll on mobile if needed
       - Files: `src/app/security/page.tsx`
       - Verify: Test at 375px - cards stack, forms usable, log table accessible

- [ ] 22. **Make Workspace page responsive**
       - Current state: AI chat interface, tool cards grid
       - Changes:
         - Page padding: `p-4 sm:p-6`
         - Chat interface: full-width on mobile, adjust message bubbles to fit
         - Tool cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
         - Split-panel layouts (if any): collapse to single column on mobile
       - Files: `src/app/workspace/page.tsx`
       - Verify: Test at 375px - chat interface usable, tool cards stack

### Phase 6: Final Testing & Verification

- [ ] 23. **Cross-browser and cross-device testing**
       - Test on Chrome, Firefox, Safari (Mac/iOS), Edge (Windows)
       - Test on actual mobile devices (iPhone, Android) if possible, or use browser DevTools device emulation
       - Test at key breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (large desktop)
       - Verify no horizontal scroll on any page except intentional table scroll containers
       - Verify all interactive elements (buttons, links, checkboxes) have adequate touch targets (44x44px minimum)
       - Verify glassmorphism effects (backdrop-blur, transparency) still work on all devices
       - Verify Framer Motion animations don't cause performance issues on mobile
       - Files: All modified files
       - Verify: Manual testing across devices and browsers

- [ ] 24. **Build and deploy verification**
       - Run `npm run build` to ensure production build succeeds
       - Check build output for any warnings or errors related to responsive classes or Tailwind
       - Run `npm run test` if tests exist
       - Deploy to staging environment and test live site on mobile devices
       - Files: N/A
       - Verify: `npm run build` completes successfully, no errors

## Summary of Files Modified

1. `src/app/layout.tsx` - viewport meta tags
2. `src/app/globals.css` - safe-area variables, mobile utilities
3. `tailwind.config.js` - verify breakpoints (may not need changes)
4. `src/components/layout/Sidebar.tsx` - hamburger menu, mobile overlay
5. `src/components/layout/Navbar.tsx` - hamburger trigger, mobile layout
6. `src/components/layout/GlobalSearchModal.tsx` - full-screen mobile
7. `src/components/auth/AuthPortal.tsx` - mobile form layout
8. `src/components/auth/FaceRecognitionModal.tsx` - mobile video and buttons
9. `src/components/auth/PasskeyModal.tsx` - mobile button layout
10. `src/components/character/RiggedAnimeCharacter.tsx` - responsive sizing
11. `src/components/character/LiveCharacter.tsx` - mobile speech bubble
12. `src/components/character/AICompanionCharacter.tsx` - mobile modal width
13. `src/components/documents/DocumentUploadModal.tsx` - mobile form fields
14. `src/components/documents/DocumentPreviewDrawer.tsx` - full-width mobile
15. `src/components/employees/EmployeeProfileDrawer.tsx` - full-width mobile
16. `src/app/page.tsx` - responsive dashboard
17. `src/app/documents/page.tsx` - responsive filters and table scroll
18. `src/app/employees/page.tsx` - responsive employee grid
19. `src/app/fraud/page.tsx` - responsive fraud analysis and table scroll
20. `src/app/meetings/page.tsx` - responsive meeting cards
21. `src/app/security/page.tsx` - responsive security settings
22. `src/app/workspace/page.tsx` - responsive workspace chat
23. `src/components/auth/AuthGuard.tsx` - mobile menu state coordination (if needed)

## Key Design Decisions

1. **Mobile-first Tailwind approach**: Base styles target mobile, use `sm:`, `md:`, `lg:` prefixes for larger screens
2. **Hamburger menu for Sidebar**: Hidden on mobile (<768px), shown as overlay drawer when hamburger clicked, preserving desktop collapse/expand behavior
3. **Full-screen modals on mobile**: GlobalSearchModal, auth modals, and drawers become full-screen on mobile for better usability
4. **Horizontal scroll for tables**: Data tables (fraud transactions, documents comparison) use horizontal scroll on mobile rather than trying to fit columns
5. **Character component scaling**: Anime characters scale down on mobile while maintaining aspect ratio and interactivity
6. **44px minimum touch targets**: All buttons, links, and interactive elements meet accessibility guidelines
7. **Preserved aesthetics**: Glassmorphism effects (backdrop-blur, transparency) maintained across all screen sizes
8. **No breaking changes**: Business logic, data-fetching, API routes, and Framer Motion animations remain unchanged

## Estimated Effort
- **Setup & Global CSS**: 1-2 hours
- **Layout Components (Sidebar, Navbar, Modals)**: 3-4 hours
- **Auth & Character Components**: 3-4 hours
- **Document & Employee Components**: 2-3 hours
- **Page Layouts (7 pages)**: 4-5 hours
- **Testing & Refinement**: 2-3 hours
- **Total**: ~15-21 hours

## Success Criteria
- ✅ All pages display correctly on mobile (375px width) without horizontal scroll
- ✅ Sidebar hamburger menu works on mobile, desktop collapse/expand preserved
- ✅ All modals and drawers are full-screen or appropriately sized on mobile
- ✅ Tables scroll horizontally on mobile where needed
- ✅ All interactive elements meet 44x44px touch target requirement
- ✅ Glassmorphism aesthetic preserved across all screen sizes
- ✅ Build completes successfully with no errors
- ✅ Manual testing on iPhone, Android, Mac, Windows confirms responsive behavior
