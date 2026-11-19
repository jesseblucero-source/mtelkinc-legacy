import assert from 'node:assert/strict';
import { verifyApplicationMail } from '../netlify/lib/application-mail-preflight.mjs';

const env = {
  APPLICATION_MAIL_FROM: 'jesse@mtelkinc.com', APPLICATION_SMTP_HOST: 'smtp.example.com',
  APPLICATION_SMTP_PORT: '587', APPLICATION_SMTP_USER: 'fixture-only',
  APPLICATION_SMTP_PASSWORD: 'fixture-only-secret',
};
const getEnv = key => env[key];
const unreachable = () => { throw new Error('Transport must not be created'); };
for (const key of Object.keys(env)) {
  const result = await verifyApplicationMail({ getEnv: name => name === key ? undefined : getEnv(name), createTransport: unreachable });
  assert.deepEqual(result, { status: 'incomplete', missing: [key], emailsSent: 0 });
}
for (const [key, value] of [
  ['APPLICATION_SMTP_PORT', '25'], ['APPLICATION_MAIL_FROM', 'other@example.com'],
  ['APPLICATION_SMTP_HOST', 'smtp.example.com\r\nSECRET'],
]) {
  assert.deepEqual(await verifyApplicationMail({ getEnv: name => name === key ? value : getEnv(name), createTransport: unreachable }), { status: 'invalid-settings', emailsSent: 0 });
}
for (const port of ['465', '587']) {
  let closed = 0;
  const result = await verifyApplicationMail({
    getEnv: name => name === 'APPLICATION_SMTP_PORT' ? port : getEnv(name),
    createTransport(options) {
      assert.equal(options.secure, port === '465');
      assert.equal(options.requireTLS, true);
      assert.equal(options.tls.minVersion, 'TLSv1.2');
      assert.equal(options.tls.rejectUnauthorized, true);
      assert.equal(options.logger, false);
      assert.equal(options.debug, false);
      return { async verify() { return true; }, sendMail: unreachable, close() { closed++; } };
    },
  });
  assert.deepEqual(result, { status: 'verified', emailsSent: 0, deliveryVerified: false });
  assert.equal(closed, 1);
}
for (const [code, category] of [['EAUTH', 'authentication'], ['EDNS', 'dns'], ['ETLS', 'tls'], ['ETIMEDOUT', 'connection'], ['UNEXPECTED', 'provider']]) {
  let closed = 0;
  const result = await verifyApplicationMail({ getEnv, createTransport: () => ({
    async verify() { throw Object.assign(new Error('secret-provider-detail fixture-only-secret'), { code, response: 'private' }); },
    sendMail: unreachable, close() { closed++; },
  }) });
  assert.deepEqual(result, { status: 'failed', category, emailsSent: 0 });
  assert(!JSON.stringify(result).includes('secret'));
  assert.equal(closed, 1);
}
assert.deepEqual(await verifyApplicationMail({ getEnv, createTransport: () => ({ async verify() { return false; } }) }), { status: 'unconfirmed', emailsSent: 0 });
assert.deepEqual(await verifyApplicationMail({ getEnv, createTransport: () => { throw new Error('secret'); } }), { status: 'failed', category: 'provider', emailsSent: 0 });
assert.equal((await verifyApplicationMail({ getEnv, createTransport: () => ({ async verify() { return true; }, close() { throw new Error('secret'); } }) })).status, 'verified');
console.log('PASS: missing/invalid settings, TLS ports, authentication/DNS/provider failures, cleanup and redacted output. No network connection or email sent.');
