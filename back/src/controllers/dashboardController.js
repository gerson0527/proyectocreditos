const db = require('../../models');
const { Op } = require('sequelize');

exports.getCreditosProcesos = async (req, res) => {
    try {   
        const results = await db.sequelize.query(`
          SELECT 
            actual.total AS creditos_en_proceso,
            CONCAT(
                IF(actual.total > anterior.total, '+', ''),
                (actual.total - anterior.total),' semana pasada'
            ) AS variacion_semanal
        FROM 
            (
                SELECT COUNT(*) AS total
                FROM creditos
                WHERE estado IN ('En Revisión', 'Pendiente')
                AND fechaSolicitud >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
            ) AS actual,
            (
                SELECT COUNT(*) AS total
                FROM creditos
                WHERE estado IN ('En Revisión', 'Pendiente')
                AND fechaSolicitud BETWEEN 
                    DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
            ) AS anterior;
        `);
    
        res.json(results[0][0]);
    } catch (error) {
        console.error('Error en getCreditosProcesos:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMontoSolicitudes = async (req, res) => {
    try {
        const results = await db.sequelize.query(`
            SELECT 
                CONCAT('$', FORMAT(monto_actual, 1)) AS monto_en_solicitudes,
                CONCAT(
                    IF(monto_actual > monto_anterior, '+', ''),
                    ROUND(((monto_actual - monto_anterior) / NULLIF(monto_anterior, 0)) * 100, 0),
                    '% este mes'
                ) AS variacion_mensual
            FROM (
                SELECT
                    SUM(CASE 
                        WHEN estado IN ('En Revisión', 'Pendiente') 
                        AND MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) 
                        THEN monto ELSE 0 
                    END) AS monto_actual,
                    SUM(CASE 
                        WHEN estado IN ('En Revisión', 'Pendiente') 
                        AND MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) - 1 
                        THEN monto ELSE 0 
                    END) AS monto_anterior
                FROM creditos
                WHERE YEAR(fechaSolicitud) = YEAR(CURRENT_DATE)
                AND MONTH(fechaSolicitud) BETWEEN MONTH(CURRENT_DATE) - 1 AND MONTH(CURRENT_DATE)
            ) AS montos
        `);

        res.json(results[0][0]);
    } catch (error) {
        console.error('Error en getMontoSolicitudes:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTasaAprobacion = async (req, res) => {
    try {
        const results = await db.sequelize.query(`
            SELECT
                ROUND(tasa_actual * 100, 0) AS tasa_aprobacion,
                CONCAT(
                    IF(tasa_actual > tasa_anterior, '+', ''),
                    ROUND((tasa_actual - tasa_anterior) * 100, 0),
                    '% vs mes anterior'
                ) AS variacion_mensual
            FROM (
                SELECT
                    COUNT(CASE WHEN estado = 'Aprobado' AND MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) THEN 1 END) /
                    NULLIF(COUNT(CASE WHEN estado IN ('Aprobado', 'Rechazado') AND MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) THEN 1 END), 0) AS tasa_actual,
                    COUNT(CASE WHEN estado = 'Aprobado' AND MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) - 1 THEN 1 END) /
                    NULLIF(COUNT(CASE WHEN estado IN ('Aprobado', 'Rechazado') AND MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) - 1 THEN 1 END), 0) AS tasa_anterior
                FROM
                    creditos
                WHERE
                    YEAR(fechaSolicitud) = YEAR(CURRENT_DATE)
                    AND MONTH(fechaSolicitud) BETWEEN MONTH(CURRENT_DATE) - 1 AND MONTH(CURRENT_DATE)
            ) AS tasas
        `);

        res.json(results[0][0]);
    } catch (error) {
        console.error('Error en getTasaAprobacion:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTiempoPromedio = async (req, res) => {
    try {
        const results = await db.sequelize.query(`
            SELECT
                ROUND(tiempo_actual, 1) AS tiempo_promedio_dias,
                CONCAT(
                    IF(tiempo_actual < tiempo_anterior, '-', '+'),
                    ROUND(ABS(tiempo_actual - tiempo_anterior), 1),
                    ' días vs mes anterior'
                ) AS variacion_mensual
            FROM (
                SELECT
                    AVG(
                        CASE
                            WHEN MONTH(fechaSolicitud) = MONTH(CURRENT_DATE)
                            THEN TIMESTAMPDIFF(DAY, fechaSolicitud, fechaAprobacion)
                            ELSE NULL
                        END
                    ) AS tiempo_actual,
                    AVG(
                        CASE
                            WHEN MONTH(fechaSolicitud) = MONTH(CURRENT_DATE) - 1
                            THEN TIMESTAMPDIFF(DAY, fechaSolicitud, fechaAprobacion)
                            ELSE NULL
                        END
                    ) AS tiempo_anterior
                FROM
                    creditos
                WHERE
                    YEAR(fechaSolicitud) = YEAR(CURRENT_DATE)
                    AND MONTH(fechaSolicitud) BETWEEN MONTH(CURRENT_DATE) - 1 AND MONTH(CURRENT_DATE)
                    AND estado = 'Aprobado'
                    AND fechaAprobacion IS NOT NULL
            ) AS tiempos
        `);

        res.json(results[0][0]);
    } catch (error) {
        console.error('Error en getTiempoPromedio:', error);
        res.status(500).json({ message: error.message });
    }
};
  