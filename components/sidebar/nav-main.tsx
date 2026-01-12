"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // 1. Импортируем хук
} from "@/components/ui/sidebar"
import Link from "next/link";

export function NavMain({
                          items,
                        }: {
  items: {
    title: string
    url: string
    icon: React.ComponentType<any>
  }[]
}) {
  // 2. Получаем функцию управления мобильным сайдбаром
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = () => {
    // 3. Если мы на мобильном устройстве, закрываем сайдбар после клика
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link
                  href={item.url}
                  className='font-semibold text-[17px]'
                  onClick={handleClick} // 4. Добавляем обработчик
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}