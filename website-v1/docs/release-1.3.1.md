# MT E.L.K., INC. — 1.3.1

Storefront stability follow-up to the 1.3.0 mobile comparison release, November 19, 2026.

Production testing exposed intermittent blank merchant views with a Vue renderer `insertBefore` exception. Custom suggestion panels previously moved into Ecwid-managed product/cart elements. They now remain in site-owned siblings immediately before the storefront and at the existing recommendation section, preserving their styling, product/cart context, model-specific rules and mobile browsing controls without reparenting merchant-owned DOM.

A late subscriber initializes explicit product/category deep-link context from the public URL; subsequent merchant events remain authoritative. The API being available no longer marks a blank storefront as ready. Browsing controls stay disabled until visible store content is present, and the existing timeout/retry UI remains available. Child-module content hashes update with parent controller versions, including warm navigation between releases.

No merchant configuration, processor, pricing, inventory, cart API behavior, financial operation or email activation was changed. Anonymous UI tests do not certify card authorization or order fulfillment. Original records/downloads remain unchanged.

See the preceding 1.3.0 release note for comparison, localized search/sharing and product-guide routing. The wider owner-controlled acceptance gates remain open.

Production deploy: `6affbf9896b0a78ee666e13b` · https://www.mtelkinc.com/catalog/compare/ .

The final startup guard permits at most one automatic SDK remount only before a first successful render and only when the widget contains no input, textarea, select or iframe. It never remounts a previously ready store. A second failure exposes the existing manual Retry control. Eight controlled scenarios across Chromium/WebKit cover successful recovery, permanent failure, manual retry and untouched customer fields. These are mocked safety tests, not payment authorization tests.
