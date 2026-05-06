// components/PluggyConnect.tsx
'use client'

import { useState } from 'react'

// Declara o tipo do widget da Pluggy para o TypeScript não reclamar
declare global {
  interface Window {
    PluggyConnect: any
  }
}

interface Props {
  userId: string
  onSuccess: () => void  // função chamada após conectar com sucesso
}

export default function PluggyConnect({ userId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    try {
      // 1. Pede o token para nossa API
      const res = await fetch('/api/pluggy/token', { method: 'POST' })
      const { connectToken } = await res.json()

      // 2. Carrega o script do widget da Pluggy dinamicamente
      const script = document.createElement('script')
      script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js'
      script.onload = () => {
        // 3. Abre o widget com o token
        const pluggyConnect = new window.PluggyConnect({
          connectToken,

          // 4. Quando o usuário conecta o banco com sucesso
          onSuccess: async (itemData: any) => {
            try {
              // 5. Chama nossa API de sync para salvar os dados
              await fetch('/api/pluggy/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  itemId: itemData.item.id,
                  userId,
                }),
              })
              onSuccess()  // avisa o Dashboard para recarregar os dados
            } catch (err) {
              console.error('Erro ao sincronizar:', err)
            }
          },

          onError: (error: any) => {
            console.error('Erro no widget Pluggy:', error)
          },
        })

        pluggyConnect.init()
      }
      document.body.appendChild(script)

    } catch (err) {
      console.error('Erro ao abrir Pluggy Connect:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500
                 disabled:opacity-50 disabled:cursor-not-allowed
                 text-white px-6 py-3 rounded-xl font-medium transition-colors"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Conectando...
        </>
      ) : (
        <>
          🏦 Conectar meu banco
        </>
      )}
    </button>
  )
}
