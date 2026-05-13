import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { token } = await req.json()

    const supabase = createAdminClient()
    await supabase
      .from('profiles')
      .update({ fcm_token: token })
      .eq('id', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar token:', error)
    return NextResponse.json({ error: 'Erro ao salvar token' }, { status: 500 })
  }
}
