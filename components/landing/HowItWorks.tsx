const steps = [
  { n: '1', title: 'Crew Takes Photos', body: 'After service, open SightProof and photograph each area. Lobby, bathrooms, offices, kitchen — 30 seconds per area.' },
  { n: '2', title: 'AI Scores Every Photo', body: "SightProof's AI analyzes each photo for service quality. Floors, surfaces, fixtures, trash — scored 1–10 with specific notes." },
  { n: '3', title: 'Report Generated Instantly', body: 'A branded Quality Verification Report with photos, scores, and timestamps is generated automatically.' },
  { n: '4', title: 'Client Gets It By Morning', body: 'The building manager opens their email at 8 AM and sees exactly what was done, scored, and verified.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label">HOW IT WORKS</p>
          <h2 className="section-headline">Photo. Score. Report. Automatic.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="text-center md:text-left">
              <div className="w-14 h-14 bg-navy rounded-full flex items-center justify-center text-white text-2xl font-extrabold mx-auto md:mx-0 mb-4 shadow-lg">
                {s.n}
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
