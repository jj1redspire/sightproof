'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
          <ShieldCheck size={22} className="text-teal-600" />
          <span className="text-navy">Sight</span>
          <span className="text-teal-600">Proof</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="#how-it-works" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors text-sm">How It Works</Link>
          <Link href="#pricing" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors text-sm">Pricing</Link>
          <Link href="/login" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors text-sm">Log In</Link>
          <Link href="/login?signup=true" className="btn-teal-sm">Start Free Trial</Link>
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-slate-700 font-semibold py-2" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="#pricing" className="text-slate-700 font-semibold py-2" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/login" className="text-slate-700 font-semibold py-2" onClick={() => setOpen(false)}>Log In</Link>
          <Link href="/login?signup=true" className="btn-teal-sm w-full text-center" onClick={() => setOpen(false)}>Start Free Trial</Link>
        </div>
      )}
    </nav>
  )
}
