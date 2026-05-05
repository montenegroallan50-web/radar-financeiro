// middleware.ts
// O middleware roda ANTES de cada página carregar
// É como um segurança na entrada: verifica se o usuário está logado

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifica se há um usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  // Se não está logado e tenta acessar o dashboard → redireciona para login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se já está logado e tenta acessar login/cadastro → vai para dashboard
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/cadastro'
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Define quais rotas o middleware monitora
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/cadastro'],
}