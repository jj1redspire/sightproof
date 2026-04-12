'use client'
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSignup = searchParams.get('signup') === 'true'
  const plan = searchParams.get('plan') ?? ''

  const [mode, setMode] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Lazy Supabase init — never called at module/component scope, only inside handlers
  let sbRef: SupabaseClient | null = null
  function getSb(): SupabaseClient {
    if (!sbRef) {
      sbRef = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    }
    return sbRef!
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const sb = getSb()

    try {
      if (mode === 'signup') {
        const { error } = await sb.auth.signUp({ email, password })
        if (error) throw error
        // After signup, redirect to setup with plan param
        const dest = plan ? `/setup?plan=${plan}` : '/setup'
        router.push(dest)
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck size={24} className="text-teal-600" />
          <span className="text-2xl font-extrabold text-navy">Sight</span>
          <span className="text-2xl font-extrabold text-teal-600">Proof</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          {/* Tab toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'signup' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
            {mode === 'signup' ? 'Start your free trial' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 text-sm font-medium mb-6">
            {mode === 'signup'
              ? '14 days free. No credit card required.'
              : 'Sign in to your SightProof account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={mode === 'signup' ? 'Create a password (8+ chars)' : 'Your password'}
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-teal w-full mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs font-medium mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-teal-600 hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
