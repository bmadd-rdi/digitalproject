---
name: Civic Horizon
colors:
  surface: '#f9f9ff'
  surface-dim: '#d9d9e0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fa'
  surface-container: '#ededf4'
  surface-container-high: '#e7e8ee'
  surface-container-highest: '#e2e2e9'
  on-surface: '#191c20'
  on-surface-variant: '#3f4942'
  inverse-surface: '#2e3036'
  inverse-on-surface: '#f0f0f7'
  outline: '#6f7a71'
  outline-variant: '#bec9c0'
  surface-tint: '#006c46'
  primary: '#005838'
  on-primary: '#ffffff'
  primary-container: '#00734b'
  on-primary-container: '#98f5c3'
  inverse-primary: '#7dd9a8'
  secondary: '#5f5e5d'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfdd'
  on-secondary-container: '#636261'
  tertiary: '#1646a3'
  on-tertiary: '#ffffff'
  tertiary-container: '#375fbd'
  on-tertiary-container: '#d9e0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#99f6c3'
  primary-fixed-dim: '#7dd9a8'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#005234'
  secondary-fixed: '#e5e2e0'
  secondary-fixed-dim: '#c9c6c4'
  on-secondary-fixed: '#1c1c1a'
  on-secondary-fixed-variant: '#474745'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b2c5ff'
  on-tertiary-fixed: '#001848'
  on-tertiary-fixed-variant: '#0b409e'
  background: '#f9f9ff'
  on-background: '#191c20'
  surface-variant: '#e2e2e9'
  canvas-ghost: '#F8F8FF'
  surface-white: '#FFFFFF'
  border-gray: '#D1CDC7'
  status-orange: '#CF4500'
  slate-gray: '#696969'
typography:
  headline-lg:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  eyebrow:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  nav-button:
    fontFamily: "'Inter', 'Sarabun', sans-serif"
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 96px
  container-max: 1280px
  section-padding-desktop: 128px
  section-padding-mobile: 48px
---

## Brand & Style

This design system blends institutional authority with a modern, "tech-forward" editorial aesthetic. It is specifically crafted for high-stakes government project management where clarity, organization, and accessibility are paramount. 

The visual language is defined by **Institutional Minimalism**—leveraging expansive whitespace (editorial breathing room), oversized radii, and a disciplined "Orbits and Stadiums" geometry. The atmosphere is professional and grounded, yet approachable through the use of soft, ghosted backgrounds and rounded structural elements that remove the typical "stiff" feeling of bureaucratic software.

**Key Stylistic Pillars:**
- **Extreme Radii:** Rejection of standard 4px/8px corners in favor of 20px buttons and 40px containers to create a distinct, premium feel.
- **Satellite Composition:** Circular imagery and orbital UI elements that guide the eye toward secondary actions.
- **Structured Tech:** High organization through subtle 1px borders and a rigid 8px grid, ensuring data-heavy project management remains legible.

## Colors

The palette transitions away from traditional "putty" tones to a cleaner **Ghost White** canvas, providing a fresh and energetic backdrop for government work.

- **Primary Green (#00734B):** Used for primary actions, success states, and brand-defining accents. In code, primary action surfaces should use `primary-container` (#00734B), while `primary` (#005838) remains a darker brand accent for hover/active states and supporting UI tints. It represents growth and institutional stability.
- **Canvas & Surface:** The UI uses a "paper-on-paper" layering strategy. The main background is **Ghost White**, while interactive cards and elevated containers use pure **White** to create a visible lift.
- **Ink Black:** Reserved for typography and high-contrast UI elements to ensure WCAG AA/AAA compliance for the Thai script.
- **Border Gray:** A neutral 1px stroke used for input fields and dividers to maintain the "organized tech" requirement.

## Typography

The system uses **Inter** for Latin text and includes a Thai fallback stack to ensure consistent rendering for Thai script. The typographic hierarchy follows an editorial pattern, using generous line heights to accommodate the ascending and descending marks of the Thai script.

**Usage Notes:**
- **Eyebrows:** Always uppercase with increased letter-spacing to act as section identifiers.
- **Body Text:** Avoid weights below 400 for Thai script to prevent "thinning out" on high-resolution displays.
- **Font Stack:** Use `Inter, Sarabun, sans-serif` (or equivalent Thai-friendly fallback) to keep Thai text visually consistent.
- **Headlines:** Use tighter letter-spacing (-2%) for English text within headlines to maintain the modern, "tight" editorial look.

## Layout & Spacing

The layout is built on a **12-column fixed grid** with a maximum width of 1280px. For project management dashboards, the system employs a **Fluid-within-Fixed** model: the sidebar and utility panels are fixed, while the central workspace expands.

**Spacing Rhythm:**
- **Editorial Breath:** Vertical section spacing is aggressive (96px+) to prevent information density fatigue.
- **Gutters:** Standardized at 24px (Desktop) and 16px (Mobile).
- **Responsive Behavior:** On mobile, section padding collapses to 48px, and oversized typography (Headline LG) scales down to 32px to ensure readability without excessive scrolling.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** supplemented by **Atmospheric Shadows**. 

- **Level 0 (Canvas):** Ghost White (#F8F8FF).
- **Level 1 (Cards/Surfaces):** Pure White (#FFFFFF) with a 1px border in #D1CDC7 (10% opacity) or a soft halo: `0px 4px 24px rgba(0, 0, 0, 0.04)`.
- **Level 2 (Active/Floating):** Used for navigation pills and modals. This level uses a more pronounced shadow: `0px 24px 48px rgba(0, 0, 0, 0.08)`.
- **Level 3 (Modals/Overlays):** Dramatic lift: `0px 70px 110px rgba(0, 0, 0, 0.15)`.

The design avoids harsh blacks in shadows, opting for low-opacity spreads that mimic natural light falling on stacked paper.

## Shapes

The "signature" of this design system is its aggressive corner radii, which provide a modern, accessible, and friendly interface.

- **Buttons:** All action-oriented buttons are **Pill-Shaped** (999px radius).
- **Primary Containers:** Major dashboard cards and hero media frames use a **40px** radius.
- **Service Portraits:** All user avatars and "Project Lead" photos must be clipped to perfect **Circles (50%)**.
- **Satellite Elements:** Small utility circles (e.g., "Add Project" floating buttons) utilize the circle shape to contrast against rectangular grid items.

## Components

### Buttons
- **Primary:** Pill-shaped, Primary Green (#00734B) fill, White text.
- **Secondary:** Pill-shaped, White fill, 1.5px solid Ink Black border.
- **Satellite CTA:** A 56px white circle containing a primary-colored icon, docked to the corner of circular images or cards.

### Input Fields
- **Style:** Fully rounded (pill) or 8px radius depending on context. 
- **Border:** Subtle 1px solid #D1CDC7. 
- **Focus State:** 1.5px Primary Green border with a soft green outer glow.

### Cards
- **Project Card:** 40px radius, pure white background, subtle Level 1 shadow. 
- **Header:** Large H3 card title, followed by muted slate-gray labels for metadata.

### Selection Controls
- **Checkboxes:** Use rounded rectangles with an `sm` (4px) or `md` (8px) corner radius to preserve familiar checkbox semantics while keeping a softened "Orbits" aesthetic.
- **Radios:** Can remain circular to clearly signal single-choice selection.
- **Chips:** Pill-shaped with a light Ghost White fill and 14px semi-bold labels.

### Portraits & Avatars
- Always perfect circles. 
- In dashboard views, portraits often feature a "Satellite" status indicator (e.g., a small orange dot for "Away" or green for "Online") docked at a 135-degree angle.