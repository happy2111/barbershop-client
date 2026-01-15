"use client"

import * as React from "react"
import {
  Cable,
  Frame, Home, LayoutDashboard, NotebookPen, Scissors,
  Settings2,
  User
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail, useSidebar,
} from "@/components/ui/sidebar"
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {useRouter} from "@/i18n/navigation";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navMain = [
    { title: "Дашборд", url: "/admin/dashboard", icon: LayoutDashboard  },
    { title: "Бронирование", url: "/admin/bookings", icon: NotebookPen },
    { title: "Клиенты", url: "/admin/clients", icon: User },
    { title: "Услуги", url: "/admin/services", icon: Frame },
    { title: "Категории услуг", url: "/admin/services-categories", icon: Settings2 },
    { title: "Специалисты", url: "/admin/specialists", icon: Scissors  },
    { title: "Интеграции", url: "/admin/integrations", icon: Cable  },

  ]

  const router = useRouter()

  const t = useTranslations()

  const {state} = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter/>
      { state === 'expanded' ?
        (
          <Button onClick={() => {router.push('/')}} className='m-4'>
            <Home/> {t("navbar.menu.home")}
          </Button>
        )  :
        (
          <Button variant={"ghost"} onClick={() => {router.push('/')}} className='m-4'>
            <Home/>
          </Button>
        ) }


      <SidebarRail />
    </Sidebar>
  )
}
