# Radar Financeiro — Contexto do Projeto

## Links
- GitHub: montenegroallan50-web/radar-financeiro
- Vercel: radar-financeiro-seven.vercel.app
- Supabase ID: imeqyddoqrfjdkmixdat
- Pluggy App: RADAR FINANCEIRO (Due Diligence submetido — aguardando aprovação)

## Stack
- Next.js 14 App Router
- Supabase (auth + banco)
- Pluggy (Open Finance / BACEN)
- Tailwind CSS + Recharts
- Vercel (hospedagem)
- @react-pdf/renderer (geração de PDF no servidor)

## Credenciais importantes
- user.id real: 608c76f0-aa5b-41e4-90fd-cf537693de24
- Pluggy sandbox: usuário user-ok / senha password-ok
- SUPABASE_SERVICE_ROLE_KEY — configurada na Vercel e no .env.local

## Tabelas no Supabase
| Tabela | Função |
|---|---|
| profiles | Dados do usuário (nome, email, preferências, onboarding_done) |
| transactions | Transações reais dos bancos |
| connected_accounts | Contas conectadas via Pluggy |
| investments | Investimentos reais |
| alerts | Alertas inteligentes |
| alert_settings | Configurações de alertas por usuário |
| budget_goals | Metas de orçamento por categoria |

## Colunas importantes da tabela profiles
id, nome, email, cpf, telefone, created_at, phone, monthly_income,
financial_goal, pref_dark_mode, pref_notifications, pref_biometria,
avatar_emoji, currency, onboarding_done

## Arquivos importantes
- app/(app)/dashboard/page.tsx — dashboard principal
- app/(app)/alertas/page.tsx — página de alertas
- app/(app)/perfil/page.tsx — página de perfil (100% funcional)
- app/(app)/perfil/relatorio/page.tsx — relatório PDF mensal
- app/(app)/onboarding/page.tsx — 5 telas de onboarding premium
- app/api/pluggy/token/route.ts — gera token do widget
- app/api/pluggy/sync/route.ts — sincroniza tudo
- app/api/transactions/route.ts — busca transações
- app/api/accounts/route.ts — busca saldo real
- app/api/accounts/disconnect/route.ts — desconecta banco
- app/api/dashboard/route.ts — calcula entradas/saídas
- app/api/budget/route.ts — gastos reais por categoria
- app/api/budget-goals/route.ts — metas de orçamento
- app/api/investments/route.ts — busca investimentos
- app/api/alerts/route.ts — GET/POST/PATCH alertas
- app/api/alerts/generate/route.ts — gera alertas automáticos
- app/api/alert-settings/route.ts — configurações de alertas
- app/api/profile/route.ts — GET/PATCH perfil (usa maybeSingle + upsert)
- app/api/report/route.ts — dados completos para relatório
- app/api/report/pdf/route.ts — gera PDF no servidor
- app/api/ai-suggestions/route.ts — sugestões automáticas por regras
- lib/supabase.ts — createClient + createAdminClient
- lib/supabase-server.ts — getSessionUserId()
- context/AppContext.tsx — contexto global (tem refreshUser)
- components/OnboardingGuard.tsx — redireciona novos usuários

## O que está funcionando

### Dashboard
- 4 abas: Visão, Invest., Transações, Orçamento
- Visão: Saldo real, Entradas/Saídas, categorias + gráfico de pizza
- Invest.: Investimentos reais + gráfico de rosca + filtros + valores reais no card
- Transações: reais + filtros + gráfico de barras + edição de categoria
- Orçamento: Metas salvas no Supabase + gastos reais + barras animadas
- Sino animado com badge verde no header
- Nome do usuário atualiza em tempo real após editar perfil (refreshUser)

### Página /perfil (100% funcional)
- Dados pessoais salvos no Supabase
- Nome atualiza no dashboard após salvar (refreshUser no AppContext)
- Stats reais: bancos conectados, patrimônio investido, rentabilidade
- Bancos reais da tabela connected_accounts + botão desconectar
- Preferências salvas no Supabase (toggles: darkMode, notificações, biometria)
- Exportar dados em CSV melhorado com cabeçalho e resumo
- Relatório PDF mensal com sugestões automáticas (funciona no mobile!)
- Alterar senha via Supabase Auth

### Página /perfil/relatorio
- Seletor dos últimos 12 meses
- Bloqueado no mês atual até o último dia útil
- PDF gerado no servidor (@react-pdf/renderer)
- Abre em nova aba — funciona no mobile
- Seções: capa, resumo, gastos por categoria, evolução mensal, investimentos, transações, sugestões

### Onboarding (5 telas premium)
- Tela 1: Radar animado com círculos concêntricos
- Tela 2: Funcionalidades com ícones Tabler
- Tela 3: Bancos com logos SVG e cores oficiais
- Tela 4: Orçamento com barras animadas pulsando
- Tela 5: Sino animado + notificações com slide-in
- Aparece apenas uma vez (onboarding_done no Supabase)
- OnboardingGuard redireciona automaticamente novos usuários

### Alertas (3 abas)
- Alertas: Lista real do Supabase, dispensar, ver detalhes
- Config.: Toggles salvos no Supabase + threshold configurável
- Histórico: Alertas lidos
- Generate automático: gasto >R$500, orçamento estourado, próximo limite,
  vencimento investimento 60 dias, saldo baixo, rentabilidade negativa

### Infraestrutura
- Auth Trigger no Supabase: cria perfil automaticamente no cadastro
- profile/route.ts usa maybeSingle() + auto-criação se não existir
- RLS habilitado em todas as tabelas
- Cada usuário vê apenas seus dados
- Publicado na Vercel + variáveis de ambiente configuradas

## Decisões técnicas importantes
- Modo escuro: adiado para depois da monetização (será Tailwind dark:)
- Moeda: apenas BRL por enquanto (USD/EUR removido)
- Sugestões PDF: por regras automáticas (sem IA/custo)
- PDF: gerado no servidor com @react-pdf/renderer (não html2canvas)
- Relatório PDF: disponível apenas após último dia útil do mês
- AppContext tem função refreshUser() para atualizar nome após editar perfil
- API /api/profile usa maybeSingle() + upsert para evitar erros com novos usuários
- Email semanal: DESCARTADO — não faz parte do escopo do app

## Status do Pluggy (Open Finance)
- Due Diligence submetido em 11/05/2026 ✅
- Status atual: "Under Review" — aguardando aprovação do time Pluggy
- Segment escolhido: Other
- Documentos enviados: Registration Form + Social Contract (gerados com reportlab)
- Prazo esperado de aprovação: 2 a 5 dias úteis
- Ainda em modo sandbox (user-ok / password-ok)
- Quando aprovado: trocar variáveis de ambiente na Vercel para produção

## Contexto pessoal importante
- Allan é militar da ativa — não pode abrir MEI no momento
- MEI foi considerado mas descartado por restrição legal
- Monetização (Stripe) depende de solução jurídica futura (reserva/aposentadoria ou familiar)
- Pluggy foi submetido como pessoa física / desenvolvedor independente

## Próximos passos (em ordem de prioridade)
1. 🏦 Aguardar aprovação do Pluggy (Due Diligence submetido ✅)
2. 📱 Push Notification (Firebase) — PRÓXIMO A IMPLEMENTAR
3. 💰 Monetização (Stripe) — depende de solução jurídica
4. 🌙 Modo escuro — Tailwind dark: em todas as páginas

## Push Notification — O que será implementado
- Serviço: Firebase Cloud Messaging (FCM) — gratuito
- Gatilhos: alertas de gasto, saldo baixo, orçamento estourado, vencimento de investimento
- Funciona em Android e iOS
- Usuário aceita receber notificações no onboarding
- Quando o app gera alerta no Supabase, também dispara push notification
- Complexidade: média (estimativa 2 a 3 sessões)

## Como usar este arquivo
No início de cada nova conversa com o Claude, cole o conteúdo
deste arquivo e diga: "Continuando o projeto Radar Financeiro,
aqui está o contexto atualizado."

## Como atualizar este arquivo
Ao final de cada sessão, peça ao Claude para atualizar o CONTEXTO.md
com o que foi feito naquele dia. Cole o novo conteúdo aqui e faça commit.

## Histórico de sessões
- Sessão 1 (maio 2026): Setup inicial, dashboard, alertas, infraestrutura
- Sessão 2 (maio 2026): Página /perfil completa, relatório PDF, onboarding premium,
  sino animado, auth trigger, refreshUser, valores reais no dashboard
- Sessão 3 (11/05/2026): Due Diligence Pluggy submetido, documentos gerados (Registration Form
  + Social Contract em PDF), email semanal descartado do escopo, decisão de implementar
  Push Notification com Firebase na próxima sessão