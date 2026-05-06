// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import PluggyConnect from '@/components/PluggyConnect'

// Tipos TypeScript — definem o formato dos dados
interface Transaction {
  id: string
  description: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  category: string
  date: string
}

interface Summary {
  saldo: number
  receitas: number
  despesas: number
}

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({ saldo: 0, receitas: 0, despesas: 0 })
  const [hasAccount, setHasAccount] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    inicializar()
  }, [])

  async function inicializar() {
    // 1. Busca o usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUsuario(user)

    // 2. Carrega os dados do Supabase
    await carregarDados(user.id)
    setLoading(false)
  }

  async function carregarDados(userId: string) {
    // Verifica se tem banco conectado
    const { data: contas } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)

    setHasAccount(!!contas && contas.length > 0)

    // Busca as últimas 20 transações
    const { data: trans } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20)

    if (trans) {
      setTransactions(trans)

      // Calcula resumo financeiro
      const receitas = trans
        .filter(t => t.type === 'CREDIT')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const despesas = trans
        .filter(t => t.type === 'DEBIT')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      setSummary({
        receitas,
        despesas,
        saldo: receitas - despesas,
      })
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Formata valor em Real brasileiro
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formata data
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">📡 Radar Financeiro</h1>
            <p className="text-gray-400 text-sm mt-1">
              Olá, {usuario?.user_metadata?.full_name || usuario?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300
                       px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo Atual</p>
            <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(summary.saldo)}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Receitas</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(summary.receitas)}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Despesas</p>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(summary.despesas)}
            </p>
          </div>
        </div>

        {/* Seção de Conexão ou Transações */}
        {!hasAccount ? (
          // Nenhum banco conectado ainda
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Conecte seu banco para começar
            </h2>
            <p className="text-gray-400 mb-6">
              Conecte sua conta bancária via Open Finance para visualizar
              suas transações e análises financeiras em tempo real.
            </p>
            <PluggyConnect
              userId={usuario?.id}
              onSuccess={() => carregarDados(usuario?.id)}
            />
          </div>
        ) : (
          // Tem banco conectado — mostra transações
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">
                Transações Recentes
              </h2>
              <PluggyConnect
                userId={usuario?.id}
                onSuccess={() => carregarDados(usuario?.id)}
              />
            </div>

            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma transação encontrada.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center
                               py-3 border-b border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {t.description || 'Sem descrição'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {t.category || 'Sem categoria'} • {formatDate(t.date)}
                      </p>
                    </div>
                    <span className={`font-semibold text-sm ${
                      t.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {t.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(Math.abs(t.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
