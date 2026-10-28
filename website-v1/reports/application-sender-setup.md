# Application notifications from Jesse

Updated October 28, 2026. **Sender confirmed: jesse@mtelkinc.com. Pending mailbox/server verification and authenticated outgoing-mail credentials. Not activated or deployed.**

The current production site has four dealer/distributor application forms and eight active form-specific native Netlify email notifications: one each to phillip@elkinc.com and jesse@elkinc.com for every form. All forms register 84 fields. Netlify's native notifications use its own sender. The production Functions-scoped APPLICATION_MAIL_FROM variable is set to jesse@mtelkinc.com. The user confirms the mailbox exists. APPLICATION_SMTP_USER is also set to jesse@mtelkinc.com. The exact SMTP host, TLS port and mailbox password are still missing, and custom sending remains disabled.

Prepared server function: `netlify/functions/application-notification.mts`. It handles Netlify's platform-verified `formSubmitted` event, restricts processing to the four application forms, and has no public fetch handler. It sends to phillip@elkinc.com with Cc jesse@elkinc.com, with Jesse's confirmed company address as From/Reply-To and sender name `Jesse | MT E.L.K., INC.`. It includes every submitted questionnaire answer, full summary, reference, review checks, all eight signature fields, and available submission metadata. No sender, destination or attachment URL is accepted from applicant input. HTML is escaped. SMTP must use authenticated TLS on port 465 or 587. Mail errors propagate without exposing applicant data or raw provider errors in logs. A provider acceptance response is not proof of inbox delivery.

The SMTP adapter is ready for the existing company mailbox; no Make or personal Gmail connection is used. The user confirmed jesse@mtelkinc.com and selected “Directnic or another mail host.” On October 20, 2026, local and Cloudflare DNS queries returned NOERROR with no MX answer for mtelkinc.com; Google DNS returned no apex TXT answer. elkinc.com has MX web164.dnchosting.com, but this does not establish a mailbox/server for mtelkinc.com. Do not reuse that other domain’s host or alter mail DNS without verification. Ask for the mtelkinc.com mailbox’s Email Details/server name.

## Secure activation

In Netlify project configuration, create production environment variables with the Functions scope. Enter credentials securely there, never in chat or source files:

- `APPLICATION_MAIL_FROM`: jesse@mtelkinc.com, confirmed and configured.
- `APPLICATION_SMTP_HOST`: the mailbox provider's authenticated outgoing SMTP hostname.
- `APPLICATION_SMTP_PORT`: 465 (implicit TLS) for Directnic hosting mail, subject to the mailbox’s actual settings; 587 (required STARTTLS) if another provider requires it.
- `APPLICATION_SMTP_USER`: the mailbox's authenticated user.
- `APPLICATION_SMTP_PASSWORD`: secret provider-issued SMTP/app password. A Microsoft/Google tenant may instead require an approved SMTP relay or OAuth integration; confirm provider requirements before enabling.
- `APPLICATION_MAIL_ENABLED`: set `true` only when the confirmed sender and credentials are ready.

First verify encrypted SMTP authentication with `node scripts/verify-application-email.mjs` in a trusted environment with the settings securely injected. This command never sends email, prints no credential values, and exits with status 1 when settings or the connection are incomplete. Do not put passwords in command arguments, source files or shell history. A verified connection does not establish authorized From-address acceptance or inbox delivery.

Then deploy the function with the existing static site, submit one clearly labeled test, verify provider acceptance and the actual email headers/body in Phillip's inbox. Keep native notifications active through verification. They intentionally remain active, so enabling this custom notification adds a Jesse-sent email alongside the native alerts until duplicate-alert preferences are decided. Spam-flagged submissions trigger no notification until verified. A deterministic Message-ID aids tracing, but does not guarantee exactly-once delivery during platform retries. Native alerts remain the fallback if custom SMTP is unavailable.

Local verification: run `node scripts/test-application-notification.mjs`. This tests all 67 answers, eight signature fields, all four forms, fixed recipients/sender, HTML/header safety, TLS enforcement, missing configuration, provider rejection/failure handling, and real Nodemailer MIME generation without sending any email. Preview fixtures are in `/private/tmp/application-notification-preview.html` and `.txt`.

Directnic source: https://directnic.com/knowledge/article/77%3Acan%2Bi%2Bset%2Bup%2Bmy%2Bemail%2Baccount%2Bto%2Buse%2Bssl%3F — find the webXXX.dnchosting.com server under the account’s Hosting/Email details; SSL SMTP port 465; username is the full mailbox email. Mailbox password is distinct from the Directnic account password.

## October 28 readiness check

Netlify API confirms only APPLICATION_MAIL_FROM and APPLICATION_SMTP_USER, both in Functions scope for production. Host, port and password are absent; APPLICATION_MAIL_ENABLED is absent. Four language-specific forms remain registered. The custom function stays excluded from production.

Public Google DNS queries returned no MX or apex TXT answers for mtelkinc.com (NOERROR) and NXDOMAIN for _dmarc.mtelkinc.com. Confirm the mailbox provider’s incoming MX and outgoing SPF/DKIM/DMARC requirements; DKIM selectors have not been checked. Do not guess records or copy elkinc.com settings. SMTP authentication alone will not verify incoming mail or domain authentication.

Notification and preflight fixture tests pass, including 67 questionnaire fields, eight signature fields, all four forms, fixed To/Cc, minimal localized applicant receipts, required TLS, redacted connection failures and transport cleanup. These are local tests; no live SMTP login, submission, email delivery or inbox check was performed.
