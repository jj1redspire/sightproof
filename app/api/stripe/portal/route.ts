import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id, companies!inner(owner_id)')
      .eq('companies.owner_id', user.id)
      .single()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[stripe/portal]', err)
    return NextResponse.json({ error: 'Portal error' }, { status: 500 })
  }
}
