// app/login/page.tsx
// Página de login do Radar Financeiro

'use client' // Indica que este componente roda no navegador

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  // Estados: guardam os valores dos campos e mensagens
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Função chamada quando o usuário clica em "Entrar"
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault() // Evita recarregar a página
    setCarregando(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      // Traduzindo erros comuns do Supabase para português
      if (error.message === 'Invalid login credentials') {
        setErro('Email ou senha incorretos.')
      } else {
        setErro('Erro ao fazer login. Tente novamente.')
      }
      setCarregando(false)
      return
    }

    // Login OK → vai para o dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">📡 Radar Financeiro</h1>
          <p className="text-gray-400 mt-2">Controle total das suas finanças</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">Entrar na conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Campo Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none 
                           focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none 
                           focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 
                         text-white font-semibold py-3 rounded-lg transition-colors
                         disabled:cursor-not-allowed"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Link para cadastro */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-blue-400 hover:text-blue-300">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}