const API_BASE_URL = 'http://localhost:3000/api'

export interface DashboardKPI {
  value: number
  variation: number
  trend: 'up' | 'down' | 'neutral'
}

export const DashboardService = {
  // Obtener créditos en proceso
  getCreditosProceso: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/creditos-proceso`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener créditos en proceso')
    return response.json()
  },

  // Obtener monto total de solicitudes
  getMontoSolicitudes: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/monto-solicitudes`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener monto de solicitudes')
    return response.json()
  },

  // Obtener tasa de aprobación
  getTasaAprobacion: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/tasa-aprobacion`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener tasa de aprobación')
    return response.json()
  },

  // Obtener tiempo promedio
  getTiempoPromedio: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/tiempo-promedio`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener tiempo promedio')
    return response.json()
  },
}
