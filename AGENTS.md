# AGENTS.md

Guide for AI agents and developers working on this codebase.

## What this is

AUSTONIX is the MVP of a graph-native AI content growth system. It implements one complete
loop: understand a business → detect an opportunity → engineer content → approve → publish →
measure → learn. Every entity created along the way (business, brand, product, audience, goal,
topic, opportunity, content asset, publication, engagement, insight) is stored as a row with
explicit foreign keys back to the entities that produced it, so any recommendation or piece of
content can be traced back to the graph evidence that justified it.

This is a single-tenant build (all rows carry a `tenant_id` column defaulted to `"default"`) but
the schema is deliberately shaped so a real multi-tenant rollout only needs to thread a real
tenant id through instead of introducing new columns.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (file-based routing, server functions) |
| Frontend | React 19, TanStack Router v1, Tailwind CSS 4 |
| Database | Netlify Database (managed Postgres) via Drizzle ORM |
| AI | Anthropic via Netlify AI Gateway (`claude-sonnet-5`), with a deterministic fallback draft if the call fails |
| Deployment | Netlify |

## Directory structure

```
db/
  schema.ts               # Drizzle schema — the Business Growth Graph node types
  index.ts                # Drizzle client (Netlify Database adapter)
netlify/database/migrations/  # Generated migrations, applied automatically by Netlify on deploy
src/
  components/AppShell.tsx # Shared nav + layout
  server/
    graph.server.ts       # Core business logic: onboarding, opportunity scoring, content
                           # generation, approval, publishing, simulated engagement + insight
    graph.functions.ts     # createServerFn wrappers exposed to routes/components
  routes/
    __root.tsx             # Root HTML shell
    onboarding.tsx          # "Understand the business" form — creates the initial graph
    index.tsx               # Growth Brief — the home dashboard, top opportunity + stats
    opportunities.tsx       # Opportunity Radar — ranked, scored, explainable opportunities
    content/index.tsx       # Content Workspace — list of all content assets
    content/$id.tsx         # Content detail — approve/reject/publish + performance feedback
    graph.tsx                # Graph Explorer — read-only view over connected entities
```

## How the loop works

1. `onboarding.tsx` collects business, brand DNA, one product, one audience, and one goal, then
   calls `completeOnboarding` (`graph.server.ts`), which also seeds one `topic` and one scored
   `opportunity` with human-readable evidence.
2. `opportunities.tsx` lists open opportunities ranked by score. Selecting "Engineer this
   content" calls `engineerContentFromOpportunity`, which assembles graph context (brand voice,
   product, audience, goal) and asks Claude (via AI Gateway) for a draft; if that call fails for
   any reason, a deterministic fallback draft keeps the loop working.
3. `content/$id.tsx` lets the customer approve, reject (with feedback notes), or publish. On
   publish, a `publication` row is created and a simulated `engagement` result is generated
   (a real integration would replace this with actual channel analytics).
4. Publishing also writes an `insight` — a plain-language statement of what happened, linked back
   to the content asset and topic — which is what "the graph updates with what was learned" means
   in this build.

## Conventions

- Server-only logic lives in `*.server.ts`; the corresponding `*.functions.ts` file wraps it in
  `createServerFn` for use from routes and components. Never import `*.server.ts` from client code.
- Opportunity scoring is a simple, explainable weighted sum (see `scoreOpportunity` in
  `graph.server.ts`) rather than an opaque model — Principle 19 (explainability) governs this.
- Every new capability should either enrich the graph (write a new relationship) or consume it
  (read graph context before acting) — avoid one-off features that bypass the schema.
- Database schema changes always go through `db/schema.ts` + `npx drizzle-kit generate`. Never
  hand-write SQL migrations or run DDL directly against the database.

## Local development

```bash
pnpm install
pnpm dev   # or: netlify dev --port 8889
```

AI content generation requires the Netlify AI Gateway, which activates after at least one
production deploy. Locally, or before a first deploy, `engineerContentFromOpportunity` falls
back to the deterministic draft automatically.
