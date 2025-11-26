# Design Guidelines: AI-Powered Supply Chain Risk Intelligence Platform

## Design Approach

**Selected Approach:** Design System-Based (Carbon Design + Modern Enterprise Dashboard Patterns)

**Justification:** Enterprise security platform requiring high information density, clear data hierarchy, and professional credibility. Drawing inspiration from Linear's clarity, Notion's organization, and enterprise security dashboards (Splunk, DataDog patterns).

**Core Principles:**
- Information clarity over visual flourish
- Scannable data presentation with strong hierarchy
- Professional enterprise aesthetic that builds trust
- Efficient task completion over engagement tactics

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN) - exceptional readability at all sizes
- Monospace: JetBrains Mono - for data/metrics display

**Type Scale:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold  
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Metrics/Data: text-2xl font-bold (JetBrains Mono)
- Labels: text-sm font-medium
- Helper Text: text-xs font-normal

**Line Height:** leading-tight for headers, leading-relaxed for body content

## Layout System

**Container Strategy:**
- Dashboard: Full-width layout with max-w-screen-2xl mx-auto
- Content areas: px-6 py-8 responsive padding
- Cards/Panels: Contained width with proper breathing room

**Spacing Primitives:**
Core spacing units: **2, 4, 6, 8, 12, 16** (Tailwind units)
- Tight spacing: gap-2, p-2 (within components)
- Standard spacing: gap-4, p-4 (between related elements)  
- Section spacing: gap-8, py-8 (major sections)
- Page margins: p-6 to p-8

**Grid Systems:**
- Dashboard overview: 3-column grid (lg:grid-cols-3) for metric cards
- Vendor list: Single column with expandable rows
- Risk matrix: 2-column split (details + visualization)

## Component Library

### Navigation & Structure
**Top Navigation Bar:**
- Fixed header with platform logo, main navigation, user profile
- Height: h-16
- Search bar integrated into header (max-w-md)

**Sidebar (Optional for multi-section access):**
- Width: w-64 on desktop, collapsible on mobile
- Vertical navigation with icon + label pattern
- Active state with subtle indicator

### Dashboard Components

**Metric Cards:**
- Compact design with icon, label, value, trend indicator
- Structure: p-6, rounded-lg, border
- Metric value: text-3xl font-bold (JetBrains Mono)
- Trend: Small arrow icon + percentage (text-sm)

**Risk Heatmap Visualization:**
- Grid-based visual (could be implemented with HTML/CSS grid)
- Each cell represents vendor with size indicating impact
- Hover shows vendor name + risk score tooltip

**Vendor Table/List:**
- Dense information display with sortable columns
- Row structure: Vendor name, Risk score badge, Products used, Last assessment, Actions
- Zebra striping for readability (alternate row backgrounds)
- Row height: py-4

**Risk Score Badges:**
- Pill-shaped indicators: px-3 py-1 rounded-full text-xs font-semibold
- Different visual treatments for severity levels (Critical/High/Medium/Low)
- Always include numeric score alongside text label

**Detail Panels:**
- Vendor profile: 2-column layout (left: key metrics, right: detailed analysis)
- Sections with clear headings and dividers
- Collapsible sections for optional details

### Forms & Inputs

**Form Layout:**
- Vertical stacking with space-y-4
- Label above input: text-sm font-medium mb-1
- Input fields: w-full px-4 py-2 rounded-md border
- Helper text below inputs: text-xs mt-1

**Search & Filter Bar:**
- Horizontal layout with gap-2
- Search input with icon prefix
- Filter dropdowns inline
- Clear filters button when active

### Data Visualization

**Chart Components:**
- Use Chart.js or Recharts library
- Clean, minimal styling
- Consistent padding and spacing
- Clear axis labels and legends
- Tooltips on hover for detailed data

**Progress Indicators:**
- Horizontal bars for risk scores (w-full h-2 rounded-full)
- Percentage completion with numeric label

### Feedback & Status

**Alert Banners:**
- Top of page placement for system alerts
- Structure: px-4 py-3 rounded-md with icon + message + dismiss
- Icons from Heroicons

**Loading States:**
- Skeleton screens for data tables (animated pulse)
- Spinner for action confirmations (w-5 h-5)

**Empty States:**
- Centered content with icon, heading, description, action button
- Max width: max-w-sm mx-auto

## Authentication Pages

**Login Screen:**
- Centered card: max-w-md mx-auto
- Clean, minimal form with logo at top
- "Sign in with Replit" button (primary action)
- Subtle background pattern or gradient (no distracting imagery)

## Icons & Assets

**Icon Library:** Heroicons (via CDN)
- Outline style for navigation and secondary actions
- Solid style for status indicators and primary actions
- Consistent size: w-5 h-5 for inline, w-6 h-6 for standalone

**Images:**
No hero images for this enterprise dashboard application. Focus entirely on data presentation and functional UI. Any vendor logos should be small avatars (w-10 h-10 rounded).

## Accessibility

- Maintain WCAG AA contrast ratios throughout
- All interactive elements keyboard navigable
- Form inputs with proper labels and ARIA attributes
- Focus indicators visible on all focusable elements (ring-2 ring-offset-2)
- Screen reader friendly table markup with proper headers

## Responsive Behavior

**Breakpoints:**
- Mobile: Stack all columns, full-width cards
- Tablet (md:): 2-column layouts where appropriate
- Desktop (lg:): Full multi-column dashboards
- Large (xl:): Max content width with centered layout

**Mobile Optimizations:**
- Hamburger menu for navigation
- Simplified metric cards (stack icon/value vertically)
- Horizontal scroll for wide tables with fixed first column
- Bottom sheet pattern for filters on mobile

## Animation Guidelines

**Minimal, purposeful animations only:**
- Smooth transitions on hover states (transition-colors duration-200)
- Page transitions: Subtle fade (optional)
- Loading spinners: Gentle rotation
- Modal/dropdown entry: Scale and fade (scale-95 opacity-0 to scale-100 opacity-100)

**NO animations for:**
- Scrolling effects
- Parallax
- Complex data visualizations (keep static for performance)