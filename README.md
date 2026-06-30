# FelekiDB 🎬

A social movie-night planner where friends come together to pick, watch, and rate films.

## What is FelekiDB?

FelekiDB helps groups organize movie nights with built-in voting, scheduling, and a reputation system that tracks who picks the best movies over time.

**Key Features:**
- 🔐 Google authentication
- 📅 Create and schedule movie nights
- 👥 Invite friends via link or username
- 🎯 Nominate and vote on movies/series (via TMDB)
- ⭐ Rate movies after watching
- 📊 Reputation system for movie proposers

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Google OAuth credentials

### Setup

```bash
# Clone and install
git clone https://github.com/root-dm/felekidb
cd felekidb
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start PostgreSQL
docker-compose up -d

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

| Document | Description |
|----------|-------------|
| [Product Overview](docs/PRODUCT_OVERVIEW.md) | Core vision and value proposition |
| [User Flows](docs/USER_FLOWS.md) | Step-by-step user journeys |
| [Features](docs/FEATURES.md) | Detailed feature specifications |
| [Architecture](docs/ARCHITECTURE.md) | System design and patterns |
| [Database Schema](docs/DB_SCHEMA.md) | Data models and relationships |
| [Reputation System](docs/REPUTATION_SYSTEM.md) | Scoring algorithm and guardrails |
| [API Integration](docs/API_INTEGRATION.md) | TMDB integration details |
| [Security](docs/SECURITY.md) | Auth and security practices |
| [Environment](docs/ENV.md) | Environment variables |
| [Roadmap](docs/ROADMAP.md) | Future plans |
| [Decisions](docs/DECISIONS.md) | Architecture Decision Records |
| [Test Plan](docs/TEST_PLAN.md) | Testing strategy |

## Tech Stack

- **Frontend:** React 18, Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** Auth.js (NextAuth) with Google provider
- **External API:** TMDB (The Movie Database)
- **Infrastructure:** Docker Compose

## Project Structure

```
felekidb/
├── docs/               # Documentation (source of truth)
├── prompts/            # AI assistant context
├── prisma/             # Database schema & migrations
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Business logic & utilities
│   └── types/          # TypeScript definitions
├── docker-compose.yml
└── .env.example
```

## Contributing

1. Read the [Architecture](docs/ARCHITECTURE.md) and [Decisions](docs/DECISIONS.md) docs
2. Follow the [Review Checklist](prompts/REVIEW_CHECKLIST.md)
3. Update documentation when changing behavior

## License

MIT
