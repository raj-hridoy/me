# Cinematic soundtrack integration

Implemented inside the existing project on 10 October 2026. The approved design, content, cursor, architecture diagrams, route transitions, and request experiment are preserved. The latest user preference is **sound enabled by default, playback volume 100%, with manual off remembered**.

## Recording and encoding

The supplied `Bliss(MP3_320K).mp3` remains untouched at `/run/user/1000/doc/BOtQQbmAwSV7dUIE52N9xg/Bliss(MP3_320K).mp3`. SHA-256: `26fc42d7233e3130d799f7944e41c86dd9546cac32fdbc35c7a704f5c9155394`.

FFprobe identifies MPEG Layer III audio at 320 kbps CBR, 48,000 Hz, two-channel stereo, 140.328 seconds encoded duration, and 5,639,030 bytes. Decoded duration is 140.316979 seconds. The container includes a 1280 × 720 MJPEG cover image and title/artist/album/encoder metadata. The complete probe and FFmpeg evidence are retained in `.qa/audio/`.

| Version             | Target encoding     |         Bytes | Decimal MB | Reduction from original |
| ------------------- | ------------------- | ------------: | ---------: | ----------------------: |
| Original MP3        | 320 kbps CBR        |     5,639,030 |      5.639 |                       — |
| Opus comparison     | 80 kbps VBR         |     1,510,575 |      1.511 |                  73.21% |
| **Production Opus** | **96 kbps VBR**     | **1,798,073** |  **1.798** |              **68.11%** |
| Opus comparison     | 112 kbps VBR        |     2,095,439 |      2.095 |                  62.84% |
| AAC comparison      | 96 kbps AAC-LC      |     1,689,710 |      1.690 |                  70.04% |
| **Production AAC**  | **128 kbps AAC-LC** | **2,251,469** |  **2.251** |              **60.07%** |

Both production encodings retain 48 kHz stereo. Opus uses FFmpeg 7.1.3/libopus, audio application, VBR enabled, compression level 10, 20 ms frames, and 200 ms Ogg pages. AAC uses FFmpeg's native AAC encoder, LC profile, and MP4 `+faststart` (index before media). Targets are not exact average/container rates: FFprobe measures 104.218 kbps for the Opus container and approximately 130.5 kbps for the AAC container. Artwork and source descriptive metadata are removed; required codec/container tags remain.

Selected assets are `public/audio/bliss-85e89bcddff4.ogg` and `public/audio/bliss-44d89e144d72.m4a`. Their fingerprinted filenames are recorded in `src/data/soundtrack.json`. Only these two files are production assets; comparison encodings stay under `.qa/audio/candidates/`.

## Signal quality and loop

The original has no leading silence at the tested −60 dB / 150 ms threshold. Its trailing silence begins at 140.017167 seconds and lasts about 300 ms. That tail is trimmed. A two-second equal-power blend joins the final music with the opening, and the loop boundary is rotated to two seconds into the intro. This produces a 138.017167-second master with immediate musical content and a prepared musical seam. Source content in the first two seconds remains in the overlap rather than being discarded.

The source decoded true peak is +4.4 dBFS. A uniform −5.5 dB gain provides headroom for full-volume playback without a dynamic limiter or compressor. This is peak protection, not the earlier requested quiet background level: the site's media volume settles at 1.0 (100%). Production true peaks measure −1.1 dBFS for Opus and −0.9 dBFS for AAC; integrated loudness is −16.0 LUFS and loudness range is 7.0 LU. Existing distortion in the recording is not repaired by attenuation.

`scripts/analyze-audio.py` compares decoded candidates with the identical prepared master. The chosen Opus preserves measured band power within about 0.03 dB and stereo correlation at 0.4638 versus the master's 0.4643. AAC 128 stays within 0.216 dB in the measured bands and correlation 0.4670. Within-codec time-domain SNR improves from 20.30 to 21.26 dB between Opus 80 and 96, and from 22.65 to 26.74 dB between AAC 96 and 128. These comparisons support a conservative quality/size choice; SNR is not a perceptual ranking between codecs. No subjective headphone comparison or perceptual transparency certification was performed.

Native `loop` repeats one media instance. Opus decoding preserves the master's duration; AAC has approximately 9.5 ms of decoded padding in FFmpeg. The prepared seam avoids an abrupt musical stop, but browser decoder scheduling and AAC padding mean a universally gapless result cannot be guaranteed. Native loop wrap and continued playback are tested in Chromium.

## Default-on playback and interaction unlocking

`BackgroundAudio` lives in the root layout and owns one stable `SoundtrackController` and one native HTML audio element. Internal client navigation does not remount it, reload its source, or reset its current time. No audio framework, Web Audio buffer, streaming service, or third-party request is used.

On hydration, the controller immediately requests audible playback at volume 1.0. It does not wait for scrolling, animation completion, or full page loading. Once genuine playback is permitted, a bounded 360 ms fade approaches 100%; manual off fades for 160 ms and pauses. Platforms that cannot set native media volume use immediate native playback/pause at their supported volume. [Native volume support varies by platform](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume).

If playback rejects with `NotAllowedError`, **SOUND READY** explains that sound is enabled but awaits browser permission. Temporary passive capture listeners watch trusted pointer, touch, click, key, wheel, and scroll events anywhere in the document. `play()` is called synchronously inside the event handler, without a timer, fake click, `preventDefault`, or delayed navigation. The controller allows one best-effort weak opportunity (such as scroll/touch start) and one qualifying activation opportunity. This lets a failed scroll attempt retain the later tap/click/key retry. A successful retry removes every temporary listener. A failed qualifying retry leaves the visible manual control rather than repeatedly spamming play requests. Synthetic events and modifier/repeated keys are ignored. [Autoplay restrictions are browser policy](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay); [user activation explains why scrolling alone is unreliable](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userActivation).

**SOUND ON** appears only during actual playback. **SOUND OFF** reflects stopped audio, including remembered manual off; loading and error states show **AUDIO LOADING** and **SOUND RETRY**. A visible, keyboard-accessible square SVG control sits in the header and docks at the bottom of the viewport while reading. Its touch target is 44 px tall, and a polite status message explains state changes. Without JavaScript, the inactive control is hidden and no audio is requested.

Manual off persists under `rh-sound-preference` in local storage. Subsequent gestures, route changes, visibility changes, and reloads do not reactivate it. A fresh manually muted load assigns no audio source and makes no media request. Storage failures are caught. A previous preference of on still does not override browser policy. Page hiding suspends existing playback; returning resumes its existing position only when it was playing/pending and desired. Other-tab manual off is respected. Promise tokens prevent stale play requests from resurrecting sound after stop or cleanup.

## Loading, failure, and hosting

Capability detection chooses one source before assigning it: Opus when supported, otherwise AAC-LC. The initial element uses `preload="none"`; the immediate play request starts native progressive loading of the chosen file. No synchronous fetch, whole-song download gate, preload link, full decoded buffer, or request for both codecs blocks rendering. Native range delivery is verified with 206 responses, `Accept-Ranges: bytes`, correct audio MIME types, and a one-year immutable cache policy on fingerprinted assets. A throttled native test verifies playing before the complete track is buffered. [Capability selection uses `canPlayType`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType).

An actual unsupported/decode failure permits one Opus-to-AAC fallback. An autoplay rejection does not trigger another codec download. Network failures expose a manual retry; metadata recovery restores the previous position when possible. Waiting/stalled, native pause, page visibility, page lifecycle, and cleanup handlers maintain button accuracy. All listeners and finite fade callbacks are removed on detach. No permanent polling or visual audio effects are added.

`public/audio/` is included in the existing Next production build and served from this origin, allowed by the explicit CSP `media-src 'self'`. The asset URL helper accepts `NEXT_PUBLIC_BASE_PATH=/me` for a host already configured with that application prefix; its `/me/audio/...` output is tested. The current application remains a Next server deployment with a dynamic research index, **not a GitHub Pages static export**. A future GitHub Pages deployment must configure the whole application for `/me/` and static hosting, not merely change the audio helper. No public deployment occurred.

## Reproducibility and evidence

`scripts/optimize-audio.py` checks the supplied source hash, prepares one float master, encodes all five candidates, publishes the selected fingerprinted pair, and writes `.qa/audio/encoding.json` with exact commands and complete probes. FFmpeg and FFprobe are build-time tools only. `scripts/analyze-audio.py` uses NumPy for offline signal analysis; NumPy is not an application dependency. Large raw PCM intermediates can be regenerated and are excluded from production.

`tests/audio.spec.ts` covers genuine allowed/blocked native Chromium autoplay, synchronous first click/key/touch, a scroll retry followed by a click, route persistence, manual off, volume, native loop, AAC selection, HTTP ranges/cache/subpath paths, network retry, simulated visibility lifecycle, progressive playback, and bounded rejected/synthetic-event handling. Playwright's default `--mute-audio` flag is removed for these tests, and tracing is disabled because its DevTools evaluations can grant activation before hydration. Native policy is verified without that test instrumentation. Browser policy flags are test-only and are never part of the website.

`scripts/inspect-audio.mjs visual` captures header/playing/docked states at 360, 390, 800, 1024, and 1440 px. Its `browsers` mode runs independent Firefox and WebKit checks. Firefox 157 verified native blocked autoplay, key activation, 100% volume, and one continuing audio element across navigation. WebKit could not launch because this host lacks its required shared libraries. Real iPhone/Safari and Android hardware, mobile lifecycle interruptions, real cellular networks, and subjective speaker/headphone quality remain unverified. Chromium touch emulation is not a real iPhone test.

Final suite, layout, visual, and Lighthouse results are recorded in [verification.md](verification.md). Before-audio performance reports and verification text are archived under `.qa/audio/`. Reports document observed behavior and do not guarantee the same startup latency on every network or device.

## Recording rights

The attached recording's ownership and public-use license have **not been confirmed**. Supplying the file does not establish permission to publish it. This integration and its preview are local. Before any public deployment, obtain the user's confirmation of the necessary recording/music rights or replace the recording with one whose permitted use is established.

## Public-use confirmation

On 2026-10-10, the user explicitly confirmed approval and permission to publish the supplied recording. This records their confirmation; it does not independently establish ownership.
