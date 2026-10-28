# MT E.L.K., INC. — 1.1.1

The tagged `v1.0.0` remains the immutable V1 baseline. The active static release retains guided University training in English, French, Spanish and German, production-domain canonical metadata, consolidated CSS delivery, and repeatable release checks. The V1 pull request is merged.

The 1.1.1 patch adds responsive AVIF hero variants with WebP fallbacks and a matching preload on all four homepages. English initialization restores persistent translated controls without rescanning the entire static page. Original imagery and current cinematic motion remain. See `reports/home-delivery-performance.json` for paired CDN lab measurements and `PERFORMANCE-1.1.1.md` for the release assessment.

## Build and verify this release

Use Node 22+, Python 3.9+ and pnpm 11.25.0. From this directory:

```sh
corepack pnpm install --frozen-lockfile
pnpm build
pnpm test:mail
python3 scripts/audit-static-links.py
python3 -m http.server 8772 --bind 127.0.0.1 --directory dist
# In another terminal, after installing Playwright browsers:
pnpm exec playwright install chromium webkit
pnpm test:closeout
pnpm package:static
```

This is a deterministic incremental build on the retained static website; it is not a reconstruction of the original project from an empty dist directory. Preserve dist, content, templates and scripts together. Original PDFs and scans remain unchanged. The required on-site video preservation script runs before resource-index refresh. `pnpm-lock.yaml` is authoritative.

## Current limits and activation gates

University contains 11 existing verified lessons with model/species paths, embedded playback, explicit reviewed checkboxes, a reset confirmation and a downloadable personal plan. Progress is saved in this browser only. No learner accounts, exams or certificates are claimed. Video audio remains in its original language; original documents and English business PDFs are labeled accordingly.

The SMTP notification/receipt code is prepared under netlify but deliberately excluded by the configured empty-functions directory. Its tests do not send email. Enable it only after Functions-scoped host/port/password configuration, SMTP connection validation and a labeled end-to-end delivery check. Staff To/Cc is phillip@elkinc.com / jesse@elkinc.com; From is jesse@mtelkinc.com. Existing Netlify form notifications remain in place in the meantime. SMTP acceptance is not proof of inbox placement. A retried event can resend an already accepted message; there is no exactly-once guarantee.

Run `npm run test:mail` for offline message and connection-check tests. After securely injecting the confirmed mail settings into a trusted environment, `npm run verify:mail` checks encrypted SMTP login without sending a message. It emits only status codes and missing variable names. Connection verification does not establish delivery; complete the labeled submission and inbox check before declaring notifications operational. See `reports/application-sender-setup.md`.

The closeout report records remaining registrar, certificate, merchant and source-document requirements. Viewport/browser automation does not certify physical devices, native speech voices, provider sign-in behavior or payment settlement. See `CLOSEOUT-STATUS.md` for current evidence.

---

<!-- v1-baseline -->
**MT E.L.K., INC. - V1 / 1.0.0** is the production baseline captured October 21, 2026. See `VERSION`, `RELEASE.json` and `V1-RELEASE-NOTES.md`. The public-safe GitHub snapshot is under `website-v1/` in `jesseblucero-source/mtelkinc-legacy`; production deploy identity is preserved in the release metadata. Internal cost PDFs and email records are excluded from that snapshot.


MT E.L.K., INC. static website export.

## Distributor support guide

`scripts/build-distributor-guide.py` copies the approved, clickable five-page PDF from `../output/pdf/MT E.L.K., INC. - Multilingual Support and Distributor Partnership.pdf` to the stable public URL `/downloads/mtelkinc-multilingual-distributor-guide.pdf`. It adds `#distributor-guide` cards on U.S. Dealers, Canada and International in English, French, Spanish and German. Copy is in `content/distributor-guide.json`; the PDF itself is in English and is labeled accordingly.

Cards provide a real download, the existing on-page PDF preview, native mobile link sharing where supported, Copy link, WhatsApp and prepared email. No message sends automatically. A readonly URL supports manual copying and no-JavaScript use. The 4.2 MB PDF and its preview engine load only after interaction. Original scans, videos and application fields remain unchanged.

Run the guide builder after other business-page builders, then the established video keeper, resource-index, video-compatibility, document-viewer and optimized-delivery passes. Preserve `content/font-delivery.json` so font subsetting remains active. The router registers the small page-scoped `distributor-guide.js` controller; scoped styles are in `dist/distributor-guide.css`. The document-viewer builder recognizes `/downloads/` PDFs as well as `/records/`, and supports an explicit document title on a preview link.

Verify with `node scripts/test-distributor-guide.cjs [origin]`. The browser suite exercises all 12 cards, real PDF downloads and five-page rendering, mocked Web Share/clipboard success and fallback paths, cancelled sharing, navigation/history, 320–1440 px layouts, and no-JavaScript links. Native operating-system share sheets and actual WhatsApp/email delivery require user interaction and are not simulated as delivery confirmations.

Netlify project: mtelkinc-educationhub
Site ID: 2235167f-7f96-4631-a741-1394bfa6b8d0
Publish directory: dist
Source commit: f41814c2494b7810ddd2191c6834a19ce237cce3

All 330 pages, embedded video controls, original archive documents, language editions, music and navigation effects are included. Canonical metadata and sitemap use https://www.mtelkinc.com. The live store uses the existing Ecwid catalog, cart and checkout.

Public deployment authorized by the owner on October 14, 2026. This export is a snapshot; future changes require a new deployment.

## Navigation expansion

October 14, 2026: full-screen mobile menu with focus containment, scrolling and a visible Close control; localized quick links to Education, Videos, saved resources and search; three verified learning pathways on Education; opacity-only phone page fades; parallel loading of page controllers with ordered initialization.

Run `python3 scripts/expand-netlify.py` to rebuild the navigation and learning pathways. Shared menu source: templates/mobile-menu.js. Records: content/learning-pathways.json. CSS: dist/mobile-navigation.css. The historical source scans and PDFs remain unchanged.

## German edition

110 static German pages are available under /de/, with German navigation, search, filters and archive summaries. The full site has 440 pages across English, French, Spanish and German. Machine-assisted German copy includes reviewed hunting terminology and main-page copy. Original scans, PDFs, video URLs and audio remain preserved.

German source dictionary: content/translations/de.json. Reviewed primary copy: content/translations/de-reviewed.json. Rebuild with python3 scripts/build-german.py after updating the dictionary.

## Live store

The live storefront at /shop/ embeds the existing Ecwid store 117609763 used on elkinc.com/products/. English, French, Spanish and German wrappers preserve current products, options, prices and stock through the existing store. There were 57 products and ten top-level categories during verification. Product descriptions and checkout language depend on the existing store’s enabled translations.

Cart and checkout are embedded in the website; orders and payments use the existing merchant integration. Bank authentication or payment-provider approval may use provider-controlled flows. Testing added and cleared an anonymous cart but did not enter customer data, place an order, or charge a payment. Full payment authorization and fulfillment were not tested.

The store renderer remains connected while browsing other pages to preserve the cart. Music remains connected across navigation. The provider script is only loaded after visiting the shop. Policies link to the published policies on elkinc.com.

Rebuild the store wrappers with python3 scripts/build-store.py. If rebuilding languages, run the store builder afterward to retain localized navigation and shop links.

### Store discovery

`content/store-categories.json` preserves the existing merchant category IDs and source URL. `scripts/build-store.py` generates localized category navigation, product search and model-resource guides; category and keyword URLs can be shared. Run `scripts/test-store-discovery.cjs` to verify the new browsing controls (optional production origin argument).

### Published disclosures

Records: `content/disclosures.json`. Original page captures, text and published-page inventory: `content/source/disclosures/`. Downloads: `dist/records/policies/`. `python3 scripts/import-disclosures.py` explicitly refreshes source snapshots from elkinc.com; it does not invent new policies. `python3 scripts/build-disclosures.py` generates the hub and individual pages in all four site languages, footer/store links, search-index entries, sitemap and redirects from original policy slugs. Run this builder after the store/language/navigation builders.

The policy body and source downloads stay in their published English language; localized labels explain this. Only company-name typography is normalized in the displayed copy. Original HTML and text retain the published spelling. The original source names Shopify. The user-authorized revision in `content/payment-policy-amendment.json` updates section 6.2 for the existing Ecwid checkout and removes Shopify-specific payment-method and infrastructure claims. `build-disclosures.py` applies this revision without altering the original source capture, produces a separately labeled current-policy download, and records the revision date. If refreshed source wording changes, the builder stops for review rather than losing the revision. Merchant terms and provider settings were not edited. No new privacy policy or terms-of-service document was invented: the published WordPress page inventory exposes two policy pages.

Verify with `scripts/test-disclosures.cjs` (optional production-origin argument).

### Guidefitter footer

`content/guidefitter.json` preserves the original elkinc.com footer destination and program labels. `python3 scripts/build-guidefitter.py` adds the localized Guidefitter section to every page; run this last after other page builders. The destination uses the original Guidefitter account path without the malformed tracking query. Links open a new tab, with clear accessible labels. No discount, eligibility or approval promises are added.

### Guidefitter program pages

`content/guidefitter-page.json` contains the English, French, Spanish and German program-page content, stable program anchors and source references. The Guidefitter builder now generates `/guidefitter/` in each language, preserves the three original external account links, and adds internal overview links in the footer and store. Pages use native anchor navigation and FAQ details, a responsive existing elk photograph, and a desktop image effect with reduced-motion support. No additional page JavaScript or verification form is introduced. Verify with `scripts/test-guidefitter.cjs`.

### Homepage store visibility

`content/home-shop.json` and `scripts/build-home-shop.py` generate the first-position Shop button and compact store-category section on the four homepages. Run the homepage builder last after other page builders. The shared mobile-menu template adds a bag icon to the persistent Shop shortcut. Shared CSS highlights Shop in the desktop menu, phone menu and bottom navigation. Verify links and responsive layouts with `scripts/test-home-shop.cjs`.

### About refinement

`content/about-tightening.json` and `scripts/tighten-about.py` shorten the four About editions, remove repeated introductory cards and decorative strips, and preserve source distinctions. Run this builder last to retain the copy and matching archive-card links. Spacing overrides are scoped to `.about-tight`. Original scans, PDFs, timeline anchors, people and preview controls remain unchanged. Checks: `scripts/test-about-tight.cjs`.

### Homepage refinement

`content/home-tightening.json` and `scripts/tighten-home.py` trim homepage copy and duplicate teasers in all four languages. Run this after the homepage store builder. The primary Shop CTA, original source record links and labels, people pages, embedded videos, care links, country list and contact information remain. Scoped `.home-tight` CSS reduces spacing without introducing scripts or media. Checks: `scripts/test-home-tight.cjs`.

### Cinematic store campaign

`content/home-store-campaign.json` and `dist/home-store-campaign.css` replace the plain homepage store band with an outdoor campaign. `build-home-shop.py` generates the localized headline, manufacturer/education proof points, primary shop CTA, secondary lesson link and four source-mapped category cards. Existing local wildlife imagery is responsive and lazy-loaded. Only homepages load campaign CSS; other homepage-based templates strip it.

`dist/cinematic.js` uses the existing motion controller to reveal the campaign and gently move its image on desktop while visible. The shared Pause control cancels it. Continuous campaign-image motion is disabled on phones; reduced-motion settings show static content. Verify with `scripts/test-shop-campaign.cjs`. No prices, discounts, testimonials, scarcity or product-performance promises were introduced.
### MT E.L.K., INC. UNIVERSITY

`content/university.json` defines the planned University page in English, French, Spanish, and German. Run `scripts/build-university.py` after the existing generation pipeline and before the article-reader builder. It generates `/university/` in each locale, an Education teaser, a shared footer link, sitemap entries, and resource-index entries. `dist/university.css` scopes the responsive design and honors reduced-motion preferences. The page describes planned learning themes and points to current resources; it does not announce a launch date, enrollment, qualifications, or completed courses. Verify with `scripts/test-university.cjs`.
The University builder also places a localized Coming Soon feature after the homepage pathways. It shares the scoped `university.css` stylesheet and existing responsive elk imagery. `cinematic.js` provides a single desktop entrance tied to the shared Pause control; phone and reduced-motion layouts stay static. The generic heading-reveal observer excludes this section to avoid duplicate motion. Verify with `scripts/test-home-university.cjs`.

### Shop image motion

`content/store-motion.json` stores four localized motion controls and the public HorizonX reference. `dist/store-motion.js` is an original lightweight implementation of reveal/depth ideas, imported by `store.js` with a content hash added by `build-store.py`. No HorizonX membership asset is bundled. The existing shop controller initializes and cleans up motion around the cached Ecwid storefront.

The shop hero uses the existing responsive elk image, with visible desktop pan/zoom and one finite phone entrance. Only category/product listing images receive masked, counter-moving reveals and desktop hover depth. Labels, prices, native product details, cart, and checkout remain stable. Reveal observation follows newly rendered categories/search results, caps concurrent animations, and cleans up on navigation. The localized Pause control saves the visitor’s preference for the session; device reduced-motion preferences override animation. Hidden tabs and offscreen hero media stop moving. Check with `scripts/test-store-motion.cjs` and `scripts/test-store-discovery.cjs`.

### Article audio summaries (initial version; superseded by full narration below)

Run `scripts/build-article-reader.py` last. It adds 80 localized audio-summary players across 64 pages: the homepage history cards, Legacy records, and all 14 archive records in English, French, Spanish, and German. Narration is derived from existing archive descriptions and curated translated summaries. `content/article-reader-overrides.json` improves German narration; original scans and PDFs remain unchanged. `content/article-narration-records.json` records the generated narration text.

`dist/article-reader.js` uses the browser’s speech synthesis with a matching language voice, short passages, Listen/Pause/Resume/Stop, and reading speed. It never falls back to a different language. Missing voices, unsupported browsers, and synthesis errors receive accessible messages with the readable transcript still available. Resume repeats the current passage for cross-device consistency. Voices may be local or supplied by the browser/operating system; no TTS account, secret, or new audio hosting service is configured.

Narration stops on page/language changes and video playback; it pauses existing music, including a pending music load. Explicit music playback stops narration. No speech autoplays. The router recognizes the new page controller, and the reader builder refreshes shared module hashes. Tests: `scripts/test-article-reader.cjs` uses a deterministic speech API mock for controls, language matching, errors, navigation and audio interlocks; `scripts/test-article-reader-native.cjs` checks actual installed browser voices and speech events.

### Full article narration (2026-10-15)

The reader now uses `content/full-articles/{en,fr,es,de}.json` rather than summaries. Nine archive records have full source text, including the three featured Legacy/home records. Translated editions are explicitly labeled automatic; featured Cow Call, MORE, and company-biography texts received additional source-aligned translation review. Short speech passages and preserving passage position across speed changes support longer listening. Original scans and PDFs remain unchanged.

Five files cannot currently support complete narration: `big-bull-elk-cow-talk` is low resolution; `newest-secret` lacks its continuation; `prime-time` is cropped; `retail-correspondence` and `cow-talk-radio` link to files that do not match the indexed descriptions. Full-reading controls are disabled with localized reasons; summaries are never silently substituted. `take-a-bull` marks one unclear phrase in brackets. The faint `talk-to-the-elk` copy is checked against the clearer duplicate `cow-talk-for-elk`, with both source links retained.

Run `build-article-reader.py` last. It produces 36 downloadable localized `.txt` transcripts in `dist/records/transcripts/`. Source SHA256 values, page selection and review notes are stored in the English records. OCR bounding-box evidence is in `content/source/full-article-ocr/`. Translation models ran locally for preparation; no model weights or translation APIs ship to the browser. No new merchant or TTS integration is needed.

`scripts/test-full-article-reader.cjs` checks the entire text-to-speech sequence, downloads, language editions, marked gaps, unavailable-source states, and maintaining position when reading speed changes. Existing control/interlock and native voice tests continue to apply.

## Consolidated archive clippings

October 15, 2026: the archive shows 12 unique records per language. `content/archive-duplicates.json` identifies two duplicate pairs: `talk-to-the-elk` → `cow-talk-for-elk`, and `more-show` → `more-exposition`. Both original PDF copies remain available on the retained record. Old routes redirect within the selected language; search indexes, record counts and sitemap exclude duplicate entries. Source registries and original documents remain unchanged.

Run `python3 scripts/deduplicate-archive.py` **last**, after `build-article-reader.py` and the other page generators. Guidefitter and University builders skip the static redirect pages. Verify with `node scripts/test-archive-deduplication.cjs [origin]`.

## Legacy phone improvements

October 15, 2026: tighter Legacy hero and record spacing, compact full-scan previews with an accessible on-site zoom dialog, clear localized Close/zoom controls, larger audio play/stop buttons, compact speed controls, and expandable audio notes. Original transcripts and PDFs remain available. Repeated summary/PDF actions beneath each record were consolidated.

Run `python3 scripts/tighten-legacy.py` after `build-article-reader.py` and `deduplicate-archive.py`. The builder is idempotent. Verify with `node scripts/test-legacy-phone.cjs [origin]`.

## Archive phone improvements

October 15, 2026: four Archive hubs and 48 canonical record pages now share Legacy’s scan zoom dialog and compact audio controls. Search stays visible on phones; optional year/type filters expand, including automatically for shared filtered URLs. Preview buttons enlarge original scans on-site. Verified full-text records have Read & listen links directly to the audio panel. Incomplete records retain their clear unavailable-audio messages. Previous/next and all-records links support chronological browsing. Original source documents remain unchanged.

Run `python3 scripts/tighten-archive.py` last, after the article-reader, deduplication and Legacy builders. Shared preview UI copy is in `content/scan-preview-ui.json`; controller and reader styling are reused from `dist/legacy-phone.js` and `dist/legacy-phone.css`. Verify with `node scripts/test-archive-phone.cjs [origin]`.

## Shop suggestions

October 15, 2026: four shop editions now include contextual product suggestions on category, product and cart pages. Exact named replacement parts, educational materials, accessories and existing packages come from the public Ecwid catalog. Suggestions exclude the current product, cart items, known package contents and the superseded green bands. Package alternatives are offered for comparison on product pages; a call already in the cart does not trigger a suggestion to buy its package too. No sales-history, popularity or “customers bought” claims are made.

Suggestions open the native product page for current prices, stock and required options. Nothing is automatically added. Checkout, payment and account pages suppress the suggestion section. The component retains only product IDs from the current cart in browser memory; it does not read or persist customer identity, address or payment details. Original catalog names are retained while suggestion controls are localized. Native Ecwid checkout settings remain unchanged.

Run `python3 scripts/build-store-suggestions.py` last after store/page generation. Source rules: `content/store-suggestions.json`; catalog evidence: `content/source/store-products.json` and `store-pairing-evidence.json`. Public read-only refresh scripts: `scripts/import-store-products.cjs` and `scripts/import-store-pairing-evidence.cjs`; review rules and source mappings before rebuilding after a refresh. No prices are cached in recommendation cards.

Verify with `node scripts/test-store-suggestion-rules.cjs` and `node scripts/test-store-suggestions.cjs [origin]`. Live commerce tests only add and clear an anonymous test cart; no order or payment is submitted.

### More visible product and cart suggestions

October 15, 2026: compact suggestion previews now appear near product purchase controls and cart items. Two real product previews link to their existing product pages; a prominent button moves focus and scrolls to the complete suggestion row. The full row sits inside the storefront before its footer on product/cart views, and returns to its normal catalog position for category browsing. Suggestions are removed from the cached storefront when leaving the shop and rebuilt without duplicates when returning.

The rail now has 48px previous/next buttons, disabled end states, a localized accessible position indicator, a visible phone swipe cue, and one-card scrolling with reduced-motion support. Native provider styles are overridden only inside the named suggestion component. Existing recommendation rules and merchant checkout settings remain unchanged. Added UI copy: `content/store-suggestion-visibility.json`. Verify with `scripts/test-store-suggestion-visibility.cjs` plus the existing suggestion and rule checks.

## Original documents stay on the page

October 15, 2026: all original-source PDF controls on 60 relevant pages open an accessible on-page dialog. The same page and scroll position are retained. Page navigation, fit/zoom, original-text extraction when present, original-PDF download and all-page print preparation are available. Close/Escape returns focus to the original link. The source PDF URLs and files remain unchanged.

Printing uses two explicit steps: Prepare print renders every source page, then Print document opens the browser’s print options. The browser/device controls printer availability and Save as PDF. Rendering all pages avoids native embedded-PDF viewer differences on phones. Download returns the unchanged source file. No third-party viewer frame or external PDF service is used.

PDF.js 6.4.299 is self-hosted under `dist/vendor/pdfjs-6.4.299/` with bundled licenses and an integrity/file manifest in `content/document-viewer-vendor.json`. The engine and worker load only after opening a PDF. Source URLs are restricted to the current website. The versioned runtime assets use immutable caching; no source document is modified.

Run `python3 scripts/build-document-viewer.py` **last**, after all page/reader/Legacy/Archive/store builders and resource-index updates. Localized controls: `content/document-viewer.json`. Verify with `scripts/test-document-viewer.cjs` and `scripts/test-document-viewer-lifecycle.cjs`. The old direct PDF URLs remain usable for downloading and external references.

## Embedded video compatibility

October 15, 2026: all five official YouTube embed controllers share `dist/youtube-player.js`. Each player preserves its video ID/start/autoplay behavior, keeps privacy-enhanced embedding, supplies the actual website origin and explicitly sets `strict-origin-when-cross-origin`. The site response header uses the same referrer policy. `dist/video-compatibility.css` fixes individual video pages that otherwise used the default iframe size and keeps player height at least 200px on narrow phones.

After page/video generation, run the required `homepage-v1/scripts/keep-videos-on-site.py` from that project targeting this source, rebuild the resource index, then run `python3 scripts/build-video-compatibility.py` before the final document-viewer builder. It is idempotent and refreshes controller/style hashes. Verify with `node scripts/test-video-compatibility.cjs [origin]`.

Those tests mock the provider response to verify embedding, referrer headers, route/close behavior and sizing. They do not verify real YouTube playback or remove YouTube sign-in requirements. YouTube controls its anti-bot checks; website code cannot disable them. No external viewing buttons, proxy streams or downloaded YouTube media were added. Source-evidence URLs are unchanged. Fully independent playback requires authorized original video files and a separate hosting integration.

## Dealer and volume applications

October 20, 2026: `/dealer-application/` plus French, Spanish and German editions provide a 66-field Dealer or Distributor questionnaire in five stages. Only applicable questions are shown: 56 answers for the tested dealer path and 64 for the tested distributor path, with pending-document explanations enabled. Structured fields and translations are in `content/dealer-application.json` and `content/dealer-application-ui.json`; build with `python3 scripts/build-dealer-application.py`.

The questionnaire distinguishes direct-to-hunter retail, multi-location retail and supplying other independent retailers. Volume-pricing interest, opening/annual units, currency/budget, territory, existing retailer coverage, stocking, replenishment, education, fulfillment, funding readiness, documentation status, optional trade references and authorization are collected for manual review. Zero current retailer accounts are allowed. No approval score, wholesale prices, order minimums, credit offers or exclusive territories are invented. Bank/card/tax-ID documents are not collected. Answers are not saved in localStorage.

The completed localized review and print view include every applicable answer, typed authorization, reference and preparation time. Print / Save PDF opens the browser's native print controls before or after submitting. Printing does not submit. Failed or unconfirmed POST responses retain the answers. UI confirms receipt only after an OK response containing the static receipt marker; it does not claim inbox delivery. Printing and mobile layout are browser-emulation checks, not physical printer/device certification.

Four Netlify Forms are registered: `dealer-application`, `dealer-application-fr`, `dealer-application-es`, `dealer-application-de`. Form detection is enabled. Eight notification hooks are restricted to these form IDs: phillip@elkinc.com and jesse@elkinc.com each receive a complete copy. Per the user's preference this uses native Netlify notifications, no Make automation or Gmail sender. Netlify notifications send separate copies rather than a literal Cc header. Configuration and non-sensitive verification references are in `content/dealer-application-delivery.json`. Applicant data stays in Netlify Forms, not public files.

After generating pages, run the required on-site-video cleanup from `homepage-v1` targeting this source, rebuild the resource index with `scripts/expand-netlify.py`, then run `scripts/build-video-compatibility.py` and `scripts/build-document-viewer.py`. The dealer builder is idempotent on consecutive runs. Verify with `scripts/test-dealer-application.cjs`: step validation, conditional fields, localized forms, complete print view, error retention, success-response validation and persistent-navigation cleanup. Live testing should be clearly labeled and should not use real applicant information.

To verify or recreate dealer-only email hooks after deployment, run `python3 scripts/configure-dealer-notifications.py` with a logged-in Netlify CLI. For a cached CLI use `NETLIFY_CLI_JS` and `NODE_BINARY`. It uses CLI-managed authentication, refuses site-wide hooks, preserves unrelated notifications and does not read credential files.

The applicant explicitly selects Dealer or Distributor. Distributor questions cover independent retail accounts, proposed first-year reach, sales representatives, territory, warehousing, replenishment, reporting and cross-border responsibilities. Dealer questions cover retail presence and merchandising. Both collect business structure, registration status/jurisdiction, purchasing authority, volume estimates, documentation status, customer support, channel commitments and authorization. Distributor references require either a contact or an explanation of unavailability. All applications require manual verification; advisory review flags identify mismatched customer/account type, a developing network, incomplete readiness, pending documents and undetermined funding/budget. No automatic qualification or commercial thresholds are asserted. The retired account_interest field remains hidden to preserve old form records.

Application sharing: localized Share Application and Copy Link controls are generated on the application hero and dealer application CTA sections. The dependency-free dealer-share.js controller uses the native share sheet where supported, clipboard fallback, and a selectable read-only URL when clipboard access is unavailable. It always shares the canonical blank application URL with the current language prefix; never form answers, application references, query strings or draft state. Verify with scripts/test-dealer-share.cjs.

Device/browser compatibility revision (October 20, 2026): the application uses an AbortController timeout and crypto.getRandomValues reference fallback, locks actual controls during submission, and restores them after failure without depending on inert. Future steps are hidden in generated HTML. Phone hero artwork uses the existing 480px WebP, the body font is preloaded, native selects are constrained to available width, touch controls retain generous targets, and landscape/safe-area/forced-color styles are provided. Shared navigation and cinematic controllers tolerate legacy MediaQueryList listeners; unsupported 3D features retain the photo. Browser checks use scripts/test-device-compatibility.cjs; form and sharing suites accept MT_BROWSER=chromium|webkit|firefox (Firefox test binary path is local-only under /private/tmp). Performance samples use scripts/measure-dealer-performance.cjs; they are lab samples rather than field CWV data.

EIN addition: schema version 3 has 65 active questions, including mandatory EIN status and a conditionally required business EIN. The text field accepts nine digits with an optional hyphen and normalizes the summary/print/submission value to XX-XXXXXXX. Pending/no-EIN declarations trigger an advisory review flag and documentation explanation; non-U.S. businesses can select the dedicated option. Disabled EIN values are omitted from submissions. Validation checks format only, not IRS assignment or business ownership. New copy explicitly excludes SSNs and personal tax identifiers. EIN is included in the full application and application-specific native Netlify email copies; share links remain blank and never include entered data.

Directory interest addition: schema version 4 adds the optional directory_opt_in question in Operations with explicit Yes/No choices and no preselection. The hint states that approved applicants will be notified about next steps and that participating businesses will confirm listing details before publication. This captures interest in review, print and existing native Netlify notification summaries. It does not enroll or publicly list an applicant and does not add an automated approval/email workflow; the team handles approval follow-up.

## Dealer application and video starting hub

October 20, 2026: U.S. dealer pages now group a direct Start Application action, blank-application sharing controls, three application/review steps, the original Dealer Program Presentation, and three staff training videos directly below the hero. Homepages link directly to the application and video area. Hero, partner-type cards, FAQ and contact controls point to the existing localized application. Old dealer contact/resource anchors and both original program guides remain available.

The program video was located in page 1 of the existing Dealer & Affiliate Program guide. Its official-channel oEmbed identity and source guide are recorded in content/dealer-start.json. Staff lessons retain the existing verified model-to-video mappings; band and reed replacement are labeled separately. Source-context descriptions do not claim transcript coverage or current commercial terms. No order minimum, pricing, approval deadline or exclusivity is invented.

Localized UI is in content/dealer-start-ui.json. scripts/build-dealer-application.py now invokes scripts/build-dealer-start.py after generating the reusable application/share block. Follow the existing video keeper, resource-index, video-compatibility and document-viewer pipeline afterward. Dealer-only responsive styling is dist/dealer-start.css; it is omitted from the application page itself. Shared learn.js restores focus to the video opener after closing.

Verify with node scripts/test-dealer-start.cjs [origin]. Provider iframe content is stubbed to test site navigation, embedding parameters and player controls without treating a provider anti-bot response as a website failure. Actual YouTube playback availability remains provider/browser/network dependent. No form or email submission occurs in these checks.

## Applicant-controlled PDF and prepared email

October 20, 2026: on the completed review step, Download Application PDF creates a private copy in the browser; Prepare Email shows a recipient/subject/details sheet for phillip@elkinc.com with jesse@elkinc.com copied. Applicants download the PDF, copy the complete English email details, open their own mail app, paste the details, attach the PDF and press Send. Long questionnaire answers and EIN are not placed in mailto URLs. The email controls never claim sending or delivery and do not create an automatic applicant receipt. Native Netlify submission and its existing eight scoped staff notifications remain available.

All applicable answers, consent responses, EIN (if applicable), directory interest, reference and review checklist appear in the PDF and email text. The PDF follows the selected page language; email details use English for staff review. Missing clipboard permissions leave a selectable full-text fallback. Unsupported PDF-font characters show an explicit Print / Save PDF fallback instead of silently dropping answers.

PDF generation uses self-hosted pdf-lib/fontkit via a bundled engine, loaded only when Download Application PDF is pressed. The existing Roboto font was converted to TrueType without changing the source WOFF2. Answers are kept in memory and are not uploaded to a PDF or email service. A downloaded file and clipboard contents are controlled by the applicant.

Install locked dependencies with corepack pnpm install --frozen-lockfile. scripts/build-dealer-application.py invokes scripts/build-dealer-email.py and scripts/build-dealer-start.py; continue the required video keeper, resource-index, video-compatibility and document-viewer pipeline. Dependency versions/loading scope are in content/dealer-pdf-vendor.json. The browser module is built by scripts/build-dealer-pdf-vendor.cjs; pnpm-lock.yaml pins dependencies. Verify with scripts/test-dealer-email.cjs and the existing application regression suite.

Forms activation verification (October 20, 2026): Netlify Forms explicitly enabled, ignore_html_forms=false, with all 66 questionnaire fields registered in each of four 75-field form records. A real labeled test stored all 63 applicable distributor answers, summary and checklist exactly. Its initial spam flag was reviewed and only that known test was marked verified. Report: reports/dealer-forms-activation-2026-10-20.md. The opt-in live checker scripts/test-live-dealer-forms.cjs sends a real test and must not be run casually.

## Typed signature and saved timestamp

October 20, 2026: schema revision 5 has 67 questionnaire fields. A new required signature agreement uses the existing authorized_name typed full name. Save Signature & Timestamp freezes the signer name, UTC saved-at time, browser time zone/language, user-agent/platform information, statement and record version. The first validated print, PDF download, prepared email or native submission also saves the signature when consent is checked. Metadata is read only on that action, kept in memory and recorded in exported copies or the submitted form.

Editing any application answer clears the saved signature and hidden metadata and unchecks the signature agreement. Applicants must review and confirm again. Later downloads and submissions keep the signed timestamp unchanged unless answers change. Browser menu printing without completing/consenting does not create a signature.

The record explicitly uses the applicant’s device clock and browser-reported information. It is not identity verification, a certificate signature or a certified timestamp. Netlify separately records IP/user-agent and server receipt metadata on actual online form submission. The locally prepared PDF includes browser/device information and does not claim to contain Netlify’s server IP record. No unique device fingerprint, location lookup or third-party IP service is introduced.

Signature consent is a normal questionnaire answer; eight additional hidden fields hold signature_name, signature_saved_at, signature_timezone, signature_device, signature_browser_language, signature_clock_source, signature_version and signature_statement. They are also included as a complete signature block in the native application_summary, PDF, print copy and prepared email body. UI copy is in content/dealer-signature-ui.json. Existing notification recipients and optional applicant-controlled email workflow remain in place.

Signature tests are integrated into scripts/test-dealer-email.cjs: consent required, explicit save, answer-edit invalidation, re-consent, stable signed time across later exports/submission, metadata in all outputs, long answers, native submit/print retention and mobile width.

## Domain routing expansion — published; DNS pending

The expanded routing is now published: main deploy `6ad7c81ba45e0202268d9683` and U.S. dealer deploy `6ad7c831650afae70552fa34`. The credit-related publishing blocker was resolved after the user restored Netlify credits. The application shortcuts `/apply/`, `/application/`, `/usadealers/`, and catalog product paths are live on the main website. Phone checks confirmed application readiness and preserved tracking, product and cart fragments. All four 84-field application forms and eight existing staff notification hooks remain configured; inbox delivery is not independently certified by this routing deployment.

The durable package is `releases/static-routing`; its verified ZIP is `releases/static-routing/Final-Website-static-routing.zip`. The functions directory is empty and the pending custom SMTP function remains excluded. The earlier unconstrained deploy operation was rejected by automatic approval review; the successful deployment used this explicitly static-only release.

Public activation of the remaining hostnames still needs Directnic DNS/verification and HTTPS validation. Use `reports/Directnic-final-DNS-checklist.md` for exact records and `reports/Directnic-support-request.txt` for the prepared support request (not sent). Run `python3 scripts/audit-domain-completion.py` after DNS is updated. It distinguishes local readiness, deployed routing, and real public-domain DNS/HTTPS.

## Definition of complete — domain launch

Run `python3 scripts/audit-domain-completion.py`. It checks the prepared routing with Netlify’s local engine, verifies the durable static ZIP and SHA-256 manifest, checks every public hostname over normal HTTPS, and tests the expanded routes over HTTP. Each generated report carries the current audit run ID, so old results cannot mark a new run complete. Missing or invalid release evidence fails closed. The command exits with status 1 until all acceptance gates pass; local readiness is never treated as a public launch.

Results: `reports/domain-completion-audit.md` and `.json`. Directnic support handoff: `reports/Directnic-support-request.txt` (prepared only; not sent). Account requirements and exact DNS values remain in `reports/Directnic-final-DNS-checklist.md`. This domain audit does not certify SMTP sender delivery or payment settlement.

## Glass music player and soundtrack sharing

October 20, 2026: shared music controls use a translucent glass surface with an explicit solid-background option, warm sunset accents and a live Canvas frequency spectrum. Public HorizonX Glass Radio and Orbit pages are recorded as visual references in `content/music-experience.json`; the implementation is original and includes no membership-only source or external runtime.

The analyser renders actual playing-track frequencies at up to 24 fps with a capped canvas resolution. Paused music, a minimized player, offscreen artwork, hidden tabs and reduced-motion settings stop continuous rendering. Music stays in the persistent player across internal navigation and pauses for video or article narration. Audio files still load only after Play.

The player offers native sharing where supported, Copy Link, WhatsApp, Facebook and prepared email. Shared URLs contain only the localized homepage and a recognized soundtrack ID; they open the selected track's controls without autoplay. Clipboard failures expose a selectable URL, and cancelled sharing does not claim delivery. Sharing controls are localized in English, French, Spanish and German. No messages are sent by the website itself.

Run `python3 scripts/build-music-experience.py` after shared-player edits to version the lazy modules, stylesheet and page launcher. This only refreshes existing script references; it does not generate page content. Validate with `node scripts/test-music-experience.cjs [origin]` and optional `MT_BROWSER=webkit`. Reports and desktop/phone captures are stored in `reports/music-*`.


## Dealer and distributor Heyzine guides

Two source-backed guides are available in the dealer, Canada and international resource sections, with dedicated `/dealer-guides/customer-support/` and `/dealer-guides/distributor-network/` pages and French, Spanish and German navigation. PDF contents remain in English and are labeled accordingly.

Records: `content/business-guides.json`; localized UI: `content/business-guide-ui.json`. Run `python3 scripts/build-distributor-guide.py` to regenerate both the original multilingual-guide section and these pages, followed by the existing video preservation, resource index, document viewer and delivery optimization pipeline. The original local PDFs are preserved. Cover images use first-page renders.

Heyzine iframes load only after interaction. Pages include original PDF download, accessible on-site PDF preview, browser sharing, copy-link and manual fallback. Shared links point to the website page. Provider reader controls and native sharing sheets remain provider/device controlled.

Validation: `scripts/test-business-guides.cjs`, `reports/business-guides-browser-results.json` and `reports/business-guides-static-results.json`. Browser control tests mock Heyzine and native sharing; actual Heyzine embedding was separately opened and visually checked at a 390px viewport.
