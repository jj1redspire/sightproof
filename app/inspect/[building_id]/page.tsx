import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import InspectClient from './InspectClient'

export default async function InspectPage({ params }: { params: { building_id: string } }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Load building + verify ownership via company
  const { data: building } = await admin
    .from('buildings')
    .select('*, companies!inner(owner_id, vertical, name)')
    .eq('id', params.building_id)
    .single()

  if (!building) redirect('/dashboard')
  const company = (building as Record<string, unknown>).companies as { owner_id: string; vertical: string; name: string }
  if (company.owner_id !== user.id) redirect('/dashboard')

  // Load areas for this building
  const { data: areas } = await admin
    .from('areas')
    .select('*')
    .eq('building_id', params.building_id)
    .order('name')

  return (
    <InspectClient
      building={{ id: building.id, name: building.name, address: building.address }}
      companyVertical={company.vertical}
      companyName={company.name}
      areas={areas ?? []}
    />
  )
}
