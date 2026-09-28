// Tipos de QR Code, campos do formulário e montagem do conteúdo

export type QrType = "url" | "whatsapp" | "instagram" | "vcard" | "pdf" | "menu" | "wifi" | "pix" | "text";

export type Field = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  kind?: "text" | "textarea" | "select" | "file" | "checkbox" | "number";
  options?: { value: string; label: string }[];
  accept?: string;
  help?: string;
};

export type TypeDef = {
  id: QrType;
  label: string;
  short: string;
  dynamic: boolean;
  fields: Field[];
};

export const TYPES: TypeDef[] = [
  {
    id: "url", label: "Site / Link", short: "Qualquer página da internet", dynamic: true,
    fields: [{ key: "url", label: "Endereço da página", placeholder: "www.suaempresa.com.br", required: true }],
  },
  {
    id: "whatsapp", label: "WhatsApp", short: "Abre conversa com mensagem pronta", dynamic: true,
    fields: [
      { key: "phone", label: "Número com DDD", placeholder: "(11) 98765-4321", required: true },
      { key: "message", label: "Mensagem inicial", placeholder: "Olá! Vi seu QR Code e quero saber mais.", kind: "textarea" },
    ],
  },
  {
    id: "instagram", label: "Instagram", short: "Leva direto ao perfil", dynamic: true,
    fields: [{ key: "username", label: "Usuário", placeholder: "@suaempresa", required: true }],
  },
  {
    id: "vcard", label: "Cartão de visita", short: "Salva o contato no celular", dynamic: true,
    fields: [
      { key: "name", label: "Nome", required: true },
      { key: "company", label: "Empresa" },
      { key: "title", label: "Cargo" },
      { key: "phone", label: "Telefone", placeholder: "(11) 98765-4321" },
      { key: "email", label: "E-mail" },
      { key: "website", label: "Site" },
      { key: "address", label: "Endereço" },
    ],
  },
  {
    id: "pdf", label: "PDF", short: "Catálogo, folheto, apresentação", dynamic: true,
    fields: [{ key: "fileUrl", label: "Arquivo PDF (até 10 MB)", kind: "file", accept: "application/pdf", required: true }],
  },
  {
    id: "menu", label: "Cardápio", short: "PDF ou imagem do cardápio", dynamic: true,
    fields: [{ key: "fileUrl", label: "Cardápio em PDF ou imagem (até 10 MB)", kind: "file", accept: "application/pdf,image/*", required: true }],
  },
  {
    id: "wifi", label: "Wi-Fi", short: "Conecta à rede sem digitar senha", dynamic: false,
    fields: [
      { key: "ssid", label: "Nome da rede", required: true },
      { key: "password", label: "Senha" },
      {
        key: "security", label: "Segurança", kind: "select",
        options: [
          { value: "WPA", label: "WPA/WPA2 (mais comum)" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "Sem senha" },
        ],
      },
      { key: "hidden", label: "Rede oculta", kind: "checkbox" },
    ],
  },
  {
    id: "pix", label: "PIX", short: "Pagamento lido pelo app do banco", dynamic: false,
    fields: [
      { key: "key", label: "Chave PIX", placeholder: "CPF, CNPJ, e-mail, telefone ou aleatória", required: true },
      { key: "name", label: "Nome do recebedor", required: true },
      { key: "city", label: "Cidade", required: true },
      { key: "amount", label: "Valor (opcional)", placeholder: "25,00" },
      { key: "description", label: "Descrição (opcional)" },
    ],
  },
  {
    id: "text", label: "Texto", short: "Mensagem simples", dynamic: false,
    fields: [{ key: "text", label: "Texto", kind: "textarea", required: true }],
  },
];

export const typeDef = (t: string) => TYPES.find((x) => x.id === t) ?? TYPES[0];

export type Content = Record<string, string | boolean | undefined>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function normalizeUrl(u: string) {
  const s = u.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

export function normalizePhone(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d;
}

/** Destino final para QRs dinâmicos (o vCard usa a página /contato). */
export function buildDestination(type: QrType, c: Content): string | null {
  switch (type) {
    case "url":
      return normalizeUrl(str(c.url));
    case "whatsapp": {
      const msg = str(c.message);
      return `https://wa.me/${normalizePhone(str(c.phone))}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
    }
    case "instagram":
      return `https://instagram.com/${str(c.username).replace(/^@/, "").replace(/.*instagram\.com\//, "")}`;
    case "pdf":
    case "menu":
      return str(c.fileUrl) || null;
    default:
      return null;
  }
}

/** Conteúdo gravado direto no QR para os tipos estáticos. */
export function buildStaticPayload(type: QrType, c: Content): string {
  switch (type) {
    case "wifi":
      return wifiPayload(c);
    case "pix":
      return pixPayload(c);
    case "text":
      return str(c.text);
    case "url":
      return normalizeUrl(str(c.url));
    default:
      return buildDestination(type, c) ?? "";
  }
}

export function validate(type: QrType, c: Content): string | null {
  const def = typeDef(type);
  for (const f of def.fields) {
    if (f.required && !str(c[f.key])) return `Preencha: ${f.label}`;
  }
  if (type === "whatsapp" && normalizePhone(str(c.phone)).length < 12) return "Número de WhatsApp inválido";
  if (type === "pix") {
    if (str(c.amount) && isNaN(parseAmount(str(c.amount)))) return "Valor do PIX inválido";
  }
  return null;
}

// ---------- Wi-Fi ----------
function wifiEscape(s: string) {
  return s.replace(/([\\;,:"])/g, "\\$1");
}
function wifiPayload(c: Content) {
  const sec = str(c.security) || "WPA";
  const pass = sec === "nopass" ? "" : `P:${wifiEscape(str(c.password))};`;
  return `WIFI:T:${sec};S:${wifiEscape(str(c.ssid))};${pass}H:${c.hidden ? "true" : "false"};;`;
}

// ---------- PIX (padrão BR Code do Banco Central) ----------
function parseAmount(v: string) {
  return Number(v.replace(/\./g, "").replace(",", "."));
}
function plain(s: string, max: number) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}
function emv(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function pixKey(k: string) {
  const s = k.trim();
  if (s.includes("@")) return s.toLowerCase();
  const d = s.replace(/\D/g, "");
  // telefone (11 dígitos com 9) → +55; CPF (11) e CNPJ (14) só dígitos; aleatória fica como está
  if (/^[0-9a-f-]{32,36}$/i.test(s)) return s.toLowerCase();
  if (s.startsWith("+")) return "+" + d;
  if (/^\(?\d{2}\)?\s?9/.test(s) && d.length === 11) return "+55" + d;
  return d || s;
}
export function pixPayload(c: Content) {
  const desc = plain(str(c.description), 40);
  const account = emv("00", "br.gov.bcb.pix") + emv("01", pixKey(str(c.key))) + (desc ? emv("02", desc) : "");
  const amount = str(c.amount) ? parseAmount(str(c.amount)).toFixed(2) : "";
  let p =
    emv("00", "01") +
    emv("26", account) +
    emv("52", "0000") +
    emv("53", "986") +
    (amount ? emv("54", amount) : "") +
    emv("58", "BR") +
    emv("59", plain(str(c.name), 25) || "RECEBEDOR") +
    emv("60", plain(str(c.city), 15) || "BRASIL") +
    emv("62", emv("05", "***")) +
    "6304";
  p += crc16(p);
  return p;
}

// ---------- vCard ----------
export function vcardText(c: Content) {
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(str(c.name))}`, `N:${esc(str(c.name))};;;;`];
  if (str(c.company)) lines.push(`ORG:${esc(str(c.company))}`);
  if (str(c.title)) lines.push(`TITLE:${esc(str(c.title))}`);
  if (str(c.phone)) lines.push(`TEL;TYPE=CELL:+${normalizePhone(str(c.phone))}`);
  if (str(c.email)) lines.push(`EMAIL:${esc(str(c.email))}`);
  if (str(c.website)) lines.push(`URL:${normalizeUrl(str(c.website))}`);
  if (str(c.address)) lines.push(`ADR:;;${esc(str(c.address))};;;;`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
