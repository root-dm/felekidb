# Architectural Decision Records

This document captures significant technical decisions for FelekiDB.

---

## ADR-001: Next.js App Router

**Date:** January 2026  
**Status:** Accepted

### Context
Need a React framework with strong TypeScript support, good developer experience, and production-ready features.

### Decision
Use Next.js 14+ with App Router (not Pages Router).

### Rationale
- Server Components reduce client bundle size
- Built-in API routes and Server Actions
- Excellent TypeScript integration
- Strong ecosystem and community
- Vercel deployment simplicity

### Alternatives Considered
- **Remix**: Great DX but smaller ecosystem
- **Vite + React Router**: More flexible but less batteries-included
- **Pages Router**: Legacy pattern, being phased out

---

## ADR-002: PostgreSQL + Prisma

**Date:** January 2026  
**Status:** Accepted

### Context
Need a database solution with relational integrity, good TypeScript support, and easy local development.

### Decision
Use PostgreSQL with Prisma ORM.

### Rationale
- PostgreSQL: Robust, battle-tested, excellent for relational data
- Prisma: Type-safe queries, great DX, automatic migrations
- Schema-as-code enables version control
- Works seamlessly with Next.js

### Alternatives Considered
- **MongoDB + Mongoose**: Better for unstructured data, overkill for our schema
- **SQLite**: Great for local, less suitable for production
- **Drizzle ORM**: Lighter but less mature

---

## ADR-003: Auth.js (NextAuth)

**Date:** January 2026  
**Status:** Accepted

### Context
Need secure authentication with social providers, minimal custom code.

### Decision
Use Auth.js v5 with Google OAuth provider.

### Rationale
- Standard for Next.js authentication
- Handles OAuth complexity automatically
- JWT sessions with secure defaults
- Database adapter for user persistence

### Alternatives Considered
- **Clerk**: Excellent but adds external dependency/cost
- **Supabase Auth**: Tied to Supabase ecosystem
- **Custom OAuth**: Too much security risk

---

## ADR-004: TMDB for Movie Data

**Date:** January 2026  
**Status:** Accepted

### Context
Need external API for movie and TV show metadata.

### Decision
Use The Movie Database (TMDB) API.

### Rationale
- Free for non-commercial use
- Comprehensive movie and TV data
- Regular updates, community-curated
- Generous rate limits
- Excellent documentation

### Alternatives Considered
- **OMDb API**: Limited free tier
- **IMDb**: No public API
- **TVMaze**: TV-only
- **JustWatch**: Streaming-focused

---

## ADR-005: Event-Sourced Reputation

**Date:** January 2026  
**Status:** Accepted

### Context
Reputation must be fair, auditable, and resistant to gaming.

### Decision
Store reputation as immutable events, calculate score on-the-fly.

### Rationale
- Full audit trail of how score was derived
- Can adjust algorithm retroactively
- Easier to add decay, caps, and anti-abuse measures
- More resilient to bugs (can recalculate)

### Alternatives Considered
- **Mutable score field**: Simpler but no history, prone to bugs
- **Blockchain**: Massive overkill
- **External reputation service**: Adds complexity

---

## ADR-006: Server Actions for Mutations

**Date:** January 2026  
**Status:** Accepted

### Context
Need to handle form submissions and data mutations securely.

### Decision
Use Next.js Server Actions instead of API routes for mutations.

### Rationale
- Automatic CSRF protection
- Type-safe end-to-end
- Progressive enhancement (works without JS)
- Collocated with components
- Built-in revalidation

### Alternatives Considered
- **API routes**: More boilerplate, manual CSRF
- **tRPC**: Additional layer for simple CRUD

---

## ADR-007: TailwindCSS for Styling

**Date:** January 2026  
**Status:** Accepted

### Context
Need a styling solution that's productive and maintainable.

### Decision
Use TailwindCSS with component-level styles.

### Rationale
- Rapid development with utility classes
- Consistent design system via config
- Small production bundles (purged CSS)
- Excellent Next.js integration

### Alternatives Considered
- **CSS Modules**: More isolation, slower iteration
- **styled-components**: Runtime cost, less optimal for RSC
- **Vanilla CSS**: No constraints, harder to maintain

---

## ADR-008: Zod for Validation

**Date:** January 2026  
**Status:** Accepted

### Context
Need runtime validation that integrates with TypeScript.

### Decision
Use Zod for all input validation.

### Rationale
- TypeScript-first with type inference
- Works on both client and server
- Composable and readable schemas
- Great error messages

### Alternatives Considered
- **Yup**: Less TypeScript-native
- **io-ts**: Steeper learning curve
- **Manual validation**: Error-prone

---

## Template for New Decisions

```markdown
## ADR-XXX: [Title]

**Date:** [Date]  
**Status:** [Proposed | Accepted | Deprecated | Superseded]

### Context
[What is the issue we're seeing that motivates this decision?]

### Decision
[What is the change we're proposing/making?]

### Rationale
[Why is this the best choice among alternatives?]

### Alternatives Considered
[What other options were evaluated?]

### Consequences
[What are the resulting context and trade-offs?]
```
