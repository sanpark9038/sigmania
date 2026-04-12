# PROJECT.md (Sigmania Central Intelligence)

> [!IMPORTANT]
> **Mission**: Build a premium, high-density asset management dashboard for broadcast orchestration (Quick Copy Manager).

## 🏙️ System Architecture
- **Framework**: Next.js 14 (App Router)
- **Database/Realtime**: Supabase
- **Styling**: Vanilla CSS / Tailwind CSS
- **Orchestration**: El-Rade Park (Antigravity) + Codex CLI

## 📜 Core Rules (The Law)
1.  **Context Preservation**: Before ANY implementation, read `.planning/active/TASK.md`.
2.  **Surgical Edits**: Never overwrite whole files. Target specific logical blocks.
3.  **PiP Communication Protocol**: 
    - PiP windows are isolated. Use `BroadcastChannel` + `postMessage` dual-channel sync.
    - Clipboard operations MUST be proxied to the Main Window via these channels.
4.  **Premium Aesthetics**: Use `ui-ux-pro-max` guidelines. No generic colors.

## 🗺️ Workspace Roadmap
- [x] Initial Porting (Harness system)
- [ ] PiP Dual-Channel Communication Fix
- [ ] Multi-select Batch Operations
- [ ] Production Hardening

## 🏛️ Team Structure
- **CTO (엘레이드박)**: UI/UX, Frontend Logic, Design System.
- **CEO (산박대표님)**: Creative Direction, Strategy, Final Approval.
- **Codex**: Data Pipeline, Backend Automation.
