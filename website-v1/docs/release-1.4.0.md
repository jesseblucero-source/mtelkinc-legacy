# MT E.L.K., INC. — 1.4.0

Dealer/distributor application usability update, November 19, 2026.

- Required-answer progress follows the currently applicable questionnaire. It is not an eligibility score or account approval.
- Readable step states and phone navigation; one active step at a time.
- An error summary links directly to affected fields, with localized inline explanations and preserved existing hints.
- Edit any section from review and return directly after validating applicable answers. Authorization editing focuses the actual authorization field.
- Changing an answer invalidates the existing saved signature and requires consent again before a completed print or submission.
- No new questions, field names, submission routes, browser draft storage, telemetry or delivery service. The four forms retain the 67-question schema and 84 registered field names.
- Existing complete print/PDF and applicant-controlled prepared-email paths remain available. Automatic company mail remains separately gated.

Chromium and WebKit tests cover all four languages, 320–1440 pixel layouts, conditional requirements, error focus, review edits, signature invalidation, print and controlled failure/receipt responses. Automated accessibility checks cover tested error and review states; these are not a full manual or physical-device certification. No live application or email is sent by the tests. Original historical files and the merchant integration are unchanged.

Production deploy: `6affc9973f96aa3f89c1c2bc` · https://www.mtelkinc.com/dealer-application/ .
