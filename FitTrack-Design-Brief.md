# FitTrack — Design Brief

> A research-grounded design direction for the FitTrack app + marketing site.
> Built from 2026 fitness-app research across 10+ sources covering top apps (Hevy, Strong, Fitbod, Strava, MyFitnessPal, Alpha Progression, Centr, Gymscore), design trends, user complaints, habit psychology, and onboarding conversion research.

---

## 1. Product Positioning

**Tagline candidates** (for the landing page and app stores):
- *"Train smarter. Track every rep."*
- *"The only fitness app built by a trainer, for lifters."*
- *"Your coach in your pocket — without the monthly fee."*

**Who it's for:**
- Serious lifters who want Hevy's clean logging + Fitbod's intelligence + MyFitnessPal's nutrition
- People burned out by subscription-driven apps with paywalls on basic features
- Clients of Jason's coaching business (trust + continuity advantage)

**Single product promise:**
One app that replaces three — your workout tracker, nutrition logger, and progress dashboard — with professional-grade programming built in.

---

## 2. Key Research Insights Driving the Design

### Why fitness apps fail (use this as the north star for what NOT to do)
- **71% of users abandon in month 3**; 77% of daily users gone in 3 days
- **16% quit from workout monotony** → we need variety, progressive overload, and program switching
- **Cumbersome data entry** is the #2 complaint → every tap counts; default to last value, quick-log buttons, auto-complete
- **"What-the-hell effect"**: 63% of users quit after one missed day of a streak → we MUST have streak freezes and 80%-consistency framing
- **Complicated onboarding = app deleted** → keep it under 90 seconds; let users skip to value fast
- **Lack of personalization alienates beginners** → adaptive difficulty based on experience level
- **Battery drain from GPS/video** → lazy-load, skeleton states (already doing this ✅)
- **Generic gamification fatigue** → streaks/badges must tie to real goals, not vanity metrics

### What winning apps do (the playbook)
- **Hevy**: clean logging, rest timers, supersets, social feed — UX is *fast* and feels like a social app
- **Fitbod**: adaptive programming based on recovery + equipment — the app plans for you
- **Strava**: kudos, clubs, challenges, activity feed — social multiplier on motivation
- **Gymscore**: AI form-check via phone camera, 0-100 score
- **Foodnoms**: photo-based food logging (3 sec vs 30-60 sec of manual search)
- **Alpha Progression**: progressive overload engine that tells you exactly what weight/reps to hit next

### 2026 design direction (from trends research)
- **Dark mode with bold accents** — we already do this; double down with jewel-tone accents (indigo + violet ✅)
- **Rounded sans-serif typography**, high contrast, generous line-spacing
- **Large uppercase section headers** define chapters of the experience
- **Micro-animations on state transitions** — haptic-feeling feedback on every interaction
- **Minimal color palette** — one hero accent + 3-4 functional roles (success, warning, error, info)
- **Soft gradients and duotone imagery** for hero moments (PR cards, milestone toasts)

---

## 3. Visual System

### Color Palette (refined from current implementation)

**Primary background & surfaces (dark, current default):**
```
--bg          #0B0B10   ← slightly deeper than current for more contrast punch
--bg-card     #16161F   ← tightens the card-to-bg relationship
--bg-elevated #1F1F2B
--border      #2A2A3A
```

**Text:**
```
--text        #EEF0F8   ← warmer than pure white, easier on eyes
--text-muted  #7A7A90
```

**Hero accent (signature brand color):**
```
--indigo       #6366F1   (keep — it's a great signal color)
--indigo-dark  #4F52D4
--violet       #8B5CF6   (PR celebrations, premium callouts)
```

**Functional roles:**
```
--success #22C55E   (streak hit, meal logged, workout saved)
--warning #EAB308   (getting close to macro limit, streak at risk)
--error   #EF4444   (destructive confirmations)
--info    #06B6D4   (hints, tips, educational content)
--orange  #F97316   (calorie deficit, fat-loss mode)
```

**Light theme companion** (already exists — keep current tokens):
```
--bg          #F4F4F8
--bg-card     #FFFFFF
--bg-elevated #EEEEF4
--text        #1A1A2E
--text-muted  #6B6B85
```

### Typography

- **Primary:** `Inter` — already in use, clean, rounded, excellent at small sizes
- **Numerals:** use `tabular-nums` feature where numbers align in columns (workout sets, macro values)
- **Optional display font** for landing page hero only: `Satoshi` or `Space Grotesk` (paid) or `Manrope` (free alternative)

**Scale:**
```
--text-xs     0.72rem  (labels, meta)
--text-sm     0.85rem  (body secondary)
--text-base   0.95rem  (body primary)
--text-lg     1.1rem   (card titles)
--text-xl     1.35rem  (section titles)
--text-2xl    1.75rem  (page titles)
--text-3xl    2.25rem  (hero stats)
--text-hero   3rem     (landing page only)
```

**Weights:** 400 (body) / 600 (titles) / 700–800 (stats, hero numbers)

### Spacing & Radius

```
--space-1  4px
--space-2  8px
--space-3  12px
--space-4  16px
--space-5  24px
--space-6  32px
--space-8  48px

--r-sm  8px
--r-md  12px
--r-lg  16px
--r-xl  24px   (cards, modals)
--r-pill 999px
```

### Elevation

```
--shadow-sm  0 1px 3px rgba(0,0,0,0.4)
--shadow-md  0 4px 12px rgba(0,0,0,0.35)
--shadow-lg  0 12px 32px rgba(0,0,0,0.4)
--glow-indigo  0 0 24px rgba(99,102,241,0.35)   ← use on CTA hover and PR cards
```

---

## 4. Component Library (what Claude Design should produce)

### Must-have components
1. **Nav bar** (top, sticky) — logo, search, streak flame icon, theme toggle, avatar
2. **Bottom tab bar** (mobile) — Dashboard, Workouts, Nutrition, Progress, Coach
3. **Dashboard hero card** — greeting, date, streak badge, today's workout preview
4. **Stat card** — large number, label, delta indicator (↑ +12% this week)
5. **Macro ring** — circular progress for calories, with inner text + 3 mini rings (protein/carbs/fat)
6. **Workout row** (in logger) — exercise name + sets grid (weight × reps cells, editable inline)
7. **PR card** — trophy icon, exercise name, weight, 1RM, date, duotone gradient background
8. **Streak flame** — animated, pulses on hit, grayed/cracked when broken, tooltip shows freeze tokens
9. **Quick-add FAB** (floating action button) — expands to Water/Meal/Workout/Weight logs
10. **Program card** — cover image (gradient), name, duration, difficulty badge, "Preview" expand
11. **Drum picker** (already built — keep) — for onboarding measurements
12. **Chart container** — line/bar charts with light grid, consistent axis styling
13. **Empty state** — illustration, headline, single CTA (no "you have no data" text walls)
14. **Toast** (already built — keep) — success/warn/error variants with icon
15. **Skeleton loaders** (already built — keep) — on every data-loading view

### New components to request from Claude Design
16. **Today card** — a single-screen "what's on deck" module: workout + meal log prompt + water bar + weight-in reminder
17. **Progress timeline** — vertical timeline of PRs, milestones, weight changes
18. **Challenge card** — weekly challenge with join button, participants, progress ring
19. **Coach message card** — AI-generated daily tip, avatar, single-swipe feedback (helpful/skip)
20. **Form check viewer** — video thumbnail + 0-100 score + flagged issues list

---

## 5. Page Blueprints (for Claude Design to mockup)

### A. Landing Page (marketing site — currently missing)
- **Hero:** Phone mockup on left, headline + subhead + CTA on right
  - Headline: "Train smarter. Track every rep."
  - Subhead: "Professional programming, nutrition coaching, and progress tracking — all in one app."
  - CTAs: "Start free" + "See how it works"
- **Social proof strip:** "Trusted by 500+ lifters" + trainer credentials
- **Feature grid:** 6 tiles (workouts, nutrition, programs, PRs, progress, coach)
- **Results section:** 3 before/after testimonial cards with real numbers
- **Programs showcase:** carousel of the 8 programs with cover art
- **Pricing:** Free tier + Pro tier (kept deliberately simple)
- **FAQ accordion**
- **Footer:** links, socials, trainer contact

### B. App Dashboard (redesign direction)
- Top greeting row + streak badge
- "Today" card (next workout + macros so far + water)
- Active program widget (already built — keep)
- Recent PRs strip (already built — enhance with duotone gradients)
- Weekly summary row (already built — add micro-charts)
- Quick actions grid (log workout, log meal, weigh in, photo)

### C. Workout Logger (redesign direction)
- Header: workout name, timer, calories burned estimate
- Exercise rows: collapsible, inline-editable sets, rest timer auto-starts
- Between-set rest timer (big, center screen, dismissible)
- PR detection flash on weight entry
- "Add exercise" sheet with search + filter by muscle group
- Finish button → summary screen with duration, total volume, new PRs

### D. Nutrition Tracker (enhance)
- Macro rings (big, centered, tappable to see meals that contributed)
- Today's meals list (collapsible breakfast/lunch/dinner/snack)
- Quick-add buttons: last-eaten, frequent foods, barcode scan, **photo log (new)**
- Water bar (tap to add 8oz)

### E. Onboarding (already redesigned — keep drum picker flow)

### F. Progress (enhance)
- PR grid at top (already built ✅)
- Weight chart with goal line overlay
- Body measurements tracker
- Photos timeline (before/after comparison slider)
- Volume chart (by muscle group, weekly)

### G. Coach / AI (new)
- Chat interface with daily check-in prompt
- Program recommendations based on data
- Form-check video upload → score

---

## 6. Motion & Micro-interactions

- **Button press:** 0.98 scale down + haptic (mobile)
- **Card tap:** lift + subtle indigo glow
- **Toast enter:** slide up + spring
- **PR celebration:** confetti burst + trophy pulse + haptic double-tap
- **Streak hit:** flame grows + number flips (odometer style)
- **Progress bar fill:** spring easing over 0.6s
- **Page transitions:** fade + 8px slide (no jarring instant cuts)
- **Skeleton shimmer:** already built ✅

---

## 7. Accessibility Requirements

- All interactive elements min 44×44 tap target
- Color contrast 4.5:1 body, 3:1 large text
- `prefers-reduced-motion` respected for all animations
- Screen reader labels on every icon-only button
- Focus rings visible (indigo outline, 2px, 4px offset)
- Form errors announced via `aria-live="polite"`
- Never use color alone to convey state (always pair with icon or label)

---

## 8. Tone of Voice

- **Direct, encouraging, never condescending.** ("Log that workout" not "Don't forget to log your workout today!")
- **Celebrate wins with specificity.** ("New PR on Bench — 225 lbs × 3. Up 10 lbs from last month.") not ("Great job!")
- **Admit when user is slipping, offer one next step.** ("You've missed 2 workouts. Want to reschedule or swap for a lighter day?")
- **Never shame.** No "You're falling behind!" language.
- **Lean on the trainer voice** (Jason's positioning). Copy should sound like a real coach.

---

## 9. Brand Principles (the filters for every decision)

1. **Fast beats pretty.** A logged workout in 3 seconds trumps a beautiful logged workout in 30.
2. **Trust the numbers.** Every claim is backed by data visible to the user.
3. **No dark patterns.** No fake scarcity, no grief-paywalls on core features.
4. **Respect the serious user.** Power users shouldn't be forced through hand-holding they've outgrown.
5. **Coach, don't nag.** Notifications are scheduled purposefully, not spammed.

---

## 10. Export Notes for Claude Design

When importing this into Claude Design, the following structured output would be ideal:

- **Design Tokens** file (JSON): colors, typography scale, spacing, radii, shadows
- **Component set:** all 20 components listed in Section 4 with default + hover + active + disabled states
- **Page screens:** the 7 blueprints in Section 5, mobile + desktop where applicable
- **Landing page:** full marketing site, responsive

Reference files in this repo for current patterns:
- `frontend/src/index.css` — existing tokens and components
- `frontend/src/pages/*.jsx` — current page implementations
- `frontend/src/components/Skeleton.jsx` — loading states
- `frontend/src/context/ToastContext.jsx` — toast system

---

## Sources

Research compiled from:
- The Manual — Best Fitness Apps 2026
- Digital Trends — Best Fitness Apps 2026
- Forbes / ACE Fitness — Top Workout Apps 2026
- Hevy official site and app store listing
- Fitbod blog — AI Fitness Apps 2026
- Stormotion — Fitness App UI Design Principles
- Yu-kai Chou — Gamification in Fitness
- Autentika — Why Users Abandon Fitness Apps
- Ready4s — 7 Things People Hate in Fitness Apps
- Clevertap — Fitness App Retention Strategies
- Smashing Magazine — Designing a Streak System
- Psychology Today — The Science Behind Habit Tracking
- Amalgama — Psychology Behind Fitness App Onboarding
- UXCam — Top 10 Onboarding Flow Examples
- Moosend / Unbounce / Landingi — Fitness Landing Pages
- Coolors / Envato / UXPin — Color & Design Trends

---

*Document generated: April 2026*
*Living doc — update as design evolves*
