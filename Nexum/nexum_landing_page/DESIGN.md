---
name: Connectivity & Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#005e6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00788c'
  on-tertiary-container: '#d7f6ff'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  surface-base: '#FFFFFF'
  surface-subtle: '#F8FAFC'
  border-muted: '#E2E8F0'
  success: '#10B981'
  warning: '#F59E0B'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  grid-margin: 24px
  gutter: 16px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for a high-performance technological environment where clarity, connectivity, and efficiency are paramount. The brand personality is professional and systematic, aiming to evoke a sense of absolute reliability and forward-thinking logic. 

The visual style follows a **Corporate Modern** aesthetic. It prioritizes clean lines, ample whitespace, and a disciplined mathematical approach to layout. By balancing a utilitarian core with subtle high-tech flourishes, this design system establishes a premium feel that resonates with enterprise users and developers alike.

## Colors

The palette is anchored by a versatile "Digital Blue" primary and a deep "Midnight" neutral. This combination ensures high legibility and a sense of institutional trust. 

- **Primary & Secondary:** These colors are used for action-oriented elements, focus states, and representing data connectivity. 
- **Neutral:** A slate-based neutral scale is used to define hierarchy without introducing visual noise. 
- **Semantic Colors:** Success, Warning, and Error colors are calibrated for high visibility against the neutral backgrounds to ensure immediate user feedback.

## Typography

This design system utilizes **Inter** exclusively. Its geometric yet humanist qualities provide the necessary versatility for a technical interface.

- **Scale:** A mobile-first typographic scale ensures that large headlines collapse gracefully on smaller viewports. 
- **Hierarchy:** Use heavier weights (600-700) for structural headlines to create a clear "scan-path" for the user. Labels should utilize the Medium (500) weight to distinguish them from standard body text.
- **Readability:** Body text is set with a generous line height (1.5x) to maintain clarity in data-dense layouts.

## Layout & Spacing

The layout is built on an **8px linear grid system**. This mathematical approach ensures consistency across all components and page structures.

- **Grid Model:** A 12-column fluid grid is used for desktop (breakpoints at 1024px and 1280px). For mobile, the layout reflows to a single-column or 2-column grid with 16px margins.
- **Spacing Rhythm:** All margins and paddings must be multiples of 8px (8, 16, 24, 32, 48, 64). This creates a predictable vertical rhythm that reinforces the system's professional tone.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** supplemented by **Ambient Shadows**.

- **Surfaces:** Use background colors to define tiers of content. The base level uses `#FFFFFF`, while sidebar or secondary containers use the subtle `#F8FAFC`.
- **Shadows:** Shadows are highly diffused and low-opacity, mimicking a soft natural light source from above. Avoid harsh borders; instead, use 1px subtle outlines (`#E2E8F0`) to define component boundaries in flat contexts.
- **Interactions:** Upon hover, elements should slightly lift using a medium-strength ambient shadow to indicate interactivity.

## Shapes

The shape language is "Soft," utilizing a 0.25rem (4px) base radius. This provides a modern feel while maintaining the precise, technical edge required by the brand. 

- **Standard Elements:** Inputs, buttons, and small cards use the base 4px radius.
- **Large Containers:** Modals and large dashboard cards may use `rounded-lg` (8px) to soften the overall interface and distinguish them from smaller UI widgets.

## Components

Components are designed for high-frequency use and industrial-grade reliability.

- **Buttons:** Primary buttons use a solid fill with white text. Secondary buttons use a ghost style with a 1px border. Transitions should be immediate (150ms) to feel responsive.
- **Input Fields:** Use a 1px border with a 4px corner radius. Focus states are indicated by a 2px primary color ring with an inset glow. Labels are always positioned above the field for maximum accessibility.
- **Cards:** Cards should be flat with a 1px border in their default state, gaining a soft shadow only when they are interactive or contain high-priority content.
- **Data Tables:** Tables are a core component. They should utilize alternating row colors (zebra striping) in a very subtle gray to help users track horizontal data lines.
- **Chips & Tags:** Small, low-contrast pills with 500-weight text are used for categorization and status indicators.