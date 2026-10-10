# GitHub Pages migration

Destination: https://raj-hridoy.github.io/me/
Repository: `raj-hridoy/me`
Default branch: `main`

## Recovery

Original main commit: `4d562e8500a760bad88dfb2b4f2b8cbdf4168a58`.

The remotely verified branch `backup/old-portfolio-2026-10-10` points to that exact commit. Existing Git history is preserved. Restore by making a new main commit with the backup tree and deploying it; do not force-push or rewrite main history. If restoring the old branch-based publishing process, select `main` / root in Pages settings. The backup includes the original homepage and assets.

## Production configuration

The approved Next.js portfolio uses `output: "export"`, `/me`, trailing slashes, static article generation, and client-side query filters. Build with `npm ci` and `npm run build` on Node 24. The resulting `out/` is the complete Pages artifact, including all nine routes, the custom 404, local fonts, optimized audio, SEO files, and the old site's Google verification file. `scripts/prepare-pages.mjs` validates the artifact and writes `.nojekyll` and `deployment.json`.

`.github/workflows/deploy-pages.yml` runs lint, build, type checks, and Playwright, then uploads and deploys the static artifact. Future `main` pushes run this workflow automatically. Build permissions are read-only; the deployment job has `pages: write`, `id-token: write`, and the `github-pages` environment. Official action releases are pinned to commit hashes.

The repository's original authenticated Pages configuration is `build_type: legacy`, source branch `main`, path `/`, confirmed by the one-time workflow run https://github.com/raj-hridoy/me/actions/runs/38026106125. That workflow's settings update failed with HTTP 403: updating Pages settings requires Administration write as well as Pages write. The current workflow token has only Pages write. Browser access to GitHub settings also failed because the required admin-enforced browser policy could not be verified. No browser-security workaround is used.

The user confirmed switching the Pages publishing source to GitHub Actions on 2026-10-10. Successful deployment will provide independent confirmation of that configuration. The temporary settings probe was removed in commit `f933418cfd47b64c37626461671b86bd99cfaa9a`, preserving the original site tree and existing history.

## Migration status

The production static build, lint, and type checks pass locally. All 54 route/viewport layout checks pass at 360, 390, 768, 1024, 1440, and 1920px, without horizontal overflow. The production dependency audit reports zero vulnerabilities. All 40 Playwright tests pass against the static preview in 3.6 minutes. This includes all routes, native audio policy/gestures/persistence, visualizations, square scope behavior, mobile navigation, research query filtering, clipboard feedback, reduced motion, no-JavaScript content, links, 404 handling, and automated accessibility checks across all nine routes at 390px and 1440px. Independent HTTP checks verify referenced CSS/JS/fonts/images, canonical URLs, removal of old assets, and preservation of the Google ownership file. The final gzip-enabled static-preview Lighthouse audit with actual audio autoplay allowed reports desktop 100 and mobile 97 performance; accessibility, best practices, and SEO each score 100. Desktop LCP is 0.6s and mobile LCP is 2.6s, with zero CLS and TBT. An initial uncompressed-preview audit scored 99/80; the preview was updated to use gzip after confirming the existing GitHub Pages homepage uses gzip. These are local lab measurements, not field Core Web Vitals or live-site results.

The user explicitly confirmed approval and permission to publish the recording on 2026-10-10. Production publication is authorized. The verified source is prepared for the main-branch migration; deployment and live verification results will be recorded after they complete.

GitHub Pages controls HTTP headers; the document CSP provides asset/object/base/form restrictions but cannot impose `frame-ancestors` or other response headers. Audio range delivery and CDN cache behavior must be verified after publication. A native Firefox check also confirms first-keyboard-interaction playback at volume 1.0 and the same playing audio instance after navigation to `/me/about/`. WebKit could not launch because required host libraries are missing. Real Safari/iPhone and field Core Web Vitals remain outside the local automated test environment.
