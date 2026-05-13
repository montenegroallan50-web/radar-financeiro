# Radar Financeiro — Contexto do Projeto

## Links
- GitHub: montenegroallan50-web/radar-financeiro
- Vercel: radar-financeiro-seven.vercel.app
- Supabase ID: imeqyddoqrfjdkmixdat
- Pluggy App: RADAR FINANCEIRO (Aprovado ✅)

## Stack
- Next.js 14 App Router
- Supabase (auth + banco)
- Pluggy (Open Finance / BACEN)
- Tailwind CSS + Recharts
- Vercel (hospedagem)
- @react-pdf/renderer (geração de PDF no servidor)
- Firebase Cloud Messaging (push notifications)

## Credenciais importantes
- user.id real: 608c76f0-aa5b-41e4-90fd-cf537693de24
- Pluggy sandbox: usuário user-ok / senha password-ok
- SUPABASE_SERVICE_ROLE_KEY — configurada na Vercel e no .env.local
- Firebase Project ID: radar-financeiro-47279
- Firebase Sender ID: 36720509868
- Firebase App ID: 1:36720509868:web:0e0a03bbe885f624187009

## Tabelas no Supabase
| Tabela | Função |
|---|---|
| profiles | Dados do usuário (nome, email, preferências, onboarding_done, fcm_token) |
| transactions | Transações reais dos bancos |
| connected_accounts | Contas conectadas via Pluggy |
| investments | Investimentos reais |
| alerts | Alertas inteligentes |
| alert_settings | Configurações de alertas por usuário |
| budget_goals | Metas de orçamento por categoria |

## Colunas importantes da tabela profiles
id, nome, email, cpf, telefone, created_at, phone, monthly_income,
financial_goal, pref_dark_mode, pref_notifications, pref_biometria,
avatar_emoji, currency, onboarding_done, fcm_token

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
- app/api/alerts/generate/route.ts — gera alertas + dispara push notification
- app/api/alert-settings/route.ts — configurações de alertas
- app/api/profile/route.ts — GET/PATCH perfil (usa maybeSingle + upsert)
- app/api/profile/save-token/route.ts — salva fcm_token no Supabase
- app/api/notifications/route.ts — envia push notification via Firebase
- app/api/report/route.ts — dados completos para relatório
- app/api/report/pdf/route.ts — gera PDF no servidor
- app/api/ai-suggestions/route.ts — sugestões automáticas por regras
- lib/supabase.ts — createClient + createAdminClient
- lib/supabase-server.ts — getSessionUserId()
- lib/firebase.ts — inicialização Firebase + requestNotificationPermission()
- hooks/useNotifications.ts — hook para pedir permissão e salvar token
- context/AppContext.tsx — contexto global (tem refreshUser)
- components/OnboardingGuard.tsx — redireciona novos usuários
- components/ServiceWorkerRegister.tsx — registra SW automaticamente no layout
- public/firebase-messaging-sw.js — Service Worker para notificações em background

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
- Tela 5: Sino animado + botão "Ativar notificações" + botão "Agora não"
- Aparece apenas uma vez (onboarding_done no Supabase)
- OnboardingGuard redireciona automaticamente novos usuários

### Alertas (3 abas)
- Alertas: Lista real do Supabase, dispensar, ver detalhes
- Config.: Toggles salvos no Supabase + threshold configurável
- Histórico: Alertas lidos
- Generate automático: gasto >R$500, orçamento estourado, próximo limite,
  vencimento investimento 60 dias, saldo baixo, rentabilidade negativa

### Push Notification (100% funcional ✅)
- Serviço: Firebase Cloud Messaging (FCM) — gratuito
- Service Worker registrado automaticamente via ServiceWorkerRegister.tsx
- Token FCM salvo na coluna fcm_token da tabela profiles
- Notificação disparada automaticamente ao gerar alertas
- Testado e funcionando no Chrome desktop (Windows)
- Onboarding tela 5 pede permissão ao usuário
- Funciona em background (app minimizado)

### Infraestrutura
- Auth Trigger no Supabase: cria perfil automaticamente no cadastro
- profile/route.ts usa maybeSingle() + auto-criação se não existir
- RLS habilitado em todas as tabelas
- Cada usuário vê apenas seus dados
- Publicado na Vercel + variáveis de ambiente configuradas

## Variáveis de ambiente necessárias (.env.local e Vercel)
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_VAPID_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- NEXT_PUBLIC_APP_URL=https://radar-financeiro-seven.vercel.app

## Decisões técnicas importantes
- Modo escuro: adiado para depois da monetização (será Tailwind dark:)
- Moeda: apenas BRL por enquanto (USD/EUR removido)
- Sugestões PDF: por regras automáticas (sem IA/custo)
- PDF: gerado no servidor com @react-pdf/renderer (não html2canvas)
- Relatório PDF: disponível apenas após último dia útil do mês
- AppContext tem função refreshUser() para atualizar nome após editar perfil
- API /api/profile usa maybeSingle() + upsert para evitar erros com novos usuários
- Email semanal: DESCARTADO — não faz parte do escopo do app
- App nativo (React Native): planejado para depois da validação e monetização
- PWA: não implementado ainda — decidido focar no app nativo no futuro

## Status do Pluggy (Open Finance)
- Due Diligence aprovado ✅
- Ainda em modo sandbox (user-ok / password-ok)
- Quando migrar para produção: trocar variáveis de ambiente na Vercel

## Contexto pessoal importante
- Allan é militar da ativa — não pode abrir MEI no momento
- MEI foi considerado mas descartado por restrição legal
- Monetização (Stripe) depende de solução jurídica futura (reserva/aposentadoria ou familiar)
- Pluggy foi submetido como pessoa física / desenvolvedor independente

## Próximos passos (em ordem de prioridade)
1. 🌙 Modo escuro — Tailwind dark: em todas as páginas
2. 💰 Monetização (Stripe) — depende de solução jurídica
3. 📱 App nativo (React Native) — após validação e receita
4. 🏦 Migrar Pluggy para produção — quando pronto

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
- Sessão 3 (11/05/2026): Due Diligence Pluggy submetido, documentos gerados,
  email semanal descartado, decisão de implementar Push Notification
- Sessão 4 (13/05/2026): Pluggy aprovado, Push Notification implementado 100%
  com Firebase Cloud Messaging — token salvo no Supabase, Service Worker
  registrado, notificações funcionando no Chrome desktop, onboarding atualizado
  com botão de ativar notificações, alertas disparam push automaticamente