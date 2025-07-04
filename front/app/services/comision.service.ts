const API_BASE_URL = 'http://localhost:3000/api'

export interface Comision {
  id: number
  asesorId: number
  periodo: string // "2024-07"
  creditosAprobados: number
  montoTotalGestionado: number
  comisionBase: number
  bonificaciones: number
  deducciones: number
  comisionTotal: number
  estado: 'Pendiente' | 'Aprobado' | 'Pagado' | 'Rechazado'
  fechaCalculo: string
  fechaPago?: string
  metodoPago?: 'Transferencia' | 'Efectivo' | 'Cheque'
  numeroTransferencia?: string
  observaciones?: string
  asesor?: {
    id: number
    nombre: string
    email: string
    cargo: string
    sucursal?: string
  }
}

export interface ResumenComision {
  periodo: string
  totalAsesores: number
  totalComisiones: number
  pendientes: number
  aprobados: number
  pagados: number
  rechazados: number
}

export interface CalcularComisionRequest {
  periodo: string // "2024-07"
}

export interface CalcularComisionResponse {
  message: string
  periodo: string
  asesoresConComision: number
  totalComisiones: number
  comisiones: Comision[]
}

export const ComisionService = {
  getComisiones: async (periodo?: string, estado?: string): Promise<Comision[]> => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams()
    if (periodo) params.append('periodo', periodo)
    if (estado) params.append('estado', estado)
    
    const response = await fetch(`${API_BASE_URL}/comisiones?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener comisiones')
    }

    return response.json()
  },

  calcularComisiones: async (data: CalcularComisionRequest): Promise<CalcularComisionResponse> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/comisiones/calcular`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Error al calcular comisiones')
    }

    return response.json()
  },

  updateComision: async (id: number, data: Partial<Comision>): Promise<Comision> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/comisiones/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Error al actualizar comisión')
    }

    return response.json()
  },

  aprobarComisiones: async (comisionIds: number[]): Promise<{ message: string; aprobadas: number }> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/comisiones/aprobar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comisionIds }),
    })

    if (!response.ok) {
      throw new Error('Error al aprobar comisiones')
    }

    return response.json()
  },

  getResumen: async (): Promise<ResumenComision[]> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/comisiones/resumen`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener resumen de comisiones')
    }

    return response.json()
  },
}