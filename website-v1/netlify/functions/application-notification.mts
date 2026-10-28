import type { FormSubmittedEvent } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { notifyApplication } from '../lib/application-notification.mjs';

// Platform-verified event only: no public fetch handler or applicant-chosen recipients.
export default {
  async formSubmitted(event: FormSubmittedEvent) {
    const result = await notifyApplication(event, {
      getEnv: (key: string) => Netlify.env.get(key),
      createTransport: nodemailer.createTransport,
    });
    console.log(`Application notification: ${result.status}`);
  },
};
