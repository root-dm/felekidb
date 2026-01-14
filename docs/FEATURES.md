# Features

Detailed specifications for FelekiDB features, organized by priority.

## MVP Features

### F1: Google Authentication

**Description:** Users sign in using their Google account via OAuth 2.0.

**Requirements:**
- One-click sign in with Google
- Automatic account creation on first login
- Session persistence across browser sessions
- Secure sign-out

**User Story:**  
As a user, I want to sign in with my Google account so I don't need to create yet another password.

**Acceptance Criteria:**
- [ ] Google OAuth button on landing page
- [ ] Successful OAuth creates user record
- [ ] User profile shows Google avatar and name
- [ ] Session persists for 30 days
- [ ] Sign out clears session completely

---

### F2: Dashboard

**Description:** Central hub showing upcoming and past movie nights.

**Requirements:**
- List of upcoming nights (user is host or attendee)
- List of recently completed nights
- Quick create button
- Empty state for new users
- Real-time RSVP counts

**Views:**
| State | Display |
|-------|---------|
| Empty | Onboarding prompt with "Create First Night" |
| Has Upcoming | Cards sorted by date, soonest first |
| Has History | Tab to view past nights |

**Acceptance Criteria:**
- [ ] Upcoming nights sorted by date
- [ ] Past nights accessible via tab
- [ ] Create button always visible
- [ ] Loading skeleton during fetch
- [ ] Error state with retry

---

### F3: Create Movie Night

**Description:** Form to create a new movie night event.

**Input Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Title | Text | Yes | 3-100 characters |
| Date | DateTime | Yes | Must be in future |
| Location | Text | No | Max 100 characters |
| Description | Textarea | No | Max 500 characters |
| Voting Deadline | DateTime | No | Before event date |

**Behavior:**
- Creates MovieNight record with user as host
- Generates unique invite code
- Shows invite link modal on success
- Redirects to night detail page

---

### F4: Invite System

**Description:** Multiple ways to invite friends to a movie night.

**Methods:**
1. **Shareable Link** - Copy unique URL that auto-adds user to night
2. **Username Search** - Search for existing users by name (future)

**Invite Link Format:**
```
https://felekidb.app/join/{invite_code}
```

**Behavior:**
- Links are valid until event date
- Clicking link when logged in → auto-join
- Clicking link when logged out → auth then join
- Duplicate join attempts are handled gracefully

---

### F5: Movie Nomination

**Description:** Attendees nominate movies from TMDB database.

**Search Features:**
- Real-time search against TMDB API
- Results show: poster, title, year, type (movie/TV)
- Pagination for long results
- Debounced search (300ms)

**Nomination Data:**
| Field | Source | Notes |
|-------|--------|-------|
| tmdbId | TMDB | External ID |
| title | TMDB | Official title |
| posterUrl | TMDB | Cached locally |
| releaseYear | TMDB | Year only |
| mediaType | TMDB | "movie" or "tv" |
| pitch | User | Optional, max 250 chars |

**Rules:**
- Any attendee can nominate
- Max 3 nominations per user per night (configurable)
- Cannot nominate duplicates
- Cannot nominate after voting starts

---

### F6: Voting System

**Description:** Democratic voting on nominated movies.

**Mechanics:**
- One vote per user
- Can change vote before close
- Host can close voting manually
- Auto-close at deadline if set

**Display:**
- Show all nominations with details
- Highlight user's current vote
- Show vote counts (configurable: live or hidden)
- Countdown to deadline

**Tie Breaking:**
- Random selection among tied movies
- Or host picks (configurable)

---

### F7: Rating System

**Description:** Post-watch ratings that feed into reputation.

**Rating Scale:** 1-5 stars (with half-star increments)

**Workflow:**
1. Host marks night as "Watched"
2. Rating window opens (default: 48 hours)
3. All attendees can submit rating
4. After window closes, average is calculated
5. ReputationEvent created for nominator

**Minimum Participation:**
- Require at least 3 ratings for reputation to count
- Configurable threshold

---

### F8: Reputation System

**Description:** Tracks quality of movie suggestions over time.

See [Reputation System](REPUTATION_SYSTEM.md) for full details.

**Display:**
- Reputation score on user profile
- Leaderboard on dashboard (optional)
- History of reputation events

---

### F9: History View

**Description:** Browse past movie nights and their outcomes.

**Information Displayed:**
- Movie watched (poster, title)
- Date and attendees
- Average rating
- Individual ratings (optional)
- Who nominated the winner

**Filters:**
- All past nights
- Only nights I hosted
- Only nights I attended

---

## Future Features (Post-MVP)

### F10: Real-Time Updates
WebSocket-based live updates for voting and RSVPs.

### F11: Movie Discussion
Comment thread for each movie night.

### F12: Watch Together Integration
Links to streaming services or virtual watch party tools.

### F13: Recurring Movie Nights
Templates for weekly/monthly events.

### F14: Mobile Apps
Native iOS and Android applications.

### F15: Achievement System
Badges and achievements for participation milestones.
