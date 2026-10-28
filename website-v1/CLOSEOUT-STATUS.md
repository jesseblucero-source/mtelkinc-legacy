# MT E.L.K., INC. — release closeout

Release: 1.1.1, October 27, 2026. Production: https://www.mtelkinc.com/university/.
Deploy: `6ae187b9980cfaced05011e9`. Original V1: Git tag `v1.0.0`; V1 pull request merged as `85d16ae8c70970a84578bae4c8b8079857837b72`.

The 1.1.1 homepage patch adds responsive AVIF delivery with WebP fallbacks, shared-photo reuse and a smaller English initialization path. See `PERFORMANCE-1.1.1.md` for the latest paired laboratory results: median LCP 4.37 → 3.69 seconds, observed transfer about 8% lower, CLS 0. The homepage remains above target; this does not close the field-performance requirement. The earlier 1.1.0 measurements below are retained as historical evidence.

## Published and verified

- Guided University replaces the Coming Soon page in four language editions. Eleven existing verified lesson records power species paths, on-site video controls, lesson/resource links, explicit reviewed checkboxes, a reset dialog and a downloadable plan. Progress stays in this browser; videos retain their original spoken language. No accounts, assessments or certificates are claimed.
- Canonical, alternate-language and Open Graph metadata use the production domain. Public URLs, original scans, PDFs, product integration and embedded-video mappings are preserved.
- Shared styles retain their cascade order in one hashed stylesheet per page. A repeatable incremental build runs video preservation, search-index refresh, player/source-viewer processing and delivery optimization. Consecutive builds produced identical static files. The retained dist baseline is required; this is not a clean rebuild from empty output.
- Original-document integrity: 57 original records/download files unchanged. Static link audit: 480 pages, 26,431 local links/assets, zero missing destinations.
- Chromium and WebKit checks passed all four University languages: filtering, persistence, reset, plan download, click-to-load players, navigation, disabled storage, no-JavaScript lesson links and 320–1440 px layouts.
- Automated axe checks: zero findings on University in four languages and selected Home, Education, application and Legacy pages. This is not a complete manual screen-reader audit.
- Embedded video-control regression passed nine contexts, including the shop. Provider responses were mocked; YouTube sign-in and playback restrictions remain provider controlled. All 13 original archive PDFs rendered in the on-page viewer, with close/retry/navigation cleanup checks.
- Live storefront checks at 390 and 1440 px confirmed product → anonymous cart → on-site checkout email entry, with no horizontal overflow. Cart cleared afterward. No order, address, card or payment submitted.
- Four Netlify application forms and eight scoped native staff email notifications verified. The static release deliberately contains no SMTP function.

## Measured performance

Cold production Chromium lab, 390×844 at DPR 2, simulated 1.6 Mbps down / 750 Kbps up, 150 ms latency and 4× CPU slowdown; two samples per page, observed through load + 2 seconds:

| Page | Before LCP | After LCP | After CLS |
|---|---|---|---|
| Home | 3.47–4.30 s | 3.13–4.42 s | 0 |
| University | 2.10–2.44 s | 2.12–2.34 s | 0 |

University stayed within the 2.5-second laboratory target while gaining guided training. Home remains above target; two samples do not establish a statistically reliable improvement. One stylesheet request replaces seven on the homepage. Initial observed transfer was about 509 KB after versus 514 KB before. A separate diagnostic identified the hero photo as Home’s LCP element. These are laboratory observations, not real-user p75 results; no field INP claim is made. Local uncompressed-server samples are retained separately and are not compared with CDN samples.

## Prepared, not activated

Company email code includes all submitted details in staff To phillip@elkinc.com / Cc jesse@elkinc.com, from jesse@mtelkinc.com. A separate minimal applicant receipt has English, French, Spanish and German copy; it excludes EIN, answers and signature/device data. Local tests cover all 67 questionnaire fields, eight signature fields, headers, HTML escaping, TLS, missing settings and mail rejection. The event function bundles successfully.

Only sender and SMTP username were present at the last configuration check. Host, TLS port and password must be saved in Netlify Functions scope. Keep APPLICATION_MAIL_ENABLED off until the connection is verified. Activation requires a separate functions deployment and a labeled real submission/delivery check. Existing native staff notifications remain active; those do not provide a literal Cc header or an automatic applicant receipt. SMTP acceptance is not proof of inbox placement. Retries may resend a previously accepted message; no exactly-once guarantee is claimed.

## Requirements that remain external

| Item | Current evidence | Needed for completion |
|---|---|---|
| Section subdomains | canada, usadealers, application and university.mtelkinc.com already CNAME to Netlify; HTTPS hostname mismatch | Netlify certificate issuance; provisioning request returned HTTP 422. Keep current main-domain certificate intact. |
| University domain | mtelkincuniversity.com and www still resolve to registrar addresses | Directnic @ A 75.2.60.5; www CNAME mtelkinc-educationhub.netlify.app, then DNS/HTTPS/redirect acceptance. |
| Shop domain | mtelkinc.shop and www still resolve elsewhere | Directnic verification if requested, correct A/CNAME records, then DNS/HTTPS/redirect acceptance. Preserve mail records. |
| U.S. dealer domain | mtelkincusa.com and www reach the intended section over verified HTTPS | Already live; retain acceptance checks. |
| Payments | On-site cart/checkout entry tested; public responses contain provider references | Merchant-admin confirmation of active Stripe method; sandbox card-entry, error, bank-authentication, receipt and payment authorization checks. No live charge authorized/performed. |
| Five archive narrations | Alternate local files match current incomplete/mismatched sources | See original-source checklist below. Never invent missing passages. |
| Language coverage | Four-language navigation, training controls and available translated reading records; source documents and video speech retained | Human review of machine-assisted copy; verified source material for missing full articles. Original English PDFs are not falsely labeled as translated. |
| Performance | Controlled Chromium laboratory samples retained separately | Lab LCP goal is not certified by release; no real-user p75 INP/CWV dataset or physical-device certification is available. |
| Netlify source synchronization | Production is a verified manual static deploy; GitHub stores current source separately | Existing Netlify Git source is separate. A later production Git deploy can replace this manual release; reconcile source before that push. |

## Original-source checklist

- **newest-secret** — `BRWBCF4D415B79D_002273.pdf`: provide the missing continuation page(s).
- **big-bull-elk-cow-talk** — `big-bull-elk-cow-talk-1986.jpg`: provide a readable higher-resolution original.
- **retail-correspondence** — `BRWBCF4D415B79D_002299.pdf`: verify the correct document for this record.
- **cow-talk-radio** — `BRWBCF4D415B79D_002292.pdf`: verify the correct document for this record.
- **prime-time** — `BRWBCF4D415B79D_002305.pdf`: provide an uncropped complete original.

Known notices and existing source links remain available. Device speech voices, YouTube restrictions, native printing/sharing and payment-provider authentication remain controlled by those providers/devices.

A dealer directory, authenticated partner portal, staff editor and full LMS were not included in this guided-training release. No unverified commercial terms, approvals, enrollment or certifications have been added.

## October 28 application email follow-up

Rechecked Netlify: only sender and username are configured, both for production Functions. The four application forms are registered. Host, port and password remain missing. Offline notification and SMTP preflight tests pass; a new `verify:mail` command checks TLS/authentication without sending a message. The SMTP function remains excluded, and no live delivery has been certified. Public DNS currently publishes no observed MX, SPF or DMARC records for mtelkinc.com; the confirmed mail provider must supply its required settings before activation. Details: `reports/application-sender-setup.md`.
