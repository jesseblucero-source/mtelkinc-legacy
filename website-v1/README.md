# MT E.L.K., INC. - V1

This directory is the version **1.0.0 (V1)** baseline of the published website at [www.mtelkinc.com](https://www.mtelkinc.com/), captured October 21, 2026 from production deploy `6ad8fe7f7088b92e9523fcf7`.

The repository's original Vinext application remains at the repository root. This is a separate static build, not a replacement for that app. Netlify production currently uses its separate Netlify Git service; pushing this GitHub branch does not reconnect that production source.

## Run the exact published snapshot

```sh
cd website-v1
python3 scripts/verify-v1.py
python3 -m http.server 8772 --directory dist
```

Open http://localhost:8772/. Serving the ready-to-deploy `dist` directory needs no npm install or build. Netlify should use this directory as its base directory and `dist` as publish directory only if a future deployment connection is explicitly approved. Its configured server-function directory is empty; no pending SMTP integration is activated.

## Release integrity

`VERSION`, `RELEASE.json`, `V1-RELEASE-NOTES.md` and `DIST-MANIFEST.json` identify the release. `scripts/verify-v1.py` checks every published file against SHA-256 and guards the static-only package. Recalculate the manifest and increment the version before publishing a later release. Do not overwrite V1's tag.

## Source and maintenance

`content/` contains structured records and language copy; `templates/` and `scripts/` contain the current generators and checks. `source-documents/` supplies the original multilingual guide needed by its generator. Other originals are preserved in `dist/records/` and `dist/downloads/`. Public browser dependencies and license files remain self-hosted in `dist/vendor/`.

There is no single clean-source full rebuild command yet: generators modify the existing static output and their ordering matters. Start from this verified snapshot, change only the relevant records/builder, then apply video preservation, resource-index, video-compatibility, document-viewer and delivery passes. Check visual changes rather than blindly applying older palette mappings. The included README records this maintenance limitation instead of promising a reproducible clean rebuild.

Browser checks use Node 22+ and Playwright. Install a compatible Playwright locally or set `MT_PLAYWRIGHT_MODULE` to an installed package directory. For the guide regression: start the local server, then run `node scripts/test-business-guides.cjs`. Detailed historical internal reports are retained in the original workspace; only the non-sensitive guide results are bundled here. Some older scripts still contain local tool defaults and need `NODE_BINARY` / `NETLIFY_CLI_JS` configuration on another machine. Do not run live submission tests without explicit authorization.

## Known operational limits

- University is a Coming Soon page, not an LMS.
- Ecwid supplies catalog, cart and payment processing. Successful payment settlement is not certified by this snapshot.
- Native form storage has been tested; staff inbox delivery and automatic company-sender confirmations require separate verification/setup.
- Some article originals cannot support full narration; device voice availability varies.
- YouTube provider-controlled iframe links and sign-in challenges cannot all be disabled.
- Extra domains still need fresh DNS/HTTPS acceptance.
- Responsive/browser tests do not certify every physical device or real-user Core Web Vitals.

Internal cost reports, private email records, environment files, local account state and pending mail functions are not included in this public snapshot.
