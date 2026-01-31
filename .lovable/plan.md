

# SafeRoute - Walking & Cycling Route Planner

A premium, mobile-first route planning app with AI-powered safety insights. Users can explore pre-defined walking and cycling routes, view distance and time estimates, and get safety scores based on local data.

---

## Design Foundation

**Visual Style**
- Dark mode only with grayscale palette + violet accent (#8B5CF6)
- Clean, minimal interface with strong typography hierarchy
- 8pt spacing system throughout

**Core Components**
- Button, PillInput, RouteCard, Badge, BottomSheet, MapOverlay
- All components built as reusable design system pieces

---

## Screen 1: Map Home

The main screen featuring an interactive map (Mapbox) with minimal overlays.

**Elements:**
- Full-screen map with current location marker
- Top: Search pill input ("Where are you going?")
- Bottom: Quick access cards showing 2-3 nearby routes
- Mode toggle: Walking / Cycling icons
- Floating action button for "My Routes"

---

## Screen 2: Route Discovery (Bottom Sheet)

Slides up when user taps search or scrolls up on route cards.

**Elements:**
- Search input with location autocomplete
- Filter pills: Distance, Safety Score, Duration
- List of RouteCards showing:
  - Route name (e.g., "Riverside Trail Loop")
  - Distance & estimated time (e.g., "4.2 km • 52 min walk")
  - Safety badge (Safe / Moderate / Caution) with color coding
  - Small route preview thumbnail

---

## Screen 3: Route Detail (Bottom Sheet)

Expands when user selects a route.

**Elements:**
- Route name and badges
- Map overlay showing the full route highlighted
- Stats row: Distance, Duration, Safety Score
- AI Safety Summary: 2-line insight (e.g., "Well-lit path, moderate foot traffic after 8pm")
- "Save Route" and "Start" buttons
- Option to switch between Walking/Cycling times

---

## Screen 4: Saved Routes

Accessed from profile or floating button.

**Elements:**
- List of user's saved favorite routes
- Quick filters: Recent, Walking, Cycling
- Swipe to remove from favorites

---

## Screen 5: Authentication

Simple sign-in flow using Supabase Auth.

**Elements:**
- Email/password sign up and login
- Bottom sheet presentation (not separate pages)
- Minimal copy: "Sign in to save your routes"

---

## Backend (Supabase via Lovable Cloud)

**Database:**
- `routes` table: Pre-defined routes with coordinates, distance, duration, safety score
- `profiles` table: User display names
- `saved_routes` table: User favorites (many-to-many)

**AI Safety Feature (Mocked for MVP):**
- Safety scores and insights stored per route
- Prepared for future AI agent integration with real crime data

---

## MVP Scope Summary

✓ Interactive Mapbox map  
✓ Pre-defined routes with real placeholder content  
✓ Distance & time estimates for walk/cycle modes  
✓ Mocked AI safety scores and insights  
✓ User accounts with saved routes  
✓ Mobile-first responsive design  
✓ Premium dark mode with violet accent

