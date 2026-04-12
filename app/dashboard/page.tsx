import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShieldCheck, Building2, Plus, Camera, FileText, TrendingUp, Settings } from 'lucide-react'
import { formatDateShort, verticalLabel } from '@/lib/utils'
import { scoreBgClass, scoreLabel } from '@/types'

async function getPageData(userId: string) {
  const admin = createAdminClient()

  // Get company
  const { data: company } = await admin
    .from('companies')
    .select('*')
    .eq('owner_id', userId)
    .single()

  if (!company) return { company: null, buildings: [] }

  // Get buildings with recent inspection data
  const { data: buildings } = await admin
    .from('buildings')
    .select(`
      *,
      inspections(
        id, inspection_date, overall_score, status, created_at
      )
    `)
    .eq('company_id', company.id)
    .order('name')

  return { company, buildings: buildings ?? [] }
}

export default async function DashboardPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { company, buildings } = await getPageData(user.id)
  if (!company) redirect('/setup')

  // Compute stats
  const totalBuildings = buildings.length
  const allInspections = buildings.flatMap((b) => (b as Record<string, unknown>).inspections as Array<{ inspection_date: string; overall_score: number | null; status: string }>)
  const lastInspection = allInspections.sort((a, b) =>
    new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()
  )[0]
  const scoredInspections = allInspections.filter((i) => i.overall_score != null)
  const avgScore = scoredInspections.length
    ? scoredInspections.reduce((sum, i) => sum + (i.overall_score ?? 0), 0) / scoredInspections.length
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-teal-600" />
            <span className="text-xl font-extrabold text-navy">Sight</span>
            <span className="text-xl font-extrabold text-teal-600">Proof</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-500 hidden sm:block">{company.name}</span>
            <Link href="/settings" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{company.name}</h1>
            <p className="text-slate-500 font-medium mt-0.5">{verticalLabel(company.vertical)} · {totalBuildings} building{totalBuildings !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/buildings/new" className="btn-teal-sm">
            <Plus size={16} /> Add Building
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-slate-900">{totalBuildings}</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">Buildings</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-slate-900">{allInspections.length}</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">Total Inspections</p>
          </div>
          <div className="card text-center col-span-2 md:col-span-1">
            {avgScore != null ? (
              <>
                <p className={`text-3xl font-extrabold ${avgScore >= 8 ? 'text-teal-600' : avgScore >= 6 ? 'text-amber-600' : 'text-red-500'}`}>
                  {avgScore.toFixed(1)}
                </p>
                <p className="text-sm font-semibold text-slate-500 mt-1">Avg Score</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-slate-300">—</p>
                <p className="text-sm font-semibold text-slate-400 mt-1">No scores yet</p>
              </>
            )}
          </div>
        </div>

        {/* Buildings grid */}
        {buildings.length === 0 ? (
          <div className="card text-center py-16">
            <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">No buildings yet</h2>
            <p className="text-slate-400 mb-6">Add your first building to start tracking service quality.</p>
            <Link href="/buildings/new" className="btn-teal">
              <Plus size={18} /> Add Building
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {buildings.map((building) => {
              const buildingInspections = ((building as Record<string, unknown>).inspections as Array<{ inspection_date: string; overall_score: number | null; status: string }>) ?? []
              const latest = buildingInspections.sort((a, b) =>
                new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()
              )[0]

              return (
                <Link
                  key={building.id}
                  href={`/building/${building.id}`}
                  className="card hover:shadow-md hover:border-teal-200 transition-all group block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <Building2 size={20} className="text-teal-600" />
                    </div>
                    {latest?.overall_score != null && (
                      <span className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${scoreBgClass(latest.overall_score)}`}>
                        {latest.overall_score.toFixed(1)} · {scoreLabel(latest.overall_score)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1">{building.name}</h3>
                  {building.address && (
                    <p className="text-slate-400 text-sm font-medium mb-3 truncate">{building.address}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <FileText size={12} />
                      {buildingInspections.length} inspection{buildingInspections.length !== 1 ? 's' : ''}
                    </div>
                    {latest && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <TrendingUp size={12} />
                        Last: {formatDateShort(latest.inspection_date)}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/inspect/${building.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 rounded-xl transition-all"
                  >
                    <Camera size={14} /> Start Inspection
                  </Link>
                </Link>
              )
            })}
          </div>
        )}

        {/* Last activity */}
        {lastInspection && (
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Last inspection: {formatDateShort(lastInspection.inspection_date)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
