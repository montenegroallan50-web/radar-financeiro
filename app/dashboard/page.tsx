// app/dashboard/page.tsx
// Dashboard provisório — só acessível para usuários logados

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Busca o usuário logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUsuario(user)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">📡 Radar Financeiro</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Login funcionando!
          </h2>
          <p className="text-gray-400">
            Bem-vindo, <strong className="text-white">
              {usuario?.user_metadata?.full_name || usuario?.email}
            </strong>
          </p>
          <p className="text-gray-500 text-sm mt-4">
            FASE 3: Dashboard com dados reais em breve...
          </p>
        </div>
      </div>
    </div>
  )
}