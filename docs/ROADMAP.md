# Roadmap

FelekiDB development roadmap and priorities.

## Current Phase: MVP (v1.0)

Target: Complete core functionality for friend group movie nights.

### Milestone 1: Foundation ✅
- [x] Project setup and documentation
- [x] Database schema design
- [x] Architecture decisions

### Milestone 2: Core Infrastructure 🔄
- [ ] Next.js app with TypeScript
- [ ] PostgreSQL + Prisma setup
- [ ] Google OAuth authentication
- [ ] Base UI components

### Milestone 3: Movie Night Flow
- [ ] Create movie night
- [ ] Invite system (shareable links)
- [ ] TMDB integration for search
- [ ] Nomination system
- [ ] Voting mechanism

### Milestone 4: Rating & Reputation
- [ ] Post-watch rating UI
- [ ] Rating calculation
- [ ] Reputation event system
- [ ] User profile with reputation

### Milestone 5: Polish & Launch
- [ ] Loading, empty, error states
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Deployment to production

---

## Phase 2: Enhanced Social (v1.1)

*Target: Q3 2026*

### Features
- **Friend System** - Add friends, see their reputation
- **Leaderboards** - Compare picks among friend group
- **Comments** - Discuss movies before and after watching
- **Notifications** - Email/push for invites, voting, etc.

### Improvements
- Real-time voting updates (WebSocket)
- Mobile-responsive optimizations
- Performance improvements

---

## Phase 3: Discovery (v1.2)

*Target: Q4 2026*

### Features
- **Trending Movies** - Show what's popular on TMDB
- **Watch History** - Movies you've seen via FelekiDB
- **Recommendations** - Based on group preferences
- **Collections** - Save movies for later

### Improvements
- Advanced search filters (genre, year, rating)
- Similar movies suggestions

---

## Phase 4: Integrations (v2.0)

*Target: 2026*

### Features
- **Streaming Availability** - Where to watch (JustWatch API)
- **Calendar Sync** - Export to Google/Apple calendar
- **Watch Party Links** - Teleparty, Discord Activity integration
- **Watchlist Import** - From Letterboxd, IMDb, etc.

### Improvements
- Native mobile apps (React Native)
- Advanced group analytics

---

## Phase 5: Scale & Community (v2.5)

*Target: 2027*

### Features
- **Public Movie Nights** - Join open events
- **Film Clubs** - Organized groups with themes
- **Recurring Events** - Weekly movie night templates
- **Achievements** - Gamification badges

### Improvements
- Multi-language support
- Regional content recommendations

---

## Backlog / Under Consideration

These features may be prioritized based on user feedback:

| Feature | Complexity | Priority |
|---------|------------|----------|
| TV series multi-episode tracking | High | Low |
| Split bill integration | Medium | Low |
| Theater showtimes | Medium | Low |
| Watch simultaneously feature | High | Medium |
| Multiple voting rounds | Low | Medium |
| Anonymous voting option | Low | Low |

---

## Technical Debt & Infrastructure

Ongoing improvements:

- [ ] Comprehensive test coverage (>80%)
- [ ] CI/CD pipeline optimization
- [ ] Monitoring and alerting setup
- [ ] Database optimization and indexing
- [ ] CDN configuration for assets
- [ ] Documentation updates

---

## How Roadmap is Updated

1. User feedback analyzed monthly
2. Technical feasibility assessed
3. Priorities adjusted quarterly
4. This document updated accordingly

**Last Updated:** January 2026
