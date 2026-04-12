'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowLeft, Loader2, CreditCard, LogOut, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Company, Subscription } from '@/types'
import { verticalLabel } from '@/lib/utils'
import { PLANS } from '@/lib/stripe'

type PageData = {
  company: Company | null
  subscription: Subscription | null
}

export default function SettingsPage() {
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

  const [data, setData] = useState<PageData>({ company: null, subscription: null })
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const sb = getSb()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: company } = await sb
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (!company) { router.push('/setup'); return }

      const { data: subscription } = await sb
        .from('subscriptions')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle()

      setData({ company, subscription })
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal')
      setPortalLoading(false)
    }
  }

  async function handleUpgrade(plan: string) {
    setUpgradeLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
      setUpgradeLoading(null)
    }
  }

  async function handleLogout() {
    await getSb().auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    )
  }

  const { company, subscription } = data
  const planTier = subscription?.plan_tier ?? null
  const isTrialing = !subscription || subscription.status === 'trialing'

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-teal-600" />
            <span className="font-extrabold text-navy">Sight<span className="text-teal-600">Proof</span></span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Company info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={18} className="text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">Company</h2>
          </div>
          {company && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 font-medium">Company Name</span>
                <span className="text-sm font-bold text-slate-900">{company.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 font-medium">Service Type</span>
                <span className="text-sm font-bold text-slate-900">{verticalLabel(company.vertical)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Subscription */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={18} className="text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">Subscription</h2>
          </div>

          {subscription && !isTrialing ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 font-medium">Plan</span>
                <span className="text-sm font-bold text-teal-600 capitalize">{planTier?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 font-medium">Status</span>
                <span className={`text-sm font-bold capitalize ${subscription.status === 'active' ? 'text-teal-600' : 'text-amber-600'}`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Renews</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              )}
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="btn-outline w-full mt-2"
              >
                {portalLoading ? <Loader2 size={16} className="animate-spin" /> : 'Manage Billing'}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-amber-700 text-sm font-semibold">
                  {isTrialing ? '🎉 You\'re on a free trial. Choose a plan to continue after 14 days.' : 'No active subscription.'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.entries(PLANS) as [string, { name: string; price: number; label: string }][]).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => handleUpgrade(key)}
                    disabled={upgradeLoading !== null}
                    className={`p-4 rounded-2xl border-2 text-left transition-all
                      ${key === 'growth' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <p className="text-xs font-bold text-slate-500 capitalize mb-1">{key.replace('_', ' ')}</p>
                    <p className="text-xl font-extrabold text-slate-900">{plan.label}</p>
                    {upgradeLoading === key ? (
                      <Loader2 size={14} className="animate-spin text-teal-600 mt-2" />
                    ) : (
                      <p className="text-xs text-teal-600 font-semibold mt-2">Select →</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-red-500 font-semibold text-sm transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  )
}
