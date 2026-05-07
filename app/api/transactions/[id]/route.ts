import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { category, description } = await request.json()
  const supabase = createClient()

  const { error } = await supabase
    .from('transactions')
    .update({ category, description })
    .eq('pluggy_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
