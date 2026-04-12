import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import HowItWorks from '@/components/landing/HowItWorks'
import SampleReport from '@/components/landing/SampleReport'
import MultiVertical from '@/components/landing/MultiVertical'
import PropertyManager from '@/components/landing/PropertyManager'
import Pricing from '@/components/landing/Pricing'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <SampleReport />
        <MultiVertical />
        <PropertyManager />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
