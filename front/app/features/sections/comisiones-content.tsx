import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Calculator, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Calendar, Users, Filter } from "lucide-react"
import { ComisionService, type Comision, type ResumenComision } from '@/services/comision.service' 
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { Checkbox } from "@/components/ui/checkbox"

interface ComisionesContentProps {
  onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
}

export function ComisionesContent({ onAddNotification }: ComisionesContentProps) {
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [resumen, setResumen] = useState<ResumenComision[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComisiones, setSelectedComisiones] = useState<number[]>([])
  const [filtros, setFiltros] = useState({
    periodo: '',
    estado: ''
  })
  const [modalCalcular, setModalCalcular] = useState(false)
  const [modalPago, setModalPago] = useState(false)
  const [comisionSeleccionada, setComisionSeleccionada] = useState<Comision | null>(null)
  const [calculandoComisiones, setCalculandoComisiones] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)
  const { toast } = useToast()

  // Estados para el modal de pago
  const [datosPago, setDatosPago] = useState({
    metodoPago: '' as 'Transferencia' | 'Efectivo' | 'Cheque' | '',
    numeroTransferencia: '',
    deducciones: 0,
    observaciones: ''
  })

  useEffect(() => {
    loadData()
  }, [filtros])

  const loadData = async () => {
    try {
      setLoading(true)
      const [comisionesData, resumenData] = await Promise.all([
        ComisionService.getComisiones(filtros.periodo, filtros.estado),
        ComisionService.getResumen()
      ])
      setComisiones(comisionesData)
      setResumen(resumenData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las comisiones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCalcularComisiones = async (periodo: string) => {
    try {
      setCalculandoComisiones(true)
      const resultado = await ComisionService.calcularComisiones({ periodo })
      
      await loadData()
      setModalCalcular(false)

      toast({
        title: "Comisiones calculadas",
        description: `Se calcularon comisiones para ${resultado.asesoresConComision} asesores del periodo ${periodo}`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Comisiones calculadas",
        description: `Periodo ${periodo}: ${resultado.asesoresConComision} asesores con comisiones`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular las comisiones",
        variant: "destructive",
      })
    } finally {
      setCalculandoComisiones(false)
    }
  }

  const handleAprobarComisiones = async () => {
    if (selectedComisiones.length === 0) {
      toast({
        title: "Sin selección",
        description: "Selecciona al menos una comisión para aprobar",
        variant: "destructive",
      })
      return
    }

    try {
      await ComisionService.aprobarComisiones(selectedComisiones)
      await loadData()
      setSelectedComisiones([])

      toast({
        title: "Comisiones aprobadas",
        description: `Se aprobaron ${selectedComisiones.length} comisiones`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Comisiones aprobadas",
        description: `${selectedComisiones.length} comisiones fueron aprobadas`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al aprobar las comisiones",
        variant: "destructive",
      })
    }
  }

  const handlePagarComision = async () => {
    if (!comisionSeleccionada) return

    try {
      setProcesandoPago(true)
      await ComisionService.updateComision(comisionSeleccionada.id, {
        estado: 'Pagado',
        fechaPago: new Date().toISOString(),
        metodoPago: datosPago.metodoPago,
        numeroTransferencia: datosPago.numeroTransferencia,
        deducciones: datosPago.deducciones,
        observaciones: datosPago.observaciones
      })

      await loadData()
      setModalPago(false)
      setComisionSeleccionada(null)
      setDatosPago({
        metodoPago: '',
        numeroTransferencia: '',
        deducciones: 0,
        observaciones: ''
      })

      toast({
        title: "Pago registrado",
        description: `Se registró el pago de la comisión de ${comisionSeleccionada.asesor?.nombre}`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Comisión pagada",
        description: `Pago registrado para ${comisionSeleccionada.asesor?.nombre}`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar el pago",
        variant: "destructive",
      })
    } finally {
      setProcesandoPago(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const configs = {
      'Pendiente': { variant: 'secondary' as const, icon: Clock },
      'Aprobado': { variant: 'default' as const, icon: CheckCircle },
      'Pagado': { variant: 'default' as const, icon: CreditCard },
      'Rechazado': { variant: 'destructive' as const, icon: XCircle }
    }
    
    const config = configs[estado as keyof typeof configs] || configs['Pendiente']
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {estado}
      </Badge>
    )
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(monto)
  }

  const formatearPeriodo = (periodo: string) => {
    const [año, mes] = periodo.split('-')
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return `${meses[parseInt(mes) - 1]} ${año}`
  }

  // Calcular estadísticas
  const totalComisiones = comisiones.reduce((sum, c) => sum + c.comisionTotal, 0)
  const pendientes = comisiones.filter(c => c.estado === 'Pendiente').length
  const aprobados = comisiones.filter(c => c.estado === 'Aprobado').length
  const pagados = comisiones.filter(c => c.estado === 'Pagado').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Comisiones</h2>
        <div className="flex gap-2">
          <Dialog open={modalCalcular} onOpenChange={setModalCalcular}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calcular Comisiones
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calcular Comisiones</DialogTitle>
                <DialogDescription>
                  Selecciona el periodo para calcular las comisiones de los asesores
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="periodo">Periodo (Año-Mes)</Label>
                  <Input
                    id="periodo"
                    type="month"
                    onChange={(e) => {
                      const periodo = e.target.value // formato: "2024-07"
                      if (periodo) {
                        handleCalcularComisiones(periodo)
                      }
                    }}
                    disabled={calculandoComisiones}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalCalcular(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {selectedComisiones.length > 0 && (
            <Button 
              onClick={handleAprobarComisiones}
              className="flex items-center gap-2"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar ({selectedComisiones.length})
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatearMonto(totalComisiones)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comisiones.length} asesores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendientes}</div>
            <p className="text-xs text-muted-foreground">Por aprobar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{aprobados}</div>
            <p className="text-xs text-muted-foreground">Listas para pago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pagados}</div>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comisiones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comisiones">Comisiones</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="comisiones" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Periodo</Label>
                  <Input
                    type="month"
                    value={filtros.periodo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select 
                    value={filtros.estado} 
                    onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value === "todos" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Aprobado">Aprobado</SelectItem>
                      <SelectItem value="Pagado">Pagado</SelectItem>
                      <SelectItem value="Rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFiltros({ periodo: '', estado: '' })}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Comisiones */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Comisiones</CardTitle>
              <CardDescription>
                Gestiona las comisiones de los asesores por periodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedComisiones.length === comisiones.filter(c => c.estado === 'Pendiente').length && comisiones.filter(c => c.estado === 'Pendiente').length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedComisiones(comisiones.filter(c => c.estado === 'Pendiente').map(c => c.id))
                            } else {
                              setSelectedComisiones([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Asesor</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Monto Gestionado</TableHead>
                      <TableHead>Comisión Base</TableHead>
                      <TableHead>Bonificaciones</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comisiones.map((comision) => (
                      <TableRow key={comision.id}>
                        <TableCell>
                          {comision.estado === 'Pendiente' && (
                            <Checkbox
                              checked={selectedComisiones.includes(comision.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedComisiones(prev => [...prev, comision.id])
                                } else {
                                  setSelectedComisiones(prev => prev.filter(id => id !== comision.id))
                                }
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{comision.asesor?.nombre}</div>
                            <div className="text-sm text-muted-foreground">{comision.asesor?.cargo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatearPeriodo(comision.periodo)}</TableCell>
                        <TableCell>{comision.creditosAprobados}</TableCell>
                        <TableCell>{formatearMonto(comision.montoTotalGestionado)}</TableCell>
                        <TableCell>{formatearMonto(comision.comisionBase)}</TableCell>
                        <TableCell>{formatearMonto(comision.bonificaciones)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatearMonto(comision.comisionTotal)}
                        </TableCell>
                        <TableCell>{getEstadoBadge(comision.estado)}</TableCell>
                        <TableCell>
                          {comision.estado === 'Aprobado' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setComisionSeleccionada(comision)
                                setModalPago(true)
                              }}
                            >
                              Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Histórico</CardTitle>
              <CardDescription>
                Resumen de comisiones por periodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Asesores</TableHead>
                      <TableHead>Total Comisiones</TableHead>
                      <TableHead>Pendientes</TableHead>
                      <TableHead>Aprobadas</TableHead>
                      <TableHead>Pagadas</TableHead>
                      <TableHead>Rechazadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.map((item) => (
                      <TableRow key={item.periodo}>
                        <TableCell className="font-medium">
                          {formatearPeriodo(item.periodo)}
                        </TableCell>
                        <TableCell>{item.totalAsesores}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatearMonto(item.totalComisiones)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.pendientes}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{item.aprobados}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{item.pagados}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{item.rechazados}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Pago */}
      <Dialog open={modalPago} onOpenChange={setModalPago}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago de Comisión</DialogTitle>
            <DialogDescription>
              Registra el pago de la comisión para {comisionSeleccionada?.asesor?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Comisión Total</Label>
                <div className="text-2xl font-bold text-green-600">
                  {comisionSeleccionada && formatearMonto(comisionSeleccionada.comisionTotal)}
                </div>
              </div>
              <div>
                <Label>Periodo</Label>
                <div className="text-lg">
                  {comisionSeleccionada && formatearPeriodo(comisionSeleccionada.periodo)}
                </div>
              </div>
            </div>

            <div>
              <Label>Método de Pago</Label>
              <Select 
                value={datosPago.metodoPago} 
                onValueChange={(value: 'Transferencia' | 'Efectivo' | 'Cheque') => 
                  setDatosPago(prev => ({ ...prev, metodoPago: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {datosPago.metodoPago === 'Transferencia' && (
              <div>
                <Label>Número de Transferencia</Label>
                <Input
                  value={datosPago.numeroTransferencia}
                  onChange={(e) => setDatosPago(prev => ({ ...prev, numeroTransferencia: e.target.value }))}
                  placeholder="Ingresa el número de transferencia"
                />
              </div>
            )}

            <div>
              <Label>Deducciones (opcional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={datosPago.deducciones}
                onChange={(e) => setDatosPago(prev => ({ ...prev, deducciones: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Observaciones (opcional)</Label>
              <Textarea
                value={datosPago.observaciones}
                onChange={(e) => setDatosPago(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones sobre el pago..."
                rows={3}
              />
            </div>

            {datosPago.deducciones > 0 && comisionSeleccionada && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                <p className="text-sm font-medium">Cálculo final:</p>
                <p className="text-sm">
                  Comisión Base: {formatearMonto(comisionSeleccionada.comisionBase + comisionSeleccionada.bonificaciones)}
                </p>
                <p className="text-sm">
                  Deducciones: -{formatearMonto(datosPago.deducciones)}
                </p>
                <p className="text-sm font-bold">
                  Total a pagar: {formatearMonto(comisionSeleccionada.comisionBase + comisionSeleccionada.bonificaciones - datosPago.deducciones)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPago(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePagarComision}
              disabled={!datosPago.metodoPago || procesandoPago}
            >
              {procesandoPago ? "Procesando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}