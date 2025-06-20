const API_BASE_URL = 'http://localhost:3000/api'

export interface Credito {
  id?: string
  monto: number
  plazo: number
  tasa: number
  estado: string
  cliente_id: string
  asesor_id: string
  banco_id: string
  Cliente?: any
  Asesor?: any
  Banco?: any
}

export const CreditoService = {
  getCreditos: async (): Promise<Credito[]> => {
    const response = await fetch(`${API_BASE_URL}/creditos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los créditos')
    return response.json()
  },

  getCreditoById: async (id: string): Promise<Credito> => {
    const response = await fetch(`${API_BASE_URL}/creditos/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el crédito')
    return response.json()
  },

  getCreditosByCliente: async (clienteId: string): Promise<Credito[]> => {
    const response = await fetch(`${API_BASE_URL}/creditos/cliente/${clienteId}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los créditos del cliente')
    return response.json()
  },

  getCreditosByAsesor: async (asesorId: string): Promise<Credito[]> => {
    const response = await fetch(`${API_BASE_URL}/creditos/asesor/${asesorId}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los créditos del asesor')
    return response.json()
  },

  createCredito: async (credito: Omit<Credito, 'id'>): Promise<Credito> => {
    const response = await fetch(`${API_BASE_URL}/creditos`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credito),
    })
    if (!response.ok) throw new Error('Error al crear el crédito')
    return response.json()
  },

  updateCredito: async (id: string, credito: Partial<Credito>): Promise<Credito> => {
    const response = await fetch(`${API_BASE_URL}/creditos/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credito),
    })
    if (!response.ok) throw new Error('Error al actualizar el crédito')
    return response.json()
  },

  deleteCredito: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/creditos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al eliminar el crédito')
  },
}