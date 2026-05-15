import { useEffect, useState } from 'react'
import { api } from '../api'
import { addToCart } from '../cart'

function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/products')
      .then((r) => setProducts(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-center">Loading products...</div>
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Products</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const outOfStock = p.stock != null && p.stock <= 0
            return (
              <div key={p._id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mb-3" />}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{p.name}</h3>
                  {p.rating != null && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded shrink-0">
                      ★ {p.rating}
                    </span>
                  )}
                </div>
                {p.brand && <p className="text-xs text-gray-500 mt-1">{p.brand}</p>}
                {p.category && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded mt-1 self-start">
                    {p.category}
                  </span>
                )}
                {p.description && <p className="text-sm text-gray-600 mt-2">{p.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-semibold">₹{p.price}</p>
                  {p.stock != null && (
                    <span className={`text-xs ${outOfStock ? 'text-red-600' : 'text-green-700'}`}>
                      {outOfStock ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(p)}
                  disabled={outOfStock}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {outOfStock ? 'Unavailable' : 'Add to Cart'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
