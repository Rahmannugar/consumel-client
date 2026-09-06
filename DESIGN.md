# Consumel Marketing Site — Design Direction

## Purpose

The site has one job: make Consumel understandable and credible enough that a
developer or SaaS operator wants to join the waitlist.

Consumel is **infrastructure for usage-based billing**. It collects usage,
meters consumption, manages balances and entitlements, applies pricing rules,
and connects the result to the payment providers a business already uses.

The website must show the product working. It must not read like a list of
backend features or look like a generic SaaS template.

## Source hierarchy

The content and product flow come from these workspace documents, in this
order:

1. `../canonical_notes.md` for settled terminology, behavior, pricing, and
   scope.
2. `../Consumel_Canonical_Product_and_Architecture.md` for the complete product
   model and edge cases.
3. `../guide.md` for what the current public site may publish and link.

External websites are visual-quality references only. They may inform pacing,
density, interaction polish, and the amount of product proof visible on a
marketing page. They do not supply Consumel's words, page narrative, workflow,
feature grouping, claims, or information architecture.

The core page narrative is derived from Consumel's own lifecycle:

`define a meter → provision entitlement or record usage → consume → return the
result → calculate billing → coordinate with the selected provider → inspect
usage analytics`

## Research synthesis

The direction is informed by the current public sites for Orb, Metronome,
Stripe Billing, Lago, OpenMeter, Stigg, and Autumn.

- Orb and Stripe Billing use restrained navigation, a short opening claim, and
  one strong product visual instead of many small cards.
- OpenMeter makes its developer story concrete with real code, language tabs,
  and visible output.
- Stigg separates enforcement, credits, entitlements, and metering into clear
  product stories instead of presenting them as interchangeable features.
- Lago makes provider independence and the surrounding billing ecosystem
  visible as a core product benefit.
- Autumn places a product interface directly in the hero. The principle is
  useful; its dark terminal styling is not the direction for Consumel.

Consumel will use its own visual identity: an electric blue opening field, the
glossy black mark, bright product surfaces, direct product language, and a
working usage playground grounded in the canonical consume rules.

These references are for hierarchy, density, and proof. Do not copy their
layouts, illustrations, terminology, claims, or component styling.

## Audience and questions the page must answer

Primary audience:

- developers building SaaS, API, infrastructure, and AI products;
- founders and product teams defining prepaid, postpaid, or hybrid pricing;
- engineering teams that currently maintain usage counters, credit logic, and
  provider-specific billing code themselves.

The page must answer, in this order:

1. What is Consumel?
2. What does it do during a customer action?
3. Can I try that behavior here?
4. Can it model my billing approach?
5. Can it work with my payment provider?
6. Can I understand usage after it happens?
7. What does it cost?
8. How do I join the waitlist?

## Approved product language

Use the canonical tagline exactly:

> Infrastructure for usage-based billing.

Preferred supporting sentence:

> Meter usage, manage balances and entitlements, apply pricing rules, and
> connect the payment providers your product already uses.

Use these product terms when they are relevant:

- usage event
- meter and `meter_key`
- customer and `customer_id`
- balance
- entitlement
- consume
- prepaid, postpaid, and hybrid
- Sandbox and Live
- billable operation
- payment provider adapter

Use short, literal headings. A heading must either state the product, name a
user task, or explain a consequence.

Do not use invented category names such as “usage layer,” “usage controller,”
“usage truth,” “control plane,” or “decision engine.” Do not use launch-state
copy such as “in progress,” “being built,” “coming soon,” or “private beta.” Do
not add vague claims such as “billing, but better,” “move faster,” “built for
scale,” or “revenue on autopilot.”

Do not expose PostgreSQL, Redis, outbox processing, internal queues, API-worker
separation, or other implementation details on the landing page. Those belong
in architecture documentation.

## Visual system

### Opening field

The navbar and hero are one continuous `#0096FF` field. There is no white strip
between them.

- Navbar text is white.
- The logo keeps its original glossy black material and is never recolored.
- The mark and wordmark sit together with an 8–10px visual gap.
- The navbar is sticky. After the hero leaves the viewport it gains a lightly
  blurred blue surface and a subtle bottom border.
- The hero uses white type and a high-contrast, bright product surface.
- Blue remains a brand field, not a glow applied to every section.

### Color

- Brand blue: `#0096FF`.
- White: `#FFFFFF`.
- Ink: a near-black chosen to support the logo, never used to turn the whole
  site into a dark developer-tool theme.
- Cool neutral surfaces distinguish product UI from the page.
- Green appears only for a successful consume result.
- Amber appears only for overage or warning state.
- Red appears only for a denied or invalid state.
- Provider marks retain their official brand colors.

### Typography

- Sora is the primary display and interface family.
- Martian Mono is limited to code, identifiers, quantities, request headers,
  and compact status labels.
- Body copy is at least 16px on desktop and mobile.
- Interface supporting copy is at least 13px.
- Labels are at least 12px. Avoid the 7–10px text used in the rejected builds.
- Hero type is large but stays within two or three deliberate lines at common
  desktop widths. It must not create isolated one-word lines.
- Line length for prose stays near 60–72 characters.

### Shape and depth

- Use confident rectangular surfaces with 12–20px radii where a container is
  needed.
- Avoid a page made of identical rounded cards.
- Borders define product UI. Shadows are reserved for surfaces that sit over
  the blue field or overlap another section.
- The glossy mark is the only material object. Supporting diagrams remain
  clean vector or interface assets.

## Page architecture

### 1. Sticky navigation

Content:

- compact logo plus Consumel wordmark;
- Product;
- How it works;
- Providers;
- Pricing;
- FAQ;
- Join waitlist.

Behavior:

- Navbar begins transparent over blue.
- Desktop links use an animated underline or offset dot on hover/focus.
- Mobile uses a custom sheet menu based on the downloaded shadcn primitive.
- Every interactive item has `cursor: pointer`, a visible focus ring, and a
  minimum 44px target.
- No login, dashboard, documentation, API-reference, or changelog link appears
  until that destination exists.

### 2. Hero

Primary copy:

> Infrastructure for usage-based billing.

Supporting copy:

> Meter usage, manage balances and entitlements, apply pricing rules, and
> connect the payment providers your product already uses.

Primary action: **Join the waitlist**.

Secondary action: **Try the playground**, scrolling directly to the full
playground.

The right side is a custom animated “usage stream” built around the real
Consumel mark. Small usage events move into Consumel; an allowed result, balance
change, and downstream provider event emerge. The animation explains the
product relationship without displaying backend internals.

Three.js may render the event field and subtle depth around the mark. It must be
dynamically imported, paused outside the viewport, capped for device pixel
ratio, disabled for reduced motion, and replaced by an equivalent static SVG on
small or constrained devices.

### 3. Usage playground

This is the main product proof and receives more space than the hero visual.
The section title is direct:

> Try a consume operation.

The playground is a purpose-built Consumel interface, not a browser-default
form and not a generic dashboard screenshot.

Controls:

- Sandbox / Live context display. The public demo runs locally and defaults to
  Sandbox; switching is an explanatory interaction and never calls a real API.
- billing model segmented control: Prepaid, Postpaid, Hybrid;
- `customer_id` input;
- `meter_key` input;
- quantity input with custom step controls;
- idempotency key with a regenerate action;
- Add balance;
- Run consume;
- Reset.

Downloaded shadcn primitives provide the accessible behavior for button,
input, label, tabs, toggle group, tooltip, and slider where appropriate. Their
default styling is replaced with Consumel tokens and product-specific states.
Do not use an unstyled native select.

The workspace has three coordinated regions:

1. **Request** — editable fields and HTTP/Node.js/Go/Python code tabs.
2. **Result** — allowed or denied state, current balance or accrued usage, and
   the exact response for that operation.
3. **Activity** — an ordered event list showing grants, consumes, idempotent
   retries, denials, included usage, and overage.

Behavior must teach the real rules:

- Prepaid starts with a balance and decrements only when enough units exist.
- A denied consume does not change the balance or billable-operation count.
- Reusing the same idempotency key and request returns the original result and
  does not consume twice.
- Postpaid accumulates usage for the period.
- Hybrid consumes the included allowance, then shows overage.
- Add balance changes the entitlement and is not a billable operation.
- One successful logical consume adds one billable operation.
- Switching model resets the demo to a clear model-specific starting state.

Motion animates only the state that changed. Visitors can read the current
state without waiting for animation.

### 4. What Consumel handles

Avoid a four-card feature grid. Use three wide, alternating product stories.
Each has one concise paragraph and a purpose-built visual.

1. **Meter what your product delivers.** Show meters for API requests, AI
   tokens, storage, and credits entering a single event stream.
2. **Keep balances and entitlements accurate.** Show a customer balance,
   allowance period, grant, consume, and remaining entitlement.
3. **Apply prepaid, postpaid, or hybrid billing.** Use an interactive visual
   that changes the same customer timeline between the three models.

Do not decorate these headings with icons. The product visual is the evidence.

### 5. How consume works

Explain this in the user’s mental model, in three steps:

1. **Send usage.** Your product sends the customer, meter, quantity, and one
   idempotency key.
2. **Get the result.** Consumel applies the meter’s rules and returns whether
   the usage is allowed, with the resulting balance or accumulated usage.
3. **Continue billing.** Usage appears in analytics and feeds the configured
   payment provider without delaying the consume response.

GSAP ScrollTrigger may move one event through these three states. Do not expose
database transactions, workers, or internal infrastructure in the visual.

### 6. Provider adapters

Headline:

> Usage-based billing across the providers your customers use.

Supporting copy:

> Connect your provider account. Consumel keeps usage, balances, pricing, and
> provider billing aligned through one integration.

Use locally stored official marks for Stripe, Paystack, Flutterwave, Dodo
Payments, Lemon Squeezy, Polar, and Bachs. Do not use initials, monochrome
recoloring, or invented logos.

The marks move in two staggered, low-speed bands using the React Bits LogoLoop
primitive. The bands have a gentle directional drift and edge fade, rather than
small boxed logo cards. Pause on hover/focus and stop for reduced motion.

A custom connector visual below the loops shows:

`Your product → Consumel → selected payment provider`

The selected provider can change without changing the product-side consume
request. That is the provider-agnostic story. Avoid technical copy about
credential storage, deterministic mapping, webhook verification, or internal
provider calls in this marketing section.

### 7. Usage analytics

Show one large product-quality analytics surface with readable text:

- total successful consume operations;
- accepted and denied usage;
- usage by meter;
- customer balance trend;
- Sandbox / Live switch;
- date range;
- a short activity table.

The visual must resemble a real Consumel product screen without copying
AuthRail or pretending the authenticated application is already available.
Charts are custom SVG and animate once when visible. Byte DatePicker is not
needed for the static marketing example.

### 8. Pricing

Pricing must include the actual canonical data, not simplified marketing
cards.

| Plan | Monthly price | Live billable operations | Sandbox operations | Active members |
| --- | ---: | ---: | ---: | ---: |
| Free | $0 | 1,000 | 100 | 1 |
| Growth | $20 | 10,000 | 1,000 | 3 |
| Professional | $50 | 30,000 | 3,000 | 10 |
| Enterprise | Custom | Custom | Configurable | Custom |

Payment providers and SDKs are included. Professional includes SSO. Enterprise
supports custom identity requirements.

Put the billing rule next to the plans in readable text:

> One successful consume is one billable operation. Denied operations,
> idempotent retries, balance changes, provider webhooks, reconciliation, and
> Sandbox usage do not add Live billable operations.

Show overage clearly:

> Additional Live usage is $1 per 1,000 billable operations.

Do not lead with “no daily limits,” “no hard cap,” or similar negative claims.
They may appear in the FAQ if they answer a real question.

### 9. FAQ

Use a controlled shadcn accordion so opening one item closes the previous item.
The entire summary row uses a pointer cursor and remains keyboard operable.

Questions should cover:

- what Consumel is;
- what a billable operation is;
- prepaid, postpaid, and hybrid meters in one project;
- Sandbox and Live isolation;
- idempotent retries;
- supported SDKs;
- payment provider adapters;
- whether Consumel holds money or replaces a payment processor.

Answers must come directly from the canonical documents. Do not turn backend
architecture notes into FAQ copy.

### 10. Waitlist

The waitlist is the final primary conversion surface. Embed the real Tally form
inside a custom blue or ink container. The embed uses transparent background,
dynamic height, and no duplicated Tally title.

Do not render a placeholder, fake form, disabled form, or “coming soon” copy.
Until the Tally form ID is supplied, the section must stay out of the published
page.

### 11. Footer

Use a substantial but calm footer:

- logo and tagline;
- anchors for Product, How it works, Providers, Pricing, and FAQ;
- About and Contact only when their content or channel exists;
- Terms of Service and Privacy Policy;
- canonical social links only when they are ready to publish.

Keep the mark and wordmark together. Avoid repeating product claims or adding
decorative slogans.

## Terms of Service and Privacy Policy

These are full service documents for Consumel, not “pre-release terms” or
“waitlist policies.” Their visual treatment uses the same header, typography,
spacing, and footer as the marketing site.

Terms must cover service access, accounts and organizations, API and SDK use,
acceptable use, customer data, payment and subscription terms, intellectual
property, confidentiality, third-party providers, service changes,
termination, warranties, liability, indemnity, and contact.

Privacy must cover account and customer data, API/SDK telemetry, usage and
billing data, provider integrations, website/waitlist data, cookies and
analytics, purposes, processors, retention, security, international transfers,
rights, children, changes, and contact.

Do not invent a registered entity, office address, governing jurisdiction, or
data-protection contact. Those remain explicit legal inputs to finalize before
publication. Do not mention that the product is unfinished or in pre-release.

## Component ownership

- `components/ui`: downloaded shadcn primitives, adapted to Consumel tokens.
- `components/react-bits`: vendored React Bits effects with source provenance,
  reduced-motion behavior, and cleanup.
- `components/marketing`: page sections and marketing-only composition.
- `components/playground`: usage playground UI and state.
- `lib/playground`: typed consume simulation rules, fixtures, and formatters.

Use Phosphor’s `*Icon` exports. Do not use deprecated short export names.

## Motion and performance budget

The site must remain light even with Three.js, React Bits, GSAP, and Motion.

- The initial hero copy, navigation, logo, and primary CTA are server-rendered.
- The first viewport works without JavaScript.
- Three.js is an optional dynamic island, never part of the critical JS bundle.
- Load GSAP only in the section that owns the consume story.
- Load Motion only in interactive playground and chart components.
- Vendored React Bits components are selected individually; never install or
  import the whole catalog.
- Do not ship autoplay video.
- Do not use large raster screenshots for product UI.
- Prefer SVG, CSS, and HTML for charts and product diagrams.
- Pause all continuous animation outside the viewport.
- Respect `prefers-reduced-motion` everywhere.
- Target a compressed initial JavaScript budget below 170KB for the marketing
  route, excluding the deferred Three.js island.
- Target LCP below 2.5s and CLS below 0.1 on a representative mid-tier mobile
  device and connection.
- Use `content-visibility: auto` for long off-screen sections where it does not
  harm accessibility or anchor navigation.

## Responsive behavior

- Desktop: two-column hero followed by a wide playground.
- Tablet: hero visual moves below the copy; playground keeps request and result
  visible while activity moves below.
- Mobile: the hero is one column; Three.js uses the static fallback; playground
  regions become a deliberate sequence with a sticky Run consume action.
- Provider loops retain readable logos and do not become tiny.
- Pricing becomes a plan selector plus one readable detail panel, rather than
  four squeezed cards.
- Legal pages become a single readable column with no sticky sidebar.

## Review gate

Before the page is considered ready:

- review at 1440×900, 1024×768, 390×844, and 360×800;
- capture screenshots of the hero, playground, provider section, pricing,
  footer, Terms, and Privacy;
- test every playground outcome and idempotent retry;
- test navbar anchors and sticky behavior;
- test the FAQ’s single-open behavior with pointer and keyboard;
- verify every provider mark at normal and retina resolution;
- verify reduced-motion behavior;
- run Biome, TypeScript, and the production build;
- inspect the production bundle before accepting Three.js or another heavy
  dependency.

## Required external inputs

- Tally form ID and final embed preference.
- Confirmation that `hello@consumel.com` is configured before it is published.
- Registered legal entity, governing jurisdiction, and legal contact details
  before final legal publication.
