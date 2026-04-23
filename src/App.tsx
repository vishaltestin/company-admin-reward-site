import { RouterProvider } from "react-router-dom"
import { router } from "@/routes"
import { useAuthQuery } from "@/hooks/useAuth"

export default function App() {
  const { isLoading } = useAuthQuery()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}
