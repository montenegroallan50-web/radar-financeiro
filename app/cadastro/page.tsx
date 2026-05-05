// app/cadastro/page.tsx
// Página de cadastro de novos usuários

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // Validação básica
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)

    // Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { full_name: nome } // Salva o nome nos metadados
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setErro('Este email já está cadastrado.')
      } else {
        setErro('Erro ao criar conta. Tente novamente.')
      }
      setCarregando(false)
      return
    }

    // Se o email precisa de confirmação
    if (data.user && !data.session) {
      setSucesso(true)
      setCarregando(false)
      return
    }

    // Se não precisa de confirmação → vai direto para o dashboard
    router.push('/dashboard')
    router.refresh()
  }

  // Tela de sucesso (aguardando confirmação de email)
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-white mb-2">Verifique seu email</h2>
            <p className="text-gray-400 text-sm">
              Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.
              Clique no link para ativar sua conta.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">📡 Radar Financeiro</h1>
          <p className="text-gray-400 mt-2">Crie sua conta gratuita</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>

          <form onSubmit={handleCadastro} className="space-y-4">

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none 
                           focus:border-blue-500 transition-colors"
              />
            </div>

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

            <div>
              <label className="block text-sm text-gray-400 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none 
                           focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirmar senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none 
                           focus:border-blue-500 transition-colors"
              />
            </div>

            {erro && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 
                         text-white font-semibold py-3 rounded-lg transition-colors
                         disabled:cursor-not-allowed"
            >
              {carregando ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}