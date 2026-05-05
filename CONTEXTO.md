# RADAR FINANCEIRO — Contexto do Projeto

## Status atual
- ✅ Tela de login criada e aprovada (localhost:3001/login)
- 🔄 Próximo: Dashboard (radar_mobile_v1.html)
- ⏳ Pendente: Transações, Orçamento, Alertas, Perfil

## Projeto
App de controle financeiro pessoal multi-banco.
Exclusivo para smartphone (390px).
Pasta: C:\Users\CLIENTE\Desktop\ALLAN\projeto
Servidor: npm run dev → localhost:3001

## Stack
- Next.js 14 + TypeScript + Tailwind CSS
- Chart.js + react-chartjs-2 (gráficos)
- Fonte: Inter (Google Fonts)

## Design
- Cor principal: #0F6E56 (verde esmeralda)
- Cor escura: #085041
- Fundo: #f4f6f4
- Texto: #1a2e26
- Verde menta: #9FE1CB
- Vermelho: #d05050
- Fonte: Inter, pesos 400/500/600/700/800
- Mobile only: max-width 390px
- Header fixo: 56px
- Rodapé fixo: 52px (Open Finance ativo · BACEN)
- Touch targets mínimo: 44px

## Telas e arquivos HTML de referência
1. Login → ✅ app/login/page.tsx (pronto)
2. Dashboard → radar_mobile_v1.html → app/dashboard/page.tsx
3. Transações/Orçamento → radar_edit_features.html
4. Alertas → radar_alertas.html
5. Perfil → radar_perfil.html

## Estrutura de pastas
app/
  login/page.tsx ✅
  dashboard/page.tsx ⏳
  (screens)/
components/
lib/
globals.css

## Regras importantes
- App exclusivo para smartphone (390px)
- Nunca usar layout de duas colunas
- Sempre mobile first
- Rodapé fixo em todas as telas com: ponto verde pulsando + "Open Finance ativo" + badge BACEN
- Converter HTMLs fielmente — não simplificar o visual
- Aceitar todas as edições com "2" (Yes, allow all edits this session)

## Bancos suportados
Santander (#CC0000) · Nubank (#820AD1) · Inter (#FF7A00)
Bradesco (#CC092F) · Itaú (#003399) · BB (#E8A000)
Caixa (#005B8E) · C6 Bank (#333333)

## Categorias de transações
alimentacao 🛒 #edf6f1/#085041
transporte 🚗 #E6F1FB/#0C447C
saude 💊 #FCEBEB/#791F1F
lazer 🎬 #FAEEDA/#633806
contas 📱 #F3EFFE/#5B3E8F
investimento 📈 #edf6f1/#085041
educacao 📚 #E6F1FB/#0C447C
outros 📦 #f4f6f4/#5a7a6e

## Como usar este arquivo
Cole este conteúdo no início de cada nova conversa.
Depois cole o HTML da próxima tela a ser construída.
Exemplo: "Use o contexto abaixo e converta o HTML em React: [CONTEXTO] [HTML]"
