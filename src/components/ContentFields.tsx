"use client";
import { useState } from "react";
import { typeDef, type Content, type QrType } from "@/lib/qr-types";
import { uploadFile } from "@/lib/upload";
import { UploadSimple, CheckCircle } from "@phosphor-icons/react";

export function ContentFields({
  type,
  value,
  onChange,
}: {
  type: QrType;
  value: Content;
  onChange: (c: Content) => void;
}) {
  const def = typeDef(type);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string | boolean) => onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {def.fields.map((f) => {
        const wide = f.kind === "textarea" || f.kind === "file" || def.fields.length === 1 || f.key === "key" || f.key === "address";
        const v = value[f.key];
        return (
          <div key={f.key} className={wide ? "sm:col-span-2" : ""}>
            {f.kind === "checkbox" ? (
              <label className="flex items-center gap-2.5 text-sm text-mute mt-6">
                <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} className="accent-[#6ff5c6]" />
                {f.label}
              </label>
            ) : (
              <>
                <label className="label">
                  {f.label}
                  {f.required && <span className="text-signal"> *</span>}
                </label>
                {f.kind === "textarea" ? (
                  <textarea className="input min-h-24" placeholder={f.placeholder} value={(v as string) || ""} onChange={(e) => set(f.key, e.target.value)} />
                ) : f.kind === "select" ? (
                  <select className="input" value={(v as string) || f.options?.[0].value} onChange={(e) => set(f.key, e.target.value)}>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : f.kind === "file" ? (
                  <div>
                    <label className="flex items-center gap-3 input cursor-pointer hover:border-signal/50">
                      {v ? <CheckCircle size={20} className="text-signal" weight="fill" /> : <UploadSimple size={20} className="text-mute" />}
                      <span className="text-sm truncate">
                        {uploading ? "Enviando..." : v ? (value.fileName as string) || "Arquivo enviado. Clique para trocar" : "Escolher arquivo"}
                      </span>
                      <input
                        type="file"
                        accept={f.accept}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setErr("");
                          setUploading(true);
                          try {
                            const url = await uploadFile(file);
                            onChange({ ...value, [f.key]: url, fileName: file.name });
                          } catch (x) {
                            setErr(x instanceof Error ? x.message : "Falha no envio");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </label>
                    {err && <p className="text-danger text-xs mt-1">{err}</p>}
                  </div>
                ) : (
                  <input className="input" placeholder={f.placeholder} value={(v as string) || ""} onChange={(e) => set(f.key, e.target.value)} />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
