# Environment Variables

Configuration guide for FelekiDB environment variables.

## Quick Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_URL | Yes | Application base URL |
| NEXTAUTH_SECRET | Yes | Session encryption key |
| GOOGLE_CLIENT_ID | Yes | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Yes | Google OAuth secret |
| TMDB_ACCESS_TOKEN | Yes | TMDB API access token |

## Detailed Configuration

### Database

```env
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/felekidb"
```

**Local Development:**
Uses Docker Compose PostgreSQL instance.

**Production:**
Use managed database (Supabase, Neon, Railway, etc.)

---

### Authentication

```env
# Base URL of your application
# Development: http://localhost:3000
# Production: https://yourdomain.com
NEXTAUTH_URL="http://localhost:3000"

# Secret for encrypting sessions
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
```

**Generating a Secret:**
```bash
openssl rand -base64 32
```

---

### Google OAuth

```env
# Google OAuth credentials from Google Cloud Console
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Setup Instructions:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

---

### TMDB API

```env
# TMDB API access token (v4 auth)
TMDB_ACCESS_TOKEN="your-tmdb-access-token"
```

**Setup Instructions:**

1. Create account at [TMDB](https://www.themoviedb.org)
2. Go to Settings → API
3. Request an API key (free for non-commercial)
4. Copy the "API Read Access Token" (not API Key)

---

## Environment Files

### .env.local (Development)

Create this file in project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/felekidb"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# External APIs
TMDB_ACCESS_TOKEN="your-tmdb-token"
```

### .env.example (Template)

Committed to repo as reference:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/felekidb"

# Auth (generate new secret for production)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# TMDB API (from themoviedb.org)
TMDB_ACCESS_TOKEN=""
```

## Production Deployment

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment
3. Ensure `NEXTAUTH_URL` matches your production domain

### Other Platforms

Consult platform documentation for setting environment variables:
- Railway: Dashboard → Variables
- Render: Environment tab
- Fly.io: `fly secrets set`

## Security Reminders

> [!CAUTION]
> Never commit real credentials to version control.

- `.env.local` is automatically gitignored
- Use unique `NEXTAUTH_SECRET` for production
- Rotate credentials if accidentally exposed
- Use separate OAuth credentials for dev/prod

## Validation

The app validates required variables at startup:

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  TMDB_ACCESS_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);
```

Missing or invalid variables will cause a helpful error at startup.
