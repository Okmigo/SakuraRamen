# Sakura Ramen - Design Style Guide

## Design Philosophy

### Visual Language
**Modern Japanese Minimalism**: Clean, sophisticated design that honors traditional Japanese aesthetics while embracing contemporary web design principles. The visual language evokes the precision and artistry of Japanese cuisine through careful attention to spacing, typography, and visual hierarchy.

### Color Palette
**Primary Colors**:
- **Sakura Pink**: #F4C2C2 (Cherry blossom accent, used sparingly)
- **Charcoal**: #2C2C2C (Primary text and strong accents)
- **Warm White**: #FEFEFE (Background and negative space)
- **Sage Green**: #8FBC8F (Secondary accent, natural touch)

**Supporting Colors**:
- **Light Gray**: #F8F8F8 (Section backgrounds)
- **Medium Gray**: #666666 (Secondary text)
- **Soft Cream**: #FFF8DC (Warm accent backgrounds)

### Typography
**Primary Font**: "Playfair Display" (Serif)
- Used for headings and brand elements
- Elegant, sophisticated, with strong personality
- Sizes: 48px (H1), 36px (H2), 24px (H3)

**Secondary Font**: "Inter" (Sans-serif)
- Used for body text and UI elements
- Clean, highly readable, modern
- Sizes: 16px (body), 14px (small text), 18px (lead paragraphs)

**Accent Font**: "Noto Sans JP" (Japanese characters when needed)
- Authentic Japanese character support
- Used sparingly for authenticity

## Visual Effects & Styling

### Animation Library Usage
**Anime.js Implementation**:
- Smooth scroll-triggered animations for menu items
- Staggered reveals for card grids
- Subtle hover state transitions
- Page transition effects

**Splitting.js Effects**:
- Character-by-character text animations for headings
- Typewriter effects for taglines
- Word-by-word reveals for descriptions

**ECharts.js Visualizations**:
- Nutritional information charts (future enhancement)
- Customer satisfaction ratings
- Popular menu item statistics

### Header Effects
**Hero Section Background**:
- Subtle parallax scrolling with cherry blossom petals
- Gradient overlay transitioning from transparent to soft cream
- Professional food photography with depth-of-field blur

**Navigation Bar**:
- Glass morphism effect with backdrop blur
- Smooth color transition on scroll
- Sticky positioning with shadow elevation

### Interactive Elements
**Menu Cards**:
- 3D tilt effect on hover (desktop)
- Smooth scale and shadow transitions
- Image zoom with overlay information
- Color-coded category indicators

**Buttons**:
- Gradient backgrounds with sakura pink accents
- Smooth hover states with subtle glow
- Loading animations for form submissions
- Disabled states with reduced opacity

### Background Styling
**Consistent Background**: Warm white (#FEFEFE) throughout all pages
**Decorative Elements**:
- Subtle cherry blossom pattern overlay (5% opacity)
- Geometric shapes in sage green for section separation
- Soft drop shadows for content elevation

**Section Differentiation**:
- Light gray backgrounds for alternate sections
- Decorative borders with Japanese-inspired patterns
- Asymmetrical layouts for visual interest

## Image Treatment

### Food Photography Style
**Professional Quality**: All images must meet restaurant photography standards
**Lighting**: Soft, natural lighting with warm tones
**Composition**: Clean, minimalist styling with careful prop placement
**Color Grading**: Enhanced warmth with slight pink undertones

### Image Specifications
**Hero Images**: 1920x1080px, landscape orientation
**Menu Item Images**: 800x600px, consistent aspect ratio
**Gallery Images**: 1200x800px, high resolution
**Thumbnail Images**: 400x300px, optimized for mobile

### Image Effects
**Hover States**: Subtle zoom (105%) with smooth transition
**Loading States**: Progressive blur-to-sharp loading
**Overlay Effects**: Gradient masks for text readability
**Border Radius**: 8px for all images for consistency

## Layout & Spacing

### Grid System
**Desktop**: 12-column grid with 24px gutters
**Tablet**: 8-column grid with 20px gutters  
**Mobile**: 4-column grid with 16px gutters

### Spacing Scale
**Base Unit**: 8px
**Scale**: 8px, 16px, 24px, 32px, 48px, 64px, 96px
**Container Max Width**: 1200px
**Section Padding**: 96px vertical, 24px horizontal

### Component Spacing
**Cards**: 24px internal padding, 16px between elements
**Buttons**: 16px vertical padding, 32px horizontal
**Forms**: 16px between fields, 24px for sections
**Navigation**: 16px vertical, 24px horizontal spacing

## Responsive Design

### Breakpoints
**Mobile**: 320px - 767px
**Tablet**: 768px - 1023px
**Desktop**: 1024px - 1439px
**Large Desktop**: 1440px+

### Mobile Optimizations
**Touch Targets**: Minimum 44px for all interactive elements
**Typography**: Increased line height (1.6) for readability
**Spacing**: Reduced margins and padding for screen efficiency
**Navigation**: Hamburger menu with slide-out drawer

### Performance Considerations
**Image Optimization**: WebP format with JPEG fallbacks
**Font Loading**: Font-display: swap for faster rendering
**Animation Performance**: GPU-accelerated transforms only
**Critical CSS**: Inline critical styles for faster first paint

## Accessibility Standards

### Color Contrast
**Text on Background**: Minimum 4.5:1 ratio
**Large Text**: Minimum 3:1 ratio
**Interactive Elements**: Clear focus indicators
**Error States**: High contrast red (#DC2626)

### Motion & Animation
**Reduced Motion**: Respect user preferences
**Duration**: Keep animations under 300ms
**Easing**: Use natural easing curves (cubic-bezier)
**Focus Management**: Maintain keyboard navigation

This design system creates a cohesive, premium experience that reflects the quality and authenticity of Sakura Ramen while ensuring excellent usability across all devices and user needs.