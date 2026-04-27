# SplitMate — React Web App

A mobile-friendly expense splitting web app. Same concept as Splitwise — one person manages everything, no accounts needed for participants.

## Features

- ✅ Create groups with emoji icons & categories
- ✅ Add participants by name (no sign-up needed)
- ✅ Log expenses with category, payer & split modes
- ✅ Split equally, by exact amount, or by percentage
- ✅ View balances per person
- ✅ Auto-calculated minimal settlement plan
- ✅ Copy settlements to clipboard
- ✅ Delete expenses & groups
- ✅ Manage participants (add, rename, remove)
- ✅ All data stored in localStorage (no backend needed)
- ✅ Mobile-first dark UI, works great on desktop too

## Quick Start

```bash
cd splitmate-react
npm install
npm start
```

Opens at http://localhost:3000

## Build for Production

```bash
npm run build
```

Outputs to `build/` — deploy to any static host (Netlify, Vercel, GitHub Pages, etc.)

## Tech Stack

- React 18
- Context API + localStorage for state
- CSS custom properties for theming
- No external UI library dependencies
- Inter font from Google Fonts

## Currency

Currently set to LKR (Sri Lankan Rupee). To change, search for `LKR` in `src/utils/models.js` and update `formatAmount()`.
