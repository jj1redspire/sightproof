const verticals = [
  { emoji: '🧹', title: 'Commercial Cleaning', body: 'Janitorial quality scoring for offices, buildings, and facilities.' },
  { emoji: '🌿', title: 'Landscaping', body: 'Lawn care, edging, mulch, and hedge verification for HOAs and property managers.' },
  { emoji: '❄️', title: 'Snow & Ice Removal', body: 'GPS-timestamped proof of clearing and salting. Your legal defense in slip-and-fall claims.' },
  { emoji: '💦', title: 'Pressure Washing', body: 'Before/after scoring for concrete, buildings, and parking structures.' },
  { emoji: '🔥', title: 'Commercial Kitchen', body: 'Hood, exhaust, and grease trap verification for health code compliance.' },
  { emoji: '🔜', title: 'Coming Soon', body: 'Carpet care, window washing, and more verticals launching in 2026.' },
]

export default function MultiVertical() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label">ONE PLATFORM. EVERY SERVICE.</p>
          <h2 className="section-headline">Not Just Cleaning.</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {verticals.map(({ emoji, title, body }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-md transition-shadow hover:border-teal-200">
              <span className="text-3xl mb-3 block">{emoji}</span>
              <h3 className="font-extrabold text-slate-800 text-base mb-1">{title}</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
