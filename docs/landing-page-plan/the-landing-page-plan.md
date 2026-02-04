# Landing Page Redesign Plan

## 1. Goal
Transform the **Auth page** into a high-converting landing page that drives user engagement, specifically targeting the "Guest Play" feature with a **"R100 Free"** hook.

## 2. Assets
- **Main Background**: `public/images/landing.png`
- **Secondary Visual**: `public/images/landing-2.png` (Product showcase)

## 3. Design Concept
- **Layout**: Split screen or centered hero overlay.
- **Theme**: Dark, Premium Casino, Gold/Yellow accents.
- **Hook**: "Play with R100 Free - No Deposit Needed".
- **Primary Action**: "Spin Now" (triggers Guest Mode).
- **Secondary Action**: Login/Register (for saving progress).

## 4. Implementation Details

### Hero Section
- **Background**: Full-screen layout using `landing.png`.
- **Copy**:
  - Headline: "SPIN FREE, WIN REAL"
  - Subheadline: "Join the fastest growing crypto casino. Get R100 FREE when you play as a guest today."
- **Call to Action (CTA)**: "Start With R100 Free" (Triggers Guest Mode).

### Winning Combos & Payouts (New Section)
- **Visuals**: Display symbols alongside their max payouts (5x match).
- **Data Source**: `core/config.ts`

| Symbol | Icon | Max Payout (5x) |
| :--- | :---: | :--- |
| **Wild** | 💎 | **500x** (Substitutes all except Scatter) |
| **Cherry** | 🍒 | **250x** |
| **Lemon** | 🍋 | **200x** |
| **Melon** | 🍉 | **120x** |
| **Grape** | 🍇 | **100x** |

- **Special Features**:
  - **Scatter (⭐)**: Triggers Free Spins (10, 15, or 20 spins).

### Trust & Features
- **Badges**: 
  - ⚡ Instant Payouts
  - 🛡️ Fair Play
  - 💬 24/7 Support

### Auth Form
- **Style**: Floating glassmorphism card on the right side.
- **Functionality**: Toggles between "Sign In" and "Register".

## 5. Verification Checklist
- [ ] Check **R100 balance** upon guest entry.
- [ ] Verify **responsive layout** (Mobile vs Desktop).
- [ ] Confirm navigation works for both **Guest** and **Auth** flows.
- [ ] **Verify Payout Info**: Ensure displayed values match `PAYTABLE` in `config.ts`.