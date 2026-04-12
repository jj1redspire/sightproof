import Link from 'next/link'
import { LayoutDashboard, TrendingUp, FileText, ArrowRight } from 'lucide-react'

const features = [
  { icon: LayoutDashboard, label: 'All vendors, one view', body: 'Scores across every service provider in a single dashboard.' },
  { icon: TrendingUp, label: 'Trend tracking', body: 'Quality over time by vendor and building — know who is slipping.' },
  { icon: FileText, label: 'Contract leverage', body: 'Data-backed conversations about performance. No more guessing.' },
]

export default function PropertyManager() {
  return (
    <section className="py-20 px-4 bg-navy text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-teal-400 uppercase text-sm font-bold tracking-widest mb-3">PROPERTY MANAGERS</p>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Verify Every Vendor. One Dashboard.</h2>
          <p className="text-slate-300 text-xl font-medium max-w-2xl mx-auto">
            Stop trusting. Start verifying. See quality scores for your cleaning, landscaping,
            and snow removal — all in one place.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {features.map(({ icon: Icon, label, body }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-6 border border-white/10">
              <div className="w-11 h-11 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-teal-400" />
              </div>
              <h3 className="font-extrabold text-white text-base mb-1">{label}</h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/login?signup=true&plan=property_manager" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all hover:scale-[1.02] shadow-xl">
            Start Property Manager Trial <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}
