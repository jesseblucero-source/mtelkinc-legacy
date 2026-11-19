# MT E.L.K., INC. publishing and recovery

The existing public Ecwid store is the authority for products, prices, inventory, variants, cart, tax, shipping and payment methods. This release does not change merchant configuration. Static guides are a discovery/support layer. Product IDs preserve identity even when a display name changes.

## Approved publication sequence

1. Run `node scripts/refresh-public-catalog.cjs` in a trusted browser-enabled environment. It reads only the public storefront and writes a candidate/change report. It does not read merchant API tokens, orders or customers.
2. Review added/unlisted IDs, original descriptions, image sources and model relationships. An incomplete catalog or unlisted product stops application; absence is not proof of discontinuation. Apply the reviewed snapshot with `--apply`. Do not let generated marketing copy overwrite verified specifications. Unknown materials, dimensions, GTINs and compatibility stay unasserted.
3. Run `python3 scripts/build-release.py`, `python3 scripts/validate-public-authority.py`, `python3 scripts/audit-static-links.py` and the Canada reconciliation fixture tests. The build preserves original scans/downloads, runs the on-site video keeper before rebuilding resource indexes, and is deterministic on the retained static baseline. It does not reconstruct a deleted dist directory.
4. Run the browser suites against a local preview: new catalog, guided training, embedded media/source viewers and the existing store journey. Scope payment tests to a merchant sandbox; do not place a live order or claim payment settlement from cart entry.
5. Run `python3 scripts/package-static-routing.py`. The package contains dist only and an empty Functions directory. Catalog freshness is checked at packaging. Keep docs, Notion mappings, email settings, applicant data and internal business files out of the public ZIP.
6. Deploy to the existing site ID, verify canonical URLs, HTTP statuses, headers, products and on-site cart entry. Record deploy ID and release manifest. The production hostname remains https://www.mtelkinc.com.

The read-only GitHub workflow validates the static build and original-document preservation. It has contents:read only, persists no checkout credentials, does not read deployment secrets and does not deploy or send messages. Browser tests and live merchant checks are separate release gates.

## Deployment source remains an owner-controlled integration

Netlify currently links a separate hosted Git source; the GitHub website-v1 snapshot is not that production source. A later automatic production deploy from the separate source can replace a manual release. Reconcile the canonical repository/build settings with the existing Netlify integration before enabling Git-based automatic publishing. Do not assume this workflow changes Netlify's connected repository. A source-provider installation or repository authorization may be needed.

## Recovery

Netlify deploys are atomic. Restore the previously verified deploy through Netlify's deployment controls if regression occurs; do not delete the prior release. Keep the immutable v1.0.0 tag, manifests, current source snapshot and previous production deploy identity. Re-run checkout, forms registration, canonical and video checks after rollback. No database migration is part of this release, and native form notifications and merchant accounts remain in place.

## Crawler and schema limits

llms.txt follows the voluntary llmstxt.org proposal; it does not guarantee search ranking, AI citations or crawler compliance. robots.txt is a public crawl preference, not access control. The public policy blocks GPTBot, ClaudeBot, Google-Extended and CCBot from crawling while leaving traditional search discovery available. Google-Extended affects Gemini training and grounding as documented by Google; it does not control Google Search inclusion. User-requested retrieval may behave differently. Review policy deliberately before changing it.

Product guides include verified identity/description/image/SKU metadata. Static offers, ratings, reviews, shipping/return schema and invented identifiers are excluded. This is not a claim of Google product-rich-result or Merchant Center eligibility. Use the merchant's approved live feed or an authorized synchronized integration before enabling those commercial enhancements.

Primary references: https://llmstxt.org/ ; https://developers.google.com/search/docs/appearance/structured-data/product-snippet ; https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers ; https://developers.openai.com/api/docs/bots ; https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/ .
