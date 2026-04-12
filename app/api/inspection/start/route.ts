import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { building_id } = await req.json()
    if (!building_id) return NextResponse.json({ error: 'building_id required' }, { status: 400 })

    const admin = createAdminClient()

    // Verify ownership
    const { data: building } = await admin
      .from('buildings')
      .select('id, companies!inner(owner_id)')
      .eq('id', building_id)
      .single()

    const company = (building as Record<string, unknown> | null)?.companies as { owner_id: string } | undefined
    if (!building || company?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create inspection row
    const { data: inspection, error } = await admin
      .from('inspections')
      .insert({ building_id, status: 'in_progress' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: inspection.id })
  } catch (err: unknown) {
    console.error('[inspection/start]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
