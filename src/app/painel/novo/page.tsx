import { createClient } from "@/lib/supabase/server";
import { QrEditor } from "@/components/QrEditor";

export const metadata = { title: "Criar QR Code" };

export default async function NewQr() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select("credits").eq("id", user!.id).maybeSingle();
  return <QrEditor credits={data?.credits ?? 0} />;
}
