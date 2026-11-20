# MT E.L.K., INC. — 1.3.0

Product discovery and multilingual routing update, November 19, 2026.

- Four localized comparison pages at `/catalog/compare/`, `/fr/catalog/compare/`, `/es/catalog/compare/` and `/de/catalog/compare/`.
- Select up to three of the 57 published products. Selections remain in shareable URLs across catalog, product guides, comparison and language navigation. No account, browser storage or new service is needed.
- Compare original product information, published categories/SKUs and the existing verified training/replacement relationships. Prices, options, availability and checkout stay live in Ecwid.
- SKU and multiword product-name search combines with existing category filters. Clear filters preserves the separate comparison selection.
- Native sharing where available, Copy Link and selectable-URL fallback; cancelled sharing does not report success. Native operating-system share delivery is not certified by browser mocks.
- Localized controls in English, French, Spanish and German. Original English descriptions and lesson titles are explicitly labeled; no technical or commercial translation is implied.
- Corrected the shared language controller to follow actual hreflang equivalents and avoid nonexistent localized product-guide routes. Explicit original-English content stays unchanged, while persistent controls restore their English labels when switching back.
- Stacked phone comparison cards, accessible details, focus restoration, 48-pixel controls, reduced-motion support and working no-JavaScript product-guide alternatives.

Static fact/route checks, Chromium/WebKit comparison tests, catalog/training regressions and automated accessibility checks are recorded in the release evidence. The small page-scoped catalog controller is 9,532 unminified bytes; no dependency or continuous phone animation was added.

Merchant settings, financial operations, SMTP activation, original documents and DNS were not changed. No customer details, order, payment or email was submitted. The existing V1 tag is preserved. This update does not complete the owner-controlled mail, merchant, domain and analytics acceptance gates from the wider implementation plan.

Production deploy: `6affb90f54fb3d643c3f93ec` · https://www.mtelkinc.com/catalog/compare/ .
