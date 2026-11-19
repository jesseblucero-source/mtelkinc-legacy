# MT E.L.K., INC. partner and international architecture

## Keep existing systems distinct

Research prospect → inquiry/application → staff qualification → written approval/agreement → account setup → ordering/reordering. A prospect is not a customer, an interested applicant is not an approved dealer, and a distributor candidate is not an appointed distributor. The public application already supports dealer/distributor review, volume details, optional directory interest and typed consent/signature records. No automatic approval, pricing or public directory is introduced.

Use the existing private Notion prospect source and separate application/CRM sources. Their private identities and read-only aggregate findings are in the local Canada handoff, excluded from public releases and public GitHub exports. The `reconcile-canada-prospects.py` tool reviews flat local JSON/CSV exports, normalizes all 13 regions, flags missing verification/source/language evidence and identifies duplicate candidates while preserving branches. It writes a private review outside the website, never changes Notion and never makes a contact campaign-eligible. Existing opt-outs and closed status remain suppressed.

## Dealer portal feasibility and access model

Evaluate the existing Ecwid customer-group/wholesale capability with a merchant administrator before introducing a second authentication system. Approved staff actions must associate the merchant account with written approval and the correct customer group. All price access must be checked on the merchant/server side, never by hiding HTML, relying on localStorage, or checking a URL parameter. Public visitors may see retail products; approved dealers see only their approved group terms; distributors see their authorized group; staff manage approvals through least-privileged merchant/CRM roles. Verify that orders and customer data cannot cross accounts. Review invitations, password resets, revocation, sessions, CSRF, account enumeration and pricing APIs in the provider's test environment.

Current implementation has no new portal, roles or account-specific price API. Merchant administration, actual groups, approved classifications and terms are required to complete and test this part. Standard/large-volume/international classifications are proposed configurable labels, not invented commercial entitlements.

## Canada

The existing strategy is a Western Canada regional pilot; no leading province or partner has been approved. Research records cover all ten provinces and three territories. That supports research, not a public coverage claim. Confirm company identity, source freshness, business category, distributor capacity, retailer network, stockholding and staff support. Preserve observed website language separately from confirmed contact preference; Date Added is not Last Verified. Reconcile duplicate candidates before any import. Do not create a new database.

## International readiness

United States and Canada are the primary commercial focus. Germany and other named international chapters remain research/legacy context until availability is approved. Spanish-language pages do not establish shipping to Spain or Argentina, and a German translation does not establish a German distributor. Require written confirmation of destinations, current currency, taxes, importer/exporter responsibilities, customs, product restrictions, returns and local-language commercial documents before publishing fulfillment claims. Do not choose product eligibility or legal terms from a generated checklist.

## Automation and reporting

Native Netlify staff notifications remain separate from prepared company-sent To/Cc notifications and applicant receipts. SMTP server/port/password, mail DNS, delivery verification and an activated Functions release remain required. No bulk marketing workflow or new paid sender is enabled. Transactional receipt permission is not newsletter permission.

The existing merchant reports and Notion sources are the preferred reporting systems. Product view, cart, checkout, purchase, inquiry and consent events require documented event contracts and approved analytics/CRM access. Exclude names, email, addresses, EIN, free-text answers, device signatures and raw order details from advertising analytics. Do not label provider cart entry as a purchase. No GA4/Search Console/consent integration or executive revenue dashboard has been fabricated in this release.
