// Envio de e-mails transacionais. Provedor ainda a definir:
// enquanto BREVO_API_KEY não estiver configurada, os e-mails só são registrados no log da Vercel.
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || "QR Monitor <contato@qrmonitor.com.br>";
  if (!key) {
    console.log(`[email pendente] para=${to} assunto="${subject}"`);
    return false;
  }
  const m = from.match(/^(.*)<(.+)>$/);
  const sender = m ? { name: m[1].trim(), email: m[2].trim() } : { email: from };
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html }),
  });
  if (!res.ok) console.error("Falha no envio de e-mail", await res.text());
  return res.ok;
}

export function emailLayout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#05070f;font-family:Arial,sans-serif;color:#e9edf8">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:18px;font-weight:800;margin:0 0 24px">QR <span style="color:#8d97b5;font-weight:500">Monitor</span></p>
<div style="background:#0f1629;border:1px solid #1c2540;border-radius:16px;padding:28px">
<h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
<div style="color:#b9c1d9;font-size:15px;line-height:1.6">${body}</div>
${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:22px;background:#6ff5c6;color:#04120c;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">${cta.label}</a>` : ""}
</div>
<p style="color:#8d97b5;font-size:12px;margin-top:20px">Você recebe este e-mail porque tem uma conta no QR Monitor. Ajuste as notificações em Conta.</p>
</div></body></html>`;
}
