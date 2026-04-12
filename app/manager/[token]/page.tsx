import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShieldCheck } from 'lucide-react'
import { formatDate, formatDateShort, verticalLabel } from '@/lib/utils'
import { scoreBgClass, scoreLabel, scoreColor } from '@/types'
import type { AreaScore, Area } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ManagerPortalPage({ params }: { params: { token: string } }) {
  const admin = createAdminClient()

  // Look up building by manager token
  const { data: building } = await admin
    .from('buildings')
    .select('*, companies(name, vertical, logo_url)')
    .eq('manager_token', params.token)
    .single()

  if (!building) notFound()

  const company = building.companies as { name: string; vertical: string; logo_url: string | null }

  // Load last 10 sent inspections
  const { data: inspections } = await admin
    .from('inspections')
    .select('*, area_scores(*, areas(*))')
    .eq('building_id', building.id)
    .eq('status', 'sent')
    .order('inspection_date', { ascending: false })
    .limit(10)

  const latest = (inspections ?? [])[0]
  const latestScores = latest
    ? ((latest.area_scores as (AreaScore & { areas: Area })[]).sort((a, b) => a.overall_score - b.overall_score))
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy text-white px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={22} className="text-teal-400" />
            <span className="font-extrabold text-lg">
              <span className="text-white">Sight</span>
              <span className="text-teal-400">Proof</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold">{building.name}</h1>
          {building.address && <p className="text-slate-400 text-sm mt-0.5">{building.address}</p>}
          <p className="text-slate-400 text-sm mt-1">
            Service by <span className="text-teal-400 font-bold">{company.name}</span>
            {' · '}{verticalLabel(company.vertical)}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Latest inspection */}
        {latest ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">Latest Report</h2>
              <span className="text-sm text-slate-400 font-medium">{formatDate(latest.inspection_date)}</span>
            </div>

            {latest.overall_score != null && (
              <div className="card text-center mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Score</p>
                <p className="text-7xl font-black leading-none mb-1" style={{ color: scoreColor(latest.overall_score) }}>
                  {latest.overall_score.toFixed(1)}
                </p>
                <p className="text-lg font-bold" style={{ color: scoreColor(latest.overall_score) }}>
                  {scoreLabel(latest.overall_score)}
                </p>
                <p className="text-slate-400 text-sm mt-2">{latestScores.length} areas inspected</p>
              </div>
            )}

            <div className="space-y-4 mb-10">
              {latestScores.map((s) => (
                <div key={s.id} className="card">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.areas?.name ?? 'Area'}</h3>
                    </div>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${scoreBgClass(s.overall_score)}`}>
                      {s.overall_score.toFixed(1)} — {scoreLabel(s.overall_score)}
                    </span>
                  </div>

                  {s.photo_url && (
                    <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <Image src={s.photo_url} alt={s.areas?.name ?? 'photo'} fill className="object-cover" />
                    </div>
                  )}

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.summary}</p>

                  {s.flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.flags.map((f) => (
                        <span key={f} className="text-xs bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-full">⚠ {f}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Past reports */}
            {(inspections ?? []).length > 1 && (
              <>
                <h2 className="text-base font-extrabold text-slate-900 mb-3">Past Reports</h2>
                <div className="space-y-2">
                  {(inspections ?? []).slice(1).map((insp) => (
                    <div key={insp.id} className="card flex items-center justify-between">
                      <p className="font-semibold text-slate-700 text-sm">{formatDateShort(insp.inspection_date)}</p>
                      {insp.overall_score != null && (
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${scoreBgClass(insp.overall_score)}`}>
                          {insp.overall_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="card text-center py-16">
            <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">No reports yet</h2>
            <p className="text-slate-400">Your service provider will send reports here after each visit.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs text-slate-300">
            Powered by <span className="text-teal-500 font-bold">SightProof</span> · Service verification for property managers
          </p>
        </div>
      </div>
    </div>
  )
}
