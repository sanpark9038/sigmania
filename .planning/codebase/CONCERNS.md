# 📉 Critical Concerns

## 🚨 Architectural Debt
- **Massive Component (`page.tsx`)**: The main dashboard file has grown to ~400 lines. It contains file processing, storage management, sorting, real-time subscriptions, and redundant UI logic.
  - *Risk*: High maintenance cost, difficult to test, potential for race conditions in state updates.
  - *Mitigation*: Extract upload logic into `useAssetUpload` hook.

## ⚠️ Performance
- **Client-Side Sorting**: Heavy sorting of hundreds of assets is done client-side every time the list is fetched.
  - *Risk*: UI stuttering as the asset library grows.
  - *Mitigation*: Move sorting to Supabase query or implement virtualized lists.

## 🛠️ Operational
- **Environment Dependency**: Scripting depends on `.env.local` which might not be available in all terminal environments (e.g., node scripts failing due to missing `dotenv`).
  - *Mitigation*: Standardize script execution environment.
