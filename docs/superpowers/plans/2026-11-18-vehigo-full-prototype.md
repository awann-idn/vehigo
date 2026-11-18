# Vehigo Full Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Vehigo app — renter (Penyewa) and partner (Mitra/Owner) flows — from the Figma prototype, replacing placeholder screens and filling in every screen through the end of each flow.

**Architecture:** Keep the existing Expo + React Navigation stack. Introduce a shared UI kit and theme tokens, split navigation into `AuthStack` → `OwnerTabs` / `RenterTabs`, group screens by domain (`auth`, `owner`, `renter`), and drive every screen from local mock data. All visuals are code/vector (lucide icons + RN primitives); no image assets are used.

**Tech Stack:** Expo ~58, React Native 0.88, TypeScript 6, @react-navigation/native-stack 7, @react-navigation/bottom-tabs (to add), lucide-react-native, react-native-safe-area-context.

**Spec:** This plan is derived from the Figma file `zFHsEmxo9GG5Em2TO1ufG3` (sections `OWNER` and `PENYEWA (FILLAH)`). Screen node IDs are listed per task; use `get_design_context` + screenshot per screen as the visual source of truth.

## Global Constraints

- Design width 402px, height 874px (iPhone 17). Use flex/percent layout, safe-area insets, no absolute screen positioning except overlays.
- Colors: `#30364F` (primary button/nav), `#1A2138` (primary font), `#E3E4D2` (secondary button), `#F6F3F5` (card background), `#FFFFFF` (background), `#C7C6CE` (stroke at 30%).
- **No image assets.** Do not add or reference PNG/JPG/SVG files. Illustrations, vehicle photos and logos are rendered with vector primitives or lucide icons.
- Copy (Indonesian strings) is taken verbatim from the Figma frames.
- Every screen must compile under `npx tsc --noEmit` and pass `npx expo lint`.
- Mock data only; no backend or API calls.

## Review Focus

- Long forms with keyboard open: inputs must stay visible and scrollable on both platforms.
- Bottom tab + safe area on devices with gesture bars: content must not hide under the tab bar.
- Empty / loading / error states for lists (armada, pesanan, chat) when mock data is empty.
- Role switching: `PilihRole` must route to the correct app and keep a working back path.
- Stepper flows (registration 5 steps, checkout 3 steps, inspection 3 steps, rating 2 steps) must not allow skipping steps or losing entered data on back navigation.

---

## Phase 0 — Foundation

### Task 0.1: Theme tokens and typography

**Files:**
- Modify: `src/theme/colors.ts`
- Create: `src/theme/typography.ts`
- Create: `src/theme/spacing.ts`

**Interfaces:**
- Produces: `colors` (existing keys plus `card`, `stroke`, `secondaryButton`), `spacing` (`xs=4, sm=8, md=16, lg=24, xl=32`), `typography` (`h1, h2, h3, body, bodySm, label, caption` font sizes/weights/line heights).

- [ ] Add tokens above; keep existing keys so current screens do not break.
- [ ] Verify `npx tsc --noEmit` passes.

### Task 0.2: Shared UI kit

**Files:**
- Create: `src/components/Screen.tsx`
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/PrimaryButton.tsx`
- Create: `src/components/TextField.tsx`
- Create: `src/components/SegmentedTabs.tsx`
- Create: `src/components/StatusBadge.tsx`
- Create: `src/components/Card.tsx`
- Create: `src/components/Stepper.tsx`
- Create: `src/components/ListItem.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/components/index.ts`

**Interfaces:**
- `Screen({ children, scroll?: boolean, padded?: boolean })`
- `AppHeader({ title?, onBack?, right?: ReactNode })`
- `PrimaryButton({ label, onPress, variant?: 'primary'|'secondary', disabled? })`
- `TextField({ label?, value, onChangeText, placeholder?, secureTextEntry?, icon?: LucideIcon, error? })`
- `SegmentedTabs({ options: string[], value, onChange })`
- `StatusBadge({ label, tone: 'neutral'|'warning'|'success'|'danger' })`
- `Stepper({ current: number, total: number, labelLeft?: string, labelRight?: string })`
- `Card({ children, style? })`, `ListItem({ icon, title, subtitle?, right?, onPress? })`, `EmptyState({ icon, title, message? })`

- [ ] Implement each component with theme tokens; no hardcoded hex outside theme.
- [ ] Verify typecheck + lint.

### Task 0.3: Navigation restructure

**Files:**
- Modify: `src/navigation/types.ts`
- Modify: `src/navigation/AppNavigator.tsx`
- Create: `src/navigation/AuthStack.tsx`
- Create: `src/navigation/OwnerTabs.tsx`
- Create: `src/navigation/RenterTabs.tsx`

**Interfaces:**
- `RootStackParamList`: `Auth: undefined`, `OwnerApp: undefined`, `RenterApp: undefined`.
- `AuthStackParamList`: `LogoSplash, Splash, Onboarding1..3, Login, SignUp, PilihRole, OwnerRegistration` (5 step routes), `RenterCheckout` entry.
- `OwnerTabs` routes: `Dashboard, Pesanan, Armada, Alerts, Profil`.
- `RenterTabs` routes: `Home, Pesanan, Chat, Notifikasi, Profil`.
- Produces: `navigateToRole(role: 'penyewa'|'mitra')` used by `PilihRoleScreen`.

- [ ] Install tab navigator: `npx expo install @react-navigation/bottom-tabs`.
- [ ] Wire `Auth` → role tabs; delete the unused `MainApp` route.
- [ ] Verify typecheck + lint, then commit (`feat(nav): role-based navigation shell`).

---

## Phase 1 — Auth & Onboarding (match existing screens to Figma)

### Task 1.1: Logo + Splash

**Files:** Modify `src/screens/LogoSplashScreen.tsx`, `src/screens/SplashScreen.tsx`.
**Figma:** `107:1370` (Logo), `104:1373` (Splash).

- [ ] Call `get_design_context` for both nodes (with screenshot) before editing.
- [ ] Render logo mark with vector shapes (no PNG); splash illustration with vector/icon composition.
- [ ] Match copy: "Dari Pilihan ke Perjalanan, Semua dalam Genggaman", button "MULAI SEKARANG", copyright line.
- [ ] Verify typecheck + lint.

### Task 1.2: Onboarding 1–3

**Files:** Modify `Onboarding1Screen.tsx`, `Onboarding2Screen.tsx`, `Onboarding3Screen.tsx`.
**Figma:** `104:1388`, `104:1427`, `104:1498`.

- [ ] Implement header with logo + "Lewati" → `Login`; page control; back/next buttons on step 2.
- [ ] Step 3 "MULAI SEKARANG" → `Login`; show S&K consent line.
- [ ] Replace all PNG illustrations with vector compositions.
- [ ] Verify typecheck + lint.

### Task 1.3: Login + Sign Up + social block

**Files:** Modify `LoginScreen.tsx`, `SignUpScreen.tsx`; Create `src/components/SocialAuthRow.tsx`.
**Figma:** `116:688`, `120:1333`, `120:1332` (social block).

- [ ] Add eye toggle for password, "Lupa Sandi?" (static), guest login link, social buttons (Google/Facebook) drawn with lucide icons.
- [ ] `MASUK` / `DAFTAR` → `PilihRole`.
- [ ] Verify typecheck + lint.

### Task 1.4: Pilih Role

**Files:** Modify `PilihRoleScreen.tsx`.
**Figma:** `120:1798`, `2116:274`, `2116:338` (states).

- [ ] Two selectable cards (Penyewa / Mitra) with radio states, security notice, footer hint, "LANJUTKAN".
- [ ] On continue: `mitra` → Owner registration step 1; `penyewa` → renter onboarding/identity or home as specified by prototype.
- [ ] Verify typecheck + lint.
- [ ] Commit (`feat(auth): pixel-match auth and onboarding`).

---

## Phase 2 — Mitra Registration (5 steps + verification)

### Task 2.1: Registration shell + stepper

**Files:** Create `src/screens/owner/registration/OwnerRegistrationNavigator.tsx`, `RegistrationStepLayout.tsx`.
**Figma:** `2009:116` header/stepper/footer.

- [ ] Stack over 5 steps with shared header ("Mitra Kami"), progress stepper and fixed footer ("Mengalami kesulitan? Hubungi Kami").
- [ ] Keep form state in a context (`OwnerRegistrationContext`) so back navigation preserves input.
- [ ] Verify typecheck + lint.

### Task 2.2: Step 1 Identitas — `2009:116`
### Task 2.3: Step 2 Legalitas — `2009:206`
### Task 2.4: Step 3 Informasi Usaha (+ S&K popup `2009:542`) — `2009:309`
### Task 2.5: Step 4 Kontak — `2009:614`
### Task 2.6: Step 5 Keuangan (3 variants `2009:686`, `2041:132`, `2046:447`) — select bank/e-wallet, final submit

Each step:
- [ ] `get_design_context` with screenshot; implement fields, labels, validation and footer CTA exactly.
- [ ] Verify typecheck + lint; commit per step.

### Task 2.7: Verification screens
**Files:** Create `VerificationIdentityScreen.tsx`, `VerificationAccountScreen.tsx`.
**Figma:** `2116:336` (identitas), `2116:337` (keamanan akun).

- [ ] Implement KTP upload placeholder preview (vector) and verification steps; complete → `OwnerApp` dashboard.
- [ ] Commit.

---

## Phase 3 — Mitra App

### Task 3.1: Dashboard with first-run states
**Figma:** `2119:834` (dashboard), `2087:1286/1377/1643/1834/1925/2059` (prep/empty states).

- [ ] Implement greeting "Selamat datang, Sriwijaya Rent!", KPI cards, best-seller list, insights, recent orders.
- [ ] Empty/preparation state with checklist and "TAMBAH KENDARAAN".
- [ ] Verify typecheck + lint.

### Task 3.2: Armada list + filters + detail + add vehicle
**Figma:** `2160:462`, `2161:1098`, `2161:1675`, `2356:1393`, `2101:351` (tambah kendaraan).

- [ ] Search, availability tabs (Semua/Tersedia/Disewa/Maintenance), vehicle cards with status badges.
- [ ] Detail sheet/screen and add-vehicle form (360 photo slots rendered as vector placeholders).
- [ ] Commit.

### Task 3.3: Pesanan list + details + WhatsApp order
**Figma:** `2193:876`, `2265:1729`, `2265:2139`, `2265:2438`, `2265:2746`, `2389:1049`, `2253:1062` (belum bayar), `2265:3198` (berlangsung), `2265:3494` (selesai), `2290:2766` (denda), `2399:1494` (WhatsApp).

- [ ] Tabs: Semua/Belum Bayar/Berlangsung/Selesai/Denda/Draft WhatsApp; order cards and full detail screens with actions.
- [ ] Commit.

### Task 3.4: Alerts, Chat, Profil
**Figma:** `2199:1653` (notifikasi), `2199:1555` (chat list), `2199:…` chat detail.

- [ ] Notification grouped list, chat list and conversation screen with bubbles + input bar.
- [ ] Profile screen: role switch, settings rows, logout.
- [ ] Commit.

---

## Phase 4 — Penyewa App

### Task 4.1: Home + search + filters
**Figma:** `105:1747` (home), `105:3763` (search), `105:4103` (results), `157:627` + `2527/2597` (filter), `245:145`/`388:1832` (date picker).

- [ ] Search bar, date range, Top Mitra, sponsored/vehicle cards, results list, filter sheet with sliders/chips, date picker modal.
- [ ] Commit.

### Task 4.2: Detail kendaraan + mitra profile + reviews
**Figma:** `191:254` (detail), `105:4103`, `392:2428/2972/3387` (mitra profile), `199:579`/`235:162` (reviews).

- [ ] Vehicle gallery (vector), specs, reviews, mitra profile with unit/order stats, review list.
- [ ] Commit.

### Task 4.3: Booking flow (gateway → identity → checkout → payment)
**Figma:** `2015:133`/`2433:1438` (gateway), `2038:322`/`2078:130` (identitas), `2086:1774`/`2105:2747`/`2086:888` (checkout), `2125:207`/`2279:5576`/`2433:1212` (payment), `492:196` (S&K).

- [ ] 3-step flow with stepper, S&K screen, payment method and success state.
- [ ] Commit.

### Task 4.4: Pesanan penyewa + inspection + rating
**Figma:** `2182:3273` (list all states `2241:831/1192`, `2279:5284/6367`), detail `2241:1790/1953/3288/5006/5282/5576/5652/2145/2433:1337`, inspection `2241:1953/3288/5006`, rating `2287:994/1511`.

- [ ] Tabs: Semua/Belum Bayar/Berlangsung/Selesai/Denda; order detail; 3-step return inspection with result and approval; 2-step rating.
- [ ] Commit.

### Task 4.5: Chat, notifikasi, profil penyewa
**Figma:** `428:4069` (chat list), `444:323/484/859/1243/1535` (chat detail + emergency ring), `428:4199` (notifikasi).

- [ ] Conversation screen with emergency states, notification list, renter profile.
- [ ] Commit.

---

## Verification (each phase)

- [ ] `npx tsc --noEmit` — zero errors.
- [ ] `npx expo lint` — zero errors.
- [ ] Manually walk the flow on `npx expo start` (web or device) for the phase.
- [ ] No `assets/**.png` references remain in code; grep `require('.*assets` returns nothing.
