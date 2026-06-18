# Responsive Design Documentation - Roti Wala Project

## Overview
This project is fully responsive and optimized for all device types using a mobile-first approach with consistent breakpoints across all components.

## Responsive Breakpoints

All components follow these standard breakpoints:

```
Mobile (XS):     320px - 575px
Tablet (SM):     576px - 767px
Tablet (MD):     768px - 991px
Desktop (LG):    992px - 1199px
Large (XL):      1200px - 1399px
Extra Large (XXL): 1400px+
```

### Breakpoint CSS Variables (in :root)
```css
--breakpoint-xs: 320px;
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
--breakpoint-xxl: 1400px;
```

## Font Sizing

Font sizes automatically scale based on device size:

**Mobile (≤576px):**
- h1: 1.5rem
- h2: 1.25rem
- h3: 1.1rem
- Body: 0.875rem
- Base font-size: 14px

**Tablet (577px-992px):**
- h1: 2rem
- h2: 1.5rem
- h3: 1.25rem
- Body: 0.95rem
- Base font-size: 16px

**Desktop (≥993px):**
- h1: 2.5rem
- h2: 1.75rem
- h3: 1.25rem
- Body: 1rem
- Base font-size: 18px

## Key Responsive Components

### 1. Header Component (`Header.jsx` & `Header.css`)

**Features:**
- Sticky positioning with z-index management
- Mobile hamburger menu (≤992px)
- Responsive logo sizing
- Collapsible navigation
- Touch-friendly tap targets (minimum 44x44px on mobile)

**Breakpoints:**
- **Mobile (≤576px):** Full-width drawer menu, condensed header height (70px)
- **Tablet (577-992px):** Hybrid layout, header height (75px)
- **Desktop (≥993px):** Full navigation visible, header height (80px)

### 2. Sidebar Component (`Sidebar.jsx` & `Sidebar.css`)

**Features:**
- Fixed sidebar on desktop
- Slide-in drawer on tablets/mobile
- Overlay backdrop on mobile
- Responsive width

**Breakpoints:**
- **Mobile (≤576px):** Full-width mobile drawer
- **Tablet (577-992px):** Slide-in drawer (260px)
- **Desktop (≥993px):** Fixed sidebar always visible

### 3. Footer Component (`Footer.jsx` & `Footer.css`)

**Features:**
- 4-column grid on desktop
- 2-column grid on tablet
- Single column on mobile
- Responsive newsletter form
- Stacked social icons

**Breakpoints:**
- **Mobile (≤576px):** 1 column, smaller text
- **Tablet (577-992px):** 2 columns
- **Desktop (≥993px):** 4 columns

### 4. Forms (`ProductForm.jsx` & `forms.css`)

**Features:**
- Full-width inputs with proper padding
- Mobile-optimized labels and error messages
- Two-column layouts on desktop, single on mobile
- Touch-friendly input fields
- Responsive form actions

**Layout:**
```
Desktop:  [Field 1] [Field 2]
          [Field 3] [Field 4]
          [Submit] [Cancel]

Mobile:   [Field 1]
          [Field 2]
          [Field 3]
          [Field 4]
          [Submit]
          [Cancel]
```

## Responsive Utility Classes

### Spacing Utilities

**Padding (px = horizontal, py = vertical):**
- `.px-responsive`: Responsive horizontal padding
- `.py-responsive`: Responsive vertical padding

**Mobile (≤576px):** 1rem padding
**Desktop (≥993px):** 1.5rem padding

**Gap:**
- `.gap-responsive`: Responsive gap between flex/grid items
  - Mobile: 1rem
  - Desktop: 1.5rem

### Display Utilities

```css
.d-none-mobile    /* Hidden on mobile, visible on tablet+ */
.d-none-tablet    /* Hidden on tablet and below */
.d-none-desktop   /* Hidden on desktop and above */
```

### Responsive Grids

**Grid Auto Responsive:**
```css
.grid-auto-responsive
/* Desktop: auto-fit with 250px minimum
   Mobile: Single column */
```

**Flex Responsive:**
```css
.flex-responsive       /* Flexible row layout */
.flex-responsive-col   /* Flexible column layout */
```

### Column System

```html
<!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
<div class="col-lg-3 col-md-6"></div>

<!-- Examples -->
<div class="col-12">Full width</div>
<div class="col-md-6">50% on tablet, 100% on mobile</div>
<div class="col-lg-3">25% on desktop, 100% on mobile</div>
```

## Component-Specific Responsive Behavior

### Cards
```css
Mobile:  Padding: 15px
Desktop: Padding: 25px
```

### Product Cards
```
Mobile:   Image height: 200px
Tablet:   Image height: 225px
Desktop:  Image height: 250px
```

### Containers
```
Mobile:   Max-width: 100%, padding: 1rem
Tablet:   Max-width: 540px
Desktop:  Max-width: 960px-1320px
```

### Tables
```
Mobile:   Font size: 0.85rem, padding: 0.5rem
Tablet:   Font size: 0.9rem, padding: 0.75rem
Desktop:  Font size: 0.95rem, padding: 1rem

Mobile: Horizontally scrollable with touch support
Desktop: Full-width display
```

## Responsive Meta Tags

The project includes optimized meta tags in `index.html`:

```html
<!-- Viewport configuration -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

<!-- Mobile web app support -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- Theme color for browser chrome -->
<meta name="theme-color" content="#F7C600" />
```

## Mobile-First Approach

All CSS is written with mobile-first methodology:

```css
/* Base styles apply to mobile */
.element {
  font-size: 0.9rem;
  padding: 1rem;
}

/* Tablet and above */
@media (min-width: 768px) {
  .element {
    font-size: 0.95rem;
    padding: 1.5rem;
  }
}

/* Desktop and above */
@media (min-width: 993px) {
  .element {
    font-size: 1rem;
    padding: 2rem;
  }
}
```

## Performance Optimizations

1. **Image Optimization:**
   - Use `object-fit: cover` for consistent aspect ratios
   - Responsive image sizes with CSS
   - Lazy loading support ready

2. **Touch Targets:**
   - Minimum 44x44px on mobile for interactive elements
   - Increased spacing between clickable items
   - Proper hover/active states

3. **Typography:**
   - Readable font sizes on all devices
   - Proper line-height for better readability
   - Responsive text scaling

4. **Layout:**
   - Flexbox for flexible layouts
   - CSS Grid for complex layouts
   - No fixed widths (except specific components)

## Bootstrap Integration

The project uses Bootstrap 5.3 for additional responsive utilities:

```html
<div class="container px-3 px-lg-5">
  <div class="row gy-4">
    <div class="col-lg-4 col-md-6">Content</div>
  </div>
</div>
```

Available Bootstrap utilities:
- `.container`: Responsive container
- `.row` & `.col-*`: Grid system
- `.d-lg-none`: Display utilities
- `.px-3`, `.px-lg-5`: Padding utilities
- `.mb-3`, `.py-5`: Spacing utilities

## Viewport Considerations

### Safe Area Handling
- `viewport-fit=cover` enables safe area support
- Padding applied to account for notches on modern devices

### Device Orientation
- Both portrait and landscape supported
- No fixed heights for main content
- Flexible spacing adjusts to orientation

## Testing Recommendations

### Devices to Test
1. **Mobile:** iPhone SE (375px), iPhone 12 (390px), iPhone 14 Pro (430px), Android 6.5" (412px)
2. **Tablet:** iPad (768px), iPad Pro (1024px), Android tablets (600px+)
3. **Desktop:** 1366px, 1920px, 2560px widths

### Testing Tools
- Chrome DevTools responsive mode
- Firefox responsive design mode
- Apple Safari responsive design mode
- Physical device testing

### Key Testing Areas
1. Header/Navigation responsiveness
2. Form input sizing and accessibility
3. Image scaling and responsiveness
4. Touch interaction on mobile
5. Horizontal scrolling prevention
6. Overflow handling

## Accessibility

All responsive designs maintain WCAG 2.1 AA compliance:

- Adequate color contrast (4.5:1 for body text)
- Font sizes no smaller than 12px (after zoom)
- Touch targets ≥44x44px
- Proper heading hierarchy
- ARIA labels for screen readers
- Keyboard navigation support

## Future Enhancements

1. **PWA Support:** Add service workers for offline support
2. **High DPI Displays:** @2x assets for Retina displays
3. **Dark Mode:** Responsive dark mode support
4. **Performance:** Implement critical CSS and code splitting
5. **Internationalization:** Right-to-left language support

## CSS File Organization

```
styles/
├── theme.css           /* Color and theme variables */
├── responsive.css      /* Responsive utilities and base styles */
├── forms.css          /* Form-specific responsive styles */
├── pages.css          /* Page layout responsive styles */
└── ...

components/
├── layout/
│   ├── Header.css     /* Header responsive styles */
│   ├── Footer.css     /* Footer responsive styles */
│   └── ...
└── ...
```

## Quick Reference

**Import responsive CSS in your components:**

```jsx
// In component files
import "../styles/responsive.css";
import "../styles/forms.css";
import "../styles/pages.css";
```

**Use responsive utilities:**

```jsx
// HTML examples
<div className="container px-responsive py-responsive">
  <div className="row gy-4">
    <div className="col-lg-4 col-md-6">
      <div className="card">
        <div className="card-body">
          <h3>Title</h3>
          <p>Content</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Standard breakpoint usage:**

```css
/* Mobile-first approach */
.element {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .element {
    /* Tablet styles */
  }
}

@media (min-width: 993px) {
  .element {
    /* Desktop styles */
  }
}
```

---

**Last Updated:** 2026-06-16  
**Version:** 1.0  
**Status:** Fully Responsive ✓
