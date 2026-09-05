# Consumel Public Website Design

## Direction

The public website should make usage infrastructure feel concrete, legible,
and dependable. Pair Consumel's electric blue and sculptural black mark with a
clean editorial layout and product demonstrations that resemble real developer
work. Avoid generic dashboard collages, decorative SaaS gradients, and empty
claims.

This document governs the marketing site. The later authenticated application
will establish its own operational interface rules.

## Visual System

- Primary brand color: `#0096FF`.
- Base surfaces: white, near-black, and restrained cool grays.
- Use blue to direct attention and explain active product flow.
- Preserve the black material quality of `public/logo.png`; give it clear space
  and avoid placing it on noisy backgrounds.
- Typography should be direct and highly legible, with a neutral sans-serif for
  product copy and a monospaced face for API examples and usage values.
- Use a wide but bounded content column, strong vertical rhythm, thin borders,
  and restrained corner radii.

## Layout and Components

- The hero must state what Consumel does and show the usage operation in the
  first viewport on common desktop sizes.
- Demonstrate balance being added, usage being consumed, and the remaining
  balance changing. The example should be understandable without animation.
- Organize sections around product understanding: problem, usage flow, billing
  models, environments, provider-agnostic integration, pricing, FAQ, waitlist,
  and footer.
- Pricing must remain scannable on mobile and desktop and must explain what one
  billable operation means.
- Calls to action lead to the waitlist while the product is not publicly
  available.

## Interaction

- Motion should explain transitions in the usage flow or improve orientation.
- Respect `prefers-reduced-motion` and never require animation to understand
  state.
- Buttons and links need visible hover, active, and keyboard-focus states.
- Interactive targets should be at least 44 by 44 CSS pixels where practical.

## Content and Accessibility

- Use canonical terminology: customer, meter, balance, consume, billable
  operation, Sandbox, and Live.
- Do not claim that a planned connector, SDK, account surface, or document is
  available.
- Use semantic landmarks and heading order, sufficient contrast, useful image
  alternatives, and keyboard-operable controls.
- Keep essential content available without client-side JavaScript.

## Known Unknowns

- The final Tally form URL has not been supplied.
- No payment-provider connector has been verified for a named public logo.
- Legal-page copy and publishing readiness have not been confirmed.
