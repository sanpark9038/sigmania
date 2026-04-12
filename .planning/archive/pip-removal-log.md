# PiP (Picture-in-Picture) Feature Removal Log

- **Date**: 2026-04-12
- **Reason**: Browser security restrictions prevent cross-window clipboard access and dataTransfer persistence in PiP mode.
- **Action**: All PiP-related code, BroadcastChannel sync, and UI elements were purged to focus on the main window Sniper Mode.