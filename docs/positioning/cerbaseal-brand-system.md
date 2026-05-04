# CerbaSeal Brand System

## Mark

The CerbaSeal mark is a three-headed guardian symbol representing the three enforcement outcomes: ALLOW, HOLD, and REJECT. The keyhole in the shield body represents controlled execution — nothing passes through without authorization. The shield-like containment frame represents the governed execution boundary that sits between decision systems and execution systems.

The mark is derived from Cerberus, the three-headed guardian of a threshold. CerbaSeal is the threshold between AI decision and consequential execution.

## Usage

Use the mark with restrained, technical presentation. The mark should reinforce trust and authority, not create hype. It should appear on a clean background. Do not overlay it on complex imagery.

Correct uses:
- Small nav mark (22–32px) on portal pages
- Full lockup (mark + wordmark) on the homepage and one-page brief
- Standalone mark as favicon (32px and smaller)

Incorrect uses:
- Oversized or hero-sized mark that dominates a page
- Mark placed on busy or colored backgrounds without contrast control
- Mark used to imply production readiness or certification
- Animated or glowing versions

## Assets

| File | Purpose | Dimensions |
|---|---|---|
| cerbaseal-logo-source.png | Original unmodified source | 1536×1536 |
| cerbaseal-logo-primary.png | Transparent background, dark mark | 512×512 (auto) |
| cerbaseal-logo-mark.png | Mark only (no wordmark), transparent bg | 512×512 |
| cerbaseal-logo-dark.png | White mark on transparent bg, for dark backgrounds | same |
| cerbaseal-favicon.png | Favicon / app icon | 32×32 |

## Colors

Primary navy: `#0B1F33`
Deep background: `#0A0F14`
Light background: `#FFFFFF`
Muted text: `#667085`
Border: `rgba(11, 31, 51, 0.16)`

State colors (restrained — do not saturate):
- ALLOW: muted green `#4ade80` on dark bg, `#16a34a` on light
- HOLD: muted amber `#fbbf24` on dark bg, `#d97706` on light
- REJECT: muted red `#f87171` on dark bg, `#dc2626` on light

## Typography

Portal UI: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Wordmark: bold, uppercase, slightly tracked — `CERBASEAL`

Monospace (proof, status, labels): `"SF Mono", "JetBrains Mono", ui-monospace, "Fira Code", monospace`

## Visual Style

The portal visual language is security infrastructure, not consumer product. It should feel like:
- a controlled review environment
- a system that takes execution authority seriously
- something a technical security reviewer would trust

Rules:
- No gradients unless extremely subtle and already established in the design
- No neon or glow effects
- No animation unless directly tied to enforcement outcomes
- No rounded-corner excess or card-heavy layouts that suggest SaaS
- Dark theme for portal pages, light theme for the printable brief

## Required Status Language

Every page in the portal must include:
- `Review Candidate` status label
- `review-ready core demo, not a production client deployment`
- `No third-party security review yet` or equivalent

These are not optional. They are enforced by the validation script and the test suite.

## Do Not

- Add gradients to the mark
- Add neon or glow effects
- Add cartoon styling or rounded-corner excess
- Overuse mythology or Cerberus symbolism
- Imply production readiness
- Remove limitation language
- Remove "no third-party security review" disclosure
- Use the mark to imply external certification or approval
