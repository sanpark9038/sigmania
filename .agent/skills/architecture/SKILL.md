---
name: architecture
description: "Architectural decision-making framework tailored for vanilla web and Supabase. Use when making architecture decisions or analyzing system design."
risk: safe
source: community
date_added: "2026-02-27"
---

# Architecture Decision Framework

> "Requirements drive architecture. Trade-offs inform decisions. ADRs capture rationale."

## 🎯 Architecture Context

**Environment Checklist:**
- [x] Vanilla JS (No React/Next.js overhead)
- [x] Tailwind CSS for styling structure
- [x] GSAP for timeline/motion
- [x] Supabase Realtime for state synchronization
- [x] 1920x1080 Fixed Canvas (OBS Broadcast Source)

## Core Principle

**"Simplicity is the ultimate sophistication."**

- Start simple with functional JS modules.
- Add complexity ONLY when proven necessary.
- Removing complexity is MUCH harder than adding it.
- Over-engineering is an anti-pattern for OBS browser sources.

## Validation Checklist

Before finalizing architecture:

- [ ] Requirements clearly understood for broadcast UI.
- [ ] Constraints identified (Single-screen fixed size, OBS performance).
- [ ] Each decision has trade-off analysis (e.g., complex frameworks vs raw DOM + GSAP).
- [ ] Simpler alternatives considered (Can we do this with vanilla state instead of a massive store?).
- [ ] ADRs written for significant decisions.
