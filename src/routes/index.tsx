import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute, GuestRoute } from "@/components/auth/RouteGuards"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import SystemAdminsPage from "@/pages/SystemAdmins"
import EmployeesPage from "@/pages/Employees"
import SettingsPage from "@/pages/Settings"
import StorefrontPage from "@/pages/Storefront"
import EmailTemplatesPage from "@/pages/EmailTemplatesPage"
import TemplateEditor from "@/components/features/email-templates/TemplateEditor"
import LandingPagesPage from "@/pages/LandingPagesPage"

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      element: <GuestRoute />,
      children: [
        {
          path: "/login",
          element: <Login />,
        },
      ],
    },
    {
      element: <ProtectedRoute />,
      errorElement: (
        <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong!
          </h1>
          <p className="text-gray-500">
            A component threw an unexpected error.
          </p>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </a>
        </div>
      ),
      children: [
        {
          element: <AdminLayout />,
          children: [
            { path: "/dashboard", element: <Dashboard /> },
            {
              element: (
                <ProtectedRoute allowedRoles={["business_head", "sub_admin"]} />
              ),
              children: [
                { path: "/system-admins", element: <SystemAdminsPage /> },
                { path: "/storefront", element: <StorefrontPage /> },
                { path: "/employees", element: <EmployeesPage /> },
                { path: "/settings", element: <SettingsPage /> },
                { path: "/email-templates", element: <EmailTemplatesPage /> },
                {
                  path: "/landing-page-templates",
                  element: <LandingPagesPage />,
                },
                {
                  path: "/email-templates/editor/:id",
                  element: <TemplateEditor />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: (
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
        </div>
      ),
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
)
