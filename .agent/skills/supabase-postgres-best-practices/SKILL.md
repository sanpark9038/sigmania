---
name: supabase-postgres-best-practices
description: "Postgres optimization and Supabase Realtime best practices. Essential for designing and optimizing schemas for OBS overlay sync."
risk: safe
source: community
date_added: "2026-02-27"
---

# Supabase Postgres & Realtime Best Practices

Performance optimization guide for Postgres and Realtime channels in Supabase.

## When to Use
- Writing SQL queries or designing schemas for the overlay data.
- Managing Supabase Realtime subscriptions in Vanilla JS.
- Reviewing database performance issues.
- Configuring connection pooling or scaling.
- Working with Row-Level Security (RLS).

## Key Realtime & JS Considerations
- **Subscription Management**: In Vanilla JS, ensure `supabase.channel()` subscriptions are uniquely named. Always clean up disconnected channels.
- **Payload Handling**: Broadcaster UI and Viewers UI should filter payload changes conservatively to avoid infinite GSAP timeline triggers or layout thrashing.
- **RLS (Row Level Security)**: Since the OBS browser source acts as an unauthenticated or anonymous client in some situations, ensure your RLS policies explicitly allow necessary reads and strictly lock down writes to admin only.

## Rule Categories
1. **Query Performance**: Index heavily read tables (like scoreboards).
2. **Security & RLS**: Broadcast sources need isolated RLS.
3. **Schema Design**: Keep it denormalized if you need flat JSON payloads for broadcast overlays quickly.

Follow standard Postgres best practices for query design. YAGNI on highly complex schemas if flat key-value pairs work better for overlay states.
