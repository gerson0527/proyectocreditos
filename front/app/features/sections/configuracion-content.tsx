"use client"

import { useState } from "react"
import { Save, User, Bell, Shield, Palette, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"

interface ConfiguracionContentProps {
  onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
}

export function ConfiguracionContent({ onAddNotification }: ConfiguracionContentProps) {
  const { toast } = useToast()

  // Estados para configuraciones
  const [perfilData, setPerfilData] = useState({
    nombre: "Juan Pérez",
    email: "juan.perez@creditpro.com",
    telefono: "+1 234 567 8900",
    cargo: "Administrador",
    bio: "Administrador del sistema de gestión de créditos con 5 años de experiencia.",
  })

  const [notificacionesConfig, setNotificacionesConfig] = useState({
    emailNotificaciones: true,
    pushNotificaciones: true,
    creditosAprobados: true,
    creditosRechazados: true,
    nuevosClientes: true,
    reportesSemanales: false,
    alertasSeguridad: true,
  })

  const [sistemaConfig, setSistemaConfig] = useState({
    idioma: "es",
    timezone: "America/Mexico_City",
    formatoFecha: "DD/MM/YYYY",
    moneda: "MXN",
    decimales: 2,
  })

  const [seguridadConfig, setSeguridadConfig] = useState({
    autenticacionDosFactor: false,
    sesionAutomatica: true,
    tiempoSesion: "8",
    loginNotificaciones: true,
  })

  const handleSaveProfile = () => {
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
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notificaciones configuradas",
      description: "Tus preferencias de notificaciones han sido guardadas.",
      variant: "success",
    })

    onAddNotification({
      type: "info",
      title: "Configuración actualizada",
      description: "Se actualizaron las preferencias de notificaciones",
      read: false,
    })
  }

  const handleSaveSystem = () => {
    toast({
      title: "Configuración del sistema",
      description: "Las configuraciones del sistema han sido aplicadas.",
      variant: "success",
    })

    onAddNotification({
      type: "success",
      title: "Sistema configurado",
      description: "Se aplicaron las nuevas configuraciones del sistema",
      read: false,
    })
  }

  const handleSaveSecurity = () => {
    toast({
      title: "Seguridad actualizada",
      description: "Las configuraciones de seguridad han sido guardadas.",
      variant: "success",
    })

    onAddNotification({
      type: "warning",
      title: "Seguridad actualizada",
      description: "Se modificaron las configuraciones de seguridad",
      read: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuración</h2>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
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
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe tu experiencia y rol en la empresa..."
                  value={perfilData.bio}
                  onChange={(e) => setPerfilData({ ...perfilData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cambio de Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline">Cambiar Contraseña</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Métodos de Notificación */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Métodos de Notificación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibe notificaciones en tu correo electrónico</p>
                    </div>
                    <Switch
                      checked={notificacionesConfig.emailNotificaciones}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, emailNotificaciones: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones en tiempo real en el navegador
                      </p>
                    </div>
                    <Switch
                      checked={notificacionesConfig.pushNotificaciones}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, pushNotificaciones: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tipos de Notificaciones */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tipos de Notificaciones</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Créditos Aprobados</Label>
                    <Switch
                      checked={notificacionesConfig.creditosAprobados}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, creditosAprobados: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Créditos Rechazados</Label>
                    <Switch
                      checked={notificacionesConfig.creditosRechazados}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, creditosRechazados: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Nuevos Clientes</Label>
                    <Switch
                      checked={notificacionesConfig.nuevosClientes}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, nuevosClientes: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Reportes Semanales</Label>
                    <Switch
                      checked={notificacionesConfig.reportesSemanales}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, reportesSemanales: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Alertas de Seguridad</Label>
                    <Switch
                      checked={notificacionesConfig.alertasSeguridad}
                      onCheckedChange={(checked) =>
                        setNotificacionesConfig({ ...notificacionesConfig, alertasSeguridad: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Notificaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración del Sistema */}
        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración Regional
              </CardTitle>
              <CardDescription>Configura el idioma, zona horaria y formatos de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select
                    value={sistemaConfig.idioma}
                    onValueChange={(value) => setSistemaConfig({ ...sistemaConfig, idioma: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select
                    value={sistemaConfig.timezone}
                    onValueChange={(value) => setSistemaConfig({ ...sistemaConfig, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formato-fecha">Formato de Fecha</Label>
                  <Select
                    value={sistemaConfig.formatoFecha}
                    onValueChange={(value) => setSistemaConfig({ ...sistemaConfig, formatoFecha: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={sistemaConfig.moneda}
                    onValueChange={(value) => setSistemaConfig({ ...sistemaConfig, moneda: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                      <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="decimales">Decimales en Moneda</Label>
                <Select
                  value={sistemaConfig.decimales.toString()}
                  onValueChange={(value) => setSistemaConfig({ ...sistemaConfig, decimales: Number.parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 decimales</SelectItem>
                    <SelectItem value="2">2 decimales</SelectItem>
                    <SelectItem value="4">4 decimales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveSystem}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Sistema
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Apariencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema</Label>
                  <p className="text-sm text-muted-foreground">Cambia entre tema claro, oscuro o automático</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>Configura las opciones de seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <Switch
                    checked={seguridadConfig.autenticacionDosFactor}
                    onCheckedChange={(checked) =>
                      setSeguridadConfig({ ...seguridadConfig, autenticacionDosFactor: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mantener Sesión Iniciada</Label>
                    <p className="text-sm text-muted-foreground">Recordar tu sesión en este dispositivo</p>
                  </div>
                  <Switch
                    checked={seguridadConfig.sesionAutomatica}
                    onCheckedChange={(checked) => setSeguridadConfig({ ...seguridadConfig, sesionAutomatica: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones de Inicio de Sesión</Label>
                    <p className="text-sm text-muted-foreground">Recibe alertas cuando alguien acceda a tu cuenta</p>
                  </div>
                  <Switch
                    checked={seguridadConfig.loginNotificaciones}
                    onCheckedChange={(checked) =>
                      setSeguridadConfig({ ...seguridadConfig, loginNotificaciones: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="tiempo-sesion">Tiempo de Sesión (horas)</Label>
                <Select
                  value={seguridadConfig.tiempoSesion}
                  onValueChange={(value) => setSeguridadConfig({ ...seguridadConfig, tiempoSesion: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="8">8 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="168">1 semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Seguridad
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actividad de la Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad de la Cuenta</CardTitle>
              <CardDescription>Revisa la actividad reciente de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Último inicio de sesión</p>
                    <p className="text-xs text-muted-foreground">Hoy a las 09:30 AM desde Chrome</p>
                  </div>
                  <div className="text-xs text-muted-foreground">IP: 192.168.1.100</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Cambio de contraseña</p>
                    <p className="text-xs text-muted-foreground">Hace 15 días</p>
                  </div>
                  <div className="text-xs text-muted-foreground">Exitoso</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Configuración actualizada</p>
                    <p className="text-xs text-muted-foreground">Hace 2 días</p>
                  </div>
                  <div className="text-xs text-muted-foreground">Notificaciones</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
