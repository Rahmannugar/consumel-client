# Consumel Client

Consumel is an infrastructure for usage-based billing. It helps SaaS companies
meter usage, manage customer balances and entitlements, apply pricing rules,
and connect usage data to the payment providers they already use.

This repository contains `consumel.com`, including the public website and the
customer-facing web application.

## Technology

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- Motion and GSAP
- Biome
- Bun 1.4

## Local Development

Install the Bun version declared in `package.json`, then install the locked
dependencies:

```bash
bun install --frozen-lockfile
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

Run formatting, lint, and TypeScript checks:

```bash
bun run check
```

Build the production application:

```bash
bun run build --webpack
```

## Contact

[Book a 30-minute meeting with the Consumel team](https://cal.com/rahmannugar/30min).

## License

Licensed under the [Apache License 2.0](LICENSE).
