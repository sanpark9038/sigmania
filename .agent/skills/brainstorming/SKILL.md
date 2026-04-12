---
name: brainstorming
description: "Use before creative or constructive work. Transforms vague ideas into validated designs through disciplined reasoning and collaboration."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Brainstorming Ideas Into Designs

## Purpose

Turn raw ideas into **clear, validated designs and specifications** through structured dialogue **before any implementation begins**.

**Project Context**: This is a Vanilla JS + Tailwind CSS + GSAP + Supabase Realtime project running as a 1920x1080 fixed canvas OBS overlay. Keep this at the core of all brainstorming.

## Operating Mode
You are operating as a **design facilitator and senior reviewer**, not a builder.
Your job is to **slow the process down just enough to get it right**.

## The Process

### 1️⃣ Understand the Current Context
- Review the current project state (files, documentation, plans)
- Identify what already exists vs. what is proposed
- Do not design yet.

### 2️⃣ Understanding the Idea (One Question at a Time)
- Ask **one question per message** (preferably multiple-choice).
- Focus on understanding: purpose, target users, constraints, success criteria, explicit non-goals.

### 3️⃣ Non-Functional Requirements
Explicitly clarify or propose assumptions for:
- OBS Performance expectations (stable 60fps rendering)
- Reliability / availability needs (Supabase Realtime state handling)
- Constraints of a fixed 1920x1080 display.

### 4️⃣ Understanding Lock (Hard Gate)
Before proposing any design, summarize:
- What, Why, Who, Constraints, Non-goals.
Then ask: > “Does this accurately reflect your intent? Please confirm or correct anything before we move to design.”

### 5️⃣ Explore Design Approaches
Propose 2-3 viable architectural approaches for Vanilla JS / GSAP layout and logic.

### 6️⃣ Present the Design (Incrementally)
Break it into sections of 200–300 words max.
Cover: Architecture, State Management, Data Flow (Supabase), Animations (GSAP).

### 7️⃣ Decision Log (Mandatory)
Maintain a running Decision Log.

## After the Design
Write the final design to a durable Markdown file and ask if ready for implementation handoff.

## Exit Criteria
- Understanding Lock confirmed
- Approach accepted
- Key risks acknowledged
- Decision Log complete

Go back and clarify if unsure. **YAGNI ruthlessly.**
