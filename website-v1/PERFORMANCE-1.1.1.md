# MT E.L.K., INC. — homepage delivery 1.1.1

This patch reduces the unchanged homepage hero photo’s delivery size and removes redundant English-page initialization. All four homepage language editions retain the current layout, branding, original image, cinematic motion and navigation.

Production deploy: `6ae187b9980cfaced05011e9` at https://www.mtelkinc.com.

## Changes

- AVIF variants at 480, 780, 960 and 1440 pixels, selected with the same display-size rule as the image. A matching high-priority preload reuses the selected request. Existing WebP images remain fallbacks, including a new 780-pixel version. The lower call-care card reuses the responsive variants of the same photo instead of requesting another codec copy. Unsupported AVIF browsers still receive a real image.
- At the tested 390-pixel / DPR 2 phone size, the selected image is 45,055 bytes instead of 85,612 bytes: 47.4% less image data. This is the hero image’s reduction, not a claim that the entire page is 47% smaller.
- English pages already contain English static copy. The English language controller restores only persistent controls inherited from other language editions and skips a page-wide dictionary scan/observer. French, Spanish and German dictionary behavior remains in place.
- Fingerprinted image variants use immutable caching. The source photo and original historical documents remain unchanged.

## Verification

Eight responsive-image cases across Chromium/WebKit and four languages passed: decoded AVIF selection, one reused hero request, geometry, phone overflow, fallback WebP, embedded video controls and SPA return. The fallback test deliberately removes the AVIF source to exercise the real WebP image; it does not claim to emulate an old browser version.

French/Spanish/German → English music-control restoration passed in Chromium and WebKit. Desktop Three.js rendering reached ready state and drew frames; its pause control worked. Music continued through Education and Back. The broader four-language guided-training suite passed in both engines, with zero automated axe findings in the tested views. Initial broad local attempts timed out; focused probes and the subsequent full run passed. No physical-device certification is claimed.

Builds are idempotent. The local link audit found no missing targets. No payment, form submission, email delivery, original document or merchant setting was changed. SMTP remains excluded from the static release.

## Laboratory comparison

Three alternating cold samples per version were measured from immutable Netlify deployment URLs at 390×844 / DPR 2, 1.6 Mbps download, 150 ms latency and 4× CPU slowdown. No request interception was used. All six samples are retained in `reports/home-delivery-performance.json`.

| Metric | Before (1.1.0) | Candidate (1.1.1) |
|---|---|---|
| Median LCP | 4.37 s | 3.69 s |
| LCP range | 3.62–6.27 s | 2.72–4.10 s |
| Largest CLS | 0 | 0 |
| Median resource transfer through observation window | 509,354 bytes | 468,900 bytes |
| Selected hero resource, including timing API transfer overhead | 85,912 bytes | 45,355 bytes |

Observed transfer fell 7.9%. Median LCP was lower by 15.6% in these samples. The homepage remains above the 2.5-second target. Shared workstation load was high and uncontrolled, and ranges overlap; these samples do not establish field performance or a statistically reliable improvement. They are laboratory observations, not real-user p75 Core Web Vitals or field INP. See [Google’s LCP guidance](https://web.dev/articles/optimize-lcp) for the distinction between laboratory diagnostics and user experience.

The first image-only candidate increased total transfer because the lower card still fetched the old WebP. That duplicate download was corrected before production; its initial report remains local as `home-delivery-performance-initial.json`.

The page-container experiment did not show a consistent benefit and was not shipped. Its diagnostic report is retained locally; the navigation architecture remains unchanged.

Variant encoding uses Pillow with AVIF support only when regenerating image assets. Normal builds use the checked-in variants and verify their SHA-256 values; Pillow is not a release-build dependency.
