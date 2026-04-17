import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-sans">
      <Link href="/" className="text-teal-600 hover:underline text-sm font-medium">
        ← Back to home
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mt-6 mb-2">Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: April 17, 2026</p>

      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">1. Introduction</h2>
          <p>
            Ashward Group LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates SightProof
            (sightproof.io). This Privacy Policy explains how we collect, use, and protect your
            information when you use our property condition documentation service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">2. Information We Collect</h2>
          <p className="mb-3">We collect the following categories of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account information:</strong> Email address and password when you create an account.
            </li>
            <li>
              <strong>Property inspection data:</strong> Building names, addresses, inspection notes,
              condition scores, and structured inspection responses you enter.
            </li>
            <li>
              <strong>Photos:</strong> Images you upload during property inspections. These are stored
              securely and used to generate condition reports.
            </li>
            <li>
              <strong>AI analysis:</strong> Inspection data and photos are sent to Anthropic&apos;s Claude
              API to generate condition analysis and report summaries.
            </li>
            <li>
              <strong>Usage data:</strong> Basic activity logs to maintain service performance and security.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
          <p className="mb-3">Your information is used to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and operate the SightProof service</li>
            <li>Generate AI-assisted property condition reports</li>
            <li>Store and display your inspection history</li>
            <li>Process subscription payments</li>
            <li>Send service-related communications</li>
          </ul>
          <p className="mt-3">We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">4. Third-Party Services</h2>
          <p className="mb-3">
            We share data with the following third-party services only as necessary to operate SightProof:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase:</strong> Database storage and user authentication. Your inspection data
              and account information are stored on Supabase&apos;s infrastructure.
            </li>
            <li>
              <strong>Stripe:</strong> Payment processing. We do not store credit card numbers directly —
              all payment data is handled by Stripe.
            </li>
            <li>
              <strong>Anthropic (Claude):</strong> AI analysis of property conditions. Inspection data
              and photos may be sent to Anthropic&apos;s API to generate report content. Anthropic&apos;s
              privacy policy governs their handling of this data.
            </li>
            <li>
              <strong>Resend:</strong> Transactional email delivery (e.g., report emails, account
              notifications).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">5. Data Retention</h2>
          <p>
            Your inspection records, photos, and account data are retained while your account is
            active. You may request deletion of your data at any time by contacting us. Upon account
            cancellation, your data will be deleted within 30 days unless retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">6. Data Security</h2>
          <p>
            All data is encrypted in transit using HTTPS. Data at rest is protected using
            industry-standard encryption provided by our infrastructure partners. We apply
            row-level security to ensure your inspection data is accessible only to your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">7. Your Rights</h2>
          <p>
            You may access, update, or request deletion of your personal data at any time by
            contacting us at the email below. We will respond to all requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated policy
            on this page with a revised &ldquo;Last updated&rdquo; date. Continued use of SightProof after
            changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">9. Contact</h2>
          <p>
            Questions about this Privacy Policy? Contact Ashward Group LLC at{' '}
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
