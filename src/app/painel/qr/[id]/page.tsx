import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QrDetail } from "@/components/QrDetail";
import type { QrRow } from "@/lib/format";

export const metadata = { title: "QR Code" };

export default async function QrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: qr } = await supabase.from("qr_codes").select("*").eq("id", id).maybeSingle();
  if (!qr) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user!.id).maybeSingle();
  return <QrDetail qr={qr as QrRow} credits={profile?.credits ?? 0} />;
}
