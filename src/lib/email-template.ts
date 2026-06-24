/**
 * Shared HTML chrome for transactional emails (signup, plan upgrade, etc).
 * Previously the same dark-navy header/footer/button markup was hand-copied
 * independently into api/register/route.ts and api/stripe/webhook/route.ts
 * (3 separate templates) - any branding tweak had to be repeated 3x by hand.
 * See docs/config-centralization-audit-2026-06-22.md in the ch-proj root.
 */

export type EmailButton = { href: string; label: string; primary?: boolean };

function buttonHtml({ href, label, primary }: EmailButton): string {
  const style = primary
    ? "display:inline-block;background:#4F7BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500"
    : "display:inline-block;border:1px solid rgba(255,255,255,0.1);color:#E8F0FE;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px";
  return `<a href="${href}" style="${style}">${label}</a>`;
}

export function emailButtonRow(buttons: EmailButton[]): string {
  const cells = buttons
    .map(
      (b, i) =>
        `<td style="padding:0 ${i < buttons.length - 1 ? "12px" : "0"} 0 0">${buttonHtml(b)}</td>`
    )
    .join("");
  return `<table cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

/** Three-column stat strip, e.g. "4,000 calls/month | 400 calls/day | depth=2". */
export function emailStatsRow(stats: { value: string; label: string }[]): string {
  const cells = stats
    .map(
      (s, i) => `
                <td style="padding:14px 20px;${i < stats.length - 1 ? "border-right:1px solid rgba(255,255,255,0.06);" : ""}text-align:center">
                  <div style="font-size:20px;font-weight:600;color:#fff">${s.value}</div>
                  <div style="font-size:11px;color:#7A8FAD;margin-top:2px">${s.label}</div>
                </td>`
    )
    .join("");
  return `<table style="width:100%;margin:0 0 28px;border:1px solid rgba(255,255,255,0.06);border-radius:8px" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

export function wrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#060D1B;font-family:system-ui,sans-serif;color:#E8F0FE">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060D1B;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;max-width:100%">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
            <span style="font-size:18px;font-weight:600;color:#fff">Registrum</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;font-size:12px;color:#3D5275;line-height:1.6">
              Questions? Reply to this email or contact <a href="mailto:support@registrum.co.uk" style="color:#4F7BFF">support@registrum.co.uk</a><br>
              Eugene Merwe-Chartier trading as Registrum &middot; Data sourced under the Open Government Licence v3.0
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
