const db = require('../../models');
const { Op } = require('sequelize');
const Credito = db.Credito;
const Asesor = db.Asesor;
const Banco = db.Banco;

exports.getReportePeriodo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Convertir las fechas a objetos Date
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    
    const creditos = await Credito.findAll({
      where: {
        createdAt: {
          [Op.between]: [fechaInicioObj, fechaFinObj]
        }
      }
    });

    const creditosAprobados = creditos.filter(c => c.estado === 'Aprobado').length;
    const creditosRechazados = creditos.filter(c => c.estado === 'Rechazado').length;
    const creditosPendientes = creditos.filter(c => c.estado === 'Pendiente').length;
    const montoTotal = creditos.reduce((sum, c) => sum + (c.estado === 'Aprobado' ? parseFloat(c.monto) : 0), 0);    
    const tasaAprobacion = (creditosAprobados / creditos.length) * 100 || 0;
    const comisionesTotal = creditos.reduce((sum, c) => sum + (c.estado === 'Aprobado' ? c.monto * 0.02 : 0), 0);
    res.json({
      creditosAprobados,
      creditosRechazados,
      creditosPendientes,
      montoTotal,
      tasaAprobacion,
      comisionesTotal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRankingAsesores = async (req, res) => {
  try {
    // Ejecutar la consulta raw SQL usando Sequelize
    const results = await db.sequelize.query(`
      SELECT 
    @posicion := @posicion + 1 AS Posicion,
    subquery.nombre AS Asesor,
    subquery.total_creditos AS Creditos,
    CONCAT('$', FORMAT(subquery.monto_total, 0), 'K') AS 'Monto Gestionado',
    CONCAT('$', FORMAT(subquery.total_creditos * 1000, 0), 'K') AS Comisiones,
    CONCAT(
        REPEAT('█', GREATEST(1, FLOOR((subquery.rendimiento)/20))), 
        ' ', 
        ROUND(subquery.rendimiento, 0), '%'
    ) AS Rendimiento
FROM 
    (SELECT @posicion := 0, @max_monto := (
        SELECT COALESCE(MAX(monto_total), 1) FROM (
            SELECT SUM(c.monto) AS monto_total
            FROM Creditos c
            WHERE c.estado = 'Aprobado'
            GROUP BY c.asesorId
        ) AS temp_montos
    )) AS init,
    (
        SELECT 
            a.id,
            a.nombre,
            COUNT(c.id) AS total_creditos,
            COALESCE(SUM(c.monto), 0) AS monto_total,
            -- Fórmula corregida con validación de montos
            CASE 
                WHEN @max_monto <= 0 THEN 0
                WHEN SUM(c.monto) IS NULL THEN 0
                ELSE (SUM(c.monto)/@max_monto) * 100
            END AS rendimiento
        FROM 
            Asesor a
        LEFT JOIN 
            Creditos c ON a.id = c.asesorId AND c.estado = 'Aprobado'
        GROUP BY 
            a.id, a.nombre
        ORDER BY 
            monto_total DESC
    ) AS subquery;
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error en getRankingAsesores:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCreditosMeses = async (req, res) => {
  try {
    console.log(req.query);
    const { year } = req.query; // Obtener el ano desde los query params

    if (!year || isNaN(year)) {
      return res.status(400).json({ message: 'Debe proporcionar un año válido' });
    }

    const results = await db.sequelize.query(`
      SELECT 
          CASE MONTH(fechaSolicitud)
              WHEN 1 THEN 'Enero'
              WHEN 2 THEN 'Febrero'
              WHEN 3 THEN 'Marzo'
              WHEN 4 THEN 'Abril'
              WHEN 5 THEN 'Mayo'
              WHEN 6 THEN 'Junio'
              WHEN 7 THEN 'Julio'
              WHEN 8 THEN 'Agosto'
              WHEN 9 THEN 'Septiembre'
              WHEN 10 THEN 'Octubre'
              WHEN 11 THEN 'Noviembre'
              WHEN 12 THEN 'Diciembre'
          END AS mes,
          MONTH(fechaSolicitud) AS mes_num,
          SUM(CASE WHEN estado = 'Aprobado' THEN 1 ELSE 0 END) AS aprobados,
          SUM(CASE WHEN estado = 'Rechazado' THEN 1 ELSE 0 END) AS rechazados,
          SUM(CASE WHEN estado IN ('En Revisión', 'Pendiente') THEN 1 ELSE 0 END) AS pendientes
      FROM creditos
      WHERE YEAR(createdAt) = :year
      GROUP BY mes, mes_num
      ORDER BY mes_num;
    `, {
      replacements: { year: parseInt(year) },
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error en getCreditosMeses:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReporteBancos = async (req, res) => {
  try {
    const bancos = await Banco.findAll({
      include: [{
        model: Credito,
        as: 'creditos',
        required: false
      }]
    });

    const totalCreditos = await Credito.count({ where: { estado: 'Aprobado' } }) || 1;
    const montoTotalSistema = await Credito.sum('monto', { where: { estado: 'Aprobado' } }) || 0;

    const reporteBancos = bancos.map(banco => {
      const creditosActivos = banco.creditos?.filter(c => c.estado === 'Aprobado').length || 0;
      const montoTotal = banco.creditos?.reduce((sum, c) => sum + (c.estado === 'Aprobado' ? parseFloat(c.monto || 0) : 0), 0) || 0;
      
      return {
        id: banco.id,
        nombre: banco.nombre,
        creditosActivos,
        montoTotal,
        participacion: (creditosActivos / totalCreditos) * 100 || 0
      };
    });

    res.json(reporteBancos);
  } catch (error) {
    console.error('Error en getReporteBancos:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReporteMorosidad = async (req, res) => {
  try {
    const creditos = await Credito.findAll({
      where: {
        estado: 'Aprobado'
      }
    });

    const rangos = [
      { min: 0, max: 30, label: '0-30 días' },
      { min: 31, max: 60, label: '31-60 días' },
      { min: 61, max: 90, label: '61-90 días' },
      { min: 91, max: Infinity, label: '90+ días' }
    ];

    const reporteMorosidad = rangos.map(rango => {
      const creditosEnRango = creditos.filter(credito => {
        const diasAtraso = Math.floor((new Date() - new Date(credito.fechaPago)) / (1000 * 60 * 60 * 24));
        return diasAtraso >= rango.min && diasAtraso <= rango.max;
      });

      const monto = creditosEnRango.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0);
      const porcentaje = (creditosEnRango.length / (creditos.length || 1)) * 100 || 0;

      return {
        rango: rango.label,
        cantidad: creditosEnRango.length,
        monto,
        porcentaje
      };
    });

    res.json(reporteMorosidad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportarReporte = async (req, res) => {
  try {
    const { tipo } = req.params;
    const filtros = req.body;
    
    // Aquí implementarías la lógica de exportación según el tipo (PDF o Excel)
    // Por ahora retornamos un mensaje de ejemplo
    res.json({ message: `Reporte exportado en formato ${tipo}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResumenPorBanco = async (req, res) => {
  try {
    const results = await db.sequelize.query(`
      SELECT 
        b.nombre AS banco, 
        COUNT(c.id) AS total_creditos, 
        SUM(c.monto) AS total_monto 
      FROM creditos c 
      LEFT JOIN bancos b ON b.id = c.bancoId 
      GROUP BY b.nombre 
      ORDER BY total_monto DESC limit 5;
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error en getResumenPorBanco:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getResumenPorFinanciera = async (req, res) => {
  try {
    const results = await db.sequelize.query(`
      SELECT 
        f.nombre AS banco, 
        COUNT(c.id) AS total_creditos, 
        SUM(c.monto) AS total_monto 
      FROM creditos c 
      LEFT JOIN financieras f ON f.id = c.financieraId 
      GROUP BY f.nombre 
      ORDER BY total_monto DESC limit 5;
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error en getResumenPorFinanciera:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getResumenPorEstado = async (req, res) => {
  try {
    const results = await db.sequelize.query(`
      SELECT 
        estado, 
        COUNT(*) AS cantidad, 
        ROUND((COUNT(*) / total.total_creditos) * 100, 1) AS porcentaje 
      FROM creditos 
      JOIN ( 
        SELECT COUNT(*) AS total_creditos FROM creditos 
      ) AS total ON TRUE 
      GROUP BY estado, total.total_creditos 
      ORDER BY cantidad DESC limit 5;
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error en getResumenPorEstado:', error);
    res.status(500).json({ message: error.message });
  }
};