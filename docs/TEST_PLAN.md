# Test Plan

Testing strategy and coverage goals for FelekiDB.

## Testing Philosophy

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Prioritize critical paths** - Auth, voting, rating, reputation
3. **Fast feedback** - Quick tests run on every commit
4. **Realistic data** - Use factories that mirror production

## Test Types

### Unit Tests

**Scope:** Individual functions, utilities, pure business logic

**Tools:** Vitest

**Coverage Target:** 80%

**Examples:**
- Reputation calculation functions
- Date/time utilities
- Validation schemas
- Helper functions

```typescript
// src/lib/reputation.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePoints, applyTimeDecay } from './reputation';

describe('calculatePoints', () => {
  it('returns positive points for above-average ratings', () => {
    expect(calculatePoints(4.5, 5)).toBeGreaterThan(0);
  });
  
  it('returns negative points for below-average ratings', () => {
    expect(calculatePoints(2.0, 5)).toBeLessThan(0);
  });
  
  it('returns zero for exactly average ratings', () => {
    expect(calculatePoints(3.0, 5)).toBe(0);
  });
});
```

---

### Integration Tests

**Scope:** Server Actions, API routes, database operations

**Tools:** Vitest + Prisma test utilities

**Focus Areas:**
- Server Action mutations
- Database queries
- API route handlers
- Auth flows

```typescript
// src/lib/actions/movie-night.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMovieNight } from './movie-night';
import { prisma } from '@/lib/db';

describe('createMovieNight', () => {
  beforeEach(async () => {
    await prisma.movieNight.deleteMany();
  });
  
  it('creates a movie night with valid data', async () => {
    const result = await createMovieNight({
      title: 'Test Night',
      scheduledAt: new Date('2026-02-01'),
    });
    
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Night');
    expect(result.inviteCode).toHaveLength(12);
  });
});
```

---

### Component Tests

**Scope:** React components in isolation

**Tools:** Vitest + React Testing Library

**Focus Areas:**
- User interactions
- Form submissions
- Loading/error states
- Accessibility

```typescript
// src/components/features/voting/VoteButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VoteButton } from './VoteButton';

describe('VoteButton', () => {
  it('shows loading state when voting', async () => {
    render(<VoteButton nominationId="123" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Voting...')).toBeInTheDocument();
  });
  
  it('is disabled when already voted', () => {
    render(<VoteButton nominationId="123" hasVoted />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

### End-to-End Tests

**Scope:** Full user flows through the actual application

**Tools:** Playwright

**Focus Areas:**
- Authentication flow
- Complete movie night lifecycle
- Critical user journeys

```typescript
// e2e/movie-night-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete movie night flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.click('[data-testid="google-login"]');
  // ... OAuth mock
  
  // Create movie night
  await page.goto('/dashboard');
  await page.click('[data-testid="create-night"]');
  await page.fill('[name="title"]', 'Friday Movie');
  await page.fill('[name="scheduledAt"]', '2026-02-01T19:00');
  await page.click('[data-testid="submit"]');
  
  // Verify creation
  await expect(page).toHaveURL(/\/nights\/.+/);
  await expect(page.getByText('Friday Movie')).toBeVisible();
});
```

## Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## CI Pipeline

Tests run on every pull request:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Test Data

### Factories

Use factories to create test data:

```typescript
// tests/factories/movie-night.ts
import { faker } from '@faker-js/faker';

export const movieNightFactory = {
  build: (overrides = {}) => ({
    title: faker.lorem.words(3),
    scheduledAt: faker.date.future(),
    location: faker.location.city(),
    ...overrides,
  }),
};
```

### Seed Data

Development seed script creates:
- 3 test users
- 5 movie nights (various statuses)
- Sample nominations, votes, ratings
- Reputation events

## Coverage Targets

| Area | Target | Priority |
|------|--------|----------|
| Reputation calculation | 95% | Critical |
| Auth utilities | 90% | Critical |
| Server Actions | 85% | High |
| API routes | 85% | High |
| Components | 70% | Medium |
| Utilities | 80% | Medium |

## Manual Testing Checklist

Before release, verify:

- [ ] Google OAuth login works
- [ ] Can create movie night
- [ ] Invite link works for new user
- [ ] TMDB search returns results
- [ ] Voting updates in real-time
- [ ] Ratings calculate average correctly
- [ ] Reputation events are created
- [ ] Mobile layout looks correct
- [ ] Works in Chrome, Firefox, Safari
