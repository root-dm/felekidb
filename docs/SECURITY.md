# Security

Security considerations and practices for FelekiDB.

## Authentication

### Provider: Auth.js with Google OAuth

- Industry-standard OAuth 2.0 flow
- No password storage
- Session-based authentication with secure cookies

### Session Configuration

```typescript
// src/lib/auth.ts
export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
```

## Authorization

### Route Protection

Protected routes are enforced at the layout level:

```typescript
// src/app/(main)/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

### Resource Authorization

Every mutation checks ownership:

```typescript
export async function updateMovieNight(nightId: string, data: UpdateData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  
  const night = await prisma.movieNight.findUnique({
    where: { id: nightId },
  });
  
  if (night?.hostId !== session.user.id) {
    throw new Error('Forbidden: Not the host');
  }
  
  // Proceed with update
}
```

## Data Protection

### Input Validation

All inputs validated with Zod before processing:

```typescript
import { z } from 'zod';

export const createMovieNightSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  scheduledAt: z.date().refine(d => d > new Date(), {
    message: 'Date must be in the future',
  }),
  location: z.string().max(100).optional(),
});
```

### SQL Injection Prevention

Prisma uses parameterized queries by default:

```typescript
// Safe - parameterized
await prisma.user.findUnique({
  where: { email: userInput },
});

// Never do this
// await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

### XSS Prevention

React escapes output by default. Additional measures:
- Sanitize user-generated content (comments, pitches)
- CSP headers block inline scripts

## CSRF Protection

Server Actions have built-in CSRF protection:
- Unique tokens per session
- Origin validation
- Automatic for all form submissions

## Environment Security

### Secrets Management

| Variable | Sensitivity | Storage |
|----------|-------------|---------|
| DATABASE_URL | High | .env.local only |
| GOOGLE_CLIENT_SECRET | High | .env.local + production env |
| TMDB_ACCESS_TOKEN | Medium | .env.local + production env |
| NEXTAUTH_SECRET | High | Generated, production env |

### Never Commit

`.gitignore` must include:
```
.env
.env.local
.env.production
```

### Secret Rotation

- Generate new NEXTAUTH_SECRET for production
- Rotate Google OAuth credentials annually
- Revoke and regenerate if compromised

## HTTP Security Headers

Configured in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' image.tmdb.org; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
  },
];
```

## Rate Limiting

### API Routes

Implement rate limiting for public endpoints:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // Handle request
}
```

### Invite Links

- Invite codes are cryptographically random (cuid2)
- Links expire after event date
- Rate limit join attempts per IP

## Logging & Monitoring

### What to Log
- Authentication events (login, logout)
- Authorization failures
- Rate limit hits
- Server errors (without sensitive data)

### What NOT to Log
- Passwords (we don't have them, but still)
- Full session tokens
- Personal user data
- API keys

## Incident Response

### If Credentials Exposed

1. Revoke immediately (Google Console, TMDB settings)
2. Generate new secrets
3. Rotate NEXTAUTH_SECRET (invalidates all sessions)
4. Audit access logs

### If Data Breach Suspected

1. Take app offline if needed
2. Audit database access logs
3. Notify affected users
4. Review and patch vulnerability

## Security Checklist

Before deploying:

- [ ] All secrets in environment variables
- [ ] .env files in .gitignore
- [ ] HTTPS enforced (Vercel default)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] Authorization checks on all mutations
- [ ] No sensitive data in client bundles
- [ ] Dependency audit (`npm audit`)
