import { AlertTriangle, PhoneOff, BarChart2 } from 'lucide-react'

const problems = [
  {
    icon: AlertTriangle,
    title: 'Word-against-word disputes',
    body: "The building manager says the bathroom wasn't cleaned. Your crew says it was. Without proof, you lose.",
  },
  {
    icon: PhoneOff,
    title: 'Lost contracts with no warning',
    body: "Your client switches vendors and the first you hear about quality issues is the cancellation call.",
  },
  {
    icon: BarChart2,
    title: 'No quality data over time',
    body: "You can't improve what you can't measure. And right now, you're measuring nothing.",
  },
]

export default function Problem() {
  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label">THE PROBLEM</p>
          <h2 className="section-headline">You Do Great Work.<br className="hidden md:block" /> But Nobody Sees the Proof.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-400 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-red-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">{title}</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
