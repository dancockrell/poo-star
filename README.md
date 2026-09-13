# Poo Star
[Play Poo Star](https://dancockrell.github.io/poo-star/)

A lovingly ridiculous bathroom-celebrity slot demo, made from the supplied Poo Star reference.

Forked from dancockrell/supernatural-wild-west at e739f731b6be777df618ffdaf6fda3951a19d2af. The original project is unchanged. This edition has its own five-by-three presentation and twenty-payline demo rules; it reuses the original deterministic RNG/replay helpers for tests. It does not inherit Wild West payout percentages or certification claims.

Run `npm install`, `npm run dev`. Build with `npm run build`. `npm test` checks paylines, free-spin accounting and balance conservation.

Fictional credits only. No deposits, cash prizes, or real-money wagering. Saves are local to the browser. Generated art follows the user-supplied reference; provenance is in docs/art-direction.md.

Sound: original 112 BPM sixteen-bar funk score (resonant slap bass, wah chops, horn call-and-response, drum breaks), synthesized in the browser. Enable with SOUND ON. Music and effects have independent sliders in How to Play; win cues duck the score. No audio downloads or third-party music licenses required.

Math audit: run `node scripts/audit-math.mjs` for seeded complete paid-spin cycles, including every retriggered free spin. Results and approximate uncertainty are in `docs/math-audit.json`. This is engineering evidence for a fictional-credit demo, not a certified return claim.
