# Poo Star delivery review

2026-09-13. Published demo: https://dancockrell.github.io/poo-star/

Six rules tests pass, including fifty free spins, wild substitution, scatter exclusion, locked bonus bets and ledger conservation across 2,000 spins. Production build passes. Hosted-browser checks pass for completed spins, saved state, help dialog, autoplay stop, 390px overflow and demo refill; no page errors. Desktop screenshot reviewed at 1440x1030, mobile at 390x844.

Art uses the built-in image_gen tool. Approved game files: public/art/stage.png and public/art/tiles.png, both 1536x1024. Structured prompts and constraints: docs/art-direction.md. Tile art is intentionally opaque cream; the initial painted-checkerboard candidate was rejected and is not shipped. Stage is a still illustration; only game symbols and win typography animate. Sound consists of original synthesized cues, enabled by the player.

Source lineage: dancockrell/supernatural-wild-west e739f731b6be777df618ffdaf6fda3951a19d2af. The Poo Star repository has a fresh current-version history and retains upstream source attribution. Wild West source and published page were not changed.

## Audio update
Original eight-bar 106 BPM funk soundtrack and nine distinct cue types added. Browser audio analyser confirmed nonzero music and effects, zero music output with its slider at zero, independent effects, AudioContext suspended on mute, and audible resumption. Build, six rules tests and browser gameplay checks passed. scripts/review-audio.mjs repeats the audio transport check.


## Funk, reels and reward repair — September 13
Supersedes the earlier eight-bar audio pass. The score now runs at 112 BPM over sixteen bars with articulated bass, filtered wah chords, horn exchanges and breakdown fills. Comic effect variants include rasps, double farts and liquid plops. Existing music/effects controls, ducking and tab suspension remain.

The old single-symbol wobble is replaced by five scrolling strips with decorative intermediate symbols, staggered deceleration and a small settling bounce. Final symbols always come from the previously settled game result. Reduced motion displays the result directly. Desktop motion was inspected; mobile and desktop control checks passed.

A 200,000-cycle baseline probe found roughly 3.82% returned credits with the old tiny line payouts. Line pays are now 28/84/280 for ordinary symbols and 56/196/840 for premiums, in units of the line wager. The evaluator pays the best eligible wild interpretation, including a run of wilds followed by a scatter. Scatter awards and bonus rules remain as documented in the menu.

The checked-in audit runs one million complete paid cycles at each of 20, 100 and 1,000 cents using the same seeded sequence to compare wager scaling. Each includes 22,260 free spins. Observed return is 94.03%, with an approximate per-run 95% interval of 93.44–94.61%; the three runs are deliberately correlated, not three independent samples. Paid spins with any payout: 26.68%. No certification claim. All eight rule tests, production build, browser gameplay review and audio transport checks passed. Audio was measured through an analyser, not a subjective listening review.

## Fixed dividers and licensed recording — September 13
Replaced procedural music with the bundled Funkorama recording by Kevin MacLeod, CC BY 4.0; see music-license.md. Existing comic effects and independent gains remain. Browser analyser confirmed recording playback, zero music with its slider at zero, independent effects, mute suspension and resumption.

Reel separators are now one stationary overlay: no per-tile borders or nth-child border changes on moving strips. Landing overshoot is 18% of a cell with two diminishing rebounds; a trailing buffer symbol prevents empty space at maximum overshoot. Removed the visible rotating comments and footer slogan. Reduced feature-board type and inset the content into the chalkboard. Desktop and mobile screenshots inspected; gameplay and eight rule tests passed.
