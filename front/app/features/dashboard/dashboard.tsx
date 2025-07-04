// Compare this snippet from dashboard.tsx:"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Header } from "@/components/header/header"
import { DashboardContent } from "@/features/sections/dashboard-content"
import { ClientesContent } from "@/features/sections/clientes-content"
import { AsesoresContent } from "@/features/sections/asesores-content"
import { BancosContent } from "@/features/sections/bancos-content"
import { FinancierasContent } from "@/features/sections/financieras-content"
import { ObjetivosContent } from "@/features/sections/objetivos-content"
import { CreditosContent } from "@/features/sections/creditos-content"
import { ComisionesContent } from "@/features/sections/comisiones-content"
import { ReportesContent } from "@/features/sections/reportes-content"
import { ConfiguracionContent } from "@/features/sections/configuracion-content"
import { Toaster } from "@/components/toaster/toaster"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { ThemeProvider } from "@/components/theme-provider/theme-provider"


export default function Component() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "Bienvenido al sistema",
      description: "Sistema de gestión de créditos iniciado correctamente",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
      read: false,
    }
  ])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications([])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const renderContent = () => {
    switch (activeSection) {
      case "clientes":
        return <ClientesContent onAddNotification={addNotification} />
      case "asesores":
        return <AsesoresContent onAddNotification={addNotification} />
      case "bancos":
        return <BancosContent onAddNotification={addNotification} />
      case "financieras":
        return <FinancierasContent onAddNotification={addNotification} />
      case "objetivos":
        return <ObjetivosContent onAddNotification={addNotification} />
      case "reportes":
        return <ReportesContent />
      case "creditos":
        return <CreditosContent onAddNotification={addNotification}/>
      case "comisiones":
        return <ComisionesContent onAddNotification={addNotification} />
      case "configuracion":
        return <ConfiguracionContent onAddNotification={addNotification} />
      default:
        return <DashboardContent />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar estático */}
        <div className="hidden border-r bg-muted/40 md:block">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col">
          <Header
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onRemoveNotification={removeNotification}
          />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{renderContent()}</main>
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
