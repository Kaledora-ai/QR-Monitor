import { NextResponse } from "next/server";
import { getVcard } from "@/lib/public-qr";
import { slug } from "@/lib/slug";
import { vcardText } from "@/lib/qr-types";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await getVcard(code);
  if (!c) return new NextResponse("Não encontrado", { status: 404 });
  return new NextResponse(vcardText(c), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug(c.name || "contato")}.vcf"`,
    },
  });
}
