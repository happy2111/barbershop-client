"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function LocaleSwitcher(props: { isMobile: boolean }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale })
      router.refresh()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-9 px-3 gap-2 hover:bg-accent/50 transition-all active:scale-95"
        >
          <Languages className="h-4 w-4 opacity-70" />
          {!props.isMobile && (
            <span className={`${props.isMobile && '!hidden'}` + "text-xs font-bold uppercase tracking-wider"}>
              {locale}
            </span>
          )}


        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="rounded-[1.5rem] p-2 min-w-[140px] backdrop-blur-xl bg-background/80 border-border shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => switchLocale("ru")}
          className={`
            rounded-[1rem] px-4 py-2 text-sm transition-colors mb-1
            ${locale === "ru" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}
          `}
        >
          Русский (RU)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("uz")}
          className={`
            rounded-[1rem] px-4 py-2 text-sm transition-colors
            ${locale === "uz" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}
          `}
        >
          O'zbekchа (UZ)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}