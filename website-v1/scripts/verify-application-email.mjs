import nodemailer from 'nodemailer';
import { verifyApplicationMail } from '../netlify/lib/application-mail-preflight.mjs';

if (process.argv.includes('--help')) {
  console.log('MT E.L.K., INC. application email connection check\n'
    + 'Run with the five APPLICATION_MAIL_FROM / APPLICATION_SMTP_* settings already injected into the environment.\n'
    + 'No passwords in command arguments. This check negotiates TLS and authenticates; it sends no email.\n'
    + 'A verified connection does not prove sender authorization, recipient acceptance or inbox delivery.\n'
    + 'Exit 0: connection verified. Exit 1: incomplete, invalid or failed connection.');
} else if (process.argv.length > 2) {
  console.error('No arguments supported except --help. Inject settings through the environment.');
  process.exitCode = 1;
} else {
  const result = await verifyApplicationMail({
    getEnv: key => process.env[key],
    createTransport: options => nodemailer.createTransport(options),
  });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === 'verified' ? 0 : 1;
}
