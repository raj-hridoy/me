# Raj Hridoy — Boundary Studies

A complete independent security research portfolio built with Next.js 16.4 App Router, React 19.3, strict TypeScript, local fonts, custom CSS, and original SVG graphics. No external accounts, trackers, contact backend, or credentials are required.

The dark refinement preserves Boundary Studies’ monumental typography and unequal research folios, introducing obsidian/graphite materials, platinum/blue accents, sharp architectural geometry, and a shared uppercase RH monogram. The projected trust architecture supports drag/button rotation, layer separation, cross-section inspection, and selectable identity/policy/resource planes. The caller/policy request experiment has distinct desktop and mobile diagrams. See [the refinement audit](docs/dark-refinement.md) for the project-wide findings and rendered refinements.

The living experience adds a context-sensitive square optical cursor, direct diagram nodes, interruptible architecture transitions and focusing, pointer-directed lighting and card depth, scroll-responsive structural lines, and concise navigation/filter/copy feedback. Native text interaction, touch, keyboard, reduced motion, and fallback behavior are preserved. See [the interaction upgrade](docs/living-experience.md).

The supplied Bliss soundtrack now has a persistent root-layout controller, optimized same-origin Opus/AAC assets, immediate audible autoplay, and direct first-interaction retries when autoplay is blocked. Sound defaults on at 100% media volume; deliberate off is remembered. A square header control docks while reading. It shows READY when awaiting permission and ON only while actually playing. See [the encoding and playback report](docs/audio-integration.md) for exact settings, size comparisons, loop preparation, browser tests, and rights status. The user confirmed permission to publish the recording on 2026-10-10.

## Run locally

Use Node.js 20.9 or newer and npm. Run all commands from this project directory:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Production mode:

```sh
npm run build
npm run start
```

Do not run development and a production build concurrently against the same `.next` directory.

## Routes and project structure

```text
src/app/                 App Router pages, error handling, SEO routes, favicon
  page.tsx               Complete homepage
  about/                 Biography, principles, and working tools
  research/              Filterable index and article routes
  methodology/           Six-stage workflow and trust explorer
  recognition/           Disclosure acknowledgments
  contact/               Direct email, copy interaction, supplied profiles
  globals.css            Tokens, layouts, interaction states, responsive rules
  interaction.css        Optical scope, diagram inspection, presence and microinteractions
src/components/          Navigation, footer, artwork, cards, interactive components
src/data/site.ts         Identity, exact profile URLs, recognitions, research areas
src/data/notes.ts        Typed educational notes and approved case-study model
src/lib/metadata.ts      Shared metadata and deployment URL validation
public/                  Original SVG and PNG social preview
  audio/                 Fingerprinted 96 kbps Opus / 128 kbps AAC-LC soundtrack
scripts/                 Asset generation, performance checks, portal workaround
tests/                  Playwright interaction, route, layout, and accessibility tests
docs/                    Art direction and verification report
```

## Edit identity and acknowledgments

Update `src/data/site.ts` to change name, email, profile links, research areas, workflow, or recognition information. Introductory biography text lives in `src/app/about/page.tsx` and the homepage. Acknowledgments are disclosure-program acknowledgments, not endorsements. No achievements, reports, portrait, or accounts have been fabricated.

## Update technical notes

Edit the typed `notes` collection in `src/data/notes.ts`. Every note has a unique slug, educational content type, category, tags, illustration, summary, reading time, sections, and authoritative references. Existing illustration styles are `authorization`, `oauth`, and `code`. A new note automatically enters the index, article routing, and sitemap. Keep references accurate and explain whether examples are illustrative.

## Add an approved public case study

Populate the separate `caseStudies` collection in `src/data/notes.ts` with a `PublicCaseStudy` object. Only records with `publicationApproved: true`, `approvedOn`, and `publicReference` are published. Supply a unique slug, title, summary, category, disclosure date, program, approved public reference, and sections. Optional illustration and reference lists are supported.

The archive and article renderer distinguish public case studies from educational notes automatically. Static article generation and the sitemap include approved records. Verify publication permission, remove private data, and ensure the original public reference is legitimate before adding a record. An empty collection is intentional: there are no client-approved reports to publish.

## GitHub Pages production

This repository exports the approved portfolio to `out/` for https://raj-hridoy.github.io/me/. `next.config.mjs` sets static export, `/me`, trailing slashes, and unoptimized images. All nine public routes are generated at build time. Research query filters run in the client; the exported HTML retains readable research cards without JavaScript.

`npm run build` runs Next.js and verifies the complete artifact with `scripts/prepare-pages.mjs`. That check covers canonical URLs, project asset paths, fonts, SEO files, both soundtrack formats, and all generated pages. It creates `.nojekyll` and a public `deployment.json` containing the build commit for live verification. `npm run start` previews this exact static export at http://localhost:3000/me/; it does not run a production Next.js server. Development also uses `/me/`.

The deployment workflow in `.github/workflows/deploy-pages.yml` installs the lockfile on Node 24, runs lint, the build, type checks, and Playwright against the export, uploads `out/`, and deploys with GitHub's Pages action. It runs on pushes to `main` and manual dispatch. The repository's Pages publishing source must be **GitHub Actions**. Permissions are read-only during the build; only the deployment job receives Pages write and OIDC permission. Action versions are pinned to verified release commits.

The production canonical URL defaults to the actual destination and is set explicitly in CI. `.env.example` documents it. If moving this project, update the Next.js base path, font URLs/preloads, canonical URL, tests, and hosting configuration together, then rebuild. No domain, token, or other secret is embedded in the site.

The old site's Google ownership verification file is preserved under `public/`. Old homepage code, styles, and soundtrack assets belong only to the verified backup branch. Deployment state and rollback information are recorded in `docs/deployment.md`.

The user confirmed approval and permission to publish the supplied Bliss soundtrack on 2026-10-10. The local encoding report does not independently establish ownership.

GitHub Pages controls HTTP response headers. The export includes a document CSP restricting asset origins, objects, base URLs, and form submission. Frame restrictions and custom HTTP headers cannot be enforced by an HTML meta policy; production header behavior must be checked on the live host. The static preview's range and cache headers support audio QA but do not configure GitHub's CDN.

## Checks and tests

```sh
npm run typecheck
npm run lint
npx playwright install chromium
npm run build
npm run test
npm run audit
```

Playwright starts or reuses the production server at port 3000. Tests cover all public routes, link destinations, filters, query-selected categories, keyboard explorer navigation, policy toggles, methodology controls, mobile menu focus/Escape, clipboard success and failure, headers, 404s, social image, layouts at 360/390/768/1024/1440/1920px, automated WCAG checks, no-JavaScript content, native touch separation, layer selection, dark/square consistency, pointer lighting, and reduced-motion cleanup. Living-experience coverage additionally verifies scope modes, native reading/selection/keyboard/forced-color behavior, simulated cursor failure, rapid interrupted SVG transitions, focused-view restoration, direct diagram nodes, touch inspection, and a reduced-motion change during a running request.

Generated screenshots are saved under `.qa/screenshots/`, with test details under `playwright-report/`. Accessibility tests supplement manual review; they do not certify every aspect of WCAG compliance.

See [the verification report](docs/verification.md) for executed checks, current measurements, visual corrections, and remaining validation limits. The saved initial production audit has zero findings; the initial full audit includes a development-only upstream glob-pattern advisory. These audits were not rerun during the visual refinement.

For production-server Lighthouse measurements:

```sh
npm run start
# In another terminal:
npm run qa:performance
```

Reports are generated in `.qa/performance/`. These are local lab results, not deployed field Core Web Vitals. INP requires real interaction/field data.

## Design and assets

See `docs/design-rationale.md`. Display: Space Grotesk; body: Manrope; technical labels: IBM Plex Mono. Fontsource packages bundle fonts locally under their included open font licenses. Original angular hero and note illustrations are SVG/CSS. The recognition wordmarks are typographic presentations, not downloaded organizational logos. Edit `scripts/create-social.mjs` and run it with Node to regenerate both the original SVG and PNG social artwork.

The projected architecture lives in `src/components/boundary-sculpture.tsx`, with interruptible SVG interpolation in `use-architecture-motion.ts`. The fictional policy model lives in `src/lib/request-policy.ts`, with visual traces and five-stage controls in `src/components/trust-explorer.tsx`. Coordinated entries and bounded scroll motion live in `src/components/experience-motion.tsx`. The optical cursor and pointer presence live in `scope-cursor.tsx`; their CSS lives in `src/app/interaction.css` alongside the original `globals.css`. No 3D engine or animation library is required. Reduced-motion traces resolve immediately, and no-JavaScript visitors receive static explanations and the complete methodology text.

The paper-direction review is preserved under `.qa/overhaul/`. Dark-refinement before screenshots, rendered review passes, state and motion captures, and final production evidence are stored under `.qa/refinement/`. The optional `scripts/inspect-overhaul.mjs`, `scripts/inspect-refinement.mjs`, and `scripts/check-layouts.mjs` inspection helpers target this desktop's downloaded browser; they supplement the portable Playwright suite.

Living-experience before screenshots, two review passes, production captures, idle-frame evidence, and layout results are in `.qa/living/`. Run `scripts/inspect-living.mjs final` with Node against the production server to capture desktop and touch-emulated phone states. Run browser inspection, the test suite, and Lighthouse sequentially on this desktop's single-process browser.

Audio source inspection, five bitrate candidates, exact FFmpeg commands/probes, objective signal comparisons, and before/after verification are in `.qa/audio/`. `scripts/optimize-audio.py` regenerates assets from the unchanged supplied recording with FFmpeg/FFprobe; `scripts/analyze-audio.py` performs offline NumPy analysis. Neither tool is used by the website. `scripts/inspect-audio.mjs visual` captures five responsive audio-control profiles; its `browsers` mode checks Firefox/WebKit where host libraries permit. `tests/audio.spec.ts` verifies native autoplay and gestures, 100% volume, codec selection, loop wrap, one instance across routes, remembered off, range delivery, throttled progressive playback, bounded rejected attempts, lifecycle state, and network retry. Tracing is disabled for these policy tests because DevTools evaluations can grant activation before hydration.

## Security choices

No form backend, persistent user data, telemetry, or third-party widgets. External profiles use `noopener noreferrer`. The document CSP restricts assets and connections to this origin, disables objects, and disallows form submission. GitHub Pages controls framing and other HTTP headers. Inline script/style allowances support Next.js static rendering and hydration; this is not a nonce-based strict CSP. Do not add secrets to public configuration. Review the current dependency audit before deployment.

## This desktop's document portal

The provided directory is a FUSE document-portal mount. Its native current-directory and lock primitives are incompatible with parts of Node/SWC/Chromium. All source, dependencies, downloaded browser binaries, and generated artifacts remain inside this directory.

The project uses Webpack. The optional portal preload selects the version-matched Next.js WebAssembly compiler for this desktop; ordinary checkouts use native SWC. Ordinary checkouts use the standard commands above. For this specific desktop, the bundled runtime was used with:

```sh
export PATH=/home/raj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
export NODE_OPTIONS="--require=$(pwd)/scripts/portal-cwd.cjs"
export CODEX_PORTAL_WORKAROUND=1
export PLAYWRIGHT_BROWSERS_PATH="$(pwd)/.qa/browser"
export TMPDIR="$(pwd)/.qa/tmp"
node .tooling/npm/package/bin/npm-cli.js run dev
```

If a shell cannot resolve `pwd` on the portal, replace it with the absolute project directory supplied to the task. The `.tooling/npm` installer and `.qa/browser` downloads are ignored local tooling, not production requirements. `CODEX_PORTAL_WORKAROUND=1` disables the unsupported build lock: run only one build/dev process at a time. It also selects the installed `@next/swc-wasm-nodejs` compiler and enables single-process Chromium with fresh browsers per test. Leave that flag unset on ordinary hosting and CI. The app browser preview was queued through Codex; the local static server is directly usable at http://localhost:3000/me/.

The optional `scripts/desktop.mjs` launcher sets these portal flags automatically. For this exact desktop environment, run:

```sh
/home/raj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /run/user/1000/doc/9OhOsAgDSQt7QMjW5hAEMA/newweb/scripts/desktop.mjs dev
```

Replace `dev` with `build`, `start`, `test`, `lint`, `typecheck`, or `performance` as needed. Normal hosting continues to use the standard npm commands.
