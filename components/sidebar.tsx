"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Briefcase, CreditCard, LayoutDashboard, Settings } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Clientes",
      href: "/clientes",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Serviços",
      href: "/servicos",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: "Débitos",
      href: "/debitos",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">Sistema de Gestão</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

