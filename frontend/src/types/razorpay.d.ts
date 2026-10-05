type RazorpayCheckoutResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayFailureResponse = {
  error?: {
    description?: string
    metadata?: { order_id?: string; payment_id?: string }
  }
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name?: string; email?: string; contact?: string }
  theme: { color: string }
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>
  modal: { ondismiss: () => void }
}

type RazorpayInstance = {
  open: () => void
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

export {}
