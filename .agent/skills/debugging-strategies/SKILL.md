---
name: debugging-strategies
description: "Systematic problem-solving strategies optimized for Vanilla JS, GSAP, and OBS Browser Sources."
risk: safe
source: community
date_added: "2026-02-27"
---

# Debugging Strategies (OBS & Vanilla JS)

Transform debugging from frustrating guesswork into systematic problem-solving.

## OBS Browser Source Debugging Context
OBS overlays run inside Chromium embedded frameworks. You do not always have standard DevTools open during a live broadcast.

**Key Tactics for Overlays:**
1. **On-Screen Visual Debugging**: Use fixed, high-`z-index` debug panels that display current Supabase connection state and variable payloads.
2. **Robust Console Routing**: Wrap critical state transitions with `console.log` or custom loggers so that when viewed via OBS remote debugging port, flow is clear.
3. **GSAP Timeline Tracking**: Use `console.log` on timeline callbacks (`onStart`, `onComplete`) to trace missing or hanging animations.

## Instructions
- Reproduce the issue locally on `localhost:3000` at `1920x1080`.
- Capture network requests (ensure Supabase websocket is healthy).
- Form hypotheses out of UI tearing, jitter, or GSAP state misalignments.
- Narrow scope with binary search and targeted `console.log`.
- Document findings and verify the fix.

## Do not use this skill when
- There is no reproducible issue.
- The task is purely feature development without current blockers.
