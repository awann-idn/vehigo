# Implementation Plan: Vehigo Figma Functional UI

## Overview
Implement the provided Renter and Mitra Figma designs as functional React Native/Expo screens while preserving Supabase, storage, realtime, navigation, and existing business rules.

## Architecture Decisions
- Reuse existing screen routes, hooks, API modules, and Supabase contracts before adding new ones.
- Keep payment gateway deferred; use the existing internal payment simulation.
- Add migrations only where Figma behavior requires persistent data not currently modeled.
- Implement vertical slices so each flow remains testable after completion.
- Preserve Manrope typography and existing design tokens; use local Figma-derived assets only.

## Task List

### Phase 1: Mitra registration
- [ ] Rebuild registration shell and progress/footer behavior.
- [ ] Wire identity, legalitas, business info, contact, payout, upload, validation, and persistence.
- [ ] Add operating-hours and terms persistence if required by final behavior.

### Phase 2: Mitra operations
- [ ] Rebuild dashboard and onboarding checklist with real metrics.
- [ ] Rebuild fleet, vehicle editor, photo upload, status, and availability.
- [ ] Rebuild orders, chat, notification, and profile flows.

### Phase 3: Renter operations
- [ ] Rebuild home/search/detail/mitra/reviews/calendar.
- [ ] Rebuild checkout/payment/orders/inspection/rating.
- [ ] Rebuild chat, notification, verification, profile, and settings.

### Checkpoint: Functional flows
- [ ] Mitra can register, add a vehicle, set availability, receive an order, and chat.
- [ ] Renter can browse, book, simulate payment, inspect, rate, and receive routed notifications.

### Phase 4: Verification
- [ ] Run lint, typecheck, Expo Doctor, Android export, and web export.
- [ ] Run static screen audit and Supabase QA runner.
- [ ] Manually verify the core renter and mitra flows on a development build.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| 93 screens exceed a single safe change | High | Implement grouped vertical slices with checkpoints. |
| Figma contains fields absent from Supabase | High | Add focused migrations only after confirming the data contract. |
| Existing realtime/order logic regression | High | Reuse hooks and run typecheck/export after each slice. |
| Temporary Figma asset URLs expire | Medium | Download required assets locally before using them. |

## Open Questions
- Whether WhatsApp OTP will be simulated or connected to a real provider.
- Whether vehicle galleries need a new `vehicle_photos` table or can remain Storage-only for the first release.
