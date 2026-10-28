import { smtpSettings } from './application-notification.mjs';

const required = [
  'APPLICATION_MAIL_FROM', 'APPLICATION_SMTP_HOST', 'APPLICATION_SMTP_PORT',
  'APPLICATION_SMTP_USER', 'APPLICATION_SMTP_PASSWORD',
];

// SMTP verify authenticates and negotiates TLS. It never submits a message.
// Only fixed status codes and variable names may leave this check.
export async function verifyApplicationMail({ getEnv, createTransport }) {
  const missing = required.filter(key => !getEnv(key));
  if (missing.length) return { status: 'incomplete', missing, emailsSent: 0 };
  let settings;
  try {
    settings = smtpSettings(getEnv);
  } catch {
    return { status: 'invalid-settings', emailsSent: 0 };
  }
  let transport;
  try {
    transport = createTransport(settings.transport);
    if (await transport.verify() !== true) return { status: 'unconfirmed', emailsSent: 0 };
    return { status: 'verified', emailsSent: 0, deliveryVerified: false };
  } catch (error) {
    const code = {
      EAUTH: 'authentication', EDNS: 'dns', ENOTFOUND: 'dns', EAI_AGAIN: 'dns',
      ETLS: 'tls', CERT_HAS_EXPIRED: 'tls', DEPTH_ZERO_SELF_SIGNED_CERT: 'tls',
      ERR_TLS_CERT_ALTNAME_INVALID: 'tls', UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'tls',
      ETIMEDOUT: 'connection', ESOCKET: 'connection', ECONNECTION: 'connection',
      ECONNREFUSED: 'connection', ECONNRESET: 'connection',
    }[error?.code] || 'provider';
    return { status: 'failed', category: code, emailsSent: 0 };
  } finally {
    try { transport?.close?.(); } catch { /* Do not expose provider/credential details. */ }
  }
}
