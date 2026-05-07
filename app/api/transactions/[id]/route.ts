import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/supabase-server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { category, description } = await request.json()
  const supabase = createClient()

  // Garante que a transação pertence ao usuário autenticado
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('pluggy_id', params.id)
    .eq('user_id', userId)
    .single()

  if (!existing) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })

  const { error } = await supabase
    .from('transactions')
    .update({ category, description })
    .eq('pluggy_id', params.id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
