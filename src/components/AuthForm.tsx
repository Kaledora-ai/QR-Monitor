"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_ENABLED } from "@/lib/site";
import { Logo } from "./Logo";

type Mode = "login" | "signup" | "forgot" | "reset";

const TITLES: Record<Mode, [string, string]> = {
  login: ["Entrar", "Bom te ver de novo."],
  signup: ["Criar conta grátis", "Ganhe 10 créditos para criar seus primeiros QR Codes."],
  forgot: ["Recuperar senha", "Enviaremos um link para você criar uma nova senha."],
  reset: ["Nova senha", "Escolha uma senha com pelo menos 8 caracteres."],
};

function translate(msg: string) {
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/Email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.";
  if (/already registered/i.test(msg)) return "Este e-mail já tem conta. Tente entrar.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if (/Password should be/i.test(msg)) return "A senha precisa ter pelo menos 8 caracteres.";
  return msg;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/painel";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("erro") || "");
  const [info, setInfo] = useState("");
  const supabase = createClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else if (mode === "signup") {
        if (!accept) throw new Error("Aceite os termos de uso para continuar.");
        if (password.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=/painel` },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/painel");
          router.refresh();
        } else {
          setInfo("Pronto! Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar a conta.");
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/nova-senha`,
        });
        if (error) throw error;
        setInfo("Se existir uma conta com esse e-mail, você receberá o link em instantes.");
      } else if (mode === "reset") {
        if (password.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        router.replace("/painel");
      }
    } catch (err) {
      setError(translate(err instanceof Error ? err.message : "Algo deu errado."));
    } finally {
      setBusy(false);
    }
  }

  async function magic() {
    if (!email) return setError("Digite seu e-mail primeiro.");
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: false },
    });
    setBusy(false);
    if (error) setError(translate(error.message));
    else setInfo("Enviamos um link de acesso para o seu e-mail.");
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  const [title, sub] = TITLES[mode];
  return (
    <div className="sky min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="card p-7 sm:p-8">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="text-mute text-sm mt-1">{sub}</p>

          {GOOGLE_ENABLED && (mode === "login" || mode === "signup") && (
            <>
              <button onClick={google} className="btn btn-ghost w-full mt-6">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                Continuar com Google
              </button>
              <div className="flex items-center gap-3 my-5 text-xs text-mute">
                <div className="h-px flex-1 bg-edge" /> ou com e-mail <div className="h-px flex-1 bg-edge" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={`space-y-4 ${GOOGLE_ENABLED && (mode === "login" || mode === "signup") ? "" : "mt-6"}`}>
            {mode !== "reset" && (
              <div>
                <label className="label" htmlFor="email">E-mail</label>
                <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}
            {mode !== "forgot" && (
              <div>
                <label className="label" htmlFor="password">{mode === "reset" ? "Nova senha" : "Senha"}</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={mode === "login" ? 1 : 8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            {mode === "signup" && (
              <label className="flex items-start gap-2.5 text-sm text-mute">
                <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1 accent-[#6ff5c6]" />
                <span>
                  Li e aceito os <Link href="/termos" target="_blank" className="text-signal hover:underline">termos de uso</Link> e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-signal hover:underline">política de privacidade</Link>.
                </span>
              </label>
            )}

            {error && <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2">{error}</p>}
            {info && <p className="text-sm text-signal bg-signal/10 rounded-xl px-3 py-2">{info}</p>}

            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {busy ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : mode === "forgot" ? "Enviar link" : "Salvar nova senha"}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-5 space-y-3 text-sm text-center">
              <button onClick={magic} disabled={busy} className="text-mute hover:text-ink">
                Prefere entrar sem senha? <span className="text-signal">Receber link por e-mail</span>
              </button>
              <p>
                <Link href="/recuperar" className="text-mute hover:text-ink">Esqueci minha senha</Link>
              </p>
              <p className="text-mute">
                Ainda não tem conta? <Link href="/cadastro" className="text-signal hover:underline">Criar grátis</Link>
              </p>
            </div>
          )}
          {mode === "signup" && (
            <p className="mt-5 text-sm text-center text-mute">
              Já tem conta? <Link href="/entrar" className="text-signal hover:underline">Entrar</Link>
            </p>
          )}
          {mode === "forgot" && (
            <p className="mt-5 text-sm text-center">
              <Link href="/entrar" className="text-mute hover:text-ink">Voltar para o login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
