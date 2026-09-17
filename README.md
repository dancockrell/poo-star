# Poo Star
[Play Poo Star](https://dancockrell.github.io/poo-star/)

A lovingly ridiculous bathroom-celebrity slot demo, made from the supplied Poo Star reference.

Forked from dancockrell/supernatural-wild-west at e739f731b6be777df618ffdaf6fda3951a19d2af. The original project is unchanged. This edition has its own five-by-three presentation and twenty-payline demo rules; it reuses the original deterministic RNG/replay helpers for tests. It does not inherit Wild West payout percentages or certification claims.

Run `npm install`, `npm run dev`. Build with `npm run build`. `npm test` checks paylines, free-spin accounting and balance conservation.

Fictional credits only. No deposits, cash prizes, or real-money wagering. Saves are local to the browser. Generated art follows the user-supplied reference; provenance is in docs/art-direction.md.

Sound: �C-Funk� by Kevin MacLeod (incompetech.com), CC BY 4.0, with CC0 recorded farts, mud splats and casino foley. Recording bundled locally. Sound starts ON with music and effects at 100%; click anywhere to unlock playback if the browser requires it. music and effects have independent sliders and gameplay ducking. See docs/music-license.md for credit, source and license.

Math audit: run `node scripts/audit-math.mjs` for seeded complete paid-spin cycles, including every retriggered free spin. Results and approximate uncertainty are in `docs/math-audit.json`. This is engineering evidence for a fictional-credit demo, not a certified return claim.
