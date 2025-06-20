import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader,CardDescription, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { useState,useEffect  } from "react"
import { AddModal } from "@/components/add-modals/add-modals"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { TableActions } from "@/components/table-actions/table-actions"
import { TableFilter } from "@/components/table-filter/table-filter"
import { ActionModals } from "@/components/action-modals/action-modals"
import { ObjetivoService } from "@/services/objetivo.service"

const filterOptions = [
  {
    key: "tipo",
    label: "Tipo",
    options: [
      { label: "VENTAS", value: "VENTAS" },
      { label: "COLOCACION", value: "COLOCACION" },
      { label: "CAPTACION", value: "CAPTACION" },
    ],
  },
  {
    key: "estado",
    label: "Estado",
    options: [
      { label: "EN_PROGRESO", value: "EN_PROGRESO" },
      { label: "COMPLETADO", value: "COMPLETADO" },
    ],
  },
  {
    key: "prioridad",
    label: "Prioridad",
    options: [
      { label: "ALTA", value: "ALTA" },
      { label: "MEDIA", value: "MEDIA" },
      { label: "BAJA", value: "BAJA" },
    ],
  },
]

interface ObjetivosContentProps {
  onAddNotification?: (notification: Omit<Notification, "id" | "timestamp">) => void
}

export function ObjetivosContent({ onAddNotification }: ObjetivosContentProps) {


  const [objetivosData, setObjetivosData] = useState<Objetivo[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "view" | "edit" | "delete" | null
    data: any
  }>({
    isOpen: false,
    action: null,
    data: null,
  })
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadObjetivos()
  }, [])

  // Actualizar el loadObjetivos para manejar la respuesta de la API
  const loadObjetivos = async () => {
    try {
      setLoading(true)
      const response = await ObjetivoService.getAllObjetivos()
      setObjetivosData(response.data.map(objetivo => ({
        ...objetivo,
        estadoVariant: getEstadoVariant(objetivo.estado.toLowerCase()),
        prioridadVariant: getPrioridadVariant(objetivo.prioridad.toLowerCase())
      })))
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los objetivos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Actualizar las funciones de variantes para los nuevos valores
  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'success';
      case 'en progreso':
        return 'warning';
      case 'pendiente':
        return 'secondary';
      case 'rechazado':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getPrioridadVariant = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'warning';
      case 'baja':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Filtrar datos
  const filteredData = objetivosData.filter((objetivo) => {
    // Filtro de búsqueda
    if (
      filters.search &&
      !objetivo.titulo.toLowerCase().includes(filters.search.toLowerCase()) &&
      !objetivo.responsable.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Filtro de tipo
    if (filters.tipo && objetivo.tipo !== filters.tipo) {
      return false
    }

    // Filtro de estado
    if (filters.estado && objetivo.estado !== filters.estado) {
      return false
    }

    // Filtro de prioridad
    if (filters.prioridad && objetivo.prioridad !== filters.prioridad) {
      return false
    }

    // Filtro de responsable
    if (filters.responsable && objetivo.responsable !== filters.responsable) {
      return false
    }

    return true
  })

  // Paginación
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Calcular progreso
  const calcularProgreso = (objetivo: any) => {
    if (objetivo.tipo === "Tasa" && objetivo.titulo.includes("Reducir")) {
      // Para objetivos de reducción, el progreso es inverso
      return Math.max(0, Math.min(100, (objetivo.meta / objetivo.actual) * 100))
    }
    return Math.min(100, (objetivo.actual / objetivo.meta) * 100)
  }

  // Formatear valor
  const formatearValor = (valor: number, unidad: string) => {
    switch (unidad) {
      case "pesos":
        return `$${(valor / 1000000).toFixed(1)}M`
      case "porcentaje":
        return `${valor}%`
      default:
        return valor.toString()
    }
  }

  // Handlers para acciones
  const handleViewObjetivo = (objetivo: any) => {
    setModalState({ isOpen: true, action: "view", data: objetivo })
  }

  const handleEditObjetivo = (objetivo: any) => {
    setModalState({ isOpen: true, action: "edit", data: objetivo })
  }

  const handleDeleteObjetivo = (objetivo: any) => {
    setModalState({ isOpen: true, action: "delete", data: objetivo })
  }

  const handleSaveObjetivo = async (data: Partial<Objetivo>) => {
    try {
      let updatedObjetivo
      if (data.id) {
        updatedObjetivo = await ObjetivoService.updateObjetivo(data.id, data)
      } else {
        updatedObjetivo = await ObjetivoService.createObjetivo(data as Omit<Objetivo, 'id'>)
      }

      await loadObjetivos()

      toast({
        title: "Objetivo actualizado",
        description: `El objetivo "${updatedObjetivo.titulo}" ha sido actualizado correctamente.`,
        variant: "success",
      })

      if (onAddNotification) { 
        onAddNotification({
          type: "success",
          title: "Objetivo actualizado",
          description: `Se actualizó el objetivo: ${updatedObjetivo.titulo}`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el objetivo",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!modalState.data?.id) return

    try {
      await ObjetivoService.deleteObjetivo(modalState.data.id)
      await loadObjetivos()

      toast({
        title: "Objetivo eliminado",
        description: `El objetivo "${modalState.data.titulo}" ha sido eliminado del sistema.`,
        variant: "destructive",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "warning",
          title: "Objetivo eliminado",
          description: `Se eliminó el objetivo: ${modalState.data.titulo}`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el objetivo",
        variant: "destructive",
      })
    }
  }

  const handleAddObjetivo = async (data: Omit<Objetivo, 'id'>) => {
    try {
      const newObjetivo = await ObjetivoService.createObjetivo(data)
      await loadObjetivos()

      toast({
        title: "Objetivo creado",
        description: `El objetivo "${newObjetivo.titulo}" ha sido creado correctamente.`,
        variant: "success",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "info",
          title: "Nuevo objetivo creado",
          description: `Se creó el objetivo: ${newObjetivo.titulo}`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el objetivo",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Objetivos y Metas</h2>
        <Button onClick={() => setAddModalOpen(true)}>Nuevo Objetivo</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Objetivos</CardTitle>
          <CardDescription>Administra y da seguimiento a los objetivos del equipo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableFilter
            onFilterChange={setFilters}
            filterOptions={filterOptions}
            placeholder="Buscar por título o responsable..."
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((objetivo) => {
                    const progreso = objetivo.progreso ?? 0; // usa progreso real si existe
                    return (
                      <TableRow key={objetivo.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{objetivo.titulo}</TableCell>
                        <TableCell>{objetivo.tipo}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{objetivo.meta} {objetivo.unidad}</span>
                            </div>
                            <Progress value={progreso} className="w-20" />
                            <div className="text-xs text-center">{progreso}%</div>
                          </div>
                        </TableCell>
                        <TableCell>{objetivo.asesor?.nombre || 'Sin asignar'}</TableCell>
                        <TableCell>
                          {objetivo.fechaFin
                            ? new Date(objetivo.fechaFin).toLocaleDateString('es-ES')
                            : 'Sin fecha'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={objetivo.estadoVariant}>
                            {objetivo.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={objetivo.prioridadVariant}>
                            {objetivo.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TableActions
                            row={objetivo}
                            onView={handleViewObjetivo}
                            onEdit={handleEditObjetivo}
                            onDelete={handleDeleteObjetivo}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
        type="objetivo"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveObjetivo}
        onDelete={handleDeleteConfirm}
      />

      <AddModal
        type="objetivo"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddObjetivo}
      />
    </div>
  )
}

