'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {ChevronUp, LogIn, Menu, User} from "lucide-react"
import {usePathname, useRouter} from "next/navigation"
import Link from "next/link"
import { authStore } from "@/stores/auth.store"

const Navbar = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAuthenticated = authStore(state => state.isAuth())
  const user = authStore(state => state.user)

  const pathname = usePathname()

  if (pathname !== '/' && !pathname.startsWith('/specialist') && !pathname.startsWith('/login')) {
    return null
  }

  return (
    <div className="bg-background py-8 px-4 text-foreground">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          {process.env.NEXT_PUBLIC_TITLE || "Название по умолчанию"}
        </Link>

        <Button
          onClick={() => setIsMenuOpen(p => !p)}
          variant="outline"
        >
          {isMenuOpen ? <ChevronUp /> : <Menu />}
        </Button>
      </div>

      <div
        className={`
          max-w-2xl mx-auto overflow-hidden transition-all duration-300
          ${isMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="bg-card border rounded-lg p-6 mt-6">
          <nav className="flex flex-col gap-4">

            {isAuthenticated ? (
              <Button
                variant="ghost" // Кнопка в меню лучше смотрится без заливки
                className="justify-start gap-2 w-full"
                onClick={() => {
                  router.push('/specialist/profile')
                  setIsMenuOpen(false)
                }}
              >
                <User className="h-4 w-4" />
                Личный кабинет
              </Button>
            ) : (
              <Button
                variant="default"
                className="justify-start gap-2 w-full"
                onClick={() => {
                  router.push('/login')
                  setIsMenuOpen(false)
                }}
              >
                <LogIn className="h-4 w-4" />
                Вход для мастеров
              </Button>
            )}

          </nav>
        </div>
      </div>
    </div>
  )
}

export default Navbar
