# Lumera Roadmap

Lumera is being built in 10 levels — each one fully functional before the next begins. Every level adds a real, usable layer to the platform rather than laying incomplete groundwork.

The current version is **Level 3 (MVP)** — live at [watchlumera.com](https://watchlumera.com).

---

## Level 1 — Frontend Foundation `COMPLETE`

The visual shell of the platform. No backend, no real data — just the UI framework and navigation.

- React 19 + TypeScript + Vite project setup
- React Router 7 with page-level routing
- Tailwind CSS custom dark theme with gold accent (`#C9A84C`)
- Framer Motion for page transitions and animations
- Navbar with responsive layout
- Home page with horizontal category rows and film cards
- Placeholder film card component (poster, title, creator name)
- Film detail page shell
- Creator profile page shell
- 404 Not Found page

---

## Level 2 — Backend Core `COMPLETE`

The API, database, and authentication that power everything.

- FastAPI + Uvicorn setup
- PostgreSQL with SQLAlchemy async ORM
- JWT authentication — 7-day tokens, bcrypt password hashing
- User registration and login endpoints
- Email verification flow (token-based)
- Admin and creator role flags on users
- Film model with full metadata fields (title, description, budget, gear, duration)
- Category seeding (8 default categories on first run)
- Rate limiting via SlowAPI
- Security headers middleware (X-Frame-Options, CSP, etc.)
- Cloudflare R2 image storage + local filesystem fallback for dev
- Docker containerization for Railway deployment
- CORS configured for Cloudflare Pages frontend

---

## Level 3 — Full Film Workflow (MVP) `COMPLETE`

The full creator and audience experience — upload, discover, engage.

**Film Workflow**
- Upload films with title, description, production story, budget, gear, duration
- Thumbnail upload (2:3 vertical poster format)
- Cover upload (16:9 banner format)
- Video hosting via Cloudflare Stream
- Contributor tagging — name, role (DP, editor, actor, etc.), social handle
- Category assignment
- Publish / draft toggle
- Edit film metadata post-upload
- Delete films with media cleanup

**Creator Profiles**
- Avatar, display name, bio, location
- Social links — Instagram, YouTube, personal website
- Gear kit (list of equipment used regularly)
- Awards (title, festival, year)
- Public portfolio page showing all published films

**Browsing & Discovery**
- Home page shows only populated categories (no empty rows)
- Film detail page — full metadata, Cloudflare Stream video player, creator sidebar, contributors
- Category pages — all films in a given category
- Public creator profile pages

**Community**
- Like system
- Report system — 5 reason categories (spam, inappropriate, misinformation, stolen content, other)
- Admin panel — view reports, force-delete flagged films, manage users

**Legal & Trust**
- Terms of Service, Privacy Policy, Creator Guidelines pages
- Creator Agreement versioning — tracks which version each creator accepted and when
- User report model (report a user, separate from film reports)

---

## Level 4 — Search & Discovery `NEXT`

Make Lumera genuinely browsable and searchable — the difference between a database and a discovery platform.

**Search**
- Full-text search across film titles, descriptions, and creator names
- Search results page with film + creator tabs
- Debounced live search in the navbar

**Filters**
- Filter films by category, duration range, and budget range
- Filter by gear used (for other filmmakers looking for inspiration)
- Sort by: newest, most liked, trending

**Discovery**
- Trending algorithm — weighted score based on views + likes + recency
- "New This Week" row on the home page
- "Featured" slot — admin-curated film pinned to the top of the home page
- Related films on the film detail page (same category or same creator)

**Sitemap & SEO**
- Dynamic sitemap.xml for film and creator pages
- Open Graph meta tags on film detail and creator pages (for link previews)

---

## Level 5 — Social & Community

Creators building an audience, audiences following creators — the social layer that turns Lumera into a community.

**Follows**
- Follow / unfollow creators
- Following count and follower count on creator profiles
- "Following" feed on the home page — films from creators you follow

**Comments**
- Comment on films
- Nested replies (one level deep)
- Like comments
- Report comments
- Admin: view and remove comments

**Notifications**
- In-app notification system
- Notify creators when: someone likes their film, someone comments, someone follows them
- Notification bell in the navbar with unread count
- Mark all as read

**Activity Feed**
- Personal activity log — your likes, comments, and follows
- Public creator activity — "recently liked" or "recently uploaded" shown on their profile (opt-in)

---

## Level 6 — Creator Analytics

Give creators real visibility into how their work is performing.

**View Tracking**
- Count views per film (deduped — one view per user session per 24h)
- Total view counts displayed on film cards and detail pages

**Creator Dashboard Analytics**
- Views over time chart (7d, 30d, 90d)
- Likes over time chart
- Top performing films by views and likes
- Follower growth over time

**Per-Film Stats**
- Views, likes, comment count, and report count per film
- Retention — average watch percentage (from Cloudflare Stream analytics)

**Audience Insights**
- Geography breakdown (country-level from Cloudflare Stream)
- Device type breakdown (mobile vs. desktop)

---

## Level 7 — Industry Features

Tools that make Lumera useful to filmmakers as a professional network, not just a portfolio.

**Creator Collaboration**
- "Open to work" flag on creator profiles (for hire, available for projects)
- Specialty tags — what type of work a creator specializes in
- Direct message / contact form (sends email to creator's address without exposing it)

**Job Board**
- Post a crew call — role needed, project type, location, paid/unpaid, deadline
- Browse open crew calls filtered by role and location
- Apply to a crew call (message + link to your Lumera profile)

**Film Festival Submissions**
- Creators mark films as "festival submitted" or "festival selected"
- Festival laurel badges shown on film cards (e.g., "Official Selection — Sundance 2026")
- Aggregated festival credits on creator profile

**Gear Marketplace Integration**
- Link gear kit items to B&H / Amazon product pages
- "Gear used in this film" section with affiliate-linked items

---

## Level 8 — Monetization

Revenue for Lumera and an income stream for creators.

**Creator Subscriptions**
- Fans subscribe to a creator for exclusive content
- Creators set their own monthly subscription price
- Subscriber-only films (visible only to subscribers and the creator)
- Subscriber count visible on creator profiles

**Stripe Integration**
- Stripe for subscription billing and creator payouts
- Connect creator Stripe accounts for direct payouts
- Lumera takes a platform cut (configurable per-creator or flat rate)
- Subscription management — cancel, pause, view billing history

**Tipping**
- One-time tip on any film or creator profile
- Tip history in the creator dashboard

**Premium Listings**
- Creators pay to feature their film on the home page or category page
- Admin dashboard shows active paid features and revenue

---

## Level 9 — Mobile

Lumera on every screen.

**Progressive Web App (PWA)**
- Installable on iOS and Android home screens
- Offline caching for the home page and recently viewed films
- Push notifications (new film from followed creators)
- Touch-optimized film card swiping

**Performance**
- Lazy loading and infinite scroll on all film lists
- Image optimization — WebP conversion and responsive srcset for thumbnails
- Video prefetch on hover for instant playback start

---

## Level 10 — Scale & Polish

Make Lumera fast, reliable, and fully operational at scale.

**Performance & Infrastructure**
- Redis caching for home page rows, trending scores, and creator profile data
- Background job queue (Celery or ARQ) for video processing, email, and analytics aggregation
- CDN cache rules tuned per content type (thumbnails, video manifests, API responses)
- Database query optimization — indexes, connection pooling, query analysis

**Admin Suite**
- Full admin dashboard: user growth, film upload rate, daily active users
- Content moderation queue — reports sorted by severity with one-click actions
- Bulk actions — ban user, remove film, clear all reports
- Email broadcasting — send announcements to all creators or all users
- Agreement version management — push a new creator agreement and track acceptance

**Reliability**
- Automated database backups with point-in-time recovery
- Uptime monitoring and on-call alerting
- Error tracking (Sentry or equivalent)
- Structured logging with request tracing

**Quality**
- End-to-end test suite (Playwright) covering the critical creator and viewer paths
- API contract tests
- Accessibility audit — WCAG 2.1 AA compliance

---

## Version History

| Version | Level | Description |
|---------|-------|-------------|
| 0.1.0 | 1 | Frontend shell — routing, UI, placeholder data |
| 0.2.0 | 2 | Backend core — auth, database, API |
| 0.3.0 | 3 | MVP — full film workflow, creator profiles, community, live deploy |
