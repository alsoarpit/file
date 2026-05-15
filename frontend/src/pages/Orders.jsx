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

  if (loading) return <div className="p-10 text-center text-white bg-black min-h-screen">Loading orders...</div>
  if (error) return <div className="p-10 text-center text-neutral-400 bg-black min-h-screen">{error}</div>

  return (
    <div className="bg-black min-h-screen text-white">
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="border border-neutral-800 rounded-lg p-10 bg-neutral-950 text-center">
          <p className="text-neutral-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {orders.map((o) => {
            const itemCount = o.items?.reduce((s, i) => s + i.qty, 0) || 0
            return (
              <div key={o._id} className="border border-neutral-800 rounded-lg p-4 bg-neutral-950 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-white">{o.appName}</h3>
                  <span className="text-xs border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded shrink-0">
                    {o.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
                <span className="inline-block text-xs border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded mt-1 self-start">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>

                <ul className="text-sm text-neutral-300 mt-3 space-y-1">
                  {o.items?.map((it, idx) => (
                    <li key={idx} className="flex justify-between gap-2">
                      <span className="truncate">{it.name} × {it.qty}</span>
                      <span className="text-neutral-400 shrink-0">₹{(it.price * it.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
                  <p className="text-lg font-semibold text-white">₹{Number(o.totalAmount).toFixed(2)}</p>
                  <span className="text-xs text-neutral-400">Total paid</span>
                </div>

                <p className="text-xs text-neutral-600 font-mono mt-2 truncate" title={o.razorpayPaymentId}>
                  {o.razorpayPaymentId}
                </p>
                <p className="text-xs text-neutral-500 mt-1 truncate" title={o.userEmail}>
                  {o.userEmail}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </div>
  )
}

export default Orders
