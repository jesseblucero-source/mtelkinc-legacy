import { createHash } from 'node:crypto';
import schema from '../../content/dealer-application.json' with { type: 'json' };

const forms = new Set(['dealer-application', 'dealer-application-fr', 'dealer-application-es', 'dealer-application-de']);
const recipient = 'phillip@elkinc.com';
const metadataLabels = {
  application_reference: 'Application reference', application_language: 'Application language',
  submitted_at: 'Applicant-reported submission time', review_route: 'Review route',
  review_checks: 'Review checks', signature_name: 'Typed signature',
  signature_saved_at: 'Applicant device signing time (UTC)', signature_timezone: 'Signing time zone',
  signature_device: 'Browser/device reported at signing', signature_browser_language: 'Browser language',
  signature_clock_source: 'Signature clock source', signature_version: 'Signature version',
  signature_statement: 'Signature agreement', application_summary: 'Full application summary',
  ip: 'Netlify-recorded IP address', user_agent: 'Netlify-recorded user agent',
};
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const scalar = value => typeof value === 'string' ? value : '';

export function buildNotification(data, from, now = new Date()) {
  if (!data || !forms.has(data['form-name'])) return null;
  // The sender and destination never come from applicant-controlled fields.
  if (!/^jesse@mtelkinc\.com$/i.test(from || '')) throw new Error('A confirmed Jesse company sender is required.');
  const labels = new Map(schema.fields.map(field => [field.name, field.labels.en]));
  const excluded = new Set(['bot-field', 'g-recaptcha-response', 'form-name']);
  const order = [...new Set([...labels.keys(), ...Object.keys(metadataLabels), ...Object.keys(data)])];
  const rows = order.filter(key => Object.hasOwn(data, key) && !excluded.has(key))
    .map(key => [labels.get(key) || metadataLabels[key] || key, scalar(data[key]) || '(Not provided)']);
  const reference = scalar(data.application_reference);
  const safeReference = /^[A-Z0-9-]{1,80}$/.test(reference) ? reference : 'See details';
  const receivedAt = now.toISOString();
  const introduction = `Phillip,\n\nA new dealer or distributor application was received through the MT E.L.K., INC. website. All submitted details are included below.\n\nForm: ${data['form-name']}\nNotification prepared (UTC): ${receivedAt}\n\n`;
  const text = introduction + rows.map(([label, value]) => `${label}: ${value}`).join('\n\n')
    + '\n\n— Jesse\nMT E.L.K., INC.\nAutomated website notification. Receipt does not mean the application has been approved.';
  const html = `<div style="font:16px/1.6 Arial,sans-serif;color:#171b18;max-width:760px"><h1 style="font-size:24px;border-bottom:4px solid #ef431f;padding-bottom:16px">MT E.L.K., INC.</h1><p>Phillip,</p><p>A new dealer or distributor application was received through the MT E.L.K., INC. website. All submitted details are included below.</p><p><b>Form:</b> ${escape(data['form-name'])}<br><b>Notification prepared (UTC):</b> ${escape(receivedAt)}</p><dl>${rows.map(([label, value]) => `<dt style="font-weight:bold;margin-top:20px">${escape(label)}</dt><dd style="margin:4px 0;white-space:pre-wrap;overflow-wrap:anywhere">${escape(value)}</dd>`).join('')}</dl><p>— Jesse<br>MT E.L.K., INC.</p><p style="font-size:13px">Automated website notification. Receipt does not mean the application has been approved.</p></div>`;
  const hash = createHash('sha256').update(JSON.stringify(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)))).digest('hex');
  return {
    from: { name: 'Jesse | MT E.L.K., INC.', address: from.toLowerCase() },
    to: recipient, cc: 'jesse@elkinc.com', replyTo: from.toLowerCase(),
    subject: `MT E.L.K., INC. — New application received — ${safeReference}`,
    text, html, messageId: `<application-${hash}@${from.split('@')[1].toLowerCase()}>`,
    disableFileAccess: true, disableUrlAccess: true,
  };
}

// Receipt contains no EIN, signature/device data or questionnaire answers.
export function buildApplicantReceipt(data, from) {
  if (!data || !forms.has(data['form-name'])) return null;
  const address = scalar(data.email).trim();
  if (!/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,63}$/i.test(address) || address.length > 254) return null;
  if (!/^jesse@mtelkinc\.com$/i.test(from || '')) throw new Error('A confirmed company sender is required.');
  const reference = /^[A-Z0-9-]{1,80}$/.test(scalar(data.application_reference)) ? data.application_reference : '';
  const lang = data['form-name'].endsWith('-fr')?'fr':data['form-name'].endsWith('-es')?'es':data['form-name'].endsWith('-de')?'de':'en';
  const copy = {
    en: ['Application received', 'We received your dealer or distributor application. Our team will review it and contact you about the next steps. This receipt is not an approval.'],
    fr: ['Candidature reçue', 'Nous avons reçu votre candidature de détaillant ou de distributeur. Notre équipe l’examinera et vous contactera pour la suite. Cet accusé de réception ne constitue pas une approbation.'],
    es: ['Solicitud recibida', 'Hemos recibido su solicitud de distribuidor o minorista. Nuestro equipo la revisará y le comunicará los siguientes pasos. Este acuse de recibo no es una aprobación.'],
    de: ['Bewerbung eingegangen', 'Wir haben Ihre Händler- oder Vertriebspartnerbewerbung erhalten. Unser Team prüft sie und informiert Sie über die nächsten Schritte. Diese Eingangsbestätigung ist keine Genehmigung.']
  }[lang];
  const text = 'MT E.L.K., INC.\n\n'+copy[1]+(reference?'\n\nReference: '+reference:'')+'\n\nhttps://www.mtelkinc.com/support/';
  const key = createHash('sha256').update(data['form-name']+address+reference).digest('hex');
  return {from:{name:'MT E.L.K., INC.',address:from.toLowerCase()},to:address,replyTo:from.toLowerCase(),subject:'MT E.L.K., INC. - '+copy[0],text,messageId:'<receipt-'+key+'@mtelkinc.com>',disableFileAccess:true,disableUrlAccess:true};
}

export function smtpSettings(getEnv) {
  const keys = ['APPLICATION_MAIL_FROM', 'APPLICATION_SMTP_HOST', 'APPLICATION_SMTP_PORT', 'APPLICATION_SMTP_USER', 'APPLICATION_SMTP_PASSWORD'];
  if (keys.some(key => !getEnv(key))) throw new Error('Application email sender connection is incomplete.');
  const from = getEnv('APPLICATION_MAIL_FROM');
  if (!/^jesse@mtelkinc\.com$/i.test(from)) throw new Error('Application email sender is invalid.');
  const host = getEnv('APPLICATION_SMTP_HOST');
  if (!/^[a-z0-9.-]+$/i.test(host)) throw new Error('Application SMTP host is invalid.');
  const port = Number(getEnv('APPLICATION_SMTP_PORT'));
  if (![465, 587].includes(port)) throw new Error('Application SMTP requires TLS on port 465 or 587.');
  return {
    from,
    transport: {
      host, port, secure: port === 465, requireTLS: true,
      auth: { user: getEnv('APPLICATION_SMTP_USER'), pass: getEnv('APPLICATION_SMTP_PASSWORD') },
      tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 30000,
      disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false,
    },
  };
}

export async function notifyApplication(event, { getEnv, createTransport, now = () => new Date() }) {
  if (!forms.has(event?.data?.['form-name'])) return { status: 'ignored' };
  if (getEnv('APPLICATION_MAIL_ENABLED') !== 'true') return { status: 'disabled' };
  const settings = smtpSettings(getEnv);
  const message = buildNotification(event.data, settings.from, now());
  const transport = createTransport(settings.transport);
  try {
    const result = await transport.sendMail(message);
    if (![recipient, 'jesse@elkinc.com'].every(expected => result.accepted?.some(address => String(address).toLowerCase() === expected))) {
      throw new Error('Recipient not accepted');
    }
    const receipt = buildApplicantReceipt(event.data, settings.from);
    if (receipt) {
      const confirmation = await transport.sendMail(receipt);
      if (!confirmation.accepted?.some(address => String(address).toLowerCase() === receipt.to.toLowerCase())) throw new Error('Receipt not accepted');
    }
    return { status: 'accepted', receipt: receipt ? 'accepted' : 'invalid-email' };
  } catch {
    // Avoid logging applicant answers, tax IDs, SMTP credentials or raw provider errors.
    throw new Error('Application notification was not confirmed by the outgoing mail service.');
  } finally {
    transport.close?.();
  }
}
