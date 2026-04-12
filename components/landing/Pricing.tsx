import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/mo',
    features: ['1–5 buildings', '1 service vertical', 'Email reports', 'AI quality scoring', '30-day history'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$99',
    period: '/mo',
    features: ['6–20 buildings', 'All service verticals', 'Trend analytics', '90-day history', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    id: 'property_manager',
    name: 'Property Manager',
    price: '$199',
    period: '/mo',
    features: ['6–20 buildings', 'ALL vendor verification', 'Manager dashboard', '12-month history', 'Custom branding'],
    cta: 'Start Free Trial',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label">PRICING</p>
          <h2 className="section-headline">Plans That Scale With Your Business</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-3xl p-8 ${p.highlight ? 'bg-navy text-white shadow-2xl scale-[1.03]' : 'bg-white shadow-md border border-slate-100'}`}
            >
              {p.highlight && (
                <div className="bg-teal-500 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">Most Popular</div>
              )}
              <h3 className={`text-lg font-extrabold mb-2 ${p.highlight ? 'text-white' : 'text-slate-800'}`}>{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-5xl font-extrabold ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                <span className={`text-lg font-semibold ${p.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.highlight ? 'bg-teal-500/30' : 'bg-teal-100'}`}>
                      <Check size={12} className={p.highlight ? 'text-teal-300' : 'text-teal-600'} strokeWidth={3} />
                    </div>
                    <span className={`text-sm font-medium ${p.highlight ? 'text-slate-200' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/login?signup=true&plan=${p.id}`}
                className={`w-full flex items-center justify-center gap-2 font-bold text-base py-3 rounded-xl transition-all hover:scale-[1.02] ${
                  p.highlight
                    ? 'bg-teal-500 hover:bg-teal-400 text-white'
                    : 'bg-navy text-white hover:opacity-90'
                }`}
              >
                {p.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm font-semibold">
            Need more?{' '}
            <a href="mailto:joel@helmport.com" className="text-teal-600 hover:underline">Enterprise plans</a>{' '}
            available for 50+ buildings.
          </p>
          <p className="text-slate-400 text-sm font-medium mt-2">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  )
}
