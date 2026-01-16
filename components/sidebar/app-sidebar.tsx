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
import LocaleSwitcher from "@/components/LocaleSwitcher";
import Footer from "@/components/Footer";
import {ModeToggle} from "@/components/ModeToggle";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navMain = [
    { title: "dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "bookings", url: "/admin/bookings", icon: NotebookPen },
    { title: "clients", url: "/admin/clients", icon: User },
    { title: "services", url: "/admin/services", icon: Frame },
    { title: "categories", url: "/admin/services-categories", icon: Settings2 },
    { title: "specialists", url: "/admin/specialists", icon: Scissors },
    { title: "integrations", url: "/admin/integrations", icon: Cable },

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
      <div className={`flex items-center justify-center ${state === 'expanded' ? '' : " flex-col"}`}>
        <LocaleSwitcher isMobile={state === 'collapsed'}/>
        <div className={`w-[1px] h-4 bg-border mx-1 ${state === 'collapsed' && 'hidden'}`} />
        <ModeToggle />
      </div>



      { state === 'expanded' ?
        (
          <Button onClick={() => {router.push('/')}} className='m-4'>
            <Home/> {t("navbar.menu.home")}
          </Button>
        )  :
        (
          <Button variant={"ghost"} onClick={() => {router.push('/')}}>
            <Home/>
          </Button>
        ) }


      <SidebarRail />
    </Sidebar>
  )
}
