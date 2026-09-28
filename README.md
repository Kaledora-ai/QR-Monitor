# QR Monitor

Plataforma de QR Codes dinâmicos com relatório de leituras, validade e personalização.
Next.js 15 · Supabase · Vercel.

---

## Como publicar (passo a passo, sem VS Code)

### 1. Banco de dados (Supabase) — uma vez só
1. Abra o projeto no Supabase → **SQL Editor** → **New query**.
2. Copie todo o conteúdo de `supabase/schema.sql`, cole e clique em **Run**.
   Pode rodar de novo quando houver atualização: o arquivo é seguro para reexecutar.
3. **Authentication → URL Configuration**
   - *Site URL*: `https://SEU-PROJETO.vercel.app` (depois, `https://www.qrmonitor.com.br`)
   - *Redirect URLs*: adicione `https://SEU-PROJETO.vercel.app/**`
4. **Authentication → Sign In / Providers → Email**: deixe **Confirm email** ligado.

> ⚠️ O e-mail padrão do Supabase envia só poucas mensagens por hora. Serve para testar,
> mas antes de abrir ao público configure um SMTP próprio (Authentication → Emails → SMTP).

### 2. Código (GitHub) — pelo navegador
1. Descompacte o `.zip`.
2. Abra `github.com/Kaledora-ai/QR-Monitor` → **Add file → Upload files**.
3. Entre na pasta descompactada, selecione **tudo o que está dentro dela** (inclusive
   `.gitignore` e `.env.example`) e arraste para a página. Não arraste a pasta em si.
4. Clique em **Commit changes**. A Vercel publica sozinha em 1–2 minutos.

Nas próximas atualizações: repita o upload só com os arquivos alterados (o GitHub substitui os de mesmo nome).

### 3. Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Nome | Valor | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | criada pela integração Supabase | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | criada pela integração Supabase | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | criada pela integração (ou copie de Supabase → Settings → API) | **sim — sem ela o QR não redireciona** |
| `NEXT_PUBLIC_SITE_URL` | `https://SEU-PROJETO.vercel.app` | sim |
| `CRON_SECRET` | qualquer texto longo e aleatório | sim (avisos de vencimento) |
| `NEXT_PUBLIC_BUY_CREDITS_URL` | link de pagamento do Asaas | quando abrir a conta |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | `true` depois de configurar o Google no Supabase | não |
| `BREVO_API_KEY` / `EMAIL_FROM` | quando decidir o provedor de e-mail | não |

Depois de alterar variáveis: **Deployments → ⋯ → Redeploy**.

### 4. Seus créditos (cupom)
Supabase → **Table Editor → coupons → Insert row**:
- `code`: ex. `ALEXANDRE`
- `credits`: ex. `1000`
- `max_uses`: `1` (cada conta pode usar um cupom só uma vez)

Depois, no site: **Créditos → Tem um cupom?**

### 5. Antes de imprimir QR Code para cliente real
- Compre o domínio e ajuste `NEXT_PUBLIC_SITE_URL`. **O domínio fica gravado na imagem impressa:
  QRs gerados com `vercel.app` param de funcionar se esse endereço mudar.**
- Preencha razão social e CNPJ em `src/components/LegalPage.tsx` (termos e privacidade).

---

## Regras de créditos
| Item | Créditos |
|---|---|
| QR estático (Wi-Fi, PIX, texto) | 0 |
| QR dinâmico 30 dias | 3 |
| QR dinâmico permanente | 10 |
| Design completo (logo, moldura, formatos, degradê) | +2 |
| Renovar 30 dias | 3 |
| Conta nova | +10 |

Os valores ficam em `supabase/schema.sql` (função `qr_cost` e funções de renovação) e em `src/lib/site.ts` (textos do site). Mude nos dois lugares.

## Estrutura
- `supabase/schema.sql` — tabelas, segurança, cobrança de créditos, relatórios
- `src/app/q/[code]` — redirecionador que conta as leituras
- `src/app/painel` — área logada
- `src/app/r/[token]` — relatório público para o cliente final
- `src/app/api/cron/daily` — avisos de vencimento e resumo mensal (roda todo dia às 9h)
