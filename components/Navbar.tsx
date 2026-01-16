'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronUp, LogIn, Menu, User, LogOut, Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { authStore } from "@/stores/auth.store"
import LocaleSwitcher from "@/components/LocaleSwitcher"
import { useTranslations } from 'next-intl'

const Navbar = () => {
  const t = useTranslations()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Состояния для скрытия при скролле
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  // Эффект для отслеживания направления скролла
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Если открыто бургер-меню, навбар всегда виден
      if (isMenuOpen) {
        setIsVisible(true)
        return
      }

      // Если скроллим вверх (current < last) — показываем
      // Если скроллим вниз (current > last) — скрываем
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        setIsVisible(false) // Скрываем при скролле вниз
      } else {
        setIsVisible(true) // Показываем при скролле вверх
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMenuOpen])

  const isAuthenticated = authStore(state => state.isAuth())
  const logout = authStore(state => state.logout)

  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0]

  const secondSeg = segments[1]
  const isHome = segments.length === 1
  const isSpecialist = secondSeg === 'specialist'
  const isLogin = secondSeg === 'login'

  if (!isHome && !isSpecialist && !isLogin) return null

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMenuOpen(false)
  }

  return (
    <>
      <header
        className={`
          fixed left-0 right-0 z-50 px-4 pointer-events-none 
          sm:top-2 top-[calc(var(--tg-safe-top)+50px)]
          transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
      >
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div
            className={`
            transition-all duration-300 ease-in-out border
            bg-card/80 backdrop-blur-md border-border shadow-sm overflow-hidden
            will-change-[height, transform]
            rounded-[2rem] mt-2
          `}
          >
            {/* Верхняя панель */}
            <div className="flex items-center justify-between px-5 py-2 h-12">
              <Link
                href={`/${locale || ''}`}
                className="text-lg font-bold tracking-tight hover:text-muted-foreground transition-colors ml-1"
              >
                {process.env.NEXT_PUBLIC_TITLE || t('navbar.title')}
              </Link>

              <div className="flex items-center gap-1">
                <LocaleSwitcher isMobile={false} />
                <Button
                  onClick={() => setIsMenuOpen(p => !p)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-9 w-9 p-0 hover:bg-accent/50 transition-colors"
                >
                  <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
                    {isMenuOpen ? <ChevronUp className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </div>
                </Button>
              </div>
            </div>

            {/* Контент меню */}
            <div
              className={`
              grid transition-[grid-template-rows,opacity,border-top] duration-300 ease-in-out
              ${isMenuOpen ? 'grid-rows-[1fr] opacity-100 border-t' : 'grid-rows-[0fr] opacity-0 border-t-transparent'}
            `}
            >
              <div className="overflow-hidden">
                <nav className="p-3 flex flex-col gap-1">
                  <MenuButton
                    icon={<Home className="h-4 w-4" />}
                    label={t('navbar.menu.home')}
                    onClick={() => handleNavigation(`/${locale}`)}
                  />

                  {isAuthenticated ? (
                    <>
                      <MenuButton
                        icon={<User className="h-4 w-4" />}
                        label={t('navbar.menu.personal_cabinet')}
                        onClick={() => handleNavigation(`/${locale}/specialist/profile`)}
                      />
                      <div className="h-px bg-border my-1 mx-3" />
                      <MenuButton
                        icon={<LogOut className="h-4 w-4" />}
                        label={t('navbar.menu.logout')}
                        variant="destructive"
                        onClick={() => {
                          logout()
                          setIsMenuOpen(false)
                          router.push(`/${locale}`)
                        }}
                      />
                    </>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full justify-start gap-3 h-11 px-5 rounded-[1.5rem] mt-1 transition-transform active:scale-95"
                      onClick={() => handleNavigation(`/${locale}/login`)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('navbar.menu.login_for_specialists')}</span>
                    </Button>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Отступ под навбаром */}
      <div className="relative py-9 flex"></div>
    </>
  )
}

const MenuButton = ({ icon, label, onClick, variant = "default" }: any) => (
  <Button
    variant="ghost"
    className={`
      justify-start gap-3 w-full h-11 px-5 rounded-[1.5rem] transition-all
      active:scale-[0.98]
      ${variant === 'destructive' ? 'text-destructive hover:bg-destructive/10' : 'hover:bg-accent'}
    `}
    onClick={onClick}
  >
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </Button>
)

export default Navbar