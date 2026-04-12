'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Camera, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-bold px-4 py-2 rounded-full mb-8 border border-teal-200">
          <ShieldCheck size={14} />
          AI Quality Verification
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.08] mb-6 text-balance">
          Proof Your Service Meets{' '}
          <span className="text-teal-600">the Standard.</span>
          <br className="hidden md:block" /> Every Night.
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          SightProof uses AI to score service quality from photos and sends your
          client a verified report automatically.{' '}
          <span className="font-bold text-slate-800">Stop losing contracts over &ldquo;he said, she said.&rdquo;</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
          <Link href="/login?signup=true" className="btn-teal text-xl w-full sm:w-auto">
            Start Free Trial — No Credit Card
            <ArrowRight size={20} />
          </Link>
        </div>
        <p className="text-slate-500 text-sm font-semibold">Set up in 5 minutes. First report tonight.</p>

        {/* Visual proof */}
        <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Camera, label: 'Photo taken at 11:04 PM', sub: 'Lobby — Main Entrance', score: '9.2', color: 'teal' },
            { icon: Star, label: 'AI scored in 4 seconds', sub: 'Floors, glass, surfaces', score: '7.8', color: 'amber' },
            { icon: ShieldCheck, label: 'Report sent by 6 AM', sub: 'Building manager notified', score: '8.6', color: 'teal' },
          ].map(({ icon: Icon, label, sub, score, color }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'teal' ? 'bg-teal-100' : 'bg-amber-100'}`}>
                  <Icon size={20} className={color === 'teal' ? 'text-teal-600' : 'text-amber-600'} />
                </div>
                <span className={`text-2xl font-extrabold ${color === 'teal' ? 'text-teal-600' : 'text-amber-600'}`}>{score}</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
