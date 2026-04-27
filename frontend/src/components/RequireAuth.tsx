import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-8 text-center text-gray-500">Laddar...</div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
