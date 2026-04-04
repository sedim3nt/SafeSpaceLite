# SafeSpace

Boulder County tenant health & safety rights — no wallet, no blockchain, just tools that work.

**Live:** [safespace.spirittree.dev](https://safespace.spirittree.dev)
**Stack:** Vite + React, TailwindCSS, Supabase, Stripe, OpenAI
**Status:** Active

## What This Is

SafeSpace is a renter-focused reporting tool for Boulder County housing health and safety issues. It helps tenants understand their rights under Colorado's 2024 tenant protection laws, document violations with photo evidence, generate legal notices as client-side PDFs, and track landlord response deadlines.

Built as a React SPA with hash routing, it's designed to be accessible and privacy-first — EXIF data is stripped from uploaded photos, legal notices are generated entirely in the browser, and the property lookup system lets renters see community-reported issues for any address.

The project grew out of real advocacy work around Boulder County renter protection law. It's the kind of tool that should exist as public infrastructure.

## Features

- 🚨 **Emergency Guide** — interactive decision tree identifying 24hr/72hr/standard issues
- ⚖️ **Know Your Rights** — accordion-based rights library with legal citations
- 🏠 **Property Lookup** — search properties by address, view reports and community comments
- 📋 **Report Issues** — submit health violations with photo evidence (EXIF stripped)
- ⏱️ **Response Tracker** — local-storage deadline calculator and issue tracker
- 📄 **Legal Notice Generator** — client-side PDF generation, no data leaves the browser
- 💳 **Landlord Rebuttals** — $10 Stripe-gated rebuttal system
- 🔐 **Auth** — Supabase email/password + Google OAuth
- 🤖 **AI Chat Widget** — context-aware tenant rights assistant
- 🏙️ **City Pages** — city-specific housing information

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
