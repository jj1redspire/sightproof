'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Building2, MapPin, CheckCircle2, Plus, Trash2, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { DEFAULT_AREAS, AREA_TYPE_MAP, verticalLabel } from '@/lib/utils'
import type { Vertical } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type BuildingInput = {
  name: string
  address: string
  manager_email: string
}

type AreaInput = {
  name: string
  area_type: string
  selected: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VERTICALS: { value: Vertical; label: string; icon: string }[] = [
  { value: 'cleaning',           label: 'Commercial Cleaning',  icon: '🧹' },
  { value: 'landscaping',        label: 'Landscaping',           icon: '🌿' },
  { value: 'snow_removal',       label: 'Snow & Ice Removal',    icon: '❄️' },
  { value: 'pressure_washing',   label: 'Pressure Washing',      icon: '💧' },
  { value: 'commercial_kitchen', label: 'Commercial Kitchen',    icon: '🍳' },
]

const STEPS = ['Your Company', 'Buildings', 'Service Areas']

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${i <= current ? 'text-teal-600' : 'text-slate-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
              ${i < current ? 'bg-teal-600 border-teal-600 text-white'
                : i === current ? 'border-teal-600 text-teal-600 bg-white'
                : 'border-slate-200 text-slate-300 bg-white'}`}
            >
              {i < current ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === current ? 'text-slate-700' : i < current ? 'text-teal-600' : 'text-slate-300'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? 'bg-teal-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter()
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

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 1: Company
  const [companyName, setCompanyName] = useState('')
  const [vertical, setVertical] = useState<Vertical | ''>('')

  // Step 2: Buildings
  const [buildings, setBuildings] = useState<BuildingInput[]>([
    { name: '', address: '', manager_email: '' }
  ])

  // Step 3: Areas per building (index maps to buildings array)
  const [areasByBuilding, setAreasByBuilding] = useState<AreaInput[][]>([])

  // When vertical or buildings change, reset areas
  function initAreas(bList: BuildingInput[], v: Vertical | '') {
    if (!v) return
    const defaults = DEFAULT_AREAS[v] ?? []
    const typeMap = AREA_TYPE_MAP[v] ?? {}
    setAreasByBuilding(bList.map(() =>
      defaults.map((name) => ({ name, area_type: typeMap[name] ?? 'general', selected: true }))
    ))
  }

  // ── Step 1 handlers ────────────────────────────────────────────────────────

  function handleStep1Next() {
    if (!companyName.trim()) { toast.error('Enter your company name'); return }
    if (!vertical) { toast.error('Select your service type'); return }
    setStep(1)
  }

  // ── Step 2 handlers ────────────────────────────────────────────────────────

  function updateBuilding(i: number, field: keyof BuildingInput, val: string) {
    setBuildings((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b))
  }

  function addBuilding() {
    setBuildings((prev) => [...prev, { name: '', address: '', manager_email: '' }])
  }

  function removeBuilding(i: number) {
    if (buildings.length === 1) return
    setBuildings((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleStep2Next() {
    for (const b of buildings) {
      if (!b.name.trim()) { toast.error('All buildings need a name'); return }
      if (!b.manager_email.trim()) { toast.error('Each building needs a manager email'); return }
      if (!/\S+@\S+\.\S+/.test(b.manager_email)) { toast.error('Invalid email: ' + b.manager_email); return }
    }
    initAreas(buildings, vertical)
    setStep(2)
  }

  // ── Step 3 handlers ────────────────────────────────────────────────────────

  function toggleArea(bIdx: number, aIdx: number) {
    setAreasByBuilding((prev) => prev.map((areas, bi) =>
      bi !== bIdx ? areas : areas.map((a, ai) => ai !== aIdx ? a : { ...a, selected: !a.selected })
    ))
  }

  function addCustomArea(bIdx: number) {
    const name = prompt('Area name:')?.trim()
    if (!name) return
    const typeMap = AREA_TYPE_MAP[vertical as Vertical] ?? {}
    setAreasByBuilding((prev) => prev.map((areas, bi) =>
      bi !== bIdx ? areas : [...areas, { name, area_type: typeMap[name] ?? 'general', selected: true }]
    ))
  }

  // ── Final save ─────────────────────────────────────────────────────────────

  async function handleFinish() {
    setSaving(true)
    const sb = getSb()

    try {
      // Get current user
      const { data: { user }, error: userErr } = await sb.auth.getUser()
      if (userErr || !user) throw new Error('Not authenticated')

      // Create company
      const { data: company, error: coErr } = await sb
        .from('companies')
        .insert({ owner_id: user.id, name: companyName.trim(), vertical })
        .select()
        .single()
      if (coErr) throw coErr

      // Create buildings + areas
      for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i]
        const { data: building, error: bErr } = await sb
          .from('buildings')
          .insert({
            company_id: company.id,
            name: b.name.trim(),
            address: b.address.trim() || null,
            manager_email: b.manager_email.trim(),
          })
          .select()
          .single()
        if (bErr) throw bErr

        const selectedAreas = (areasByBuilding[i] ?? []).filter((a) => a.selected)
        if (selectedAreas.length > 0) {
          const { error: aErr } = await sb.from('areas').insert(
            selectedAreas.map((a) => ({
              building_id: building.id,
              name: a.name,
              area_type: a.area_type,
            }))
          )
          if (aErr) throw aErr
        }
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <ShieldCheck size={22} className="text-teal-600" />
          <span className="text-xl font-extrabold text-navy">Sight</span>
          <span className="text-xl font-extrabold text-teal-600">Proof</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Set up your account</h1>
          <p className="text-slate-500 font-medium mt-1">Takes about 2 minutes.</p>
        </div>

        <StepBar current={step} />

        {/* ── STEP 1: Company ─────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <ShieldCheck size={20} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Your Company</h2>
                <p className="text-slate-500 text-sm">How you&apos;ll appear on client reports</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                  placeholder="Pinnacle Building Services"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Service Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VERTICALS.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setVertical(v.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all font-semibold text-sm
                        ${vertical === v.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-2xl">{v.icon}</span>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleStep1Next} className="btn-teal w-full mt-8">
              Next: Add Buildings <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Buildings ────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <Building2 size={20} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Your Buildings</h2>
                <p className="text-slate-500 text-sm">Each building gets its own report emailed to its manager</p>
              </div>
            </div>

            <div className="space-y-6">
              {buildings.map((b, i) => (
                <div key={i} className="border-2 border-slate-100 rounded-2xl p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-500">Building {i + 1}</span>
                    {buildings.length > 1 && (
                      <button
                        onClick={() => removeBuilding(i)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Building Name *</label>
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => updateBuilding(i, 'name', e.target.value)}
                        className="input-field"
                        placeholder="Northpark Office Complex"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                      <input
                        type="text"
                        value={b.address}
                        onChange={(e) => updateBuilding(i, 'address', e.target.value)}
                        className="input-field"
                        placeholder="123 Main St, Chicago, IL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manager Email *</label>
                      <input
                        type="email"
                        value={b.manager_email}
                        onChange={(e) => updateBuilding(i, 'manager_email', e.target.value)}
                        className="input-field"
                        placeholder="manager@building.com"
                      />
                      <p className="text-slate-400 text-xs mt-1">Reports are sent here automatically after each service</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addBuilding}
              className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Another Building
            </button>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
              <button onClick={handleStep2Next} className="btn-teal flex-1">
                Next: Service Areas <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Areas ────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <MapPin size={20} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Service Areas</h2>
                <p className="text-slate-500 text-sm">
                  Select areas to inspect at each building. Based on{' '}
                  <span className="font-bold text-teal-600">{verticalLabel(vertical as string)}</span>.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {buildings.map((b, bIdx) => (
                <div key={bIdx}>
                  <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Building2 size={16} className="text-teal-600" />
                    {b.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(areasByBuilding[bIdx] ?? []).map((area, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => toggleArea(bIdx, aIdx)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all text-sm font-semibold
                          ${area.selected
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${area.selected ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}
                        >
                          {area.selected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        {area.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCustomArea(bIdx)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-teal-400 hover:text-teal-600 text-sm font-semibold transition-all"
                    >
                      <Plus size={16} /> Add custom area
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
              <button onClick={handleFinish} disabled={saving} className="btn-teal flex-1">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <>Finish Setup <CheckCircle2 size={18} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
