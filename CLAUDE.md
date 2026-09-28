# QR Monitor — contexto para o Claude

Este repositório é **somente o QR Monitor**. Não tem relação com Receita e Ponto nem Parceiro Financeiro:
nunca misture código, chaves ou projetos Supabase/Vercel entre eles.

- Supabase deste projeto: `sesvuevvgphzuhzijcne`
- GitHub: `Kaledora-ai/QR-Monitor` (deploy manual: upload pelo site do GitHub → Vercel publica)
- Stack: Next.js 15 (App Router), Supabase (auth + Postgres + Storage), Tailwind v4, qr-code-styling, recharts
- Idioma da interface: português do Brasil
- Créditos são cobrados SEMPRE no banco (funções `create_qr`, `renew_qr`, `upgrade_*`), nunca só no front
- Wi-Fi, PIX e texto são sempre estáticos (não passam pelo redirecionador)
- O redirecionador `/q/[code]` usa a service role key e grava leituras via `record_scan`
- Mudanças de banco: editar `supabase/schema.sql` mantendo-o idempotente
