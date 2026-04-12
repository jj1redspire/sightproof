'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Camera, CheckCircle2, Loader2, ChevronRight, AlertCircle, ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { scoreBgClass, scoreLabel } from '@/types'
import type { Area } from '@/types'

type Props = {
  building: { id: string; name: string; address: string | null }
  companyVertical: string
  companyName: string
  areas: Area[]
}

type ScoreResult = {
  overall_score: number
  criteria_scores: Record<string, { score: number; note: string }>
  summary: string
  flags: string[]
}

type AreaState = {
  status: 'pending' | 'capturing' | 'uploading' | 'scoring' | 'scored' | 'error'
  photoUrl?: string
  localPreview?: string
  result?: ScoreResult
  errorMsg?: string
}

export default function InspectClient({ building, companyVertical, companyName, areas }: Props) {
  const sbRef = useRef<SupabaseClient | null>(null)

  function getSb(): SupabaseClient {
    if (!sbRef.current) {
      sbRef.current = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    }
    return sbRef.current!
  }

  const [areaStates, setAreaStates] = useState<Record<string, AreaState>>(
    Object.fromEntries(areas.map((a) => [a.id, { status: 'pending' }]))
  )
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null)
  const [inspectionId, setInspectionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper to patch a single area's state
  function patchArea(id: string, patch: Partial<AreaState>) {
    setAreaStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  // Ensure inspection row exists (created lazily on first photo)
  const ensureInspection = useCallback(async (): Promise<string> => {
    if (inspectionId) return inspectionId
    const res = await fetch('/api/inspection/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building_id: building.id }),
    })
    if (!res.ok) throw new Error('Failed to start inspection')
    const { id } = await res.json()
    setInspectionId(id)
    return id
  }, [inspectionId, building.id])

  // Handle file selected from camera/gallery
  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeAreaId) return

    // Reset input so same file can be re-selected
    e.target.value = ''

    const area = areas.find((a) => a.id === activeAreaId)
    if (!area) return

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    patchArea(activeAreaId, { status: 'uploading', localPreview })

    try {
      const iid = await ensureInspection()

      // Upload to Supabase Storage
      const sb = getSb()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `inspections/${iid}/${activeAreaId}-${Date.now()}.${ext}`

      const { error: upErr } = await sb.storage
        .from('inspection-photos')
        .upload(path, file, { contentType: file.type, upsert: true })
      if (upErr) throw upErr

      const { data: { publicUrl } } = sb.storage
        .from('inspection-photos')
        .getPublicUrl(path)

      patchArea(activeAreaId, { status: 'scoring', photoUrl: publicUrl })

      // Score via API
      const scoreRes = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_url: publicUrl,
          area_id: activeAreaId,
          area_name: area.name,
          area_type: area.area_type,
          vertical: companyVertical,
          inspection_id: iid,
        }),
      })
      if (!scoreRes.ok) {
        const err = await scoreRes.json().catch(() => ({}))
        throw new Error(err.error ?? 'Scoring failed')
      }
      const result: ScoreResult = await scoreRes.json()

      patchArea(activeAreaId, { status: 'scored', result })
      setActiveAreaId(null)
    } catch (err: unknown) {
      patchArea(activeAreaId, { status: 'error', errorMsg: err instanceof Error ? err.message : 'Failed' })
      toast.error(err instanceof Error ? err.message : 'Photo scoring failed')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAreaId, areas, companyVertical, ensureInspection])

  function openCamera(areaId: string) {
    setActiveAreaId(areaId)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  async function handleFinishInspection() {
    const scored = areas.filter((a) => areaStates[a.id]?.status === 'scored')
    if (scored.length === 0) { toast.error('Score at least one area before finishing'); return }

    setSubmitting(true)
    try {
      const iid = inspectionId ?? await ensureInspection()
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspection_id: iid }),
      })
      if (!res.ok) throw new Error('Report generation failed')
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send report')
    } finally {
      setSubmitting(false)
    }
  }

  const scoredCount = areas.filter((a) => areaStates[a.id]?.status === 'scored').length
  const totalAreas = areas.length

  // ── Submitted state ───────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-teal-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Report Sent!</h1>
        <p className="text-slate-500 font-medium mb-8">
          The building manager has been notified with today&apos;s quality report.
        </p>
        <Link href="/dashboard" className="btn-teal">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <ShieldCheck size={20} className="text-teal-600" />
            <span className="font-extrabold text-navy">Sight<span className="text-teal-600">Proof</span></span>
          </div>
          <span className="text-sm font-semibold text-slate-400">{scoredCount}/{totalAreas} areas</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Building info */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">{building.name}</h1>
          {building.address && <p className="text-slate-400 text-sm font-medium">{building.address}</p>}
          <p className="text-teal-600 text-sm font-bold mt-1">{companyName}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Inspection Progress</span>
            <span>{scoredCount} of {totalAreas} areas scored</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: totalAreas ? `${(scoredCount / totalAreas) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Area cards */}
        <div className="space-y-3 mb-8">
          {areas.map((area) => {
            const state = areaStates[area.id]
            const isActive = activeAreaId === area.id

            return (
              <div
                key={area.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden
                  ${state.status === 'scored' ? 'border-teal-200' : isActive ? 'border-teal-400' : 'border-slate-100'}`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Status icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                        ${state.status === 'scored' ? 'bg-teal-100' : 'bg-slate-100'}`}
                      >
                        {state.status === 'scored' ? (
                          <CheckCircle2 size={18} className="text-teal-600" />
                        ) : state.status === 'uploading' || state.status === 'scoring' ? (
                          <Loader2 size={18} className="animate-spin text-teal-600" />
                        ) : state.status === 'error' ? (
                          <AlertCircle size={18} className="text-red-500" />
                        ) : (
                          <Camera size={18} className="text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{area.name}</p>
                        <p className="text-slate-400 text-xs font-medium capitalize">{area.area_type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>

                    {/* Score badge or action */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {state.status === 'scored' && state.result && (
                        <span className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${scoreBgClass(state.result.overall_score)}`}>
                          {state.result.overall_score.toFixed(1)}
                        </span>
                      )}
                      {(state.status === 'pending' || state.status === 'error') && (
                        <button
                          onClick={() => openCamera(area.id)}
                          className={`cam-pulse flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all
                            ${state.status === 'error'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                        >
                          <Camera size={14} />
                          {state.status === 'error' ? 'Retry' : 'Capture'}
                        </button>
                      )}
                      {state.status === 'scored' && (
                        <button
                          onClick={() => openCamera(area.id)}
                          className="text-xs text-slate-400 hover:text-teal-600 font-semibold transition-colors px-2"
                        >
                          Retake
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status message */}
                  {state.status === 'uploading' && (
                    <p className="text-xs text-slate-400 font-medium mt-2 pl-12">Uploading photo...</p>
                  )}
                  {state.status === 'scoring' && (
                    <p className="text-xs text-teal-600 font-semibold mt-2 pl-12">AI scoring in progress...</p>
                  )}
                  {state.status === 'error' && (
                    <p className="text-xs text-red-500 font-medium mt-2 pl-12">{state.errorMsg}</p>
                  )}
                </div>

                {/* Scored result panel */}
                {state.status === 'scored' && state.result && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    {/* Photo preview */}
                    {state.localPreview && (
                      <div className="mt-3 mb-3 rounded-xl overflow-hidden aspect-video relative bg-slate-100">
                        <Image src={state.localPreview} alt={area.name} fill className="object-cover" />
                      </div>
                    )}

                    {/* Score breakdown */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-full ${scoreBgClass(state.result.overall_score)}`}>
                        {state.result.overall_score.toFixed(1)} — {scoreLabel(state.result.overall_score)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">{state.result.summary}</p>

                    {/* Criteria */}
                    <div className="space-y-1.5">
                      {Object.entries(state.result.criteria_scores).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className={`text-xs font-bold w-6 text-center py-0.5 rounded ${scoreBgClass(val.score)}`}>
                            {val.score}
                          </span>
                          <span className="text-xs text-slate-500 font-medium capitalize flex-1">{key.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-400 truncate max-w-[140px]">{val.note}</span>
                        </div>
                      ))}
                    </div>

                    {/* Flags */}
                    {state.result.flags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {state.result.flags.map((flag) => (
                          <span key={flag} className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                            ⚠ {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Finish button */}
        {scoredCount > 0 && (
          <div className="sticky bottom-4">
            <button
              onClick={handleFinishInspection}
              disabled={submitting}
              className="btn-teal w-full shadow-xl"
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  {scoredCount === totalAreas
                    ? 'Finish & Send Report'
                    : `Send Report (${scoredCount}/${totalAreas} areas scored)`}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input — camera on mobile, file picker on desktop */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  )
}
