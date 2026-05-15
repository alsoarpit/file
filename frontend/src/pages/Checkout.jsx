import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import { getCart, clearCart } from '../cart'

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

function Checkout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Preparing payment...')
  const [error, setError] = useState('')

  useEffect(() => {
    const cart = getCart()
    if (cart.length === 0) {
      navigate('/cart', { replace: true })
      return
    }
    pay(cart)
  }, [])

  const pay = async (cart) => {
    const ok = await loadRazorpay()
    if (!ok) {
      setError('Failed to load Razorpay. Check your internet.')
      return
    }

    try {
      const { data } = await api.post('/api/payment/create-order', {
        items: cart.map((c) => ({ productId: c.productId, qty: c.qty })),
      })

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.appName,
        description: 'Order payment',
        order_id: data.orderId,
        prefill: { email: user?.email, name: user?.displayName },
        theme: { color: '#000000' },
        handler: async (response) => {
          setStatus('Verifying payment...')
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: data.items,
              totalAmount: data.amount / 100,
            })
            clearCart()
            navigate('/orders', { replace: true })
          } catch (err) {
            setError('Payment verification failed: ' + (err.response?.data?.error || err.message))
          }
        },
        modal: {
          ondismiss: () => navigate('/cart', { replace: true }),
        },
      })

      rzp.on('payment.failed', (resp) => setError('Payment failed: ' + resp.error.description))
      rzp.open()
      setStatus('Razorpay opened. Complete the payment.')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="p-10 text-center bg-black min-h-screen text-white">
      {error ? (
        <>
          <p className="text-neutral-400">{error}</p>
          <button onClick={() => navigate('/cart')} className="mt-4 text-white hover:underline">Back to cart</button>
        </>
      ) : (
        <p>{status}</p>
      )}
    </div>
  )
}

export default Checkout
