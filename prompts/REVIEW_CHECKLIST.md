# Review Checklist

Use this checklist when reviewing PRs or AI-generated code for FelekiDB.

## Security

- [ ] **Authentication checked** - Server Actions verify session exists
- [ ] **Authorization verified** - User has permission for the resource
- [ ] **Inputs validated** - Zod schema validates all user inputs
- [ ] **No secrets exposed** - API keys not accessible to client
- [ ] **SQL injection safe** - Using Prisma parameterized queries
- [ ] **XSS prevented** - User content properly escaped

## TypeScript

- [ ] **No `any` types** - Use specific types or `unknown`
- [ ] **Props typed** - Components have explicit prop interfaces
- [ ] **Return types explicit** - Functions declare return types
- [ ] **Null handled** - Optional chaining or null checks present
- [ ] **Enums used correctly** - Prisma enums match usage

## Database

- [ ] **Migrations run** - Schema changes have migration file
- [ ] **Indexes considered** - Frequent queries have indexes
- [ ] **Cascades correct** - Delete behavior explicitly defined
- [ ] **Unique constraints** - Duplicates prevented at DB level
- [ ] **Docs updated** - DB_SCHEMA.md reflects changes

## Components

- [ ] **Loading state** - Shows skeleton or spinner during fetch
- [ ] **Error state** - Graceful error display with retry
- [ ] **Empty state** - Helpful message when no data
- [ ] **Accessible** - ARIA labels, keyboard navigation
- [ ] **Responsive** - Works on mobile widths

## Server Actions

- [ ] **'use server' directive** - Present at top of file
- [ ] **Auth check first** - Session verified before logic
- [ ] **Error handling** - Try/catch with meaningful errors
- [ ] **Cache invalidation** - `revalidatePath` or `revalidateTag` called
- [ ] **Atomic operations** - Transactions for multi-step mutations

## API Routes

- [ ] **Method check** - Validates request method
- [ ] **Rate limiting** - Consider for public endpoints
- [ ] **Error responses** - Proper status codes and messages
- [ ] **Caching headers** - Set for cacheable responses
- [ ] **Timeout handling** - External calls have timeout

## Styling

- [ ] **Tailwind classes** - No inline styles
- [ ] **Design tokens** - Using Netflix Red (#E50914) & Dark Theme
- [ ] **Dark mode** - If supported, both modes work
- [ ] **Spacing consistent** - Using spacing scale
- [ ] **Overflow handled** - Long text truncated or wrapped

## Testing

- [ ] **Happy path tested** - Main functionality works
- [ ] **Edge cases covered** - Empty, null, max values
- [ ] **Error cases tested** - Invalid input, auth failures
- [ ] **Mocks appropriate** - External services mocked
- [ ] **Assertions meaningful** - Testing behavior, not implementation

## Documentation

- [ ] **Behavior documented** - New features in FEATURES.md
- [ ] **Schema updated** - Model changes in DB_SCHEMA.md
- [ ] **Decisions recorded** - Significant choices in DECISIONS.md
- [ ] **Code commented** - Complex logic explained
- [ ] **README current** - Setup instructions still accurate

## Performance

- [ ] **N+1 avoided** - Using `include` in Prisma queries
- [ ] **Pagination present** - Large lists are paginated
- [ ] **Images optimized** - Using Next.js Image component
- [ ] **Bundle size** - No unnecessary dependencies
- [ ] **Caching used** - API responses cached appropriately

## Code Quality

- [ ] **Single responsibility** - Functions do one thing
- [ ] **DRY** - No copy-pasted code blocks
- [ ] **Naming clear** - Variables/functions describe purpose
- [ ] **Magic numbers** - Constants named and explained
- [ ] **Lint passes** - No ESLint errors or warnings

---

## Quick Review (5 items)

For faster reviews, focus on these critical items:

1. **Auth & authorization checked?**
2. **Inputs validated with Zod?**
3. **Error states handled?**
4. **Types are specific (no any)?**
5. **Docs updated if behavior changed?**
