
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentId, orderId, signature, userId } = await req.json()

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured')
    }

    // Verify signature
    const generatedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(`${orderId}|${paymentId}`)
      )
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )

    if (generatedSignature !== signature) {
      throw new Error('Invalid payment signature')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', userId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Update transaction as completed
    await supabase
      .from('payment_transactions')
      .update({
        razorpay_payment_id: paymentId,
        status: 'completed'
      })
      .eq('id', transaction.id)

    // Process based on payment type
    if (transaction.payment_type === 'project_credit') {
      // Add project credit
      await supabase
        .from('project_credits')
        .update({
          available_credits: supabase.rpc('increment', { amount: 1 }),
          total_purchased_credits: supabase.rpc('increment', { amount: 1 })
        })
        .eq('user_id', userId)
    } else if (transaction.payment_type === 'subscription') {
      // Get subscription plan
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Monthly Subscription')
        .single()

      if (plan) {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        // Create or update subscription
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            status: 'active',
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString()
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
