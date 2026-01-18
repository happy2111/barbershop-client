"use client"

import {
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { authStore } from "@/stores/auth.store"
import {usePathname, useRouter} from "next/navigation";

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()


  const logout = authStore(state => state.logout)

  const user = authStore((state) => state.user)

  if (!user) return null

  const initials =
    user.name?.slice(0, 2).toUpperCase() ||
    user.phone?.slice(-2)

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const currentPhoto = user?.photo
    ? `${process.env.NEXT_PUBLIC_API_URL}${user.photo}`
    : undefined;


  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={currentPhoto}
                  alt={user.name || "User"}
                  className={"w-full h-full object-cover"}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name || "No name"}</span>
                <span className="truncate text-xs">{user.phone}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={currentPhoto}
                    alt={user.name || "User"}
                    className={"w-full h-full object-cover"}
                  />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1">
                  <span className="truncate font-medium">{user.name || "No name"}</span>
                  <span className="truncate text-xs">{user.phone}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                logout()
                router.push(`/${locale}`)
              }}
                               className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
