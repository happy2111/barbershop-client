"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-9 w-9 p-0 hover:bg-accent/50 transition-all active:scale-95"
        >
          {/* Анимация вращения иконок как в оригинале, но в стиле вашего Navbar */}
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="rounded-[1.5rem] p-2 min-w-[120px] backdrop-blur-xl bg-background/80 border-border shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`rounded-[1rem] px-4 py-2 text-sm mb-1 ${theme === 'light' ? 'bg-accent' : ''}`}
        >
          {/* Можно добавить иконку здесь для красоты */}
          Светлая
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`rounded-[1rem] px-4 py-2 text-sm mb-1 ${theme === 'dark' ? 'bg-accent' : ''}`}
        >
          Темная
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`rounded-[1rem] px-4 py-2 text-sm ${theme === 'system' ? 'bg-accent' : ''}`}
        >
          Системная
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}