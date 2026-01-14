# API Integration

FelekiDB integrates with The Movie Database (TMDB) for movie and TV show data.

## Why TMDB?

| Criteria | TMDB | Alternatives Considered |
|----------|------|------------------------|
| **Cost** | Free for non-commercial | OMDb: Limited free tier |
| **Coverage** | 900k+ movies, 160k+ shows | IMDb: No public API |
| **Data Quality** | Excellent, community-curated | TVMaze: TV only |
| **Rate Limits** | Generous (40 req/10s) | Others: More restrictive |
| **Documentation** | Comprehensive | Others: Variable |

**Decision:** TMDB provides the best balance of coverage, cost, and developer experience.

## TMDB API Overview

Base URL: `https://api.themoviedb.org/3`

### Authentication

TMDB uses an API key (v3 auth) passed as a query parameter or Bearer token.

```
Authorization: Bearer {TMDB_ACCESS_TOKEN}
```

### Key Endpoints

| Endpoint | Description | Use Case |
|----------|-------------|----------|
| `GET /search/multi` | Search movies & TV | Nomination search |
| `GET /movie/{id}` | Movie details | Display info |
| `GET /tv/{id}` | TV show details | Display info |
| `GET /movie/{id}/images` | Movie posters | Poster display |
| `GET /trending/all/week` | Trending content | Suggestions |

## Implementation

### Client Module

```typescript
// src/lib/external/tmdb.ts

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface TMDBSearchResult {
  id: number;
  title?: string;        // Movies
  name?: string;         // TV shows
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  release_date?: string; // Movies
  first_air_date?: string; // TV shows
  overview: string;
}

export async function searchMovies(query: string): Promise<TMDBSearchResult[]> {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );
  
  const data = await response.json();
  return data.results.filter(
    (r: TMDBSearchResult) => r.media_type === 'movie' || r.media_type === 'tv'
  );
}
```

### Image URLs

TMDB serves images through their CDN. Poster sizes available:

| Size | Dimensions | Use Case |
|------|------------|----------|
| w92 | 92px wide | Thumbnails |
| w185 | 185px wide | List items |
| w342 | 342px wide | Cards |
| w500 | 500px wide | Detail pages |
| original | Full size | Not recommended |

```typescript
export function getPosterUrl(posterPath: string | null, size = 'w342'): string {
  if (!posterPath) {
    return '/images/no-poster.png';
  }
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}
```

## Caching Strategy

### Server-Side Cache

Use in-memory cache with TTL to reduce API calls:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 3600,      // 1 hour default
  checkperiod: 600,  // Check for expired every 10 min
});

export async function searchMoviesWithCache(query: string) {
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const results = await searchMovies(query);
  cache.set(cacheKey, results);
  
  return results;
}
```

### Cache TTLs

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Search results | 1 hour | Queries change often |
| Movie details | 24 hours | Rarely updated |
| Trending | 6 hours | Updates daily |

## Rate Limiting

TMDB allows ~40 requests per 10 seconds.

### Strategies

1. **Debounce searches** - 300ms delay before API call
2. **Cache aggressively** - Most requests hit cache
3. **Queue requests** - Prevent burst from multiple users

```typescript
// Debounced search in React component
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    fetch(`/api/movies?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, 300),
  []
);
```

## API Route Proxy

We proxy TMDB through our own API to:
- Hide API key from client
- Add server-side caching
- Transform response format

```typescript
// src/app/api/movies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchMoviesWithCache } from '@/lib/external/tmdb';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    const results = await searchMoviesWithCache(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('TMDB search error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}
```

## Error Handling

| Error | Response | Action |
|-------|----------|--------|
| 401 Unauthorized | API key invalid | Check env vars |
| 429 Too Many Requests | Rate limited | Wait and retry |
| 500+ | TMDB server error | Show cached or error state |

```typescript
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, { /* headers */ });
    
    if (response.status === 429) {
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

## Attribution

TMDB requires attribution. Include on any page showing TMDB data:

```html
<a href="https://www.themoviedb.org">
  <img src="/tmdb-logo.svg" alt="TMDB" />
  This product uses the TMDB API but is not endorsed or certified by TMDB.
</a>
```

## Environment Variables

```env
# .env.local
TMDB_ACCESS_TOKEN=your_access_token_here
```

See [ENV.md](ENV.md) for full configuration.
