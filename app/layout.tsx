import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'SightProof — AI Service Quality Verification',
  description: 'SightProof uses AI to score service quality from photos and sends your client a verified report automatically. Stop losing contracts over he said, she said.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sightproof.io'),
  openGraph: {
    title: 'SightProof — Proof Your Service Meets the Standard. Every Night.',
    description: 'AI-powered quality verification for cleaning, landscaping, snow removal, and more.',
    url: 'https://sightproof.io',
    siteName: 'SightProof',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
