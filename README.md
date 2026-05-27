# Lumera

Lumera is a Netflix-style streaming and creator discovery platform built for filmmakers, cinematographers, editors, actors, and visual storytellers. Creators upload their work, build a portfolio, and get discovered — audiences browse films by category, engage with creators, and explore the stories behind every project.

**Live at:** [watchlumera.com](https://watchlumera.com)

---

## What It Does

- **Stream films** — Browse and watch short films, documentaries, sports cinematics, commercials, and more
- **Creator portfolios** — Every creator gets a public portfolio page with their bio, gear kit, social links, and full filmography
- **Production credits** — Contributors (DP, editor, actor, sound designer, etc.) are tagged on every film with their roles and handles
- **Production metadata** — Budget, gear used, and the full story behind how each project was made
- **Film management** — Creators upload, edit, publish/unpublish, and manage their films from a personal dashboard
- **Community** — Likes, film reporting, and admin-level content moderation

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- React Router 7
- Tailwind CSS 3 (custom dark theme with gold accent)
- Framer Motion
- Lucide React (icons)

### Backend
- Python — FastAPI + Uvicorn
- PostgreSQL — SQLAlchemy async ORM
- JWT authentication (7-day tokens, bcrypt password hashing)
- Pydantic v2 (schema validation)

### Media & Storage
- Cloudflare Stream (video hosting + playback)
- Cloudflare R2 (image/thumbnail storage)
- Local filesystem fallback for development

### Deployment
- Backend: Railway (containerized via Docker)
- Frontend: Cloudflare Pages
- Database: Railway-managed PostgreSQL

---

## Current Features (Level 3 MVP)

### Authentication
- User registration and login
- JWT token auth (7-day session)
- Admin and creator role flags

### Film Workflow
- Upload films with title, description, production story, budget, gear, duration
- Thumbnail (2:3 vertical poster) + cover (16:9 banner) + video upload
- Contributor tagging (name, role, social handle)
- Category assignment (8 default categories)
- Publish/draft toggle
- Edit film metadata post-upload
- Delete films

### Creator Profiles
- Avatar, display name, bio, location
- Social links (Instagram, YouTube, personal website)
- Gear kit
- Awards (title, festival, year)
- Public portfolio page with all published films

### Browsing & Discovery
- Home page with horizontal category rows (only populated categories shown)
- Film detail page with full metadata, video player, creator sidebar
- Public creator profile pages

### Community
- Like system
- Report system (5 reason categories)
- Admin panel: view reports, force-delete flagged films

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full 10-level plan.

---

## License

[MIT](LICENSE)
