import { SITE_URL } from "./site";
import { buildStaticPayload, type Content, type QrType } from "./qr-types";

/** O que vai gravado dentro da imagem do QR Code. */
export function qrData(q: { is_dynamic: boolean; code: string; type: string; content: Content }) {
  return q.is_dynamic ? `${SITE_URL}/q/${q.code}` : buildStaticPayload(q.type as QrType, q.content);
}
