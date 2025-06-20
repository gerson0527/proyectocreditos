
import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { useToast } from "@/hooks/use-toast"
import { ActionModals } from "@/components/action-modals/action-modals"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { AddModal } from "@/components/add-modals/add-modals"
import { ClienteService, type Cliente } from '@/services/cliente.service'

const filterOptions = [
  {
    key: "estado",
    label: "Estado",
    options: [
      { label: "Activo", value: "Activo" },
      { label: "Pendiente", value: "Pendiente" },
      { label: "Inactivo", value: "Inactivo" },
    ],
  },
  {
    key: "creditosActivos",
    label: "Créditos Activos",
    options: [
      { label: "Sin créditos", value: "0" },
      { label: "1 crédito", value: "1" },
      { label: "2 o más", value: "2+" },
    ],
  },
]

interface ClientesContentProps {
  onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
}


export function ClientesContent({ onAddNotification }: ClientesContentProps) {
  const [clientesData, setClientesData] = useState([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
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

  // Generar estadoVariant basado en el estado
  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "default" as const
      case "Inactivo":
        return "destructive" as const
      default:
        return "secondary" as const
    }
  }

  // Filtrar datos
  const filteredData = clientesData.filter((cliente) => {
    // Filtro de búsqueda
    if (
      filters.search &&
      !cliente.nombre.toLowerCase().includes(filters.search.toLowerCase()) &&
      !cliente.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Filtro de estado
    if (filters.estado && cliente.estado !== filters.estado) {
      return false
    }

    // Filtro de créditos activos
    if (filters.creditosActivos) {
      if (filters.creditosActivos === "0" && cliente.creditosActivos !== 0) return false
      if (filters.creditosActivos === "1" && cliente.creditosActivos !== 1) return false
      if (filters.creditosActivos === "2+" && cliente.creditosActivos < 2) return false
    }

    return true
  })

  // Paginación
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Generar nuevo ID
  const generateNewId = () => {
    const maxId = Math.max(...clientesData.map((c) => Number.parseInt(c.id)))
    return (maxId + 1).toString()
  }

  // Handlers para acciones
  const handleViewCliente = (cliente: any) => {
    setModalState({ isOpen: true, action: "view", data: cliente })
  }

  const handleEditCliente = (cliente: any) => {
    setModalState({ isOpen: true, action: "edit", data: cliente })
  }

  const handleDeleteCliente = (cliente: any) => {
    setModalState({ isOpen: true, action: "delete", data: cliente })
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await ClienteService.getClientes()
        console.log(data)
        setClientesData(data.map(cliente => ({
          ...cliente,
          estadoVariant: getEstadoVariant(cliente.estado)
        })))
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      }
    }
    loadClientes()
  }, [])

  const handleSaveCliente = async (data: any) => {
    try {
      const updatedCliente = await ClienteService.updateCliente(data.id, data)
      setClientesData(prev =>
        prev.map(cliente =>
          cliente.id === data.id
            ? { ...updatedCliente, estadoVariant: getEstadoVariant(updatedCliente.estado) }
            : cliente
        )
      )

      toast({
        title: "Cliente actualizado",
        description: `Los datos de ${data.nombre} han sido actualizados correctamente.`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Cliente actualizado",
        description: `Se actualizó la información de ${data.nombre}`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const clienteName = modalState.data?.nombre
      const clienteId = modalState.data?.id

      await ClienteService.deleteCliente(clienteId)
      setClientesData(prev => prev.filter(cliente => cliente.id !== clienteId))

      toast({
        title: "Cliente eliminado",
        description: `${clienteName} ha sido eliminado del sistema.`,
        variant: "destructive",
      })

      onAddNotification({
        type: "warning",
        title: "Cliente eliminado",
        description: `Se eliminó a ${clienteName} del sistema`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleAddCliente = async (data: any) => {
    try {
      const newCliente = await ClienteService.createCliente({
        nombre: data.nombre,
        apellido: data.apellido, // Cambiar de Apellido a apellido
        email: data.email,
        dni: data.dni,
        telefono: data.telefono,
        direccion: data.direccion,
        fechanacimiento: data.fechanacimiento,
        ingresosMensuales: parseFloat(data.ingresos), // Cambiar de ingresos a ingresosMensuales
        estado: data.estado,
      })
      setClientesData(prev => [
        { ...newCliente, estadoVariant: getEstadoVariant(newCliente.estado) },
        ...prev
      ])

      toast({
        title: "Cliente agregado",
        description: `${data.nombre} ha sido agregado al sistema correctamente.`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Nuevo cliente agregado",
        description: `Se registró a ${data.nombre} en el sistema`,
        read: false,
      })
    } catch (error) {
      console.error(error)  // Agrega esta línea para imprimir el error en la consola
      toast({
        title: "Error",
        description: "No se pudo agregar el cliente",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
        <Button onClick={() => setAddModalOpen(true)}>Nuevo Cliente</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Administra la información de tus clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableFilter
            onFilterChange={setFilters}
            filterOptions={filterOptions}
            placeholder="Buscar por nombre o email..."
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Créditos Activos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>{cliente.creditosActivos}</TableCell>
                      <TableCell>
                        <Badge variant={cliente.estadoVariant}>{cliente.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <TableActions
                          row={cliente}
                          onView={handleViewCliente}
                          onEdit={handleEditCliente}
                          onDelete={handleDeleteCliente}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
        type="cliente"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveCliente}
        onDelete={handleDeleteConfirm}
      />

      <AddModal type="cliente" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddCliente} />
    </div>
  )
}
