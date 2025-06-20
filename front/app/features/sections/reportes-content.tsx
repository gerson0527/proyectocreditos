
import { useState, useEffect } from "react"
import { Download, FileText, TrendingUp, BarChart3, PieChart, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-picker-range/date-picker-range"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportesService } from "@/services/reportes.service"
import type { ReportePeriodo, ReporteAsesor} from "@/services/reportes.service"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"
import { TablePagination } from "@/components/table-pagination/table-pagination"


const reportesData = {
  bancosPorVolumen: [
    { banco: "Banco Nacional", creditos: 456, monto: 18500000, participacion: 35 },
    { banco: "Banco Popular", creditos: 342, monto: 14200000, participacion: 27 },
    { banco: "Banco Internacional", creditos: 567, monto: 22700000, participacion: 43 },
    { banco: "Banco Regional", creditos: 234, monto: 8900000, participacion: 17 },
  ],
  financierasPorVolumen: [
    { financiera: "Banco Nacional", creditos: 456, monto: 18500000, participacion: 35 },
    { financiera: "Banco Popular", creditos: 342, monto: 14200000, participacion: 27 },
    { financiera: "Banco Internacional", creditos: 567, monto: 22700000, participacion: 43 },
    { financiera: "Banco Regional", creditos: 234, monto: 8900000, participacion: 17 },
  ]
}



export function ReportesContent() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("mes")
  const [selectedReport, setSelectedReport] = useState("general")
  const [loading, setLoading] = useState(false)

 
  
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const today = new Date()
    const firstDayLastMonth = new Date()
    firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1)
    firstDayLastMonth.setDate(1)
    return {
      from: firstDayLastMonth,
      to: today,
    }
  })
  const [reportData, setReportData] = useState<{
    periodo: ReportePeriodo | null,
    asesores: ReporteAsesor[],
    creditosPorMes: {
      mes: string,
      mes_num: number,
      aprobados: string,
      rechazados: string,
      pendientes: string
    }[],
    resumenBancos: {
      banco: string,
      creditos: number,
      monto: number,
      participacion: number
    }[],
    resumenFinancieras: {
      financiera: string,
      creditos: number,
      monto: number,
      participacion: number
    }[],
    resumenEstados: {
      estado: string,
      cantidad: number,
      porcentaje: number
    }[]
  }>({    
    periodo: null,
    asesores: [],
    creditosPorMes: [],
    resumenBancos: [],
    resumenFinancieras: [],
    resumenEstados: []
  })

  useEffect(() => {
    loadReportData()
  }, [date])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
  }
  const loadReportData = async () => {
    setLoading(true)
    try {
      const selectedYear = date?.from?.getFullYear() || new Date().getFullYear()

      const [periodo, asesores, creditosPorMes, resumenBancos, resumenFinancieras, resumenEstados] = await Promise.all([
        ReportesService.getReportePeriodo(date?.from?.toISOString() || '', date?.to?.toISOString() || ''),
        ReportesService.getTopAsesores(),
        ReportesService.getCreditosPormes(selectedYear),
        ReportesService.getResumenPorBanco(),
        ReportesService.getResumenPorFinanciera(),
        ReportesService.getResumenPorEstado()
      ])
      setReportData({
        periodo,
        asesores,
        creditosPorMes,
        resumenBancos,
        resumenFinancieras,
        resumenEstados
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los datos del reporte",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
}

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      const blob = await ReportesService.exportarReporte(format, {
        periodo: selectedPeriod,
        tipoReporte: selectedReport
      })
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${selectedReport}_${new Date().toISOString()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al exportar el reporte en formato ${format}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const totalItems = reportData.asesores.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return reportData.asesores.slice(startIndex, endIndex)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }
  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')} disabled={loading}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros de Reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Rango de Fechas</label>
              <DatePickerWithRange onDateChange={handleDateChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen Ejecutivo</TabsTrigger>
          <TabsTrigger value="creditos">Análisis de Créditos</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          {/* KPIs del Período */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.periodo ? reportData.periodo.creditosAprobados + reportData.periodo.creditosRechazados + reportData.periodo.creditosPendientes : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monto Desembolsado</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${reportData.periodo ? 
                    (reportData.periodo.montoTotal).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })  
                    : '0'
                  }              
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.periodo ? reportData.periodo.tasaAprobacion.toFixed(1) + '%' : '0%'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${reportData.periodo ? (reportData.periodo.comisionesTotal / 1000).toFixed(0) + 'K' : '0'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendencias */}
          <Card>
          <CardHeader>
            <CardTitle>Tendencia de Créditos por Mes</CardTitle>
            <CardDescription>
              Evolución de aprobaciones, rechazos y pendientes
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {reportData.creditosPorMes &&
                reportData.creditosPorMes.map((mes, index) => {
                  const aprobados = Number(mes.aprobados);
                  const rechazados = Number(mes.rechazados);
                  const pendientes = Number(mes.pendientes);
                  const total = aprobados + rechazados + pendientes || 1; // evita división por 0

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium">{mes.mes}</div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Aprobados: {aprobados}</span>
                          <span>Rechazados: {rechazados}</span>
                          <span>Pendientes: {pendientes}</span>
                        </div>

                        <div className="flex space-x-1 h-2 rounded overflow-hidden">
                          <div
                            className="bg-green-500"
                            style={{ width: `${(aprobados / total) * 100}%` }}
                          ></div>
                          <div
                            className="bg-red-500"
                            style={{ width: `${(rechazados / total) * 100}%` }}
                          ></div>
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${(pendientes / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        </TabsContent>

        <TabsContent value="creditos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Distribución por Banco */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Banco</CardTitle>
                <CardDescription>Volumen de créditos por institución</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.resumenBancos.map((banco, index) => {
                    const montoMillones = parseFloat(banco.total_monto) ;
                    const participacion = (parseFloat(banco.total_monto) / reportData.resumenBancos.reduce((acc, curr) => acc + parseFloat(curr.total_monto), 0)) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{banco.banco}</span>
                          <span className="text-sm text-muted-foreground">{banco.total_creditos} créditos</span>
                        </div>
                        <Progress value={participacion} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${montoMillones.toFixed()}</span>
                          <span>{participacion.toFixed()}% del total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Financiera */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por financiera</CardTitle>
                <CardDescription>Volumen de créditos por institución</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.resumenFinancieras.map((financiera, index) => {
                    const montoMillones = parseFloat(financiera.total_monto);
                    const participacion = (parseFloat(financiera.total_monto) / reportData.resumenFinancieras.reduce((acc, curr) => acc + parseFloat(curr.total_monto), 0)) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{financiera.banco}</span>
                          <span className="text-sm text-muted-foreground">{financiera.total_creditos} créditos</span>
                        </div>
                        <Progress value={participacion} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${montoMillones.toFixed()}</span>
                          <span>{participacion.toFixed()}% del total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estados de Créditos */}
            <Card>
              <CardHeader>
                <CardTitle>Estados de Créditos</CardTitle>
                <CardDescription>Distribución actual de estados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.resumenEstados.map((estado, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${estado.estado === 'Aprobado' ? 'bg-green-500' : estado.estado === 'En Proceso' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{estado.estado}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{estado.cantidad}</div>
                        <div className="text-xs text-muted-foreground">{estado.porcentaje}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Asesores</CardTitle>
                <CardDescription>Rendimiento por asesor en el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posición</TableHead>
                      <TableHead>Asesor</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Monto Gestionado</TableHead>
                      <TableHead>Comisiones</TableHead>
                      <TableHead>Rendimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageData().map((asesor, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={asesor.Posicion <= 3 ? "default" : "secondary"}>
                            #{asesor.Posicion}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{asesor.Asesor}</TableCell>
                        <TableCell>{asesor.Creditos}</TableCell>
                        <TableCell>{asesor['Monto Gestionado']}</TableCell>
                        <TableCell>{asesor.Comisiones}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 text-xs">{asesor.Rendimiento}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
