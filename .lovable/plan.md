

# Stone River Junk Removal — Premium SaaS-Style Rebuild

A complete frontend transformation delivering a high-end, trust-building experience that converts visitors into quote requests.

---

## 1. Design System Foundation

**Color Palette**
- Primary background: Deep charcoal slate (#1a1a2e / #16213e)
- Accent color: Vibrant teal (#00d9ff) for CTAs and highlights
- Secondary: Soft slate gray for cards and sections
- Text: Clean white and muted grays for contrast

**Typography**
- Font family: Inter or Plus Jakarta Sans
- Tight letter spacing for modern "tech" aesthetic
- Large, bold headlines with subtle gradient overlays

---

## 2. Hero Section (Split-Screen)

**Left Side**
- Bold headline: "Haul Away the Clutter. Reclaim Your Space."
- Subheadline explaining fast, eco-friendly junk removal
- Primary CTA button: "Get Free Quote" with animated shimmer/glow effect
- Secondary text link: "See How It Works"

**Right Side**
- Floating image card with soft shadow and rounded corners
- Before/After split comparison showing transformation
- Interactive slider or static split-view showcasing your work

**Trust Marquee (Below Hero)**
- Infinite horizontal scroll with badges:
  - "100% Eco-Friendly Disposal"
  - "Licensed & Insured"
  - "5-Star Rated Service"
  - "Same-Day Pickup Available"

---

## 3. Interactive Service Grid

**Card Categories (Residential + Commercial)**
- Furniture & Appliances
- Yard Waste & Debris
- Construction Cleanup
- Estate Cleanouts
- Commercial Junk Removal
- E-Waste & Recycling

**Card Behavior**
- Default state: Glassmorphism card with icon + title
- Hover state: Teal glow border, icon animation, expanded content
- Info tags inside cards: "Same Day," "Residential," "Commercial," "Eco-Friendly"

**Animations**
- Smooth scale and glow on hover using Framer Motion
- Icons perform subtle bounce or pulse animations

---

## 4. Animated Stats Section

Three counters that animate when scrolling into view:
- **500+** Properties Cleaned
- **100%** Customer Satisfaction
- **200+** 5-Star Reviews

Modern card layout with subtle gradient backgrounds and number counting animation.

---

## 5. Sticky Glass Navigation

- Transparent header at page top
- Shrinks and gains backdrop blur on scroll
- "Stone River" logo on left
- Navigation links: Services, About, Reviews, Contact
- Persistent "Get Free Quote" button always visible

---

## 6. Scroll Reveal Animations

All major sections fade and slide up with staggered timing as user scrolls:
- Hero → Trust Bar → Services → Stats → Footer
- Smooth, performant animations using Framer Motion and intersection observer

---

## 7. Footer & Final CTA

- Dark slate background matching the brand
- Quick links, contact info, service areas
- Final "Ready to Clear the Clutter?" CTA section
- Social links and eco-friendly certification badges

---

## Technical Implementation

- Install Framer Motion for all animations
- Use Lucide React for consistent iconography
- Add Inter/Plus Jakarta Sans font via Google Fonts
- Implement custom CSS variables for the new color palette
- Build reusable animated components (GlassCard, ShimmerButton, CountUp)

