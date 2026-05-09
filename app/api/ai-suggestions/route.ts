import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await req.json()

  // Extrai dados do prompt via regex simples
  const entradas   = parseFloat(prompt.match(/Entradas.*?R\$\s*([\d.,]+)/)?.[1]?.replace('.','').replace(',','.') ?? '0')
  const saidas     = parseFloat(prompt.match(/Saídas.*?R\$\s*([\d.,]+)/)?.[1]?.replace('.','').replace(',','.') ?? '0')
  const saldo      = parseFloat(prompt.match(/Saldo.*?R\$\s*(-?[\d.,]+)/)?.[1]?.replace('.','').replace(',','.') ?? '0')
  const patrimonio = parseFloat(prompt.match(/investido.*?R\$\s*([\d.,]+)/)?.[1]?.replace('.','').replace(',','.') ?? '0')

  // Extrai categorias
  const catMatch = prompt.match(/Categorias.*?:\s*(\{.*?\})/s)
  let categorias: Record<string, number> = {}
  try { categorias = JSON.parse(catMatch?.[1] ?? '{}') } catch { /**/ }

  const sugestoes: string[] = []

  // Regra 1 — Saldo negativo
  if (saldo < 0) {
    sugestoes.push(`1. ⚠️ Saldo negativo: suas saídas superaram as entradas em R$ ${Math.abs(saldo).toLocaleString('pt-BR', { minimumFractionDigits:2 })}. Revise seus gastos e corte o que não é essencial.`)
  } else if (saidas > 0 && entradas > 0) {
    const pct = (saidas / entradas) * 100
    if (pct > 80) {
      sugestoes.push(`1. 🟡 Você gastou ${pct.toFixed(0)}% da sua renda. O ideal é manter abaixo de 70% para conseguir guardar dinheiro com consistência.`)
    } else {
      sugestoes.push(`1. ✅ Parabéns! Você gastou ${pct.toFixed(0)}% da sua renda e ficou com saldo positivo. Continue assim e aumente gradualmente sua reserva.`)
    }
  }

  // Regra 2 — Categoria dominante
  const catEntries = Object.entries(categorias).sort((a, b) => b[1] - a[1])
  if (catEntries.length > 0) {
    const [topCat, topVal] = catEntries[0]
    const pctCat = saidas > 0 ? (topVal / saidas) * 100 : 0
    if (pctCat > 40) {
      sugestoes.push(`2. 🔍 ${topCat} representa ${pctCat.toFixed(0)}% dos seus gastos. Analise se há espaço para reduzir nessa categoria — pequenas economias diárias fazem grande diferença no mês.`)
    } else {
      sugestoes.push(`2. 📊 Seus gastos estão bem distribuídos entre categorias. ${topCat} é a maior com ${pctCat.toFixed(0)}% do total — um bom sinal de equilíbrio financeiro.`)
    }
  }

  // Regra 3 — Investimentos
  if (patrimonio === 0) {
    sugestoes.push(`3. 💡 Você ainda não possui investimentos registrados. Mesmo com pouco, começar a investir agora faz diferença — considere Tesouro Direto ou CDBs com liquidez diária como primeiro passo.`)
  } else if (entradas > 0) {
    const pctInv = (patrimonio / entradas) * 100
    if (pctInv < 10) {
      sugestoes.push(`3. 📈 Seu patrimônio investido ainda é baixo em relação à sua renda. Tente destinar pelo menos 10% das entradas para investimentos todo mês.`)
    } else {
      sugestoes.push(`3. 💰 Ótimo! Você tem R$ ${patrimonio.toLocaleString('pt-BR', { minimumFractionDigits:2 })} investidos. Continue aportando regularmente para acelerar o crescimento do patrimônio.`)
    }
  }

  // Regra 4 — Reserva de emergência
  if (saldo > 0 && patrimonio === 0) {
    sugestoes.push(`4. 🛡️ Antes de investir, priorize sua reserva de emergência — idealmente de 3 a 6 meses de despesas guardados em aplicação com liquidez diária.`)
  } else if (saldo > 0) {
    sugestoes.push(`4. 🎯 Você terminou o período com saldo positivo de R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits:2 })}. Considere automatizar uma transferência mensal para investimentos assim que receber sua renda.`)
  } else {
    sugestoes.push(`4. 📋 Crie um orçamento mensal por categoria com limites definidos. Use a aba Orçamento do Radar Financeiro para acompanhar em tempo real e evitar estouros.`)
  }

  const text = sugestoes.join('\n\n')
  return NextResponse.json({ text })
}
