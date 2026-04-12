import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { company_id, plan } = session.metadata ?? {}
        if (!company_id || !plan) break

        await admin.from('subscriptions').upsert({
          company_id,
          stripe_customer_id: session.customer as string,
          stripe_sub_id: session.subscription as string,
          plan_tier: plan,
          status: 'active',
        }, { onConflict: 'company_id' })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const invoice = sub as unknown as Record<string, unknown>
        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status

        await admin
          .from('subscriptions')
          .update({
            status,
            current_period_end: new Date((invoice.current_period_end as number) * 1000).toISOString(),
          })
          .eq('stripe_sub_id', sub.id)
        break
      }
    }
  } catch (err: unknown) {
    console.error('[webhook] Handler error:', err)
  }

  return NextResponse.json({ received: true })
}
