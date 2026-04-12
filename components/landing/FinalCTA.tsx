import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-navy to-[#2A4F80] text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Tonight&apos;s Service Deserves Proof
        </h2>
        <p className="text-slate-300 text-xl font-medium mb-10">
          Set up in 5 minutes. Your client gets their first report tomorrow morning.
        </p>
        <Link href="/login?signup=true" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-xl py-4 px-10 rounded-xl transition-all hover:scale-[1.02] shadow-xl">
          Start Free Trial <ArrowRight size={22} />
        </Link>
        <p className="mt-5 text-slate-400 text-sm font-semibold">No credit card required. 14-day free trial.</p>
      </div>
    </section>
  )
}
