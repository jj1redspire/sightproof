import { NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json() as { plan: keyof typeof PLANS }
    if (!PLANS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const admin = createAdminClient()
    const { data: company } = await admin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 })

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: PLANS[plan].name },
            unit_amount: PLANS[plan].price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: { company_id: company.id, plan },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: 'Checkout error' }, { status: 500 })
  }
}
