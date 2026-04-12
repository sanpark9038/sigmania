---
name: writing-plans
description: "Use when you have a spec or requirements for a multi-step task, before touching code. Optimized for Vanilla JS DOM workflows."
risk: critical
source: community
date_added: "2026-02-27"
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase. Document everything they need to know: which files to touch for each task, code, styles, animation logic. Give them the whole plan as bite-sized tasks. DRY. YAGNI. 

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `.agent/plans/YYYY-MM-DD-<feature-name>.md`

## Plan Document Header

```markdown
# [Feature Name] Implementation Plan

> **For Execute Phase:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach for Vanilla JS + Supabase + GSAP]
---
```

## Task Structure (Vanilla JS Context)

Each step should be a manageable action.

```markdown
### Task N: [Component or Feature Name]

**Files:**
- Create: `scripts/components/feature.js`
- Modify: `index.html`, `globals.css`

**Step 1: HTML & Styling (Tailwind)**
Describe the exact HTML elements to add to `index.html` with Tailwind classes.

**Step 2: Vanilla Logic & DOM Binding**
```javascript
export function initFeature() {
    const el = document.getElementById('feature');
    // setup logic
}
```

**Step 3: GSAP Animations**
Describe how the feature animates in/out using GSAP timelines.

**Step 4: Supabase Integration**
Describe real-time data binding.

**Step 5: Verify in Browser**
Run local server, set viewport to 1920x1080, and verify rendering.
```

## Remember
- Exact file paths always
- Complete code in plan
- Keep it specific to Vanilla JS DOM manipulation and GSAP. No React patterns.
