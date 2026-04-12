import Stripe from 'stripe'

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })
}

export const PLANS = {
  starter: { name: 'SightProof Starter', price: 4900, label: '$49/mo' },
  growth: { name: 'SightProof Growth', price: 9900, label: '$99/mo' },
  property_manager: { name: 'SightProof Property Manager', price: 19900, label: '$199/mo' },
} as const
