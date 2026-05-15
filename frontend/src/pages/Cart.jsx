import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateQty, removeFromCart, cartTotal } from '../cart'

function Cart() {
  const [cart, setCart] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const refresh = () => setCart(getCart())
    refresh()
    window.addEventListener('cart-updated', refresh)
    return () => window.removeEventListener('cart-updated', refresh)
  }, [])

  if (cart.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline">
          Browse products
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>
      <div className="space-y-3">
        {cart.map((item) => (
          <div key={item.productId} className="flex items-center justify-between border rounded p-4 bg-white">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">₹{item.price} × {item.qty}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.productId, item.qty - 1)} className="px-2 py-1 border rounded">−</button>
              <span className="w-8 text-center">{item.qty}</span>
              <button onClick={() => updateQty(item.productId, item.qty + 1)} className="px-2 py-1 border rounded">+</button>
              <button onClick={() => removeFromCart(item.productId)} className="ml-3 text-red-600 text-sm hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Total: ₹{cartTotal()}</span>
        <button onClick={() => navigate('/checkout')} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Buy Now
        </button>
      </div>
    </div>
  )
}

export default Cart
