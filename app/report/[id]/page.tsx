import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { scoreBgClass, scoreLabel, scoreColor } from '@/types'
import type { AreaScore, Area } from '@/types'

export default async function ReportPage({ params }: { params: { id: string } }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: inspection } = await admin
    .from('inspections')
    .select('*, buildings(*, companies!inner(owner_id, name, vertical)), area_scores(*, areas(*))')
    .eq('id', params.id)
    .single()

  if (!inspection) redirect('/dashboard')

  const building = inspection.buildings as Record<string, unknown>
  const company = building.companies as { owner_id: string; name: string }
  if (company.owner_id !== user.id) redirect('/dashboard')

  const areaScores = (inspection.area_scores as (AreaScore & { areas: Area })[])
    .sort((a, b) => a.overall_score - b.overall_score)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href={`/building/${(building as { id: string }).id}`} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-extrabold text-slate-900">Inspection Report</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="bg-navy text-white rounded-3xl p-8 mb-6">
          <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">Service Verification Report</p>
          <h1 className="text-2xl font-extrabold mb-1">{(building as { name: string }).name}</h1>
          <p className="text-slate-400 text-sm">{formatDate(inspection.inspection_date)}</p>
          <p className="text-slate-400 text-sm mt-0.5">Verified by <span className="text-teal-400 font-bold">{company.name}</span></p>
        </div>

        {/* Overall score */}
        {inspection.overall_score != null && (
          <div className="card text-center mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Score</p>
            <p className="text-7xl font-black leading-none mb-2" style={{ color: scoreColor(inspection.overall_score) }}>
              {inspection.overall_score.toFixed(1)}
            </p>
            <p className="text-lg font-bold" style={{ color: scoreColor(inspection.overall_score) }}>
              {scoreLabel(inspection.overall_score)}
            </p>
            <p className="text-slate-400 text-sm mt-2">{areaScores.length} areas inspected</p>
          </div>
        )}

        {/* Area scores */}
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Area Breakdown</h2>
        <div className="space-y-4">
          {areaScores.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{s.areas?.name ?? 'Area'}</h3>
                  <p className="text-slate-400 text-xs capitalize">{s.areas?.area_type?.replace(/_/g, ' ')}</p>
                </div>
                <span className={`text-sm font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 ${scoreBgClass(s.overall_score)}`}>
                  {s.overall_score.toFixed(1)} — {scoreLabel(s.overall_score)}
                </span>
              </div>

              {s.photo_url && (
                <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <Image src={s.photo_url} alt={s.areas?.name ?? 'photo'} fill className="object-cover" />
                </div>
              )}

              <p className="text-sm text-slate-600 font-medium mb-3">{s.summary}</p>

              {/* Criteria scores */}
              <div className="space-y-1.5">
                {Object.entries(s.criteria_scores).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-6 text-center py-0.5 rounded flex-shrink-0 ${scoreBgClass(val.score)}`}>
                      {val.score}
                    </span>
                    <span className="text-xs text-slate-600 font-medium capitalize flex-1">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-400 text-right max-w-[160px]">{val.note}</span>
                  </div>
                ))}
              </div>

              {s.flags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.flags.map((f) => (
                    <span key={f} className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">⚠ {f}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
