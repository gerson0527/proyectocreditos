const API_BASE_URL = 'http://localhost:3000/api'

export interface ReportePeriodo {
  creditosAprobados: number
  creditosRechazados: number
  creditosPendientes: number
  montoTotal: number
  tasaAprobacion: number
  comisionesTotal: number
}

export interface ReporteCredito {
  creditosAprobados: number
  creditosRechazados: number
  creditosPendientes: number
  mesnum: number
  mes: string
}

export interface ReporteAsesor {
  id: number
  nombre: string
  creditos: number
  montoGestionado: number
  comisiones: number
  rendimiento: number
}

export interface ResumenBanco {
  banco: string
  total_creditos: number
  total_monto: number
}

export interface ResumenFinanciera {
  banco: string
  total_creditos: number
  total_monto: number
}

export interface ResumenEstado {
  estado: string
  cantidad: number
  porcentaje: number
}

export const ReportesService = {
  getReportePeriodo: async (fechaInicio: string, fechaFin: string): Promise<ReportePeriodo> => {
    const response = await fetch(`${API_BASE_URL}/reportes/periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el reporte del período')
    return response.json()
  },

  getTopAsesores: async (): Promise<ReporteAsesor[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/asesores/rankingasesores`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el ranking de asesores')
    return response.json()
  },

  getCreditosPormes: async (ano: number): Promise<ReporteCredito> => {
    const response = await fetch(`${API_BASE_URL}/reportes/creditos/meses?year=${ano}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener todos los meses de los creditos')
    return response.json()
  },

  // Agregar estos métodos al objeto ReportesService
  getResumenPorBanco: async (): Promise<ResumenBanco[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/resumen/bancos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el resumen por banco')
    return response.json()
  },

  getResumenPorFinanciera: async (): Promise<ResumenFinanciera[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/resumen/financieras`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el resumen por financiera')
    return response.json()
  },

  getResumenPorEstado: async (): Promise<ResumenEstado[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/resumen/estados`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el resumen por estado')
    return response.json()
  },

  exportarReporte: async (tipo: 'pdf' | 'excel', filtros: any): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/reportes/exportar/${tipo}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filtros),
    })
    if (!response.ok) throw new Error(`Error al exportar el reporte en formato ${tipo}`)
    return response.blob()
  },
}

