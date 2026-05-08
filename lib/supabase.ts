// lib/supabase.ts
// Este arquivo cria a "conexão" com o banco de dados Supabase
// Exportamos dois clientes: um para o navegador, outro para o servidor

import { createBrowserClient } from '@supabase/ssr'

// Cliente para uso no navegador (componentes React)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente admin para uso em API routes (bypassa RLS)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
