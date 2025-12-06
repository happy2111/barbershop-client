"use client"

import { usePathname } from "next/navigation"

export function useBreadcrumbs() {
  const pathname = usePathname()

  const parts = pathname
    .split("/")
    .filter(Boolean)

  const breadcrumbs = parts.map((part, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/")
    const label = part
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase())

    return { href, label }
  })

  return breadcrumbs
}
