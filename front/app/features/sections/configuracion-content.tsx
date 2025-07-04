"use client"

import { useState } from "react"
import { Save, User, Eye, EyeOff, Lock, Settings, Bell, Globe, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { AuthService } from "@/services/auth.service"

interface ConfiguracionContentProps {
  onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
}

interface PerfilData {
  nombre: string
  email: string
  telefono: string
  cargo: string
  bio: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ShowPasswords {
  current: boolean
  new: boolean
  confirm: boolean
}

interface SystemConfig {
  theme: string
  language: string
  timezone: string
  emailNotifications: boolean
  autoSave: boolean
}

export function ConfiguracionContent({ onAddNotification }: ConfiguracionContentProps) {
  const { toast } = useToast()

  // Estados del perfil
  const [perfilData, setPerfilData] = useState<PerfilData>({
    nombre: "Juan Pérez",
    email: "juan.perez@creditpro.com",
    telefono: "+1 234 567 8900",
    cargo: "Administrador",
    bio: "Administrador del sistema de gestión de créditos con 5 años de experiencia.",
  })

  // Estados de contraseña
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  })

  // Estados de carga
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingSystem, setIsLoadingSystem] = useState(false)

  // Estados del sistema
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    theme: "sistema",
    language: "es",
    timezone: "america/bogota",
    emailNotifications: true,
    autoSave: true
  })

  // Manejador para guardar perfil
  const handleSaveProfile = async () => {
    setIsLoadingProfile(true)
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido guardada correctamente.",
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Perfil actualizado",
        description: "Se actualizó la información del perfil de usuario",
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Manejador para cambiar contraseña
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsLoadingPassword(true)
    try {
      // Obtener userId del localStorage o contexto de autenticación
      const userId = localStorage.getItem('userId') || localStorage.getItem('user_id') || "1"
      
      const response = await AuthService.cambiarPassword({
        userId,
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Contraseña actualizada correctamente",
          variant: "success",
        })
        
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })

        onAddNotification({
          type: "success",
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente",
          read: false,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Error al cambiar la contraseña",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cambiar la contraseña. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPassword(false)
    }
  }

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Manejador para guardar configuración del sistema
  const handleSaveSystemConfig = async () => {
    setIsLoadingSystem(true)
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Configuración guardada",
        description: "La configuración del sistema ha sido actualizada correctamente.",
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Configuración actualizada",
        description: "Se guardaron las preferencias del sistema",
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSystem(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuración</h2>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Configuración de Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    value={perfilData.nombre}
                    onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={perfilData.email}
                    onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={perfilData.telefono}
                    onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select
                    value={perfilData.cargo}
                    onValueChange={(value) => setPerfilData({ ...perfilData, cargo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Asesor Senior">Asesor Senior</SelectItem>
                      <SelectItem value="Asesor">Asesor</SelectItem>
                      <SelectItem value="Analista">Analista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoadingProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoadingProfile ? "Guardando..." : "Guardar Perfil"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={isLoadingPassword}>
                    <Lock className="mr-2 h-4 w-4" />
                    {isLoadingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración del Sistema */}
        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>Configuraciones generales y preferencias del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Tema de la aplicación
                    </Label>
                    <Select 
                      value={systemConfig.theme}
                      onValueChange={(value) => setSystemConfig({ ...systemConfig, theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claro">🌞 Claro</SelectItem>
                        <SelectItem value="oscuro">🌙 Oscuro</SelectItem>
                        <SelectItem value="sistema">💻 Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma
                    </Label>
                    <Select 
                      value={systemConfig.language}
                      onValueChange={(value) => setSystemConfig({ ...systemConfig, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Zona horaria
                  </Label>
                  <Select 
                    value={systemConfig.timezone}
                    onValueChange={(value) => setSystemConfig({ ...systemConfig, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/bogota">🇨🇴 América/Bogotá (UTC-5)</SelectItem>
                      <SelectItem value="america/mexico_city">🇲🇽 América/México (UTC-6)</SelectItem>
                      <SelectItem value="america/lima">🇵🇪 América/Lima (UTC-5)</SelectItem>
                      <SelectItem value="america/caracas">🇻🇪 América/Caracas (UTC-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">
                        Notificaciones por email
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones importantes por correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={systemConfig.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSystemConfig({ ...systemConfig, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-save" className="text-base">
                        Auto-guardado
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Guarda automáticamente los cambios mientras trabajas
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={systemConfig.autoSave}
                      onCheckedChange={(checked) => 
                        setSystemConfig({ ...systemConfig, autoSave: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSystemConfig} disabled={isLoadingSystem}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoadingSystem ? "Guardando..." : "Guardar Configuración"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default ConfiguracionContent
