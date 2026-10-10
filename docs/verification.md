# Soundtrack integration — final verification

This report preserves the earlier local integration checks. The current GitHub Pages export, migration status, and new production-preview results are documented in [deployment.md](deployment.md).

Reviewed on **10 October 2026 (Asia/Dhaka)** against the final local production build. The approved dark design, square geometry, cursor, visualizations, navigation, typography, and content remain intact. Sound now defaults enabled at **100% playback volume**, attempts immediate audible autoplay, retries directly on trusted interaction when blocked, and remembers deliberate manual off.

## Executed checks

| Check                                    | Result                                                                                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production build                         | Passed: compilation, TypeScript, and every public route                                                                                                  |
| Separate TypeScript and ESLint checks    | Passed, no errors                                                                                                                                        |
| Complete Playwright suite                | **40 passed in 3.5 minutes**, one worker, no retries, failures, skipped, or flaky tests                                                                  |
| Responsive audit                         | **54 passed**: nine routes × 360/390/768/1024/1440/1920 px                                                                                               |
| Automated accessibility                  | Zero Axe violations across nine routes at 390 and 1440 px                                                                                                |
| Audio rendered review                    | 15 production captures across 360/390/800/1024/1440 px; no overflow or page errors                                                                       |
| Settled animation-frame measurement      | Zero requested callbacks during a one-second interval at every captured width while music played                                                         |
| Chromium native media                    | Allowed and genuinely blocked autoplay, trusted click/key/touch, scroll fallback, volume 1.0, Opus/AAC decoding, loop wrap, and client navigation passed |
| Firefox 157 native media                 | Blocked autoplay → key activation → volume 1.0 → same playing instance after navigation passed                                                           |
| WebKit                                   | Launch unavailable: required host shared libraries are missing; Safari behavior is not certified                                                         |
| Original recording                       | SHA-256 unchanged; original remains outside production assets                                                                                            |
| Production asset delivery                | Correct audio MIME, 206 byte ranges, immutable caching, one selected codec, self-origin CSP passed                                                       |
| Throttled playback                       | Native playback began while less than 80% of the track was buffered at 64,000 bytes/sec with 100 ms latency                                              |
| Lighthouse with audible autoplay allowed | Desktop/mobile reports completed with no run warnings                                                                                                    |

Commands used the supplied project root and `scripts/desktop.mjs` where required by this desktop's FUSE document portal. The build emits the existing host-specific experimental-WASM warning and compiles successfully. Normal native-compiler CI was not separately run. The local production preview remains available at http://localhost:3000.

Refreshing the existing in-app preview tab could not be performed: its browser security check could not verify the admin-enforced policy. No alternate UI access was attempted after that denial. The independent local Chromium/Firefox tests and captures described above had already completed.

## Behavior and regression coverage

Thirteen audio tests verify initial playback without a gesture where allowed, honest blocked/playing state, direct event-stack activation, a scroll retry that retains a later click, a browser without the user-activation API, bounded rejected requests, ignored synthetic events, manual retry, one native media element, all six main pages preserving playback position, native loop wrap, 100% volume, remembered off across gestures/navigation/reload, no media fetch on a remembered-off load, AAC selection without Opus fetching, network recovery, simulated visibility suspension/resumption, HTTP ranges/cache, and `/me/audio/...` asset URL construction.

The policy tests remove headless hardware muting and disable tracing: tracing's DevTools evaluations were granting activation before hydration and hiding genuine autoplay rejection. Final tests exercise Chromium's native policy and decoder. One rejection-budget test deliberately substitutes rejected promises, and the absent-API test supplies an explicit click-only policy before delegating successful playback to the native player. These simulations supplement actual native tests rather than establish browser policy themselves.

The prior 27 tests continue to verify all public routes, valid links, metadata, category/query filtering, six methodology phases, fictional caller/ownership/grant decisions, keyboard and real drag controls, layer separation/cross-sections, direct request stages, native touch inspection, menu focus/Escape, clipboard outcomes, no-JavaScript content, headers/404/social artwork, scope modes, reading/selection/forced-color/keyboard fallback, reduced motion, interrupted geometry transitions, and dark square styling. The unrelated document-click handler now safely ignores non-Element targets, avoiding an exception exposed by synthetic-event QA.

Axe checks supplement visual and keyboard review; they do not certify all WCAG behavior. Dedicated screen readers, real phones, real mobile background interruptions, cellular networks, conventional CI, and deployed field performance were not measured. Chromium touch emulation is not real iPhone testing. No subjective headphone comparison was performed; signal quality evidence is objective and is detailed in [audio-integration.md](audio-integration.md).

## Actual rendered review and artifacts

The sound control was visually inspected on the final phone and desktop captures, including its docked reading position and the 1024 px header. Phone labels were enlarged while preserving the 64 × 44 px square touch control. Header/playing/docked states retain page geometry, and the button remains reachable while scrolling. Initial blocked sound shows READY, actual playback shows ON, and manual mute shows OFF. No-JavaScript visitors receive the existing content and no inactive audio control.

Evidence:

- `.qa/audio/test-run.json`: final 40-test results; full report in `playwright-report/`.
- `.qa/audio/layout-audit.json`: every route/width outcome.
- `.qa/audio/final/`: 15 screenshots plus visual/native-browser evidence JSON.
- `.qa/audio/encoding.json`: original hash, exact preparation filter, five encoding commands, sizes, probes, and selected production files.
- `.qa/audio/analysis/`: original and candidate probes/signal logs, quantitative comparison JSON.
- `.qa/audio/before-verification.md` and `before-performance-{desktop,mobile}.json`: approved pre-audio measurements.
- `.qa/audio/first-complete-test-run.json`: earlier complete 39-test pass before the absent-activation-API safeguard.

Large raw PCM intermediates were removed after preserving their measured evidence. `scripts/optimize-audio.py` regenerates the prepared master/candidates, and `scripts/analyze-audio.py` regenerates comparisons. Only the chosen Opus and AAC files appear in `public/audio/`. The original supplied file is intact. Earlier visual direction and living-experience evidence remain in `.qa/overhaul/`, `.qa/refinement/`, and `.qa/living/`.

## Fresh performance measurements

Lighthouse 13.5.0 ran sequentially against the production homepage with cleared storage and no concurrent browser work. `QA_AUDIO_AUTOPLAY=1` removes hardware muting and explicitly permits autoplay in the test browser, so these results include actual audio loading. The website itself does not contain that policy flag. Desktop uses the standard desktop preset; mobile uses simulated throttling and 4× CPU slowdown.

Fetch times: desktop **2026-10-10T04:43:55.353Z**, mobile **2026-10-10T04:44:04.655Z**.

| Metric                            | Desktop | Mobile |
| --------------------------------- | ------: | -----: |
| Performance                       |     100 |     96 |
| Accessibility                     |     100 |    100 |
| Best practices                    |     100 |    100 |
| SEO                               |     100 |    100 |
| First Contentful Paint            |   0.3 s |  0.9 s |
| Largest Contentful Paint          |   0.6 s |  2.7 s |
| Cumulative Layout Shift (rounded) |       0 |      0 |
| Total Blocking Time               |    0 ms |   0 ms |

Desktop's exact CLS is 0.00001055; mobile CLS is exactly zero. Both have zero TBT. Media requests in both network reports are **Low priority**, return 206 ranges, and reference only the chosen Opus filename. AAC is not downloaded alongside it. Media requests remain progressive; Lighthouse's partial/in-flight transfer counters are not a measurement of the complete song's bandwidth.

The approved pre-audio sample was 100 desktop / 97 mobile with LCP 0.6 / 2.6 seconds. The current audio-allowed sample is 100 / 96 with LCP 0.580 / 2.716 seconds. A single before/after lab sample does not isolate the cause of the small difference or prove zero performance impact. Mobile LCP remains above the 2.5-second good-LCP threshold. TBT is not INP. Field INP, repeated-run variance, deployed latency, and real-device frame rates remain unmeasured. Reports are `.qa/performance/{desktop,mobile}.{html,json}`.

## Hosting, rights, and content

No public deployment occurred. The recording's public-use rights have **not been confirmed**; confirmation is required before publishing it. See [the complete encoding, playback, and rights report](audio-integration.md).

`public/audio/` is served by the existing Next production configuration. The audio asset helper supports a configured `/me` prefix, and its URL output is tested. The whole application is currently server-rendered Next hosting, including a dynamic research index; it is not a GitHub Pages static export. A future `/me/` static deployment requires application-wide configuration beyond the audio prefix. Set the actual `NEXT_PUBLIC_SITE_URL` when a real HTTPS origin exists; no origin or account was invented.

No dependencies or lockfile changes were required by the integration. Historical dependency audits remain historical and were not rerun. Identity, exact contact/profile links, acknowledgment wording, educational notes, and fictional trust models are unchanged. No achievements, affiliations, private findings, licensing claims, or case studies were fabricated.
