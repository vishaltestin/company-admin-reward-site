import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip" 

export function AdminLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header with Mobile Trigger */}
          <header className="flex h-14 items-center gap-4  px-4 lg:h-15 lg:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
              {/* Global search or breadcrumbs can go here later */}
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  )
}
