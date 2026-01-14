# AI Context

> **Purpose:** This document helps AI assistants understand FelekiDB and work effectively with the codebase.

## What is FelekiDB?

FelekiDB is a **social movie-night planner** built with Next.js, PostgreSQL, and TMDB integration. Users can:

1. **Create movie nights** - Schedule events with friends
2. **Nominate movies** - Search and suggest from TMDB
3. **Vote** - Democratically choose what to watch
4. **Rate** - Score the movie after watching
5. **Build reputation** - Track who picks great movies

## Source of Truth Documents

Before making changes, read these authoritative documents:

| Document | Authority Over |
|----------|---------------|
| [DB_SCHEMA.md](../docs/DB_SCHEMA.md) | Database models, relations, fields |
| [ARCHITECTURE.md](../docs/ARCHITECTURE.md) | Folder structure, patterns, data flow |
| [FEATURES.md](../docs/FEATURES.md) | Feature requirements, acceptance criteria |
| [REPUTATION_SYSTEM.md](../docs/REPUTATION_SYSTEM.md) | Scoring algorithm, anti-abuse rules |
| [API_INTEGRATION.md](../docs/API_INTEGRATION.md) | TMDB integration, caching |
| [SECURITY.md](../docs/SECURITY.md) | Auth, authorization, data protection |
| [DECISIONS.md](../docs/DECISIONS.md) | Why technical choices were made |

## Core Rules for AI

### 1. Read Docs First

Before writing code that touches:
- Database → Read `DB_SCHEMA.md`
- Reputation → Read `REPUTATION_SYSTEM.md`
- External APIs → Read `API_INTEGRATION.md`
- Security/Auth → Read `SECURITY.md`

### 2. Update Docs When Behavior Changes

If you modify:
- A database model → Update `DB_SCHEMA.md`
- A feature's behavior → Update `FEATURES.md`
- The reputation algorithm → Update `REPUTATION_SYSTEM.md`
- An architectural pattern → Update `ARCHITECTURE.md`

**Documentation and code must stay in sync.**

### 3. Follow Established Patterns

```typescript
// ✅ Server Actions for mutations
'use server'
export async function createMovieNight(data: Input) { ... }

// ✅ API routes for external data proxying
export async function GET(request: NextRequest) { ... }

// ✅ Zod for validation
const schema = z.object({ ... });
const validated = schema.parse(input);
```

### 4. Type Everything

- Use Prisma-generated types for database models
- Create explicit types for API responses
- Avoid `any` - use `unknown` if type is truly unknown

### 5. Security First

- Check authentication in every Server Action
- Verify authorization (ownership, role) before mutations
- Never expose API keys to client
- Validate all inputs with Zod

### 6. Visual & Design Rules

- **Netflix Aesthetic**: Use dark backgrounds (#141414), red accents (#E50914), and solid cards.
- **No Glassmorphism**: Avoid blurry/glass effects; use solid grays (#181818).
- **Typography**: Bold, clean, cinematic.
- **Micro-interactions**: Use hover scales and glows.


## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| UI | React 18, Next.js 14 App Router |
| Styling | TailwindCSS (Netflix Design System: #E50914 Primary, #141414 Bg) |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth) + Google OAuth |
| Validation | Zod |
| External API | TMDB |

## Folder Structure

```
src/
├── app/                 # Pages and API routes
│   ├── (auth)/          # Auth pages
│   ├── (main)/          # Protected pages
│   └── api/             # API endpoints
├── components/
│   ├── ui/              # Primitives
│   └── features/        # Feature-specific
├── lib/
│   ├── actions/         # Server Actions
│   ├── db/              # Database utilities
│   └── external/        # External APIs
└── types/               # TypeScript types
```

## Common Tasks

### Adding a New Feature

1. Read `FEATURES.md` for requirements
2. Update `DB_SCHEMA.md` if new models needed
3. Create Prisma migration
4. Implement Server Actions in `src/lib/actions/`
5. Build UI components
6. Update documentation

### Modifying Reputation

1. Read `REPUTATION_SYSTEM.md` completely
2. Consider anti-abuse implications
3. Update the document with changes
4. Add tests for new behavior

### Adding External API

1. Document in `API_INTEGRATION.md`
2. Implement caching strategy
3. Handle rate limits
4. Add to environment variables

## Anti-Patterns to Avoid

```typescript
// ❌ Mutable reputation score
await prisma.user.update({ data: { reputation: user.reputation + 10 } });

// ✅ Event-based reputation
await prisma.reputationEvent.create({ data: { userId, points, ... } });

// ❌ Fetching API key in client
const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;

// ✅ Proxy through API route
fetch('/api/movies?q=inception');

// ❌ Missing auth check
export async function deleteNight(id: string) {
  await prisma.movieNight.delete({ where: { id } });
}

// ✅ Auth and authorization
export async function deleteNight(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const night = await prisma.movieNight.findUnique({ where: { id } });
  if (night.hostId !== session.user.id) throw new Error('Forbidden');
  // ...
}
```

## Questions?

If requirements are unclear:
1. Check the documentation files listed above
2. Look for similar patterns in existing code
3. Ask the user for clarification

**When in doubt, favor security and simplicity.**
