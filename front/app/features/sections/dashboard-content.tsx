import { useEffect, useState } from "react"
import { TrendingUp, Wallet, Clock, CheckCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/kpi-card/kpi-card"
import { ActivityItem } from "@/components/activity-item/activity-item"
import { DashboardService } from "@/services/dashboard.service"
import type { DashboardKPI } from "@/services/dashboard.service"

export function DashboardContent() {
  const [creditosProceso, setCreditosProceso] = useState<DashboardKPI | null>(null)
  const [montoSolicitudes, setMontoSolicitudes] = useState<DashboardKPI | null>(null)
  const [tasaAprobacion, setTasaAprobacion] = useState<DashboardKPI | null>(null)
  const [tiempoPromedio, setTiempoPromedio] = useState<DashboardKPI | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [creditos, monto, tasa, tiempo] = await Promise.all([
          DashboardService.getCreditosProceso(),
          DashboardService.getMontoSolicitudes(),
          DashboardService.getTasaAprobacion(),
          DashboardService.getTiempoPromedio()
        ])
        setCreditosProceso(creditos)
        setMontoSolicitudes(monto)
        setTasaAprobacion(tasa)
        setTiempoPromedio(tiempo)
      } catch (error) {
        console.log(error);
        console.error('Error al cargar datos del dashboard:', error)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Créditos en Proceso" 
          value={creditosProceso?.creditos_en_proceso?.toString() || '0'} 
          change={creditosProceso?.variacion_semanal || ''} 
          icon={Clock} 
        />
        <KpiCard 
          title="Monto en Solicitudes" 
          value={montoSolicitudes?.monto_en_solicitudes || '$0'} 
          change={montoSolicitudes?.variacion_mensual || ''} 
          icon={Wallet} 
        />
        <KpiCard 
          title="Tasa de Aprobación" 
          value={`${tasaAprobacion?.tasa_aprobacion || 0}%`} 
          change={tasaAprobacion?.variacion_mensual || ''} 
          icon={CheckCircle} 
        />
        <KpiCard 
          title="Tiempo Promedio" 
          value={`${Math.abs(Number(tiempoPromedio?.tiempo_promedio_dias || 0))} días`} 
          change={tiempoPromedio?.variacion_mensual || ''} 
          icon={TrendingUp} 
        />
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Solicitudes</CardTitle>
          <CardDescription>Actividad de las últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              type="warning"
              title="Documentación Pendiente"
              description="Crédito Vehicular - $45,000 - Cliente: Ana Martinez"
              time="Hace 15 min"
            />
            <ActivityItem
              type="success"
              title="Crédito Aprobado"
              description="Crédito Personal - $15,000 - Cliente: Carlos Ruiz"
              time="Hace 1 hora"
            />
            <ActivityItem
              type="info"
              title="Nueva Solicitud"
              description="Crédito Hipotecario - $120,000 - Cliente: Luis Mendoza"
              time="Hace 2 horas"
            />
            <ActivityItem
              type="warning"
              title="Solicitud Rechazada"
              description="Crédito Personal - $25,000 - Cliente: Sofia Torres"
              time="Hace 3 horas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Créditos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
            <CardDescription>Porcentaje por tipo de crédito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Personal</span>
                <span className="text-muted-foreground">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Hipotecario</span>
                <span className="text-muted-foreground">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Vehicular</span>
                <span className="text-muted-foreground">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Microempresa</span>
                <span className="text-muted-foreground">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Solicitudes</CardTitle>
            <CardDescription>Distribución actual de solicitudes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Aprobados</span>
                </div>
                <span className="text-muted-foreground">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">En Revisión</span>
                </div>
                <span className="text-muted-foreground">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <span className="font-medium">Pendientes</span>
                </div>
                <span className="text-muted-foreground">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
