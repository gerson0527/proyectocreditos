"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { ActionModals } from "@/components/action-modals/action-modals"
import { AddModal } from "@/components/add-modals/add-modals"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { useEffect } from "react"
import { CreditoService, type Credito } from "@/services/credito.service"
  
  const filterOptions = [
    {
      key: "estado",
      label: "Estado",
      options: [
        { label: "Pendiente", value: "Pendiente" },
        { label: "En Revisión", value: "En Revisión" },
        { label: "Aprobado", value: "Aprobado" },
        { label: "Desembolsado", value: "Desembolsado" },
        { label: "Activo", value: "Activo" },
        { label: "Rechazado", value: "Rechazado" },
        { label: "Documentos Pendientes", value: "Documentos Pendientes" },
      ],
    },
    {
      key: "tipo",
      label: "Tipo de Crédito",
      options: [
        { label: "Personal", value: "Personal" },
        { label: "Vehicular", value: "Vehicular" },
        { label: "Hipotecario", value: "Hipotecario" },
        { label: "Empresarial", value: "Empresarial" },
        { label: "Microcrédito", value: "Microcrédito" },
      ],
    },
    {
      key: "banco",
      label: "Banco/Financiera",
      options: [
        { label: "Banco Nacional", value: "Banco Nacional" },
        { label: "Banco Popular", value: "Banco Popular" },
        { label: "Banco Internacional", value: "Banco Internacional" },
        { label: "Banco Regional", value: "Banco Regional" },
        { label: "Financiera ABC", value: "Financiera ABC" },
        { label: "Hogar Financiera", value: "Hogar Financiera" },
        { label: "MicroFinanzas Plus", value: "MicroFinanzas Plus" },
        { label: "Financiera Rápida", value: "Financiera Rápida" },
      ],
    },
    {
      key: "asesor",
      label: "Asesor",
      options: [
        { label: "Ana Rodríguez", value: "Ana Rodríguez" },
        { label: "Carlos Mendoza", value: "Carlos Mendoza" },
        { label: "Roberto Silva", value: "Roberto Silva" },
        { label: "Laura Martínez", value: "Laura Martínez" },
        { label: "Patricia Gómez", value: "Patricia Gómez" },
      ],
    },
    {
      key: "rangoMonto",
      label: "Rango de Monto",
      options: [
        { label: "Hasta $25K", value: "bajo" },
        { label: "$25K - $75K", value: "medio" },
        { label: "$75K - $150K", value: "alto" },
        { label: "Más de $150K", value: "premium" },
      ],
    },
  ]
  
  interface CreditosContentProps {
    onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  }
  
  export function CreditosContent({ onAddNotification }: CreditosContentProps) {
    const [creditosData, setCreditosData] = useState<Credito[]>([])
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [loading, setLoading] = useState(false)
    const [modalState, setModalState] = useState<{
      isOpen: boolean
      action: "view" | "edit" | "delete" | null
      data: Credito | null
    }>({
      isOpen: false,
      action: null,
      data: null,
    })
    const [addModalOpen, setAddModalOpen] = useState(false)
  
    const { toast } = useToast()
  
    // Generar estadoVariant basado en el estado
    const getEstadoVariant = (estado: string) => {
      switch (estado) {
        case "Aprobado":
        case "Desembolsado":
        case "Activo":
          return "default" as const
        case "Rechazado":
          return "destructive" as const
        default:
          return "secondary" as const
      }
    }
  
    // Filtrar datos
    const filteredData = creditosData.filter((credito) => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const clienteNombre = credito.cliente ? `${credito.cliente.nombre} ${credito.cliente.apellido}`.toLowerCase() : ''
        const bancoNombre = credito.banco ? credito.banco.nombre.toLowerCase() : ''
        const financieraNombre = credito.financiera ? credito.financiera.nombre.toLowerCase() : ''
        const creditoId = credito.id ? credito.id.toLowerCase() : ''

        if (!clienteNombre.includes(searchTerm) &&
            !creditoId.includes(searchTerm) &&
            !bancoNombre.includes(searchTerm) &&
            !financieraNombre.includes(searchTerm)) {
          return false
        }
      }

      // Filtro de estado
      if (filters.estado && credito.estado !== filters.estado) {
        return false
      }

      // Filtro de tipo
      if (filters.tipo && credito.tipo !== filters.tipo) {
        return false
      }

      // Filtro de banco/financiera
      if (filters.banco) {
        const entidadNombre = (credito.banco ? credito.banco.nombre : '') || (credito.financiera ? credito.financiera.nombre : '')
        if (entidadNombre !== filters.banco) {
          return false
        }
      }

      // Filtro de asesor
      if (filters.asesor && (!credito.asesor || credito.asesor.nombre !== filters.asesor)) {
        return false
      }

      // Filtro de rango de monto
      if (filters.rangoMonto) {
        const monto = parseFloat(credito.monto)
        if (filters.rangoMonto === "bajo" && monto > 25000) return false
        if (filters.rangoMonto === "medio" && (monto <= 25000 || monto > 75000)) return false
        if (filters.rangoMonto === "alto" && (monto <= 75000 || monto > 150000)) return false
        if (filters.rangoMonto === "premium" && monto <= 150000) return false
      }

      return true
    })
  
    // Paginación
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  
    // Formatear monto
    const formatearMonto = (monto: number) => {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
      }).format(monto)
    }
  
    // Generar nuevo ID
    const generateNewId = () => {
      const maxId = Math.max(...creditosData.map((c) => Number.parseInt(c.id.split("-")[1])))
      return `CR-${String(maxId + 1).padStart(3, "0")}`
    }
  
    // Handlers para acciones
    const handleViewCredito = (credito: Credito) => {
      setModalState({ isOpen: true, action: "view", data: credito })
    }
  
    const handleEditCredito = (credito: Credito) => {
      setModalState({ isOpen: true, action: "edit", data: credito })
    }
  
    const handleDeleteCredito = (credito: Credito) => {
      setModalState({ isOpen: true, action: "delete", data: credito })
    }
  
    useEffect(() => {
      loadCreditos()
    }, [])
  
    const loadCreditos = async () => {
      try {
        setLoading(true)
        const data = await CreditoService.getCreditos()
        setCreditosData(data.map(credito => ({
          ...credito,
          estadoVariant: getEstadoVariant(credito.estado)
        })))
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los créditos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  
    const handleSaveCredito = async (data: Partial<Credito>) => {
      try {
        let updatedCredito
        if (data.id) {
          updatedCredito = await CreditoService.updateCredito(data.id, data)
        } else {
          updatedCredito = await CreditoService.createCredito(data as Omit<Credito, 'id'>)
        }
  
        await loadCreditos()
  
        toast({
          title: "Crédito actualizado",
          description: `El crédito ${updatedCredito.id} ha sido actualizado correctamente.`,
          variant: "success",
        })
  
        onAddNotification({
          type: "success",
          title: "Crédito actualizado",
          description: `Se actualizó el crédito ${updatedCredito.id}`,
          read: false,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al guardar el crédito",
          variant: "destructive",
        })
      }
    }
  
    const handleDeleteConfirm = async () => {
      if (!modalState.data?.id) return
  
      try {
        await CreditoService.deleteCredito(modalState.data.id)
        await loadCreditos()
  
        toast({
          title: "Crédito eliminado",
          description: `El crédito ${modalState.data.id} ha sido eliminado del sistema.`,
          variant: "destructive",
        })
  
        onAddNotification({
          type: "warning",
          title: "Crédito eliminado",
          description: `Se eliminó el crédito ${modalState.data.id}`,
          read: false,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al eliminar el crédito",
          variant: "destructive",
        })
      }
    }
  
    const handleAddCredito = async (data: Omit<Credito, 'id'>) => {
      try {
        const newCredito = await CreditoService.createCredito(data)
        await loadCreditos()
  
        toast({
          title: "Crédito creado",
          description: `Se ha creado el crédito ${newCredito.id} correctamente.`,
          variant: "success",
        })
  
        onAddNotification({
          type: "success",
          title: "Nuevo crédito creado",
          description: `Se registró el crédito ${newCredito.id}`,
          read: false,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear el crédito",
          variant: "destructive",
        })
      }
    }
  
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestión de Créditos</h2>
          <Button onClick={() => setAddModalOpen(true)}>Nuevo Crédito</Button>
        </div>
  
        {/* Resumen de Estados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditosData.length}</div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {creditosData.filter((c) => c.estado === "Activo" || c.estado === "Desembolsado").length}
              </div>
              <p className="text-xs text-muted-foreground">Créditos vigentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {
                  creditosData.filter(
                    (c) => c.estado === "Pendiente" || c.estado === "En Revisión" || c.estado === "Documentos Pendientes",
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Pendientes de aprobación</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatearMonto(creditosData.reduce((sum, c) => sum + parseFloat(c.monto), 0))}
              </div>
              <p className="text-xs text-muted-foreground">Valor total de cartera</p>
            </CardContent>
          </Card>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Lista de Créditos</CardTitle>
            <CardDescription>Administra todos los créditos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableFilter
              onFilterChange={setFilters}
              filterOptions={filterOptions}
              placeholder="Buscar por ID, cliente o banco..."
            />
  
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Banco/Financiera</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tasa</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((credito) => (
                      <TableRow key={credito.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{credito.id}</TableCell>
                        <TableCell>{credito.cliente ? `${credito.cliente.nombre} ${credito.cliente.apellido}` : 'N/A'}</TableCell>
                        <TableCell>{formatearMonto(parseFloat(credito.monto))}</TableCell>
                        <TableCell>{credito.banco ? credito.banco.nombre : (credito.financiera ? credito.financiera.nombre : 'N/A')}</TableCell>
                        <TableCell>{credito.asesor ? credito.asesor.nombre : 'N/A'}</TableCell>
                        <TableCell>{credito.tipo}</TableCell>
                        <TableCell>
                          <Badge variant={credito.estadoVariant}>{credito.estado}</Badge>
                        </TableCell>
                        <TableCell>{credito.tasa}</TableCell>
                        <TableCell>
                          <TableActions
                            row={credito}
                            onView={handleViewCredito}
                            onEdit={handleEditCredito}
                            onDelete={handleDeleteCredito}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No se encontraron resultados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
  
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
            />
          </CardContent>
        </Card>
  
        <ActionModals
          type="credito"
          action={modalState.action}
          data={modalState.data}
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, action: null, data: null })}
          onSave={handleSaveCredito}
          onDelete={handleDeleteConfirm}
        />
  
        <AddModal type="credito" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddCredito} />
      </div>
    )
  }
