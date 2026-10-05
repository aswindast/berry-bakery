import { apiConfig } from '../lib/api'

type PaymentOrder = {
  orderId: string
  razorpayKeyId: string
  razorpayOrderId: string
  amount: number
  currency: 'INR'
}

async function apiRequest<T>(path: string, accessToken: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result = await response.json() as { data?: T; error?: { message?: string } }
  if (!response.ok || result.data === undefined) throw new Error(result.error?.message ?? `Payment request failed (${response.status}).`)
  return result.data
}

let checkoutScript: Promise<boolean> | undefined

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (checkoutScript) return checkoutScript
  checkoutScript = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return checkoutScript
}

export async function startRazorpayPayment(accessToken: string, orderId: string, prefill: { name?: string; email?: string; contact?: string }) {
  const paymentOrder = await apiRequest<PaymentOrder>(`/orders/${encodeURIComponent(orderId)}/payment/create`, accessToken)
  if (!await loadCheckoutScript() || !window.Razorpay) {
    throw new Error('Razorpay Checkout could not be loaded. Your order is saved and you can retry payment.')
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false
    const fail = (message: string) => {
      if (settled) return
      settled = true
      reject(new Error(message))
    }
    const checkout = new window.Razorpay!({
      key: paymentOrder.razorpayKeyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'BERRY Home Bakery',
      description: `Order ${orderId.slice(0, 8).toUpperCase()}`,
      order_id: paymentOrder.razorpayOrderId,
      prefill,
      theme: { color: '#7D234A' },
      handler: async (payment) => {
        try {
          await apiRequest(`/orders/${encodeURIComponent(orderId)}/payment/verify`, accessToken, {
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
          })
          if (!settled) {
            settled = true
            resolve()
          }
        } catch (error) {
          fail(error instanceof Error ? error.message : 'Payment verification failed. Your order is saved for retry.')
        }
      },
      modal: { ondismiss: () => fail('Payment was cancelled. Your order is saved and can be paid later.') },
    })
    checkout.on('payment.failed', (failure) => {
      const metadata = failure.error?.metadata
      void (async () => {
        if (metadata?.order_id && metadata.payment_id) {
          await apiRequest(`/orders/${encodeURIComponent(orderId)}/payment/failure`, accessToken, {
            razorpayOrderId: metadata.order_id,
            razorpayPaymentId: metadata.payment_id,
          }).catch(() => undefined)
        }
        fail(failure.error?.description ?? 'Payment failed. Your order is saved and can be retried.')
      })()
    })
    checkout.open()
  })
}
