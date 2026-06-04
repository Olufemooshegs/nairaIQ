# NairaIQ — Phase 6: Frontend Integration
## Copilot Engineering Prompt

---

## WHAT YOU ARE BUILDING

A React single-page application (SPA) that is the **visual layer** for NairaIQ — a deterministic Nigerian financial intelligence platform. The backend (FastAPI, PostgreSQL, Supabase) is fully built across Phases 1–5. You are building only the frontend.

This is **not** a generic admin dashboard. It is a **fintech analytics product** built specifically for Nigeria — and it must look and feel like one.

---

## NON-NEGOTIABLE DESIGN MANDATE

The UI must be **animated, alive, and kinetic**. Every meaningful state transition must have motion. This is the primary design requirement alongside correctness.

**Animation targets (mandatory):**

- Page transitions: fade + slide between routes
- Onboarding steps: slide in from right, slide out to left on progress
- Dashboard cards: staggered mount animation (delay each card by 80ms)
- Score values: count-up animation from 0 to actual value on mount
- Budget allocation bars: animate width from 0 to final % on mount
- Loading states: a pulsing branded skeleton, not a spinner
- The "generating profile" screen: typewriter-style step reveal, identical in feel to the reference design already in use
- Number formatting transitions: when any ₦ value updates, animate the change

**Motion philosophy:** Animations should feel **purposeful and financial** — not playful or bouncy. Think Bloomberg terminal coming to life, not a landing page. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for reveals. Duration: 300–500ms for transitions, 800ms for count-ups.

**Color system (use exactly):**
```
navy:    #0A2342   (primary background)
navyM:   #0F2D54   (card backgrounds)
navyL:   #1B4980   (secondary elements)
teal:    #00A878   (primary accent, CTAs, active states)
tealBg:  #E6FFF6   (teal wash for selected states on light backgrounds)
tealDk:  #007A58   (teal hover state)
orange:  #F26522   (warning accent)
red:     #D84040   (danger/critical pressure)
yellow:  #F5A623   (caution/medium states)
white:   #FFFFFF
offW:    #F4F7FA   (light page background)
gray:    #8FA3B8   (muted text)
grayL:   #D5E1EC   (borders on light backgrounds)
grayXL:  #EEF3F8   (very light fills)
dark:    #0D1E30   (dark text on light backgrounds)
```

**Typography:** `'Sora'` (weights 400, 600, 700, 800) from Google Fonts. Import in `index.html`. This is the only font used throughout.

---

## TECH STACK — EXACT VERSIONS

```
React 18 + TypeScript
Vite 5
React Router v6 (createBrowserRouter)
Zustand (state management — NOT Redux)
Axios (HTTP client)
Recharts (charts only)
React Hook Form + Zod (onboarding form only)
Tailwind CSS v3 (utility classes)
```

No other UI libraries. No component kits. Custom CSS-in-JS via inline styles or Tailwind only.

---

## PROJECT STRUCTURE

Create this exactly:

```
nairaiq_frontend/
  src/
    app/
      router.tsx          ← createBrowserRouter, all routes defined here
      providers.tsx        ← QueryClient, RouterProvider, AuthGuard wrapper

    pages/
      LandingPage.tsx      ← animated hero, no auth required
      LoginPage.tsx
      RegisterPage.tsx
      OnboardingPage.tsx   ← 4-step form, <60s UX target
      GeneratingPage.tsx   ← animated profile-building screen
      DashboardPage.tsx    ← main analytics dashboard
      HistoryPage.tsx      ← analytics timeline
      TrendsPage.tsx       ← chart-heavy trend visualization

    components/
      layout/
        AppShell.tsx       ← sidebar nav + main content area
        Sidebar.tsx        ← navigation for authenticated users
        TopBar.tsx         ← user info, logout
      auth/
        ProtectedRoute.tsx
        AuthForm.tsx       ← shared login/register form shell
      onboarding/
        StepIndicator.tsx
        StepAboutYou.tsx
        StepLocation.tsx
        StepIncome.tsx
        StepSituation.tsx
      dashboard/
        SummaryCards.tsx   ← income, surplus, priority cards
        MetricCard.tsx     ← single animated metric card
        BudgetAllocation.tsx ← animated horizontal bars
        ExpenseBreakdown.tsx
        StrategicPriority.tsx
      charts/
        PressureChart.tsx  ← Recharts line chart
        SavingsChart.tsx
        TrendChart.tsx     ← reusable, accepts data + label props
      shared/
        StatusPill.tsx     ← colored pill for pressure/priority/etc
        Logo.tsx
        NairaValue.tsx     ← animated ₦ number display
        SkeletonCard.tsx   ← pulsing loading skeleton

    services/
      api.ts               ← Axios instance, base URL, interceptors
      auth.service.ts      ← login, register, logout
      onboarding.service.ts
      analytics.service.ts
      dashboard.service.ts ← GET /api/v1/dashboard/{user_id}
      history.service.ts   ← GET /api/v1/history/analytics/{user_id}
      trends.service.ts    ← GET /api/v1/trends/{user_id}

    store/
      auth.store.ts        ← Zustand: user, token, isAuthenticated
      dashboard.store.ts   ← Zustand: dashboardData, loading, error
      ui.store.ts          ← Zustand: sidebarOpen, activeStep

    hooks/
      useAuth.ts
      useDashboard.ts
      useAnimatedNumber.ts ← custom hook: animates number from 0 to target
      useOnboarding.ts

    schemas/
      auth.schema.ts       ← Zod schemas for login/register
      onboarding.schema.ts ← Zod schema for all 4 onboarding steps

    types/
      auth.ts
      analytics.ts
      dashboard.ts
      trends.ts
      onboarding.ts

    utils/
      formatters.ts        ← formatNaira(n), formatPercent(n), etc
      constants.ts         ← NIGERIAN_STATES[], OCCUPATIONS[], INCOME_BANDS[]
      animations.ts        ← shared animation variants/keyframes

    styles/
      global.css           ← Tailwind directives + CSS custom properties
```

---

## BACKEND API CONTRACT

The backend is running at `http://localhost:8000`. All endpoints require JWT Bearer token in `Authorization` header except auth endpoints.

### Auth endpoints

```
POST /api/v1/auth/register
Body: { email, password, full_name }
Response: { access_token, token_type, user_id }

POST /api/v1/auth/login
Body: { username (email), password }  ← OAuth2PasswordRequestForm format
Response: { access_token, token_type }

GET /api/v1/auth/me
Response: { id, email, full_name, created_at }
```

### Onboarding

```
POST /api/v1/onboarding/submit
Body: {
  state: string,
  occupation: string,
  income_range: string,   ← e.g. "100k_200k"
  pays_rent: boolean,
  has_dependants: boolean,
  primary_bank: string,
  age_range: string
}
Response: { profile_id, message }
```

### Dashboard (main payload)

```
GET /api/v1/dashboard/{user_id}
Response: {
  summary: {
    headline: string,
    priority_action: string,
    financial_health: string
  },
  scores: {
    pressure_score: number,      ← 0–11
    overall_health_score: number ← 0–100
  },
  timeline: [
    { month: string, pressure_score: number }
  ],
  expense_breakdown: [
    { category: string, amount: number, percentage: number }
  ],
  trend_analysis: [
    { metric: string, direction: string, change_pct: number }
  ],
  strategic_priority: string,
  income: number,
  surplus: number,
  budget: {
    survival: number, survival_pct: number,
    savings: number, savings_pct: number,
    investment: number, investment_pct: number,
    flex: number, flex_pct: number
  },
  profile: {
    income_level: string,   ← "low" | "medium" | "high"
    pressure: string,       ← "low" | "medium" | "high" | "critical"
    saving_cap: string,
    investment_readiness: string ← "not_ready" | "developing" | "ready"
  }
}
```

### History & Trends

```
GET /api/v1/history/analytics/{user_id}
Response: {
  records: [
    { computed_at: string, pressure_score: number, health_score: number }
  ]
}

GET /api/v1/trends/{user_id}
Response: {
  trends: [
    {
      metric: string,
      current_value: number,
      previous_value: number,
      direction: "improving" | "declining" | "stable",
      timeline: [{ month: string, value: number }]
    }
  ]
}
```

---

## PAGES — DETAILED SPEC

### 1. LandingPage.tsx

Dark background (`#0A2342`). Full-screen hero.

- Logo top left, "Log in" + "Get started" top right (no underline, ghost button)
- Hero headline (54px, weight 800, letter-spacing -2px): `₦100k salary. Rent. Dependants. What actually makes sense?`
- Teal accent on second line
- Subheadline (18px, muted): "Answer 8 questions in under 60 seconds."
- Primary CTA button → navigates to `/register`
- Sample profile preview cards (3×2 grid, static mock data): Income Level, Financial Pressure, Saving Capacity, Investment Ready, Priority, Monthly Surplus
- "How it works" section: 3 columns — 01 Answer 8 questions / 02 Get your profile / 03 View your dashboard
- Trust strip: 🔐 No BVN · 🏦 No bank access · ⚡ 60-second profile · 🇳🇬 Built for Nigeria
- **Animation**: Hero text fades up with staggered delay (headline → subheadline → CTA → cards). Each preview card slides up 60ms apart.

### 2. RegisterPage.tsx / LoginPage.tsx

Split layout: left = navy branded panel with logo + tagline, right = white form panel.

- Form uses React Hook Form + Zod
- Password show/hide toggle
- Error messages inline under each field
- Teal "continue" button at bottom
- "Already have an account? Log in" link below
- **Animation**: Form panel fades in from right on mount

### 3. OnboardingPage.tsx

4-step wizard. White card, max-width 600px, centered.

- Progress bar at top (teal fill, animated width transition)
- Step indicator: 4 numbered circles, teal fill for completed
- Each step slides in from right as you progress, slides out to left as you go back

**Step 1 — About You**: Name input (text), Age range (radio cards: 18–24, 25–34, 35–44, 45–54, 55+)

**Step 2 — Location**: State dropdown (37 Nigerian states + FCT), Occupation grid (radio cards: Private Sector, Government, Tech/IT, Self-employed, Freelancer, Healthcare, Teacher, Trader, Student, Other)

**Step 3 — Income**: 6 income band cards in 2×3 grid. Each shows band label + sub-label. Selected = teal border + teal wash background.

**Step 4 — Situation**: "Do you pay rent?" toggle (Yes/No buttons), "Do you have dependants?" toggle, Primary bank dropdown (16 Nigerian banks).

Navigation: Back/Continue buttons. Continue disabled until step validation passes. Final step button: "Build my profile →" which submits to API then navigates to `/generating`.

### 4. GeneratingPage.tsx

Full dark screen. Centered card.

- Pulsing teal logo animation (3 concentric rings, CSS keyframe pulse)
- "Building your profile, [first name]" heading
- Checklist of 7 steps appearing one at a time, 380ms intervals:
  - Analysing income level...
  - Calculating financial pressure...
  - Estimating likely expenses...
  - Measuring saving capacity...
  - Checking investment readiness...
  - Computing profile vector...
  - Generating your profile...
- Each completed step shows teal checkmark, opacity drops to 0.6
- After all complete: 600ms pause → navigate to `/dashboard`

### 5. DashboardPage.tsx

AppShell wrapper (sidebar + main). Main content max-width 900px.

**Layout (top to bottom):**

1. **Greeting strip**: "Hello, [first name] 👋" + meta info (state, occupation, bank)
2. **Income hero card** (full-width, navy): Monthly Income (large), Monthly Surplus (right-aligned, teal if positive else yellow), Strategic Priority (pill)
3. **4-column metric grid**: Income Level, Financial Pressure, Saving Capacity, Investment Readiness — each `MetricCard` with `StatusPill` and description
4. **Budget Allocation**: Horizontal bars for Survival/Savings/Investment/Flex with animated width
5. **Bottom 2-col grid**: Expense Categories (pills) + CTA card to History

**Animation sequence on mount:**
1. Greeting fades in (0ms delay)
2. Income card slides up (100ms)
3. Metric cards staggered (200ms, 280ms, 360ms, 440ms)
4. Budget bars animate width after 600ms
5. Bottom grid fades in at 800ms

### 6. HistoryPage.tsx

Timeline view of historical analytics records.

- Line chart (Recharts) showing `pressure_score` over time
- List of historical records as cards with date and key metrics
- Empty state if no history yet

### 7. TrendsPage.tsx

Chart-heavy page. 2-column grid of `TrendChart` components.

- Pressure Score trend
- Savings progression
- Financial health movement
- Each chart: Recharts LineChart, responsive, custom tooltip showing ₦ values

---

## STATE MANAGEMENT — ZUSTAND

```typescript
// auth.store.ts
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}
// Persist token to localStorage

// dashboard.store.ts
interface DashboardStore {
  data: DashboardPayload | null
  isLoading: boolean
  error: string | null
  fetchDashboard: (userId: string) => Promise<void>
}
```

---

## AXIOS CONFIGURATION

```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

// Request interceptor: inject Bearer token from auth store
// Response interceptor: on 401 → clear auth store → redirect to /login
```

---

## ROUTING

```typescript
// app/router.tsx
const router = createBrowserRouter([
  { path: '/',          element: <LandingPage /> },
  { path: '/login',     element: <LoginPage /> },
  { path: '/register',  element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,   ← redirects to /login if not auth'd
    children: [
      { path: '/onboarding',  element: <OnboardingPage /> },
      { path: '/generating',  element: <GeneratingPage /> },
      { path: '/dashboard',   element: <DashboardPage /> },
      { path: '/history',     element: <HistoryPage /> },
      { path: '/trends',      element: <TrendsPage /> },
    ]
  }
])
```

---

## PERFORMANCE CONSTRAINTS

- First Contentful Paint target: under 1.5s on 4G
- Lazy-load HistoryPage and TrendsPage with `React.lazy + Suspense`
- Recharts only imported on chart pages (lazy)
- No unnecessary re-renders: use `useMemo` for dashboard data transformations
- Images: none. SVG icons only (inline, not icon library)
- Fonts: preloaded in `<head>` with `rel="preload"`

---

## NIGERIAN CONTEXT CONSTANTS

Place in `utils/constants.ts`:

```typescript
export const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara"
]

export const OCCUPATIONS = [
  { key: "private",    label: "Private Sector (Formal)" },
  { key: "government", label: "Government / Public Sector" },
  { key: "tech",       label: "Tech / IT Professional" },
  { key: "self",       label: "Self-employed / Business Owner" },
  { key: "freelance",  label: "Freelancer / Gig Worker" },
  { key: "healthcare", label: "Healthcare Worker" },
  { key: "teacher",    label: "Teacher / Educator" },
  { key: "trader",     label: "Trader / Artisan" },
  { key: "student",    label: "Student" },
  { key: "other",      label: "Other" },
]

export const INCOME_BANDS = [
  { key: "below_50k",  label: "Below ₦50,000",       sub: "Entry level" },
  { key: "50k_75k",    label: "₦50,000 – ₦75,000",   sub: "Junior salary" },
  { key: "75k_100k",   label: "₦75,000 – ₦100,000",  sub: "Mid junior" },
  { key: "100k_200k",  label: "₦100,000 – ₦200,000", sub: "Mid-level professional" },
  { key: "200k_400k",  label: "₦200,000 – ₦400,000", sub: "Senior / Management" },
  { key: "above_400k", label: "Above ₦400,000",       sub: "Executive / High earner" },
]

export const BANKS = [
  "Access Bank","GTBank","Zenith Bank","UBA","First Bank","FCMB",
  "Fidelity Bank","Stanbic IBTC","Ecobank","Union Bank","Kuda Bank",
  "Opay","Carbon","Moniepoint","Wema / ALAT","Other"
]
```

---

## FORMATTERS

```typescript
// utils/formatters.ts
export const formatNaira = (n: number): string =>
  `₦${Math.round(n).toLocaleString()}`

export const formatPercent = (n: number): string =>
  `${n}%`

export const pressureColor = (p: string): string => ({
  low: '#00A878', medium: '#F5A623', high: '#F26522', critical: '#D84040'
}[p] ?? '#8FA3B8')

export const priorityLabel = (p: string): string => ({
  survival: 'Survival', stability: 'Stability', growth: 'Growth'
}[p] ?? p)
```

---

## ANIMATED NUMBER HOOK

```typescript
// hooks/useAnimatedNumber.ts
export function useAnimatedNumber(target: number, duration = 800): number {
  // Uses requestAnimationFrame to animate from 0 → target
  // Returns current animated value
  // Trigger: when target changes or on mount
}
```

Use this hook inside `NairaValue.tsx` and score displays.

---

## STATUS PILL COMPONENT

```typescript
// components/shared/StatusPill.tsx
// Props: value string, type: 'pressure'|'priority'|'investment'|'level'|'saving'
// Returns colored pill based on value
// Colors match the color system above
```

---

## WHAT NOT TO BUILD

- No chatbot, no conversation UI, no AI chat interface
- No WebSocket connections
- No real-time updates
- No admin panel or user management UI beyond profile display
- No payment flows
- No notification system (yet)
- No dark mode toggle (the app is already dark-first on key screens)

---

## IMPLEMENTATION ORDER

Build in this sequence. Do not jump ahead.

1. `index.html` + Vite config + Tailwind config + Google Fonts
2. `utils/constants.ts`, `utils/formatters.ts`, `types/`
3. `services/api.ts` + auth service
4. `store/auth.store.ts`
5. `app/router.tsx` + `app/providers.tsx` + `ProtectedRoute`
6. `LandingPage.tsx` (static, animated)
7. `LoginPage.tsx` + `RegisterPage.tsx`
8. `OnboardingPage.tsx` (all 4 steps, connected to API)
9. `GeneratingPage.tsx`
10. `store/dashboard.store.ts` + `services/dashboard.service.ts`
11. Shared components: `Logo`, `StatusPill`, `NairaValue`, `MetricCard`, `SkeletonCard`
12. `DashboardPage.tsx` (full animated layout)
13. `HistoryPage.tsx`
14. `TrendsPage.tsx` + `TrendChart.tsx`
15. `AppShell.tsx` + `Sidebar.tsx` (authenticated navigation)
16. Error boundaries + loading states throughout

---

## ENVIRONMENT

```env
VITE_API_URL=http://localhost:8000
```

---

## FINAL ENGINEERING PRINCIPLES

- Frontend **never** computes financial values. It only renders what the backend returns.
- Dashboard renders from backend payload directly — no local calculations.
- Every API call goes through the service layer, never from components directly.
- Zustand store is the single source of truth for auth and dashboard state.
- TypeScript strict mode. No `any`. All API responses typed.
- Components are reusable. `MetricCard`, `TrendChart`, `StatusPill` accept typed props.
- Error states must be handled gracefully with user-facing messages.
- The onboarding form must be completable in under 60 seconds — measure this.
