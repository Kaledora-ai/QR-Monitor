"use client";
import { slug } from "./slug";
// Desenho do QR Code (pré-visualização e downloads PNG / SVG / PDF)

export type Design = {
  fg: string;
  bg: string;
  dots: "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
  corners: "square" | "extra-rounded" | "dot";
  cornerDots: "square" | "dot";
  gradient: boolean;
  fg2: string;
  logo: string;
  frame: "none" | "bottom" | "top" | "badge";
  frameText: string;
  frameColor: string;
};

export const DEFAULT_DESIGN: Design = {
  fg: "#0a0f1f",
  bg: "#ffffff",
  dots: "square",
  corners: "square",
  cornerDots: "square",
  gradient: false,
  fg2: "#6d5dfc",
  logo: "",
  frame: "none",
  frameText: "ESCANEIE AQUI",
  frameColor: "#0a0f1f",
};

/** Mantém só o que é permitido no design básico (sem créditos extras). */
export function basicOnly(d: Design): Design {
  return {
    ...d,
    dots: "square",
    corners: "square",
    cornerDots: "square",
    gradient: false,
    logo: "",
    frame: "none",
  };
}

export function isPremium(d: Design) {
  return (
    d.dots !== "square" || d.corners !== "square" || d.cornerDots !== "square" || d.gradient || !!d.logo || d.frame !== "none"
  );
}

export function mergeDesign(d?: Partial<Design> | null): Design {
  return { ...DEFAULT_DESIGN, ...(d || {}) };
}

async function qrSvg(data: string, d: Design, size: number): Promise<string> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const color = d.gradient
    ? {
        gradient: {
          type: "linear" as const,
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: d.fg },
            { offset: 1, color: d.fg2 },
          ],
        },
      }
    : { color: d.fg };
  const qr = new QRCodeStyling({
    type: "svg",
    width: size,
    height: size,
    margin: Math.round(size * 0.05),
    data: data || " ",
    qrOptions: { errorCorrectionLevel: d.logo ? "H" : "M" },
    dotsOptions: { type: d.dots, ...color },
    cornersSquareOptions: { type: d.corners, ...color },
    cornersDotOptions: { type: d.cornerDots, ...color },
    backgroundOptions: { color: d.bg },
    image: d.logo || undefined,
    imageOptions: { crossOrigin: "anonymous", margin: Math.round(size * 0.012), imageSize: 0.32, hideBackgroundDots: true },
  });
  const raw = await qr.getRawData("svg");
  if (!raw) throw new Error("Falha ao gerar o QR Code");
  const text = raw instanceof Blob ? await raw.text() : (raw as Buffer).toString();
  return text.replace(/<\?xml[^>]*\?>/, "").trim();
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** SVG final, já com moldura quando houver. */
export async function buildSvg(data: string, d: Design, size = 600): Promise<{ svg: string; w: number; h: number }> {
  const inner = await qrSvg(data, d, size);
  if (d.frame === "none") return { svg: inner, w: size, h: size };

  const pad = Math.round(size * 0.06);
  const band = Math.round(size * 0.2);
  const w = size + pad * 2;
  const h = size + pad * 2 + band;
  const qrY = d.frame === "top" ? pad + band : pad;
  const textY = d.frame === "top" ? pad + band * 0.55 : pad + size + band * 0.62;
  const fontSize = Math.round(size * 0.085);
  const placed = inner.replace(/<svg\b/, `<svg x="${pad}" y="${qrY}"`);
  const radius = Math.round(size * 0.07);
  const label = esc((d.frameText || "ESCANEIE AQUI").slice(0, 24));

  let deco = "";
  if (d.frame === "badge") {
    // selo arredondado com a chamada, estilo etiqueta
    const bw = w - pad * 2;
    deco = `<rect x="${pad}" y="${pad + size + band * 0.18}" width="${bw}" height="${band * 0.72}" rx="${band * 0.36}" fill="${d.bg}"/>`;
  }
  const textColor = d.frame === "badge" ? d.frameColor : d.bg;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" rx="${radius}" fill="${d.frameColor}"/>
<rect x="${pad * 0.5}" y="${qrY - pad * 0.5}" width="${size + pad}" height="${size + pad}" rx="${radius * 0.7}" fill="${d.bg}"/>
${placed}
${deco}
<text x="${w / 2}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fontSize}" letter-spacing="${fontSize * 0.06}" fill="${textColor}">${label}</text>
</svg>`;
  return { svg, w, h };
}

export async function svgToPngBlob(svg: string, w: number, h: number, scale = 3): Promise<Blob> {
  const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Não foi possível converter a imagem"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

function save(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function download(format: "png" | "svg" | "pdf", data: string, d: Design, name: string) {
  const { svg, w, h } = await buildSvg(data, d, 600);
  const base = `qr-${slug(name)}`;
  if (format === "svg") return save(new Blob([svg], { type: "image/svg+xml" }), `${base}.svg`);
  const png = await svgToPngBlob(svg, w, h, format === "pdf" ? 4 : 3.4);
  if (format === "png") return save(png, `${base}.png`);

  const { jsPDF } = await import("jspdf");
  const mmW = 100;
  const mmH = (h / w) * mmW;
  const margin = 10;
  const doc = new jsPDF({ unit: "mm", format: [mmW + margin * 2, mmH + margin * 2] });
  const dataUrl: string = await new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(png);
  });
  doc.addImage(dataUrl, "PNG", margin, margin, mmW, mmH);
  doc.save(`${base}.pdf`);
}
