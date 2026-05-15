import { useEffect, useState } from 'react'
import { api } from '../api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/orders')
      .then((r) => setOrders(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-center">Loading orders...</div>
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {o.appName}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-green-700 font-medium text-sm">{o.status?.toUpperCase()}</span>
              </div>
              <ul className="text-sm text-gray-700 mb-2">
                {o.items?.map((it, idx) => (
                  <li key={idx}>{it.name} × {it.qty} — ₹{it.price * it.qty}</li>
                ))}
              </ul>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-xs text-gray-500 font-mono">Payment: {o.razorpayPaymentId}</span>
                <span className="font-semibold">₹{o.totalAmount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Account: {o.userEmail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
