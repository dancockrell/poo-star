# Poo Star — playable pitch demo

A bathroom-celebrity slot with a gold-and-hot-pink identity, bouncing five-by-three reels, recorded funk and casino foley, and comic poop celebrations. Built for a humorous community pitch and possible licensing discussion.

[Play the demo](https://dancockrell.github.io/poo-star/)

## A two-minute demonstration

1. Click once to unlock sound if the browser requires it. Music and effects start enabled at full slider levels; use MIX to suit the room.
2. Spin at the €1.00 demo-credit stake. Show the fixed dividers and staggered reel bounce; spins do not use fart sounds.
3. Open HOW TO PLAY and use SHOWCASE to demonstrate a win, a big win and a free-spin award without changing the credit balance. Preview labels explicitly identify these as presentations.
4. Reload after a settled spin: credits, reels, stake and last win return together. Use REFILL DEMO CREDITS between demonstrations.
5. Resize to a phone width to show the separate mobile controls. Reduced motion is available in the menu.

The euro display is a fictional-credit theme. There are no deposits, withdrawals or cash prizes. Showcase previews do not force game outcomes. Ordinary play uses the deterministic rules with browser cryptographic randomness.

## Current release authority

This document, README and current source describe the active demo. Earlier entries in `review.md` are historical; references there to synthesized audio, Funkorama or older volume defaults do not describe this release.

The current music is C-Funk. Effects are recorded casino sounds plus win-only farts and splats; the mixer also offers an explicit TEST FART. Autoplay pauses between outcomes and stops when the menu opens or the tab becomes hidden. Credits are browser-local, and play remains available in memory when browser storage is denied. Invalid state is reset to a fresh demo; valid older saves retain their credits but have no historical reel snapshot to restore.

## Delivery and provenance

`npm ci`, `npm test`, `node scripts/check-assets.mjs` and `npm run build` produce a static `dist` package. Serve it over HTTP(S). Art, recordings and fonts are bundled locally; font and audio notices accompany the distribution under `licenses/`. `build.json` records the source revision. Build from the intended committed revision before publishing.

The repository contains source, tests, runtime assets and source/credit records. See `assets.json`, `art-direction.md`, `music-license.md`, `effects-license.md` and `font-licenses/`. The asset check verifies recorded file hashes; it does not adjudicate commercial rights. Poo Star's supplied visual reference still needs its origin/authorization recorded for a licensing handoff. Third-party attribution must travel with the assets.

No general source or art license is granted by this document. Scope, recipient rights, exclusivity, support, editable masters and any transfer terms remain matters for the owner and licensee to agree. The existing math audit is seeded simulation evidence, not a certified return promise.

## Release checks

Run `scripts/review.mjs`, `review-recovery.mjs`, `review-audio.mjs`, `review-layout.mjs`, `review-pacing.mjs` and `review-poop.mjs` against a local preview. They cover settled-result recovery, corrupt/blocked storage, refill, autoplay, responsive geometry, measured audio routing and effect cleanup. CI checks the rules, persisted sessions, manifest hashes and build. Browser checks require Chrome and a running preview.

Chrome desktop and emulated phone layouts are the verified baseline. Native iOS/Safari, low-end Android and a final human sound-to-picture audition remain recipient/device acceptance work.
