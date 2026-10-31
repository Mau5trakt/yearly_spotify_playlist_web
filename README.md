# Yearly Spotify Playlists Web

> Automatically organize your saved Spotify tracks into dedicated yearly playlists through a secure, stateless architecture.

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.4.2-fbf0df?logo=bun)](https://bun.sh/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=react-query)](https://tanstack.com/query)
[![Axios](https://img.shields.io/badge/Axios-1.21-5a29e4?logo=axios)](https://axios-http.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88ce02?logo=greensock)](https://gsap.com/)
[![Tests](https://img.shields.io/badge/Tests-32%20Passing-brightgreen)](#testing-and-verification)

---

## Quickstart

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment Variables
Copy the template and set up your Spotify app credentials in `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | Spotify Developer application Client ID | *Required* |
| `SPOTIFY_CLIENT_SECRET` | Spotify Developer application Client Secret | *Required* |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URI (Spotify requires literal `127.0.0.1`) | `http://127.0.0.1:3000/api/auth/callback` |
| `SESSION_PASSWORD` | Secret key (min. 32 characters) for encrypted session cookies | *Required* |
| `NEXT_PUBLIC_APP_URL` | Base public URL of the application | `http://127.0.0.1:3000` |

### 3. Run the Development Server
```bash
bun dev
```

Open **`http://127.0.0.1:3000`** in your browser and click **Log in with Spotify**.

---

## Features

- **Secure Backend-for-Frontend (BFF):** Spotify access and refresh tokens are sealed into encrypted `HttpOnly` session cookies using `iron-session`. Client secrets are never exposed to the browser.
- **Short Chunked Serverless Endpoints:** Track pagination (50 items/request) and playlist generation (batches of up to 100) are broken into fast (<1s) calls to prevent function execution timeouts.
- **GSAP Zero-Shift Conveyor Belt:** An animated live toast stream displays up to 5 incoming liked tracks in real time with 64px album artwork on the left, smooth height collapse, and zero layout shift.
- **Randomized Visual Sampling:** Incoming track batches are randomly sampled for visual variety during download without delaying the background sync pipeline.
- **In-Memory Analytics:** Instant calculation and display of songs per year, earliest/latest years, and top musical year (`👑`) with GSAP-animated horizontal distribution bars.
- **SASS 7-1 Architecture:** Complete modular stylesheet structure (`styles/globals/`, `styles/components/`, `styles/pages/`) with pure abstractions and responsive mixins.
- **TanStack Query & Axios:** Server state, retries, and network calls are managed declaratively via domain hooks in `@/hooks`.

---

## Repository Structure

```text
├── app/                         # Next.js App Router
│   ├── api/
│   │   ├── auth/                # BFF OAuth routes (login, callback, me, logout)
│   │   └── spotify/             # Serverless endpoints (tracks, playlists)
│   ├── layout.tsx               # Root layout with Providers and global styles
│   ├── page.tsx                 # Declarative main view (Landing / Dashboard)
│   ├── providers.tsx            # QueryClientProvider wrapper for TanStack Query
│   └── proxy.ts                 # Next.js Proxy/Middleware (127.0.0.1 unifier)
│
├── components/                  # React UI components (with barrel export in index.ts)
│   ├── Header.tsx               # Top navigation bar with user profile
│   ├── LandingHero.tsx          # Welcome hero section with Spotify login CTA
│   ├── Dashboard.tsx            # Interactive sync dashboard
│   ├── ProgressBar.tsx          # Accessible progress indicator (WCAG AA)
│   ├── LiveTrackToasts.tsx      # Smooth GSAP conveyor-belt toast stream
│   ├── StatsView.tsx            # Animated KPI cards and yearly distribution chart
│   ├── PlaylistsView.tsx        # Grid of generated playlists with Spotify deep links
│   └── index.ts                 # Unified UI barrel export
│
├── hooks/                       # TanStack Query & Axios custom hooks
│   ├── useAuth.ts               # useAuthQuery(), useLogoutMutation()
│   ├── useSpotify.ts            # useCreatePlaylistMutation(), useSpotifySync()
│   └── index.ts                 # Unified hooks barrel export
│
├── lib/                         # Domain and Business Logic
│   ├── api/                     # Pre-configured Axios instance (apiClient)
│   ├── auth/                    # Encrypted cookie session handling (iron-session)
│   ├── spotify/                 # OAuth client, Web API services, and Zod schemas
│   ├── sync/                    # Pure year grouping and statistics calculation
│   └── index.ts                 # Central domain barrel export
│
├── store/                       # Client UI State
│   └── useSyncStore.ts          # Zustand store for visual progress and conveyor queue
│
├── styles/                      # Modular SASS System (7-1 Pattern)
│   ├── globals/                 # Variables, color tokens, typography, and mixins
│   │   ├── _variables.scss
│   │   ├── _text_colors.scss
│   │   ├── _typography.scss
│   │   ├── _mixins.scss
│   │   ├── _auxiliars.scss
│   │   ├── normalize.scss       # Standalone normalize.css v8.0.1
│   │   ├── base.scss            # Dark document theme, SVG safety, and scrollbar
│   │   └── index.scss           # Abstractions barrel (@forward)
│   ├── components/              # Scoped CSS modules per component
│   └── pages/                   # Scoped CSS modules per page
│
└── tests/                       # Comprehensive Test Suites (Bun Test)
    ├── api-client-and-hooks.test.ts
    ├── architecture-barrel.test.ts
    ├── components-render.test.ts
    ├── live-track-toasts.test.ts
    ├── spotify-schemas.test.ts
    ├── styles-compilation.test.ts
    └── sync-logic.test.ts
```

---

## Spotify Developer Configuration

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create or select an application.
3. In **Settings > Redirect URIs**, register:
   - `http://127.0.0.1:3000/api/auth/callback`  
     *(Note: Spotify requires the literal `127.0.0.1` loopback IP; `localhost` is rejected by Spotify's OAuth policy).*
4. Copy the **Client ID** and **Client Secret** into `.env.local`.

---

## Testing and Verification

The project includes unit and integration tests executed using Bun's native runner:

```bash
# Run all unit and architecture test suites
bun test

# Production build and type checking
bun run build

# Design audit and anti-pattern detection (Impeccable)
npx impeccable detect app components styles
```
