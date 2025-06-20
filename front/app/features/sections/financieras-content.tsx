import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { useState, useEffect } from "react"
import { AddModal } from "@/components/add-modals/add-modals"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { ActionModals } from "@/components/action-modals/action-modals"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FinancieraService, type Financiera } from "@/services/financiera.service"


const filterOptions = [
  {
    key: "especializacion",
    label: "Especialización",
    options: [
      { label: "Créditos personales", value: "Créditos personales" },
      { label: "Microcréditos", value: "Microcréditos" },
      { label: "Créditos vehiculares", value: "Créditos vehiculares" },
      { label: "Créditos empresariales", value: "Créditos empresariales" },
      { label: "Créditos hipotecarios", value: "Créditos hipotecarios" },
    ],
  },
  {
    key: "estado",
    label: "Estado",
    options: [
      { label: "Activa", value: "Activa" },
      { label: "Revisión", value: "Revisión" },
      { label: "Inactiva", value: "Inactiva" },
    ],
  },
  {
    key: "rangoTasa",
    label: "Rango de Tasa",
    options: [
      { label: "Baja (< 15%)", value: "baja" },
      { label: "Media (15% - 20%)", value: "media" },
      { label: "Alta (> 20%)", value: "alta" },
    ],
  },
]

interface FinancierasContentProps {
  onAddNotification?: (notification: Omit<Notification, "id" | "timestamp">) => void
}

export function FinancierasContent({ onAddNotification }: FinancierasContentProps) {
  const [financierasData, setFinancierasData] = useState<Financiera[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "view" | "edit" | "delete" | null
    data: Financiera | null
  }>({ isOpen: false, action: null, data: null })
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadFinancieras()
  }, [])

  const loadFinancieras = async () => {
    try {
      const data = await FinancieraService.getFinancieras()
      setFinancierasData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las financieras",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Generar estadoVariant basado en el estado
  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case "Activa":
        return "default" as const
      case "Inactiva":
        return "destructive" as const
      default:
        return "secondary" as const
    }
  }

  // Filtrar datos
  const filteredData = financierasData.filter((financiera) => {
    // Filtro de búsqueda
    if (
      filters.search &&
      !financiera.nombre.toLowerCase().includes(filters.search.toLowerCase()) &&
      !financiera.especializacion.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Filtro de especialización
    if (filters.especializacion && financiera.especializacion !== filters.especializacion) {
      return false
    }

    // Filtro de estado
    if (filters.estado && financiera.estado !== filters.estado) {
      return false
    }

    // Filtro de rango de tasa
    if (filters.rangoTasa) {
      const tasa = Number.parseFloat(financiera?.tasaPromedio.replace("%", ""))
      if (filters.rangoTasa === "baja" && tasa >= 15) return false
      if (filters.rangoTasa === "media" && (tasa < 15 || tasa > 20)) return false
      if (filters.rangoTasa === "alta" && tasa <= 20) return false
    }

    return true
  })

  // Paginación
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Generar nuevo ID
  const generateNewId = () => {
    const maxId = Math.max(...financierasData.map((f) => Number.parseInt(f.id)))
    return (maxId + 1).toString()
  }

  // Handlers para acciones
  const handleViewFinanciera = (financiera: any) => {
    setModalState({ isOpen: true, action: "view", data: financiera })
  }

  const handleEditFinanciera = (financiera: any) => {
    setModalState({ isOpen: true, action: "edit", data: financiera })
  }

  const handleDeleteFinanciera = (financiera: any) => {
    setModalState({ isOpen: true, action: "delete", data: financiera })
  }

  const handleSaveFinanciera = async (data: Financiera) => {
    try {
      if (data.id) {
        await FinancieraService.updateFinanciera(data.id, data)
        setFinancierasData((prev) =>
          prev.map((financiera) =>
            financiera.id === data.id ? { ...data, estadoVariant: getEstadoVariant(data.estado) } : financiera
          )
        )
        toast({
          title: "Financiera actualizada",
          description: `Los datos de ${data.nombre} han sido actualizados correctamente.`,
          variant: "success",
        })
      }

      if (onAddNotification) {
        onAddNotification({
          type: "success",
          title: "Financiera actualizada",
          description: `Se actualizó la información de ${data.nombre}`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la financiera",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!modalState.data?.id) return

    try {
      await FinancieraService.deleteFinanciera(modalState.data.id)
      setFinancierasData((prev) => prev.filter((financiera) => financiera.id !== modalState.data?.id))

      toast({
        title: "Financiera eliminada",
        description: `${modalState.data.nombre} ha sido eliminada del sistema.`,
        variant: "destructive",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "warning",
          title: "Financiera eliminada",
          description: `Se eliminó a ${modalState.data.nombre} del sistema`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la financiera",
        variant: "destructive",
      })
    }
  }

  const handleAddFinanciera = async (data: Omit<Financiera, 'id'>) => {
    try {
      const newFinanciera = await FinancieraService.createFinanciera({
        ...data,
        creditosActivos: 0,
        montoTotal: "$0M",
      })

      setFinancierasData((prev) => [{ ...newFinanciera, estadoVariant: getEstadoVariant(newFinanciera.estado) }, ...prev])

      toast({
        title: "Financiera agregada",
        description: `${data.nombre} ha sido agregada al sistema correctamente.`,
        variant: "success",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "success",
          title: "Nueva financiera agregada",
          description: `Se registró a ${data.nombre} en el sistema`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la financiera",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financieras</h2>
        <Button onClick={() => setAddModalOpen(true)}>Nueva Financiera</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instituciones Financieras</CardTitle>
          <CardDescription>Administra las financieras aliadas y sus especialidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableFilter
            onFilterChange={setFilters}
            filterOptions={filterOptions}
            placeholder="Buscar por nombre o especialización..."
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Financiera</TableHead>
                  <TableHead>Especialización</TableHead>
                  <TableHead>Créditos Activos</TableHead>
                  <TableHead>Monto Total</TableHead>
                  <TableHead>Tasa Promedio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((financiera) => (
                    <TableRow key={financiera.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{financiera.nombre}</TableCell>
                      <TableCell>{financiera.especializacion}</TableCell>
                      <TableCell>{financiera.creditosActivos}</TableCell>
                      <TableCell>{financiera.montoTotal}</TableCell>
                      <TableCell>{financiera.tasaPromedio}</TableCell>
                      <TableCell>
                        <Badge variant={financiera.estadoVariant}>{financiera.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <TableActions
                          row={financiera}
                          onView={handleViewFinanciera}
                          onEdit={handleEditFinanciera}
                          onDelete={handleDeleteFinanciera}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
        type="financiera"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveFinanciera}
        onDelete={handleDeleteConfirm}
      />

      <AddModal
        type="financiera"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddFinanciera}
      />
    </div>
  )
}

