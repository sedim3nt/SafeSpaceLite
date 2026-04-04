# SafeSpace Sitemap

## Public Routes (safespace.spirittree.dev)

```
/#/                          → Homepage (national, address search, city grid, feature cards)
/#/boulder                   → Boulder landing page (dedicated, laws, reviews, resources)
/#/city/:slug                → City page (any of 11 cities — rights, deadlines, enforcement)
/#/property-lookup           → Safety Check (address → rights + reviews + report actions)
/#/property/:propertyId      → Property detail (community comments, safety history)
/#/review                    → Leave a Review (7-category Likert, 5 relationship types)
/#/report                    → Report an Issue (photo evidence, anonymous option)
/#/tracker                   → Track Landlord Response (deadline monitoring)
/#/know-your-rights          → General tenant rights (all jurisdictions)
/#/legal-notice              → Legal Notice Generator (template letters with law citations)
/#/emergency-guide           → Emergency Guide (decision tree, deadlines, contacts)
/#/advocate                  → AI Tenant Advocate (situation analyzer, template letters)
```

## Supported Cities (/#/city/:slug)

| City | Slug | State |
|------|------|-------|
| Boulder | boulder (redirects to /boulder) | CO |
| Fort Collins | fort-collins | CO |
| Ann Arbor | ann-arbor | MI |
| Eugene | eugene | OR |
| Santa Cruz | santa-cruz | CA |
| Somerville | somerville | MA |
| Olympia | olympia | WA |
| Portland | portland-me | ME |
| Asheville | asheville | NC |
| Burlington | burlington | VT |
| Ithaca | ithaca | NY |

## User Flows

### Safety Flow (address → rights → action)
1. User enters address on homepage or /property-lookup
2. USPS validates and identifies jurisdiction
3. If supported city: show rights, deadlines, enforcement contacts, reviews
4. If unsupported city: show AI Advocate + general rights + review option
5. User can: view rights → report issue → track response → generate legal notice

### Review Flow (rate → share → help future tenants)
1. User goes to /review (or clicks "Leave a Review" from any page)
2. Step 1: Enter address (USPS validated, property created/found)
3. Step 2: Select relationship type (owner, management co, master tenant, owner-occupant, co-op)
4. Step 3: Rate across 7 categories (1-5 emoji scale)
5. Step 4: Select tags, write comment, choose anonymous/named
6. Optional: AI Review Helper improves their text
7. Submit → stored in Supabase → visible on property page

### Emergency Flow
1. User hits /emergency-guide
2. Decision tree: What type of emergency?
3. Shows legally mandated response deadline for their city
4. Shows enforcement contacts + emergency numbers
5. Can generate legal notice citing specific statutes

## Components

### Interactive Features
- AddressAutocomplete — real-time address suggestions
- ReviewForm — 7-category Likert with emoji ratings
- AIChatWidget — floating AI Advocate (OpenRouter/Haiku)
- ReviewAIHelper — "Improve with AI" button in review flow
- DecisionTree — emergency type → deadline → contacts
- DeadlineCalculator — track repair compliance
- CivicTempGauge — (Boulder only) community engagement vis

### Data Sources
- cityRegistry.ts — 11 cities with full structured data
- boulderSeedReviews.ts — 18 seed reviews for Boulder
- research/safespace-state-laws.json — 54 state/territory profiles
- research/safespace-major-cities.json — 100 cities (500K+)
- research/safespace-midsize-cities.json — 100 cities (200K-500K)
- research/safespace-100k-cities.json — 100 cities (100K-200K)
- research/safespace-100-cities.json — 100 college towns
- More tiers actively being researched (50K-100K, 25K-50K)

## Tech Stack
- Vite + React + TypeScript + TailwindCSS
- Supabase (auth, reviews, properties, landlords)
- USPS Address Validation API
- OpenRouter / Claude Haiku (AI Advocate)
- GitHub Pages (static hosting)
- Stone Garden design system (rice paper palette, Vollkorn/Cabin fonts)
