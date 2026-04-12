import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft, Camera, Building2, TrendingUp } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import { scoreBgClass } from '@/types'

export default async function BuildingDetailPage({ params }: { params: { id: string } }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: building } = await admin
    .from('buildings')
    .select('*, companies!inner(owner_id, vertical, name)')
    .eq('id', params.id)
    .single()

  const company = (building as Record<string, unknown> | null)?.companies as { owner_id: string; name: string } | undefined
  if (!building || company?.owner_id !== user.id) redirect('/dashboard')

  const { data: areas } = await admin
    .from('areas')
    .select('*')
    .eq('building_id', params.id)
    .order('name')

  const { data: inspections } = await admin
    .from('inspections')
    .select('*, area_scores(id, overall_score, area_id)')
    .eq('building_id', params.id)
    .order('inspection_date', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-extrabold text-slate-900">{building.name}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{building.name}</h1>
            {building.address && <p className="text-slate-400 text-sm font-medium mt-0.5">{building.address}</p>}
            <p className="text-slate-500 text-sm mt-1">Manager: <span className="font-semibold">{building.manager_email}</span></p>
          </div>
          <Link href={`/inspect/${building.id}`} className="btn-teal-sm flex-shrink-0">
            <Camera size={16} /> Start Inspection
          </Link>
        </div>

        {/* Areas */}
        <div className="card mb-6">
          <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-teal-600" /> Service Areas ({areas?.length ?? 0})
          </h2>
          {(areas ?? []).length === 0 ? (
            <p className="text-slate-400 text-sm">No areas configured.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(areas ?? []).map((a) => (
                <span key={a.id} className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Inspection history */}
        <div>
          <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-600" /> Inspection History
          </h2>
          {(inspections ?? []).length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-slate-400 font-medium">No inspections yet.</p>
              <Link href={`/inspect/${building.id}`} className="btn-teal-sm mt-4 inline-flex">
                <Camera size={14} /> Start First Inspection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(inspections ?? []).map((inspection) => {
                const scores = (inspection.area_scores as Array<{ overall_score: number }>) ?? []
                return (
                  <Link
                    key={inspection.id}
                    href={`/report/${inspection.id}`}
                    className="card hover:shadow-md hover:border-teal-200 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{formatDateShort(inspection.inspection_date)}</p>
                      <p className="text-slate-400 text-sm font-medium">{scores.length} area{scores.length !== 1 ? 's' : ''} scored</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-extrabold px-2.5 py-1 rounded-full capitalize
                        ${inspection.status === 'sent' ? 'bg-teal-100 text-teal-700'
                          : inspection.status === 'complete' ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'}`}
                      >
                        {inspection.status.replace('_', ' ')}
                      </span>
                      {inspection.overall_score != null && (
                        <span className={`text-base font-extrabold px-2.5 py-1 rounded-full ${scoreBgClass(inspection.overall_score)}`}>
                          {inspection.overall_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
