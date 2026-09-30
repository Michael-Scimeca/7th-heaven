import { Resend } from "resend";

const resend = new Resend(
  (typeof window === "undefined" ? process.env.RESEND_API_KEY : undefined) ||
    "re_dummy_key",
);

const UNSUBSCRIBE_BASE = "https://7thheavenband.com/api/newsletter/unsubscribe";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
  category?: string;
}

export interface EmailSendResult {
  success: boolean;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  errors?: Array<{ recipient: string; error: string }>;
  error?: unknown;
  data?: unknown;
  mock?: boolean;
}

export function isPublicWebmailDomain(email?: string): boolean {
  if (!email) return true;
  return /@(aol|gmail|yahoo|hotmail|outlook|icloud|comcast)\.(com|net)$/i.test(
    email.trim(),
  );
}

/**
 * Returns the verified sending From address.
 * In production, requires a verified domain or configured EMAIL_FROM.
 * In development, falls back to onboarding@resend.dev if not configured.
 */
export function getSendingFromEmail(email?: string): string {
  if (!email || isPublicWebmailDomain(email)) {
    if (process.env.NODE_ENV === "production" && process.env.EMAIL_FROM) {
      return process.env.EMAIL_FROM.trim();
    }
    return "onboarding@resend.dev";
  }
  return email.trim();
}

export function buildUnsubscribeUrl(email: string): string {
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
  return `${UNSUBSCRIBE_BASE}?email=${encodedEmail}`;
}

/**
 * CAN-SPAM compliant email sender with per-recipient result accounting.
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  from,
}: EmailPayload): Promise<EmailSendResult> {
  const recipients = Array.isArray(to) ? to : [to];
  const totalRecipients = recipients.length;

  if (totalRecipients === 0) {
    return { success: true, recipientCount: 0, sentCount: 0, failedCount: 0 };
  }

  const defaultReplyTo = replyTo || process.env.EMAIL_REPLY_TO || "info@7thheavenband.com";
  const fromAddress = from || getSendingFromEmail();

  // If no API key is set in local environment, log mock email
  if (!process.env.RESEND_API_KEY) {
    console.log("--- [DEVELOPMENT EMAIL MOCK] ---");
    console.log(`From: ${fromAddress}`);
    console.log(`To: ${recipients.join(", ")}`);
    console.log(`Reply-To: ${defaultReplyTo}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Preview: ${html.substring(0, 120).replace(/<[^>]*>/g, "")}...`);
    console.log("--------------------------------");
    return {
      success: true,
      recipientCount: totalRecipients,
      sentCount: totalRecipients,
      failedCount: 0,
      mock: true,
    };
  }

  const errors: Array<{ recipient: string; error: string }> = [];
  let sentCount = 0;

  const results = await Promise.all(
    recipients.map(async (recipient) => {
      try {
        const cleanEmail = recipient.trim().toLowerCase();
        const encodedEmail = encodeURIComponent(cleanEmail);
        const personalizedHtml = html.replace(/\{\{email\}\}/g, encodedEmail);
        const unsubscribeUrl = buildUnsubscribeUrl(cleanEmail);

        let data = await resend.emails.send({
          from: fromAddress,
          to: cleanEmail,
          replyTo: defaultReplyTo,
          subject,
          html: personalizedHtml,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        const resendRes: any = data;
        if (resendRes?.error) {
          const errMsg =
            typeof resendRes.error === "string"
              ? resendRes.error
              : resendRes.error.message || JSON.stringify(resendRes.error);

          // Fallback for unverified test keys in development
          if (
            process.env.NODE_ENV !== "production" &&
            (errMsg.includes("only send testing emails") ||
              errMsg.includes("validation_error") ||
              resendRes.error?.statusCode === 403)
          ) {
            console.warn(
              `[Resend Dev Fallback]: Retrying send for ${cleanEmail} to owner...`,
            );
            data = await resend.emails.send({
              from: fromAddress,
              to: "mikeyscimeca.dev@gmail.com",
              replyTo: defaultReplyTo,
              subject: `[DEV TEST - For: ${cleanEmail}] ${subject}`,
              html: personalizedHtml,
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            });
          }
        }

        const finalRes: any = data;
        if (finalRes?.error) {
          const errMessage = finalRes.error.message || JSON.stringify(finalRes.error);
          return { success: false, recipient: cleanEmail, error: errMessage };
        }
        return { success: true, recipient: cleanEmail };
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        return { success: false, recipient, error: errMessage };
      }
    }),
  );

  for (const res of results) {
    if (res.success) {
      sentCount++;
    } else if (res.error) {
      errors.push({ recipient: res.recipient, error: res.error });
    }
  }

  return {
    success: errors.length === 0,
    recipientCount: totalRecipients,
    sentCount,
    failedCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    error: errors.length > 0 ? errors[0].error : undefined,
  };
}
