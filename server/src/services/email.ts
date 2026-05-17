import { env } from "../config/env.ts";

type Mail = { to: string; subject: string; html: string; text: string };

/**
 * Sends through Resend's HTTP API when RESEND_API_KEY is set.
 * Without a key the message is logged, so local runs never fail on email.
 */
export async function sendEmail(mail: Mail): Promise<{ sent: boolean }> {
    if (!env.resendKey) {
        console.log(`[email] (not configured) to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
        return { sent: false };
    }
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
    });
    if (!res.ok) {
        console.error("[email] send failed:", res.status, await res.text().catch(() => ""));
        return { sent: false };
    }
    return { sent: true };
}

const wrap = (title: string, body: string, cta?: { label: string; url: string }) => `
<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f0f23">
  <div style="font-weight:700;font-size:18px;margin-bottom:24px">RankPilot</div>
  <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
  <div style="font-size:15px;line-height:1.6;color:#3b3b55">${body}</div>
  ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:24px;background:#6c5cf6;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:999px">${cta.label}</a>` : ""}
  <p style="margin-top:32px;font-size:12px;color:#8a8aa3">You get this because alerts are on in your RankPilot settings.</p>
</div>`;

export function rankDropEmail(opts: { to: string; keyword: string; domain: string; from: number; to_: number | null; trackingId: string }) {
    const where = opts.to_ ? `#${opts.to_}` : "out of the top 50";
    const title = opts.to_ ? `“${opts.keyword}” dropped to ${where}` : `“${opts.keyword}” is ${where}`;
    const text = `${opts.domain} was #${opts.from} for "${opts.keyword}" and is now ${where}.`;
    return sendEmail({
        to: opts.to,
        subject: title,
        text: `${text}\n\n${env.appUrl}/rank/${opts.trackingId}`,
        html: wrap(title, `<p><strong>${opts.domain}</strong> was <strong>#${opts.from}</strong> for <em>${opts.keyword}</em> and is now <strong>${where}</strong>.</p>`, { label: "See the history", url: `${env.appUrl}/rank/${opts.trackingId}` }),
    });
}

export function analysisDoneEmail(opts: { to: string; host: string; score: number; issues: number; analysisId: string }) {
    const title = `${opts.host} scored ${opts.score}/100`;
    return sendEmail({
        to: opts.to,
        subject: title,
        text: `Your report for ${opts.host} is ready: ${opts.score}/100 with ${opts.issues} issues.\n\n${env.appUrl}/report/${opts.analysisId}`,
        html: wrap(title, `<p>Your report for <strong>${opts.host}</strong> is ready: <strong>${opts.score}/100</strong> with ${opts.issues} issues to look at.</p>`, { label: "Open the report", url: `${env.appUrl}/report/${opts.analysisId}` }),
    });
}
