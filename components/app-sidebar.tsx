"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Cable,
  Frame, Scissors,
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
    { title: "Бронирование", url: "/admin/bookings", icon: BookOpen },
    { title: "Клиенты", url: "/admin/clients", icon: User },
    { title: "Услуги", url: "/admin/services", icon: Frame },
    { title: "Категории услуг", url: "/admin/services-categories", icon: Settings2 },
    { title: "Специалисты", url: "/admin/specialists", icon: Scissors  },
    { title: "Интеграции", url: "/admin/integrations", icon: Cable  },

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
