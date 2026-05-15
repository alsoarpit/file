import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { logout } from '../firebase'
import { getCart } from '../cart'

function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [count, setCount] = useState(0)

  useEffect(() => {
    const refresh = () => setCount(getCart().reduce((s, i) => s + i.qty, 0))
    refresh()
    window.addEventListener('cart-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('cart-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-black text-white">
      <Link to="/dashboard" className="text-xl font-semibold">MyShop</Link>
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="hover:text-neutral-400">Products</Link>
        <Link to="/cart" className="hover:text-neutral-400">Cart ({count})</Link>
        <Link to="/orders" className="hover:text-neutral-400">Orders</Link>
        <span className="text-sm text-neutral-400">{user.email}</span>
        <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white hover:underline">Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
