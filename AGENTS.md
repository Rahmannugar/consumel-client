# Consumel Client

This repository owns the public website at `consumel.com` and will later own
Consumel's authenticated customer web application. The current build is the
public landing page only.

Read the workspace `../AGENTS.md`, `../canonical_notes.md`,
`../Consumel_Canonical_Product_and_Architecture.md`, and `../guide.md` before
changing product scope, terminology, pricing, or public claims.

## Current Landing-Page Rules

- Build with the Next.js App Router, TypeScript, and Tailwind CSS.
- Keep `app/` at the repository root. Do not introduce a `src/` directory.
- Treat the landing page as a production site, not a placeholder.
- Use the supplied `public/logo.png` and `public/opengraph-image.png` assets.
- Explain the actual usage flow with a concrete interactive example.
- Use current canonical pricing and billable-operation semantics exactly.
- Present Consumel as provider-agnostic without naming or displaying an
  unverified connector.
- Use Tally for the temporary waitlist; do not build waitlist infrastructure.
- Do not link to Docs, API Reference, Dashboard, Login, Signup, Changelog, or
  other surfaces until they exist.
- Include metadata, canonical URL, Open Graph data, sitemap, robots rules,
  semantic HTML, accessibility, responsive behavior, and good performance.
- Keep browser-only JavaScript limited to interactions that require it.

## Later Authenticated Application

The authenticated client has a separate design context from the marketing
site. Before that work begins, create or update its application design rules.

Use `/Users/macbook/Codes/Work/Authrail/authrail-client` only as a selective
reference for domain-oriented structure, thin routes, app-shell composition,
API-client boundaries, dense operational layouts, and complete UI states. Do
not copy its branding, product hierarchy, navigation, wording, or components.

`/Users/macbook/Codes/Tools/auth-rail` is the separate client-side authorization
policy library. Assess it when authenticated authorization work begins. It does
not provide identity or session authentication and is not part of the landing
page.

## Delivery

- Keep route files thin and server-side by default.
- Use explicit TypeScript types; never use `any`.
- Add dependencies only for a demonstrated need.
- Do not add placeholder routes or speculative abstractions.
- Do not read or edit `.env` files without explicit permission.
- Run lint and production build for meaningful changes.
- Do not commit or push. The owner controls Git history and remotes.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
