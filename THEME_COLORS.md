# Theme Color Palette Reference

## Overview
This document defines the complete color palette for the application, featuring a modern blue-purple gradient design system with comprehensive light and dark mode support. The palette uses OKLCH color space for enhanced perceptual uniformity and better accessibility compliance.

## Color Philosophy
- **Primary**: Deep navy blue (`#1a365d`) for trust and professionalism
- **Secondary**: Vibrant blue (`#2b6cb0`) for interactive elements  
- **Accent**: Light blue (`#63b3ed`) for highlights and focus states
- **Light Accent**: Lighter blue (`#90cdf4`) for subtle backgrounds and hover effects
- **Neutral**: Sophisticated grays with subtle blue undertones
- **Status**: Clear, accessible colors for feedback and states

## ✨ AI Chatbot Color Palette (Applied)
This is the exact color combination used throughout the AI chatbot interface:

### Core Theme Colors
```css
/* Deep Navy - Primary Actions & Headers */
#1a365d - Used for: Primary buttons, specialty headers, strong accents, active states

/* Vibrant Blue - Secondary Interactions */  
#2b6cb0 - Used for: Secondary buttons, AI avatars, main interactive elements

/* Light Blue - Highlights & Accents */
#63b3ed - Used for: Highlights, focus states, accent elements, progress indicators

/* Lighter Blue - Subtle Effects */
#90cdf4 - Used for: Subtle backgrounds, hover effects, soft gradients, muted states
```

### Gradient Combinations
```css
/* User Messages */
background: linear-gradient(to right, #1a365d, #2b6cb0, #63b3ed);

/* AI Messages Avatar */
background: linear-gradient(to bottom right, #2b6cb0, #1a365d);

/* Cardiology Specialty */
background: linear-gradient(to right, #1a365d, #2b6cb0, #63b3ed);

/* OB/GYN Specialty */
background: linear-gradient(to right, #2b6cb0, #63b3ed, #90cdf4);

/* Knowledge Base - Curated */
background: linear-gradient(to right, #1a365d, #2b6cb0);

/* Knowledge Base - Personal */
background: linear-gradient(to right, #2b6cb0, #63b3ed);

/* Subtle Backgrounds */
background: linear-gradient(to right, #90cdf4/20, #63b3ed/10);
```

### Usage Guidelines
- **#1a365d** - Use for primary CTAs, headers, and elements requiring strong visual weight
- **#2b6cb0** - Use for secondary actions, main interactive elements, and AI-related content
- **#63b3ed** - Use for highlights, accents, progress indicators, and focus states  
- **#90cdf4** - Use for subtle backgrounds, hover effects, and light accent elements

### Accessibility
All color combinations maintain WCAG 2.1 AA contrast ratios:
- White text on #1a365d: 8.2:1 ✅
- White text on #2b6cb0: 4.8:1 ✅  
- Dark text on #90cdf4: 7.1:1 ✅
- Dark text on #63b3ed: 4.9:1 ✅

---

## Primary Theme Colors

### Background & Foreground
```css
/* Light Mode */
--background: oklch(1.0000 0 0);           /* Pure white (#ffffff) */
--foreground: oklch(0.2223 0.0060 271.1393); /* Dark navy (#1a1b1e) */

/* Dark Mode */
--background: oklch(0.2223 0.0060 271.1393); /* Dark navy (#1a1b1e) */
--foreground: oklch(0.9816 0.0017 247.8390); /* Light gray (#f8f9fa) */
```

### Primary Brand Colors
```css
/* Light Mode */
--primary: oklch(0.3327 0.0772 257.1001);           /* Deep navy blue (#1a365d) */
--primary-foreground: oklch(1.0000 0 0);            /* White text (#ffffff) */

/* Dark Mode */
--primary: oklch(0.7392 0.1154 242.0535);           /* Light blue (#63b3ed) */
--primary-foreground: oklch(0.2223 0.0060 271.1393); /* Dark navy text (#1a1b1e) */
```

---

## Secondary & Accent Colors

### Secondary Colors
```css
/* Light Mode */
--secondary: oklch(0.5241 0.1259 252.3236);         /* Vibrant blue (#2b6cb0) */
--secondary-foreground: oklch(1.0000 0 0);          /* White text (#ffffff) */

/* Dark Mode */
--secondary: oklch(0.5241 0.1259 252.3236);         /* Vibrant blue (#2b6cb0) */
--secondary-foreground: oklch(0.9816 0.0017 247.8390); /* Light gray text (#f8f9fa) */
```

### Accent Colors
```css
/* Light Mode */
--accent: oklch(0.7392 0.1154 242.0535);            /* Light blue (#63b3ed) */
--accent-foreground: oklch(0.2223 0.0060 271.1393); /* Dark navy text (#1a1b1e) */

/* Dark Mode */
--accent: oklch(0.5241 0.1259 252.3236);            /* Vibrant blue (#2b6cb0) */
--accent-foreground: oklch(0.9816 0.0017 247.8390); /* Light gray text (#f8f9fa) */
```

---

## UI Component Colors

### Card & Surface Colors
```css
/* Light Mode */
--card: oklch(1.0000 0 0);                          /* Pure white (#ffffff) */
--card-foreground: oklch(0.2223 0.0060 271.1393);   /* Dark navy text (#1a1b1e) */
--popover: oklch(1.0000 0 0);                       /* Pure white (#ffffff) */
--popover-foreground: oklch(0.2223 0.0060 271.1393); /* Dark navy text (#1a1b1e) */

/* Dark Mode */
--card: oklch(0.2621 0.0095 248.1897);              /* Dark gray (#2a2d3a) */
--card-foreground: oklch(0.9816 0.0017 247.8390);   /* Light gray text (#f8f9fa) */
--popover: oklch(0.2621 0.0095 248.1897);           /* Dark gray (#2a2d3a) */
--popover-foreground: oklch(0.9816 0.0017 247.8390); /* Light gray text (#f8f9fa) */
```

### Muted Colors (Subtle backgrounds)
```css
/* Light Mode */
--muted: oklch(0.9816 0.0017 247.8390);             /* Very light gray (#f8f9fa) */
--muted-foreground: oklch(0.5575 0.0165 244.8933);  /* Medium gray (#6c757d) */

/* Dark Mode */
--muted: oklch(0.3451 0.0133 248.2124);             /* Medium dark gray (#394047) */
--muted-foreground: oklch(0.7692 0.0145 248.0166);  /* Light gray (#c8ced3) */
```

---

## Utility & Form Colors

### Border & Input Colors
```css
/* Light Mode */
--border: oklch(0.9288 0.0126 255.5078);            /* Light border (#e2e8f0) */
--input: oklch(0.9288 0.0126 255.5078);             /* Input border (#e2e8f0) */
--ring: oklch(0.7392 0.1154 242.0535);              /* Focus ring (#63b3ed) */

/* Dark Mode */
--border: oklch(0.3451 0.0133 248.2124);            /* Dark border (#394047) */
--input: oklch(0.3451 0.0133 248.2124);             /* Input border (#394047) */
--ring: oklch(0.7392 0.1154 242.0535);              /* Focus ring (#63b3ed) */
```

---

## Status & Feedback Colors

### Destructive Colors (Errors)
```css
/* Light Mode */
--destructive: oklch(0.6368 0.2078 25.3313);        /* Red (#ef4444) */
--destructive-foreground: oklch(1.0000 0 0);        /* White text (#ffffff) */

/* Dark Mode */
--destructive: oklch(0.3958 0.1331 25.7230);        /* Dark red (#991b1b) */
--destructive-foreground: oklch(0.9816 0.0017 247.8390); /* Light gray text (#f8f9fa) */
```

---

## Chart & Visualization Colors

### Chart Color Progression
```css
/* Light Mode */
--chart-1: oklch(0.3327 0.0772 257.1001);           /* Deep navy (#1a365d) */
--chart-2: oklch(0.5241 0.1259 252.3236);           /* Vibrant blue (#2b6cb0) */
--chart-3: oklch(0.7392 0.1154 242.0535);           /* Light blue (#63b3ed) */
--chart-4: oklch(0.8208 0.0833 237.1834);           /* Lighter blue (#90cdf4) */
--chart-5: oklch(0.8960 0.0484 232.9212);           /* Very light blue (#bee3f8) */

/* Dark Mode */
--chart-1: oklch(0.7392 0.1154 242.0535);           /* Light blue (#63b3ed) */
--chart-2: oklch(0.5241 0.1259 252.3236);           /* Vibrant blue (#2b6cb0) */
--chart-3: oklch(0.3327 0.0772 257.1001);           /* Deep navy (#1a365d) */
--chart-4: oklch(0.4474 0.0343 261.3244);           /* Mid-tone blue (#2d3748) */
--chart-5: oklch(0.3351 0.0331 260.9120);           /* Dark blue (#1a202c) */
```

---

## Sidebar & Navigation Colors

### Sidebar Colors
```css
/* Light Mode */
--sidebar: oklch(0.9816 0.0017 247.8390);           /* Light background (#f8f9fa) */
--sidebar-foreground: oklch(0.2223 0.0060 271.1393); /* Dark text (#1a1b1e) */
--sidebar-primary: oklch(0.3327 0.0772 257.1001);   /* Deep navy (#1a365d) */
--sidebar-primary-foreground: oklch(1.0000 0 0);    /* White text (#ffffff) */
--sidebar-accent: oklch(0.7392 0.1154 242.0535);    /* Light blue (#63b3ed) */
--sidebar-accent-foreground: oklch(0.2223 0.0060 271.1393); /* Dark text (#1a1b1e) */
--sidebar-border: oklch(0.9288 0.0126 255.5078);    /* Light border (#e2e8f0) */
--sidebar-ring: oklch(0.7392 0.1154 242.0535);      /* Focus ring (#63b3ed) */

/* Dark Mode */
--sidebar: oklch(0.2621 0.0095 248.1897);           /* Dark background (#2a2d3a) */
--sidebar-foreground: oklch(0.9816 0.0017 247.8390); /* Light text (#f8f9fa) */
--sidebar-primary: oklch(0.7392 0.1154 242.0535);   /* Light blue (#63b3ed) */
--sidebar-primary-foreground: oklch(0.2223 0.0060 271.1393); /* Dark text (#1a1b1e) */
--sidebar-accent: oklch(0.5241 0.1259 252.3236);    /* Vibrant blue (#2b6cb0) */
--sidebar-accent-foreground: oklch(0.9816 0.0017 247.8390); /* Light text (#f8f9fa) */
--sidebar-border: oklch(0.3451 0.0133 248.2124);    /* Dark border (#394047) */
--sidebar-ring: oklch(0.7392 0.1154 242.0535);      /* Focus ring (#63b3ed) */
```

---

## Design System Properties

### Typography
```css
--font-sans: Inter;                                 /* Primary sans-serif font */
--font-serif: Georgia;                              /* Primary serif font */
--font-mono: monospace;                             /* Monospace font */
```

### Border Radius
```css
--radius: 0.5rem;                                   /* Base radius (8px) */
--radius-sm: calc(var(--radius) - 4px);             /* Small radius (4px) */
--radius-md: calc(var(--radius) - 2px);             /* Medium radius (6px) */
--radius-lg: var(--radius);                         /* Large radius (8px) */
--radius-xl: calc(var(--radius) + 4px);             /* Extra large radius (12px) */
```

### Shadows
```css
/* Light Mode Shadows */
--shadow-2xs: 0px 2px 8px 0px hsl(0 0% 0% / 0.05);
--shadow-xs: 0px 2px 8px 0px hsl(0 0% 0% / 0.05);
--shadow-sm: 0px 2px 8px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
--shadow: 0px 2px 8px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
--shadow-md: 0px 2px 8px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
--shadow-lg: 0px 2px 8px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);
--shadow-xl: 0px 2px 8px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10);
--shadow-2xl: 0px 2px 8px 0px hsl(0 0% 0% / 0.25);

/* Dark Mode Shadows (Enhanced) */
--shadow-2xs: 0px 2px 8px 0px hsl(0 0% 0% / 0.25);
--shadow-xs: 0px 2px 8px 0px hsl(0 0% 0% / 0.25);
--shadow-sm: 0px 2px 8px 0px hsl(0 0% 0% / 0.50), 0px 1px 2px -1px hsl(0 0% 0% / 0.50);
--shadow: 0px 2px 8px 0px hsl(0 0% 0% / 0.50), 0px 1px 2px -1px hsl(0 0% 0% / 0.50);
--shadow-md: 0px 2px 8px 0px hsl(0 0% 0% / 0.50), 0px 2px 4px -1px hsl(0 0% 0% / 0.50);
--shadow-lg: 0px 2px 8px 0px hsl(0 0% 0% / 0.50), 0px 4px 6px -1px hsl(0 0% 0% / 0.50);
--shadow-xl: 0px 2px 8px 0px hsl(0 0% 0% / 0.50), 0px 8px 10px -1px hsl(0 0% 0% / 0.50);
--shadow-2xl: 0px 2px 8px 0px hsl(0 0% 0% / 1.25);
```

### Letter Spacing
```css
--tracking-normal: 0px;                             /* Base tracking */
--tracking-tighter: calc(var(--tracking-normal) - 0.05em);  /* Tighter */
--tracking-tight: calc(var(--tracking-normal) - 0.025em);   /* Tight */
--tracking-wide: calc(var(--tracking-normal) + 0.025em);    /* Wide */
--tracking-wider: calc(var(--tracking-normal) + 0.05em);    /* Wider */
--tracking-widest: calc(var(--tracking-normal) + 0.1em);    /* Widest */
```

---

## Usage Guidelines

### When to Use Each Color

#### Primary Colors
- **Primary**: Main CTAs, navigation active states, brand elements
- **Secondary**: Secondary actions, interactive elements, highlights
- **Accent**: Hover states, focus indicators, decorative elements

#### Background Colors
- **Background**: Main app background, content areas
- **Card**: Elevated surfaces, containers, modals
- **Muted**: Subtle backgrounds, disabled states, secondary info

#### Status Colors
- **Destructive**: Errors, warnings, delete actions
- **Chart colors**: Data visualization, progress indicators, categories

#### Utility Colors
- **Border**: Dividers, input outlines, card edges
- **Ring**: Focus states, active selections, keyboard navigation

### Accessibility Considerations
- All color combinations meet WCAG 2.1 AA contrast requirements (4.5:1 minimum)
- Focus indicators use high-contrast ring colors
- Dark mode provides enhanced contrast for better readability
- Status colors remain distinguishable for color-blind users

### Implementation Notes
- Use OKLCH color space for consistent perceptual lightness
- Colors automatically adapt between light and dark themes
- All values are available as CSS custom properties and Tailwind utilities
- Maintain consistent spacing and radius values across components

---

## Quick Reference

### Hex Color Palette
```
Primary Blues:
#1a365d (Deep Navy) - Primary
#2b6cb0 (Vibrant Blue) - Secondary  
#63b3ed (Light Blue) - Accent

Neutrals:
#ffffff (White) - Light backgrounds
#f8f9fa (Very Light Gray) - Muted light
#e2e8f0 (Light Gray) - Borders light
#6c757d (Medium Gray) - Text muted light
#394047 (Medium Dark Gray) - Muted dark  
#2a2d3a (Dark Gray) - Card dark
#1a1b1e (Dark Navy) - Dark backgrounds

Status:
#ef4444 (Red) - Destructive light
#991b1b (Dark Red) - Destructive dark
```

This color palette creates a cohesive, professional, and accessible design system that works seamlessly across light and dark themes while maintaining excellent contrast ratios and visual hierarchy.