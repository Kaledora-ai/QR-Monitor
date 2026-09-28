"use client";
import { createClient } from "./supabase/client";

export async function uploadFile(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Arquivo maior que 10 MB");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Faça login novamente");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error("Falha no envio do arquivo: " + error.message);
  return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
}
