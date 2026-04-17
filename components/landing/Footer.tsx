import { ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xl font-extrabold">
          <ShieldCheck size={18} className="text-teal-500" />
          <span className="text-white">Sight</span>
          <span className="text-teal-500">Proof</span>
        </div>
        <div className="flex gap-6 text-sm font-semibold">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="mailto:joel@ashwardgroup.com" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-sm">© 2026 SightProof. All rights reserved.</p>
      </div>
    </footer>
  )
}
