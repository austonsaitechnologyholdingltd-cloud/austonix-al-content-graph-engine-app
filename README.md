# AUSTONIX — AI Content-Graph Engine

AUSTONIX is a graph-native content growth system. Instead of generating isolated social posts,
it models a business, its brand, products, audience, and goals as a connected graph, uses that
graph to detect and score content opportunities, engineers a content draft grounded in that
context, and — once approved and published — feeds performance back into the graph as a
learned insight.

This build is the MVP: one complete loop —

```
Connect business → Define brand & goals → Receive opportunity → Generate content
→ Approve → Publish → Measure → Learn
```

## Tech stack

- **TanStack Start** (React 19, TanStack Router) for the app and server functions
- **Tailwind CSS 4** for styling
- **Netlify Database** (managed Postgres) with **Drizzle ORM** for the graph schema
- **Anthropic Claude** via **Netlify AI Gateway** for content drafting, with a deterministic
  fallback so the loop keeps working if the model call fails

## Running locally

```bash
pnpm install
pnpm dev
```

Or, to get full Netlify platform emulation (database, AI Gateway):

```bash
netlify dev --port 8889
```

On first run, visiting the app redirects to `/onboarding` to build the initial Business Growth
Graph (business, brand DNA, one product, one audience, one goal). After that, the home page
shows the daily Growth Brief with the top-ranked opportunity and a button to engineer content
from it.

## Project layout

See `AGENTS.md` for a full breakdown of the schema, server logic, and routes.
