---
name: lint-and-validate
description: "MANDATORY: Verify Vanilla JS code, HTML structure, and Tailwind rules before finalizing."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Lint and Validate Skill

> **MANDATORY:** Thoroughly review the output after EVERY code change. Do not finish a task until the code is error-free.

### Procedures for Vanilla JS Ecosystem

1. **JavaScript Validation**: 
   - Ensure strictly ES6 Module compliant syntax.
   - Run ESLint (`npx eslint` or `npm run lint`) if configured in the workspace.
   - Check for undeclared variables, missing imports, or loose equality traps.

2. **Tailwind & HTML Validation**:
   - Ensure closing tags match. Ensure Tailwind v4 `@theme` variables match up with used utility classes.
   - Check for overlapping `z-index` and absolutely positioned elements running off the 1920x1080 boundaries.

3. **Console Checks**:
   - The browser console must be clean. OBS overlays fail silently or refresh unexpectedly on fatal JS errors.
   - Validate Supabase error payloads using specific `try/catch` and safe logging.

## The Quality Loop
1. **Write/Edit Code**
2. **Analyze Output**
3. **Check OBS Target Dimensions** - Ensure layout holds at 1920x1080.
4. **Fix & Repeat**

---
**Strict Rule:** No code should be committed or reported as "done" without manually or automatically passing these checks.
