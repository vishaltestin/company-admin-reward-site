import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Building2,
  ChevronRight,
  BarChart2,
  DollarSign,
  Camera,
  BookAIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { useSidebar } from "@/components/ui/sidebar"
import { NavUser } from "@/components/auth/NavUser"

interface NavSubItem {
  title: string
  url: string
  allowedRoles?: string[]
}

interface NavItem {
  title: string
  icon: React.ElementType
  url: string
  allowedRoles?: string[]
  items?: NavSubItem[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    items: [],
  },
  {
    title: "Campaign",
    icon: Camera,
    url: "#",
    items: [
      { title: "Start New Campaign", url: "/campaign/create" },
      { title: "View Campaign", url: "/campaigns" },
    ],
  },
  {
    title: "Admin",
    icon: Users,
    url: "#",
    items: [
      {
        title: "Admin List",
        url: "/system-admins",
        allowedRoles: ["business_head", "sub_admin"],
      },
      {
        title: "Employees",
        url: "/employees",
      },
    ],
  },
  {
    title: "Storefront",
    icon: ShoppingCart,
    url: "#",
    allowedRoles: ["business_head", "sub_admin"],
    items: [{ title: "Edit Storefront", url: "/storefront" }],
  },
  {
    title: "Reports",
    icon: BarChart2,
    url: "#",
    items: [{ title: "Reports Overview", url: "/reports" }],
  },
  {
    title: "Payment",
    icon: DollarSign,
    url: "#",
    allowedRoles: ["business_head", "sub_admin"],
    items: [
      { title: "View Balance", url: "/payment" },
      { title: "Transaction History", url: "/transaction-history" },
    ],
  },
  {
    title: "Templates",
    icon: BookAIcon,
    url: "#",
    allowedRoles: ["business_head", "sub_admin"],
    items: [
      { title: "Email", url: "/email-templates" },
      { title: "Landing Page", url: "/landing-page-templates" },
    ],
  },
]

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const { open } = useSidebar()

  if (!user) return null

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b-2 py-3 pb-2">
        <div className="flex items-center justify-center gap-2 px-2">
          {open ? (
            <div className="flex items-center gap-3">
              <img
                src={user.company?.logo_url || ""}
                alt="Company Logo"
                className="max-h-12 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems
            .filter(
              (item) =>
                !item.allowedRoles || item.allowedRoles.includes(user.user_type)
            )
            .map((item) => {
              const visibleSubItems =
                item.items?.filter(
                  (sub) =>
                    !sub.allowedRoles ||
                    sub.allowedRoles.includes(user.user_type)
                ) || []

              if (
                item.items &&
                item.items.length > 0 &&
                visibleSubItems.length === 0
              ) {
                return null
              }

              const hasItems = visibleSubItems.length > 0
              const isActive =
                location.pathname.startsWith(item.url) && item.url !== "#"

              if (hasItems) {
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="my-1 rounded-lg transition-all duration-200 hover:bg-primary/10"
                        >
                          <div className="relative">
                            <div className="absolute top-1/2 -left-2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-opacity group-data-[state=open]/collapsible:opacity-100" />
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {visibleSubItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className="my-1 rounded-lg transition-all duration-200 hover:bg-primary/10"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5 text-primary" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
