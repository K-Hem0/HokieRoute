

# Landing Page + Enhanced Map Page with Report Modal

## Overview

This plan adds a new **Landing Page** as the entry point, enhances the existing **Map Page** with a report feature, and creates a **Report Modal** for users to flag issues on routes. All following the existing dark mode premium aesthetic with violet accent.

---

## Architecture

```text
Pages:
  /           -> Landing Page (new entry point)
  /map        -> Map Page (existing Index.tsx, enhanced)

New Components:
  - src/pages/Landing.tsx
  - src/components/ReportModal.tsx
  - src/components/ui/FeatureBadge.tsx (for route badges like "Near help")
  - src/components/MockMapCanvas.tsx (mocked map for landing hero)

Updated Files:
  - src/App.tsx (add route for /map, update "/" to Landing)
  - src/pages/Index.tsx -> src/pages/Map.tsx (rename and enhance)
  - src/components/RouteCard.tsx (add feature badges)
  - src/lib/mock-data.ts (add badge data to routes)
```

---

## Screen 1: Landing Page (`/`)

**Layout:**
- Full viewport height
- Dark background with subtle gradient
- Centered content

**Hero Section:**
- Large heading: "Walk safer. Ride smarter."
- Subheading: "AI-powered route planning with real-time safety insights"
- Primary CTA button: "Start Safe Route" -> navigates to `/map`
- Mocked map preview with subtle animation (parallax or fade-in)

**Features Section:**
- 3 feature tiles in a responsive grid (1 col mobile, 3 col desktop)
- Each tile has: icon, title, short description
- Feature examples:
  1. "AI Safety Scores" - Shield icon
  2. "Community Reports" - Users icon  
  3. "Real-time Alerts" - Bell icon

**Footer:**
- Simple single-line footer
- "SafeRoute" branding left, "Made with care" right
- Muted text styling

**Animations:**
- Hero content fades in with staggered delay
- Feature tiles scale-in on scroll/load
- CTA button has hover scale effect

---

## Screen 2: Map Page (`/map`)

**Enhancements to existing Index.tsx:**

1. **Floating Report Button**
   - Position: bottom-right, above navigation controls
   - Icon: Flag or AlertTriangle
   - Opens ReportModal on click
   - Subtle pulse animation to draw attention

2. **Route Cards with Badges**
   - Add 2-3 feature badges per route (not just safety)
   - Badge examples: "Near help", "Fewer crossings", "Community verified", "Well-lit"
   - Compact horizontal scroll of badges below route stats

3. **Bottom Sheet Route Options**
   - Always show 3 route cards in bottom sheet
   - Each card displays: time, distance, safety badge, feature badges
   - Existing functionality preserved

---

## Screen 3: Report Modal

**Trigger:** Floating "Report" button on map

**Modal Content:**

1. **Header**
   - Title: "Report an Issue"
   - Close button (X)

2. **Pin Drop Section (Mocked)**
   - Static map preview with a pin marker in center
   - Text: "Tap to adjust pin location" (non-functional for MVP)
   - Rounded container with border

3. **Category Selection**
   - Label: "What's the issue?"
   - 4 selectable category cards in 2x2 grid:
     - Broken light (Lightbulb icon)
     - Construction (HardHat icon)
     - Unsafe area (AlertTriangle icon)
     - Other (MoreHorizontal icon)
   - Single selection with visual highlight

4. **Optional Note**
   - Label: "Additional details (optional)"
   - Textarea with placeholder
   - 3-line max height

5. **Actions**
   - Cancel button (secondary/outline)
   - Submit button (primary)
   - On submit: close modal + show toast "Report submitted"

**Animations:**
- Modal slides up from bottom (mobile) or zooms in (desktop)
- Category cards have press/active state
- Smooth transitions

---

## Component Details

### FeatureBadge Component
```typescript
interface FeatureBadgeProps {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "verified" | "safety";
}
```
- Small pill-shaped badge
- Muted background with subtle icon
- Variants for different badge types

### Updated Mock Data
```typescript
interface Route {
  // existing fields...
  badges: RouteBadge[];
}

interface RouteBadge {
  id: string;
  label: string;
  icon: string; // icon name
  type: "feature" | "verified" | "safety";
}
```

---

## Navigation Flow

```text
Landing (/)
    |
    v [Click "Start Safe Route"]
    |
Map (/map)
    |
    +-- Browse routes (existing)
    +-- Open route details (existing)
    +-- Click Report button -> Report Modal
    +-- Auth flows (existing)
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/App.tsx` | Modify | Add `/map` route, update `/` to Landing |
| `src/pages/Landing.tsx` | Create | New landing page component |
| `src/pages/Map.tsx` | Create | Rename from Index.tsx, add report button |
| `src/pages/Index.tsx` | Delete | Replaced by Landing.tsx |
| `src/components/ReportModal.tsx` | Create | Modal with pin drop and category select |
| `src/components/ui/FeatureBadge.tsx` | Create | Reusable badge for route features |
| `src/components/RouteCard.tsx` | Modify | Add feature badges display |
| `src/lib/mock-data.ts` | Modify | Add badges array to routes |

---

## Technical Notes

### Styling
- Follows existing 8pt spacing system
- Uses existing color tokens (primary, muted, card, etc.)
- Consistent border-radius (rounded-xl for cards, rounded-full for badges)

### Animations (Framer Motion)
- Landing hero: `initial={{ opacity: 0, y: 20 }}` -> `animate={{ opacity: 1, y: 0 }}`
- Feature tiles: staggered `transition={{ delay: 0.1 * index }}`
- Modal: uses existing Dialog animations

### Responsive Design
- Landing: single column on mobile, multi-column on desktop
- Feature tiles: `grid-cols-1 md:grid-cols-3`
- Report modal: full-width on mobile, centered max-w-md on desktop

### No Backend Required
- All data is mocked in `mock-data.ts`
- Report submission shows toast, no actual API call
- State managed locally in components

