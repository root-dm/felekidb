# Task Templates

Reusable prompt templates for common development tasks.

## Feature Implementation

```
I need to implement [FEATURE NAME] for FelekiDB.

Before coding:
1. Read docs/FEATURES.md for requirements
2. Read docs/DB_SCHEMA.md if data changes needed
3. Read docs/ARCHITECTURE.md for patterns

Requirements:
[Paste from FEATURES.md]

Implementation Notes:
- Follow existing patterns in the codebase
- Add Server Actions for mutations
- Include loading, empty, and error states
- Update documentation if behavior changes

Files likely to change:
- [ ] prisma/schema.prisma (if new model)
- [ ] src/lib/actions/[feature].ts
- [ ] src/app/[route]/page.tsx
- [ ] src/components/features/[feature]/

Start by outlining the implementation approach.
```

## Bug Fix

```
There's a bug in FelekiDB:

Observed: [What is happening]
Expected: [What should happen]
Steps to reproduce: [How to trigger]

Before fixing:
1. Identify the root cause
2. Check if it's documented behavior vs actual bug
3. Consider edge cases

After fixing:
1. Add test case to prevent regression
2. Update docs if behavior was incorrectly documented
```

## Database Migration

```
I need to update the database schema:

Change: [Describe the change]

Before migrating:
1. Read docs/DB_SCHEMA.md for current state
2. Consider data migration for existing records
3. Think about backward compatibility

Steps:
1. Update prisma/schema.prisma
2. Run: npx prisma migrate dev --name [name]
3. Update docs/DB_SCHEMA.md
4. Update seed.ts if needed
5. Test with existing data
```

## API Integration

```
I need to integrate with [API NAME]:

Before integrating:
1. Read docs/API_INTEGRATION.md for patterns
2. Check rate limits and caching requirements
3. Plan error handling

Implementation:
1. Create client at src/lib/external/[api].ts
2. Add caching with node-cache
3. Proxy via API route at src/app/api/[endpoint]
4. Document in API_INTEGRATION.md
5. Add environment variables to ENV.md
```

## Component Creation

```
I need to create a React component: [COMPONENT NAME]

Purpose: [What it does]
Props: [Expected inputs]
States: [loading, error, empty, success]

Guidelines:
1. Use TypeScript with explicit prop types
2. Use TailwindCSS for styling
3. Follow accessibility best practices
4. Include loading and error states
5. Write component test

Location: src/components/[ui|features]/[ComponentName].tsx
```

## Server Action

```
I need a Server Action for: [OPERATION]

Input: [Data required]
Output: [Expected return]

Requirements:
1. Must check authentication
2. Must verify authorization
3. Must validate input with Zod
4. Must handle errors gracefully
5. Must revalidate paths or redirect

Template:
'use server'

import { auth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const schema = z.object({ ... });

export async function [actionName](input: z.infer<typeof schema>) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  
  const validated = schema.parse(input);
  
  // Authorization check
  
  // Business logic
  
  revalidatePath('/affected-path');
}
```

## Code Review Request

```
Please review the following code for FelekiDB:

[CODE]

Check against:
1. prompts/REVIEW_CHECKLIST.md
2. Security concerns (SECURITY.md)
3. Pattern consistency (ARCHITECTURE.md)
4. Type safety
5. Error handling
```

## Documentation Update

```
I've made changes that affect documentation:

Changes made:
[Summary of code changes]

Docs to update:
- [ ] DB_SCHEMA.md (if models changed)
- [ ] FEATURES.md (if behavior changed)
- [ ] API_INTEGRATION.md (if API changed)
- [ ] ARCHITECTURE.md (if patterns changed)
- [ ] DECISIONS.md (if new decision made)

Please update the relevant docs to reflect the new behavior.
```

## Performance Investigation

```
I'm investigating a performance issue:

Symptom: [Slow page, high latency, etc.]
Affected area: [Component, route, query]

Investigation steps:
1. Check for N+1 queries in Prisma
2. Check for missing database indexes
3. Check for excessive re-renders
4. Check for uncached API calls
5. Profile with React DevTools / Chrome DevTools

Common fixes:
- Add `include` to avoid N+1
- Add database indexes
- Memoize expensive computations
- Add caching for external API calls
```
