import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import nodemailer from 'nodemailer';
import schema from '../content/dealer-application.json' with { type: 'json' };
import { buildNotification, buildApplicantReceipt, notifyApplication, smtpSettings } from '../netlify/lib/application-notification.mjs';

const from = 'jesse@mtelkinc.com'; // Fixture only; no sender is activated by this test.
const data = Object.fromEntries(schema.fields.map(field => [field.name, `Sample answer for ${field.name}`]));
Object.assign(data, {
  'form-name': 'dealer-application', application_reference: 'MTELK-LOCAL-PREVIEW',
  application_summary: 'Example application summary. No real applicant data.',
  signature_name: 'Example Applicant', signature_saved_at: '2026-10-20T18:00:00.000Z',
  signature_timezone: 'America/Denver', signature_device: 'Example browser',
  signature_browser_language: 'en-US', signature_clock_source: 'Applicant device clock',
  signature_version: 'MTELK-APPLICATION-SIGNATURE-1', signature_statement: 'Sample signature consent',
  bot_field_unused: 'Sample extra metadata', 'bot-field': 'Honeypot excluded',
});
const now = () => new Date('2026-10-20T18:01:00Z');
const message = buildNotification(data, from, now());
assert.equal(message.to, 'phillip@elkinc.com');
assert.equal(message.from.address, from);
assert.equal(message.replyTo, from);
assert(message.subject.includes('New application received'));
for (const field of schema.fields) assert(message.text.includes(`${field.labels.en}: ${data[field.name]}`));
for (const key of Object.keys(data).filter(key => key.startsWith('signature_'))) assert(message.text.includes(data[key]));
assert(!message.text.includes('Honeypot excluded'));
assert(message.text.includes(data.bot_field_unused));
assert.equal(buildNotification({ 'form-name': 'unrelated-form' }, from), null);
assert.throws(() => buildNotification(data, 'jesse.mtelkinc.com'));
assert.throws(() => buildNotification(data, 'jesse@elkinc.com')); 
const hostile = buildNotification({ ...data, business_name: '<img src=x onerror=alert(1)>', application_reference: 'Bad\r\nBcc: victim@example.com', to: 'victim@example.com', from: 'victim@example.com' }, from, now());
assert(!hostile.html.includes('<img'));
assert(hostile.html.includes('&lt;img'));
assert(!hostile.subject.includes('\n'));
assert.equal(hostile.to, 'phillip@elkinc.com');
assert.equal(hostile.from.address, from);
assert.equal(buildNotification(data, from, new Date()).messageId, message.messageId);

const env = {
  APPLICATION_MAIL_ENABLED: 'true', APPLICATION_MAIL_FROM: from,
  APPLICATION_SMTP_HOST: 'smtp.example.com', APPLICATION_SMTP_PORT: '587',
  APPLICATION_SMTP_USER: 'fixture-only', APPLICATION_SMTP_PASSWORD: 'fixture-only',
};
const getEnv = key => env[key];
assert.equal(smtpSettings(getEnv).transport.requireTLS, true);
assert.equal(smtpSettings(getEnv).transport.secure, false);
assert.throws(() => smtpSettings(key => key === 'APPLICATION_SMTP_PORT' ? '25' : getEnv(key)));
assert.throws(() => smtpSettings(key => key === 'APPLICATION_SMTP_PASSWORD' ? undefined : getEnv(key)));
let sends = 0, closed = 0;
const createTransport = options => {
  assert(options.requireTLS && options.tls.rejectUnauthorized);
  return { async sendMail(email) { sends++; assert.equal(email.to, 'phillip@elkinc.com'); return { accepted: ['phillip@elkinc.com','jesse@elkinc.com'] }; }, close() { closed++; } };
};
assert.deepEqual(await notifyApplication({ data }, { getEnv, createTransport, now }), { status: 'accepted', receipt: 'invalid-email' });
assert.equal(sends, 1); assert.equal(closed, 1);
assert.deepEqual(await notifyApplication({ data }, { getEnv: () => undefined, createTransport, now }), { status: 'disabled' });
assert.deepEqual(await notifyApplication({ data: { 'form-name': 'other' } }, { getEnv, createTransport, now }), { status: 'ignored' });
assert.equal(sends, 1);
for (const sendMail of [async () => ({ accepted: [], rejected: ['phillip@elkinc.com'] }), async () => { throw new Error('Secret raw SMTP detail'); }]) {
  await assert.rejects(notifyApplication({ data }, { getEnv, createTransport: () => ({ sendMail }), now }), error => error.message === 'Application notification was not confirmed by the outgoing mail service.');
}
for (const form of ['dealer-application', 'dealer-application-fr', 'dealer-application-es', 'dealer-application-de']) {
  assert(buildNotification({ ...data, 'form-name': form }, from, now()).text.includes(form));
}
// Exercise real Nodemailer MIME generation locally. No SMTP/network connection is made.
const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' });
const mime = await transport.sendMail(message);
assert(mime.message.toString().includes('To: phillip@elkinc.com'));
assert(mime.message.toString().includes('jesse@mtelkinc.com'));
await writeFile('/private/tmp/application-notification-preview.html', message.html);
await writeFile('/private/tmp/application-notification-preview.txt', message.text);
console.log(`PASS: ${schema.fields.length} answers, eight signature fields, four forms, fixed routing, safe HTML/headers, TLS, missing configuration, failure states and real MIME generation. No email sent.`);

for (const suffix of ['', '-fr', '-es', '-de']) {
 const receipt = buildApplicantReceipt({...data, 'form-name':'dealer-application'+suffix,email:'applicant@example.com'},from);
 assert.equal(receipt.to,'applicant@example.com');
 assert(!receipt.text.includes(data.signature_name));
 assert(!receipt.text.includes(data.signature_device));
 assert(!receipt.text.includes(data.ein||'unmatchable-fixture'));
 assert.equal(receipt.replyTo,from);
}
assert.equal(buildApplicantReceipt({...data,email:'bad\r\nBcc: victim@example.com'},from),null);
let messages=[];
const validData={...data,email:'applicant@example.com'};
assert.deepEqual(await notifyApplication({data:validData},{getEnv,now,createTransport:()=>({async sendMail(m){messages.push(m);return {accepted:m.to==='phillip@elkinc.com'?['phillip@elkinc.com','jesse@elkinc.com']:[m.to]};}})}),{status:'accepted',receipt:'accepted'});
assert.equal(messages.length,2);assert.equal(messages[0].cc,'jesse@elkinc.com');
await assert.rejects(notifyApplication({data:validData},{getEnv,now,createTransport:()=>({async sendMail(m){return {accepted:m.to==='phillip@elkinc.com'?['phillip@elkinc.com','jesse@elkinc.com']:[]};}})}));
console.log('PASS localized minimal applicant receipts, To/Cc staff routing, rejected receipts and header/privacy checks.');
