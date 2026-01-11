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

export default function LocaleSwitcher() {
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
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLocale("ru")}
          className={locale === "ru" ? "bg-accent" : ""}
        >
          Русский (RU)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("uz")}
          className={locale === "uz" ? "bg-accent" : ""}
        >
          O'zbekча (UZ)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}