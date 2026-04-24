import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps = {}) => {
  const { isAuthenticated, isInitialized, user } = useAuthStore()

  if (!isInitialized) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export const GuestRoute = () => {
  const { isAuthenticated, isInitialized } = useAuthStore()

  if (!isInitialized) return null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
