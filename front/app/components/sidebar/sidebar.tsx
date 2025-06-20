import { Building2, DollarSign, CreditCard, FileText, Home, Target, UserCheck, Users, Settings, LogOut } from "lucide-react"
import { AuthService } from '@/services/auth.service'
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  className?: string
  onLogout?: () => void
}

const sidebarItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Clientes", id: "clientes" },
  { icon: UserCheck, label: "Asesores", id: "asesores" },
  { icon: Building2, label: "Bancos", id: "bancos" },
  { icon: CreditCard, label: "Financieras", id: "financieras" },
  { icon: DollarSign, label: "Créditos", id: "creditos" },
  { icon: Target, label: "Objetivos", id: "objetivos" },
  { icon: FileText, label: "Reportes", id: "reportes" },
  { icon: Settings, label: "Configuración", id: "configuracion" },
]

export function Sidebar({ activeSection, onSectionChange, className = "" }: SidebarProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Cerrando sesión')
    try {
      await AuthService.logout()
      navigate('/')
      toast({
        title: 'Cierre de sesión',
        description: 'Has cerrado sesión exitosamente',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className={`flex h-full max-h-screen flex-col bg-muted/40 fixed top-0 left-0 w-[220px] lg:w-[280px] ${className}`}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-5 font-semibold">
          <CreditCard className="h-6 w-6" />
          <span>CreditPro</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col justify-between">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-5 gap-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all hover:bg-muted hover:text-primary ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-5 gap-3 border-t ">
          <button
            onClick={handleLogout}
            className="flex items-center cursor-pointer gap-3 rounded-lg px-3 py-3 text-left transition-all hover:bg-muted hover:text-primary text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </div>
  )
}
