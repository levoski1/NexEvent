import nodemailer from 'nodemailer';
import { interpolate } from '@nexevent/shared-utils';
import { config } from '@nexevent/config';
import type { EmailConfig, SorobanEvent } from '@nexevent/shared-types';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
});

export async function executeEmail(cfg: EmailConfig, event: SorobanEvent): Promise<void> {
  const subject = interpolate(cfg.subject, event as unknown as Record<string, unknown>);
  const html = interpolate(cfg.bodyTemplate, event as unknown as Record<string, unknown>);
  await transporter.sendMail({ from: config.SMTP_FROM, to: cfg.to.join(','), subject, html });
}
