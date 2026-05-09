import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const VERDE = '#0F6E56'
const VERDE_CLARO = '#edf6f1'

const styles = StyleSheet.create({
  page:        { fontFamily:'Helvetica', backgroundColor:'#ffffff', padding: 0 },
  capa:        { backgroundColor: VERDE, padding: 32 },
  capaTitulo:  { fontSize: 22, fontFamily:'Helvetica-Bold', color:'white', marginBottom: 4 },
  capaSubtitle:{ fontSize: 13, color:'rgba(255,255,255,0.7)', marginBottom: 16 },
  capaInfo:    { fontSize: 11, color:'rgba(255,255,255,0.8)', marginBottom: 3 },
  section:     { padding: 20 },
  sectionTitle:{ fontSize: 14, fontFamily:'Helvetica-Bold', color:'#1a2e26', marginBottom: 10 },
  divider:     { height: 1, backgroundColor:'#f3f4f6', marginHorizontal: 20 },
  row:         { flexDirection:'row', gap: 8, marginBottom: 8 },
  card:        { flex: 1, padding: 10, borderRadius: 8 },
  cardLabel:   { fontSize: 9, color:'#6b7280', textTransform:'uppercase', marginBottom: 3 },
  cardValue:   { fontSize: 16, fontFamily:'Helvetica-Bold' },
  txRow:       { flexDirection:'row', justifyContent:'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor:'#f9fafb' },
  txDesc:      { fontSize: 11, color:'#374151', flex: 1 },
  txMeta:      { fontSize: 9,  color:'#9ca3af', marginTop: 2 },
  txVal:       { fontSize: 12, fontFamily:'Helvetica-Bold', marginLeft: 8 },
  catRow:      { flexDirection:'row', alignItems:'center', marginBottom: 6 },
  catDot:      { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  catName:     { fontSize: 11, color:'#374151', flex: 1 },
  catPct:      { fontSize: 11, fontFamily:'Helvetica-Bold', color:'#1a2e26' },
  catVal:      { fontSize: 10, color:'#9ca3af', marginLeft: 6 },
  sugestao:    { fontSize: 12, color:'#374151', lineHeight: 1.6, marginBottom: 8 },
  rodape:      { padding: 16, backgroundColor:'#f9fafb', alignItems:'center' },
  rodapeText:  { fontSize: 9, color:'#9ca3af', marginBottom: 2 },
  invRow:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding: 8, backgroundColor:'#f9fafb', borderRadius: 6, marginBottom: 4 },
  invName:     { fontSize: 11, fontFamily:'Helvetica-Bold', color:'#1a2e26' },
  invType:     { fontSize: 9, color:'#9ca3af', marginTop: 2 },
  invVal:      { fontSize: 12, fontFamily:'Helvetica-Bold', color: VERDE },
})

const CORES = ['#0F6E56','#1a9e7a','#34d399','#6ee7b7','#f59e0b','#ef4444','#8b5cf6','#ec4899']

// Remove acentos para compatibilidade com PDF
function s(text: string): string {
  return text
    .replace(/[áàãâä]/g, 'a').replace(/[ÁÀÃÂÄ]/g, 'A')
    .replace(/[éèêë]/g, 'e').replace(/[ÉÈÊË]/g, 'E')
    .replace(/[íìîï]/g, 'i').replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[óòõôö]/g, 'o').replace(/[ÓÒÕÔÖ]/g, 'O')
    .replace(/[úùûü]/g, 'u').replace(/[ÚÙÛÜ]/g, 'U')
    .replace(/[ç]/g, 'c').replace(/[Ç]/g, 'C')
    .replace(/[ñ]/g, 'n').replace(/[Ñ]/g, 'N')
}

function formatR(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}`
}

function gerarSugestoes(resumo: any, porCategoria: Record<string,number>, patrimonioTotal: number): string[] {
  const { entradas, saidas, saldo } = resumo
  const sugestoes: string[] = []

  if (saldo < 0) {
    sugestoes.push(s(`1. Atencao: Saldo negativo de ${formatR(Math.abs(saldo))}. Revise seus gastos e corte o que nao e essencial.`))
  } else if (saidas > 0 && entradas > 0) {
    const pct = (saidas / entradas) * 100
    if (pct > 80) sugestoes.push(s(`1. Voce gastou ${pct.toFixed(0)}% da sua renda. O ideal e manter abaixo de 70% para conseguir guardar dinheiro.`))
    else sugestoes.push(s(`1. Parabens! Voce gastou ${pct.toFixed(0)}% da sua renda e ficou com saldo positivo. Continue assim!`))
  } else {
    sugestoes.push(s(`1. Nenhuma movimentacao registrada neste periodo.`))
  }

  const catEntries = Object.entries(porCategoria).sort((a,b) => b[1]-a[1])
  if (catEntries.length > 0) {
    const [topCat, topVal] = catEntries[0]
    const pctCat = saidas > 0 ? (topVal/saidas)*100 : 0
    if (pctCat > 40) sugestoes.push(s(`2. ${topCat} representa ${pctCat.toFixed(0)}% dos seus gastos. Analise se ha espaco para reduzir nessa categoria.`))
    else sugestoes.push(s(`2. Seus gastos estao bem distribuidos. ${topCat} e a maior categoria com ${pctCat.toFixed(0)}%.`))
  } else {
    sugestoes.push(s(`2. Sem gastos registrados neste periodo.`))
  }

  if (patrimonioTotal === 0) {
    sugestoes.push(s(`3. Voce ainda nao possui investimentos. Considere comecar com Tesouro Direto ou CDBs com liquidez diaria.`))
  } else {
    sugestoes.push(s(`3. Otimo! Voce tem ${formatR(patrimonioTotal)} investidos. Continue aportando regularmente.`))
  }

  if (saldo > 0) {
    sugestoes.push(s(`4. Voce terminou com saldo positivo de ${formatR(saldo)}. Considere automatizar uma transferencia mensal para investimentos.`))
  } else {
    sugestoes.push(s(`4. Crie um orcamento mensal por categoria e use a aba Orcamento do Radar Financeiro para acompanhar.`))
  }

  return sugestoes
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mes = req.nextUrl.searchParams.get('mes') ?? ''
  const supabase = createAdminClient()

  const [profileRes, investmentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('investments').select('*').eq('user_id', userId),
  ])

  let query = supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false })
  if (mes) {
    const [ano, m] = mes.split('-').map(Number)
    const inicio = new Date(ano, m-1, 1).toISOString()
    const fim    = new Date(ano, m, 0, 23, 59, 59).toISOString()
    query = query.gte('date', inicio).lte('date', fim)
  }

  const { data: txs } = await query
  const transactions = txs ?? []
  const investments  = investmentsRes.data ?? []
  const profile      = profileRes.data ?? {}

  const entradas = transactions.filter(t => t.type==='CREDIT').reduce((s,t) => s+Math.abs(t.amount), 0)
  const saidas   = transactions.filter(t => t.type==='DEBIT').reduce((s,t) => s+Math.abs(t.amount), 0)
  const saldo    = entradas - saidas
  const patrimonioTotal = investments.reduce((s,i) => s+(i.balance??0), 0)

  const porCategoria: Record<string,number> = {}
  transactions.filter(t => t.type==='DEBIT').forEach(t => {
    const cat = t.category || 'Outros'
    porCategoria[cat] = (porCategoria[cat]||0) + Math.abs(t.amount)
  })

  const resumo = { entradas, saidas, saldo, totalTransacoes: transactions.length }
  const sugestoes = gerarSugestoes(resumo, porCategoria, patrimonioTotal)
  const mesLabel = mes ? s(new Date(mes+'-15').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})) : 'Periodo completo'
  const catEntries = Object.entries(porCategoria).sort((a,b)=>b[1]-a[1])
  const totalGasto = saidas || 1

  const doc = React.createElement(Document, {},
    React.createElement(Page, { size:'A4', style: styles.page },

      // CAPA
      React.createElement(View, { style: styles.capa },
        React.createElement(Text, { style:{ fontSize:10, color:'rgba(255,255,255,0.6)', marginBottom:8 } }, 'RadarFinanceiro'),
        React.createElement(Text, { style: styles.capaTitulo }, 'Relatorio Financeiro'),
        React.createElement(Text, { style: styles.capaSubtitle }, mesLabel.charAt(0).toUpperCase()+mesLabel.slice(1)),
        React.createElement(Text, { style: styles.capaInfo }, `Usuario: ${s(profile.nome ?? 'Usuario')}`),
        React.createElement(Text, { style: styles.capaInfo }, `Email: ${profile.email ?? ''}`),
        React.createElement(Text, { style: styles.capaInfo }, `Gerado em ${s(new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}))}`),
      ),

      // RESUMO
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Resumo do Mes'),
        React.createElement(View, { style: styles.row },
          React.createElement(View, { style:{ ...styles.card, backgroundColor:'#ecfdf5' } },
            React.createElement(Text, { style: styles.cardLabel }, 'ENTRADAS'),
            React.createElement(Text, { style:{ ...styles.cardValue, color:'#059669' } }, formatR(entradas)),
          ),
          React.createElement(View, { style:{ ...styles.card, backgroundColor:'#fef2f2' } },
            React.createElement(Text, { style: styles.cardLabel }, 'SAIDAS'),
            React.createElement(Text, { style:{ ...styles.cardValue, color:'#dc2626' } }, formatR(saidas)),
          ),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(View, { style:{ ...styles.card, backgroundColor: saldo>=0?'#ecfdf5':'#fef2f2' } },
            React.createElement(Text, { style: styles.cardLabel }, 'SALDO'),
            React.createElement(Text, { style:{ ...styles.cardValue, color: saldo>=0?'#059669':'#dc2626' } }, formatR(saldo)),
          ),
          React.createElement(View, { style:{ ...styles.card, backgroundColor: VERDE_CLARO } },
            React.createElement(Text, { style: styles.cardLabel }, 'PATRIMONIO'),
            React.createElement(Text, { style:{ ...styles.cardValue, color: VERDE } }, formatR(patrimonioTotal)),
          ),
        ),
        React.createElement(Text, { style:{ fontSize:10, color:'#9ca3af', marginTop:4 } }, `${resumo.totalTransacoes} transacoes no periodo`),
      ),

      React.createElement(View, { style: styles.divider }),

      // CATEGORIAS
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Gastos por Categoria'),
        catEntries.length === 0
          ? React.createElement(Text, { style:{ fontSize:11, color:'#9ca3af' } }, 'Sem gastos neste periodo.')
          : React.createElement(View, {},
              ...catEntries.map(([cat, val], i) =>
                React.createElement(View, { key:i, style: styles.catRow },
                  React.createElement(View, { style:{ ...styles.catDot, backgroundColor: CORES[i%CORES.length] } }),
                  React.createElement(Text, { style: styles.catName }, s(cat)),
                  React.createElement(Text, { style: styles.catPct }, `${((val/totalGasto)*100).toFixed(0)}%`),
                  React.createElement(Text, { style: styles.catVal }, formatR(val)),
                )
              )
            ),
      ),

      React.createElement(View, { style: styles.divider }),

      // INVESTIMENTOS
      investments.length > 0 && React.createElement(View, {},
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Carteira de Investimentos'),
          React.createElement(View, {},
            ...investments.slice(0,5).map((inv: any, i: number) =>
              React.createElement(View, { key:i, style: styles.invRow },
                React.createElement(View, {},
                  React.createElement(Text, { style: styles.invName }, s(inv.name ?? '—').slice(0,35)),
                  React.createElement(Text, { style: styles.invType }, s(inv.type ?? '—')),
                ),
                React.createElement(Text, { style: styles.invVal }, formatR(inv.balance ?? 0)),
              )
            ),
          ),
        ),
        React.createElement(View, { style: styles.divider }),
      ),

      // TRANSAÇÕES
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Transacoes do Mes'),
        transactions.length === 0
          ? React.createElement(Text, { style:{ fontSize:11, color:'#9ca3af' } }, 'Nenhuma transacao neste periodo.')
          : React.createElement(View, {},
              ...transactions.slice(0,15).map((t: any, i: number) =>
                React.createElement(View, { key:i, style: styles.txRow },
                  React.createElement(View, { style:{ flex:1 } },
                    React.createElement(Text, { style: styles.txDesc }, s(t.description??'Sem descricao').slice(0,40)),
                    React.createElement(Text, { style: styles.txMeta }, `${s(t.category??'Outros')} · ${new Date(t.date).toLocaleDateString('pt-BR')}`),
                  ),
                  React.createElement(Text, { style:{ ...styles.txVal, color: t.type==='CREDIT'?'#059669':'#dc2626' } },
                    `${t.type==='CREDIT'?'+':'-'}${formatR(Math.abs(t.amount))}`
                  ),
                )
              )
            ),
      ),

      React.createElement(View, { style: styles.divider }),

      // SUGESTÕES
      React.createElement(View, { style:{ ...styles.section, backgroundColor: VERDE_CLARO } },
        React.createElement(Text, { style: styles.sectionTitle }, 'Sugestoes Personalizadas'),
        ...sugestoes.map((sg, i) =>
          React.createElement(Text, { key:i, style: styles.sugestao }, sg)
        ),
      ),

      // RODAPÉ
      React.createElement(View, { style: styles.rodape },
        React.createElement(Text, { style: styles.rodapeText }, 'Gerado pelo RadarFinanceiro - Dados protegidos pela LGPD'),
        React.createElement(Text, { style: styles.rodapeText }, 'Este relatorio e confidencial e destinado exclusivamente ao titular'),
      ),
    )
  )

  const buffer = await renderToBuffer(doc)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="radar-financeiro-${mes}.pdf"`,
    },
  })
}
