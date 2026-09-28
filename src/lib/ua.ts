// Leitura simples do navegador/aparelho de quem escaneou (sem bibliotecas externas)
export function parseUA(ua: string) {
  const s = ua || "";
  let os = "Outro";
  if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Linux/i.test(s)) os = "Linux";

  let device = "Computador";
  if (/iPad|Tablet/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))) device = "Tablet";
  else if (/Mobi|iPhone|iPod|Android/i.test(s)) device = "Celular";

  let browser = "Outro";
  if (/Instagram/i.test(s)) browser = "Instagram";
  else if (/FBAN|FBAV/i.test(s)) browser = "Facebook";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung Internet";
  else if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\//i.test(s)) browser = "Opera";
  else if (/Firefox|FxiOS/i.test(s)) browser = "Firefox";
  else if (/CriOS|Chrome/i.test(s)) browser = "Chrome";
  else if (/Safari/i.test(s)) browser = "Safari";
  return { os, device, browser };
}

export function isBot(ua: string) {
  return /bot|crawler|spider|preview|facebookexternalhit|WhatsApp\/|Slackbot|TelegramBot|Discordbot|curl|wget/i.test(ua || "");
}
