import Link from 'next/link'

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-sans">
      <Link href="/" className="text-teal-600 hover:underline text-sm font-medium">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mt-6 mb-2">Terms of Service</h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: April 17, 2026</p>

      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SightProof (sightproof.io), a service provided by Ashward Group LLC
            (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">2. Service Description</h2>
          <p>
            SightProof provides property condition documentation tools for rental property owners,
            managers, and real estate professionals. The service enables users to conduct structured
            property inspections, capture photo evidence, generate AI-assisted condition reports, and
            maintain documentation records.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">3. Subscription and Billing</h2>
          <p>
            SightProof is offered on a monthly subscription basis. Subscriptions renew automatically
            each month on your billing anniversary date unless cancelled. You may cancel at any time
            from your account settings page. No refunds are provided for partial billing periods.
            All fees are stated in U.S. dollars.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">4. Acceptable Use</h2>
          <p>
            You may use SightProof only for lawful purposes related to property condition documentation.
            You may not use the service to falsify inspection records, create fraudulent documentation,
            harass tenants or property owners, or violate any applicable law or regulation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">5. AI-Generated Content</h2>
          <p>
            SightProof uses AI technology (Anthropic Claude) to assist in generating property
            condition analysis and report content. AI-generated content is provided as a starting
            point and may require review and editing. You are solely responsible for the accuracy
            and completeness of reports you create, share, or rely upon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">6. Intellectual Property</h2>
          <p>
            You retain ownership of all photos, notes, and inspection data you upload to SightProof.
            You grant Ashward Group LLC a limited license to store and process your content solely
            to provide the service. We do not claim ownership of your content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">7. Disclaimer of Warranties</h2>
          <p>
            SightProof is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
            We do not warrant that the service will be uninterrupted, error-free, or that
            AI-generated reports will meet any legal or evidentiary standard in any jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">8. Limitation of Liability</h2>
          <p>
            Ashward Group LLC shall not be liable for any indirect, incidental, consequential, or
            punitive damages arising from your use of SightProof or reliance on any report or
            documentation generated through the service. Our total liability shall not exceed the
            amount you paid in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Oregon, without regard to conflict
            of law principles. Any disputes shall be resolved in the courts of Oregon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of SightProof after changes
            are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">11. Contact</h2>
          <p>
            Questions about these Terms? Contact Ashward Group LLC at{' '}
            <a href="mailto:joel@ashwardgroup.com" className="text-teal-600 hover:underline">
              joel@ashwardgroup.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
