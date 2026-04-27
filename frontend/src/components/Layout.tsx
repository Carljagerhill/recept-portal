import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-green-600 text-xl">🍴</span>
            <span className="text-lg font-bold text-gray-900 tracking-tight">RecipeVault</span>
          </Link>

          <div className="flex items-center gap-6">
            <NavLink to="/recipes" className={navLinkClass}>Recept</NavLink>
            {user && (
              <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
                >
                  Logga ut
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
