# SafeSpace

Tenant safety reporting, landlord reviews, and jurisdiction-aware renter rights.

**Live:** [safespace.spirittree.dev](https://safespace.spirittree.dev)
**Stack:** Vite + React, TailwindCSS, Supabase, Stripe, OpenAI
**Status:** Active

## What This Is

SafeSpace is the active product repo for the SafeSpace platform. It combines two public channels on the same property record:

- health and safety reports
- landlord and management reviews

SafeSpace validates addresses, merges community safety and review data at the property level, and resolves the legal stack behind each address across city, county, state, and federal layers. Colorado is the first fully coherent state in the rollout, with national research coverage expanding from there.

Built as a React SPA with hash routing, it is designed to stay privacy-first and practical: EXIF data is stripped from uploaded photos, legal notices are generated in the browser, and property pages surface the public record without forcing a read-only user to sign in.

## Features

- 🚨 **Emergency Guide** — interactive decision tree identifying 24hr/72hr/standard issues
- ⚖️ **Know Your Rights** — accordion-based rights library with legal citations
- 🏠 **Property Lookup** — search properties by address, view reports, comments, reviews, and jurisdiction layers
- 📋 **Report Issues** — submit health violations with evidence tiers and photo uploads (EXIF stripped)
- ⏱️ **Response Tracker** — local-storage deadline calculator and issue tracker
- 📄 **Legal Notice Generator** — client-side PDF generation, no data leaves the browser
- 💳 **Landlord Responses** — $10 Stripe-gated responses for safety reports and rental reviews
- 🔐 **Auth** — Supabase email/password + Google OAuth
- 🤖 **AI Chat Widget** — context-aware tenant rights assistant
- 🏙️ **City Pages** — city-specific housing information with county, state, and federal overlays

## AI Integration

**AI Chat Widget** — an embedded chat assistant that answers tenant rights questions using OpenAI. Context-aware to the current page and Colorado housing law.

## Tech Stack

- **Framework:** Vite + React (SPA with HashRouter)
- **Styling:** TailwindCSS
- **Database:** Supabase (auth + data)
- **Payments:** Stripe
- **AI:** OpenAI
- **PDF:** jspdf (client-side generation)
- **Hosting:** Vercel

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for payments |

## Part of SpiritTree

This project is part of the [SpiritTree](https://spirittree.dev) ecosystem — an autonomous AI operation building tools for the agent economy and displaced workers.

## License

MIT
