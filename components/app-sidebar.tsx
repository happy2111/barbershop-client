"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Settings2,
  SquareTerminal,
  User
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navMain = [
    { title: "Bookings", url: "/admin/bookings", icon: BookOpen },
    { title: "Clients", url: "/admin/clients", icon: Bot },
    { title: "Services", url: "/admin/services", icon: Frame },
    { title: "Service Categories", url: "/admin/services-categories", icon: Settings2 },
    { title: "Specialists", url: "/admin/specialists", icon: User },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter />

      <SidebarRail />
    </Sidebar>
  )
}
