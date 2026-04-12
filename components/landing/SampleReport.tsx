import { ShieldCheck } from 'lucide-react'

const areas = [
  { name: 'Lobby', score: 9.2, badge: 'score-high', note: 'Floors polished, glass streak-free, reception spotless.' },
  { name: 'Main Bathroom', score: 7.4, badge: 'score-mid', note: 'Generally clean. Minor water spots on mirror noted.' },
  { name: 'Kitchen / Break Room', score: 9.0, badge: 'score-high', note: 'All surfaces wiped, appliances clean, trash emptied.' },
  { name: 'Main Office', score: 8.5, badge: 'score-high', note: 'Carpets vacuumed, bins emptied, floors clean.' },
]

export default function SampleReport() {
  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label">WHAT YOUR CLIENT RECEIVES</p>
          <h2 className="section-headline">A Report That Keeps Contracts</h2>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-navy px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-xs font-semibold uppercase tracking-widest">Quality Verification Report</p>
              <h3 className="text-white text-xl font-extrabold mt-0.5">Lakeside Office Park</h3>
              <p className="text-slate-400 text-sm">Thursday, April 10, 2026 · Service completed 11:47 PM</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-extrabold">8.7</span>
              </div>
              <p className="text-teal-300 text-xs font-bold mt-1">OVERALL</p>
            </div>
          </div>

          {/* Trend */}
          <div className="bg-slate-50 px-6 py-3 flex items-center gap-3 border-b border-slate-100">
            <p className="text-slate-500 text-xs font-semibold">LAST 4 INSPECTIONS:</p>
            {['8.2', '8.5', '8.1', '8.7'].map((s, i) => (
              <span key={i} className="text-sm font-extrabold text-teal-600">{s}</span>
            ))}
            <span className="text-teal-500 text-xs font-bold ml-auto">↑ Trending up</span>
          </div>

          {/* Area list */}
          <div className="p-5 space-y-3">
            {areas.map(({ name, score, badge, note }) => (
              <div key={name} className="flex gap-4 items-start bg-slate-50 rounded-xl p-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-extrabold ${badge}`}>
                  {score}
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 text-sm">{name}</p>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2">
            <ShieldCheck size={14} className="text-teal-600" />
            <p className="text-slate-400 text-xs font-semibold">
              Verified by <span className="text-navy font-extrabold">Sight</span><span className="text-teal-600 font-extrabold">Proof</span> AI — Thu Apr 10, 2026 at 11:52 PM
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
