module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [clientes] = await queryInterface.sequelize.query('SELECT id FROM Clientes;');
    const [asesores] = await queryInterface.sequelize.query('SELECT id FROM Asesor;');
    const [bancos] = await queryInterface.sequelize.query('SELECT id FROM Bancos;');
    const [financieras] = await queryInterface.sequelize.query('SELECT id FROM Financieras;');

    const creditos = [];
    const tipos = ['Personal', 'Hipotecario', 'Vehicular', 'Microempresa'];
    const estados = ['Aprobado', 'En Revisión', 'Pendiente', 'Rechazado'];
    const garantias = ['Ninguna', 'Propiedad', 'Vehículo', 'Aval'];

    for (let i = 1; i <= 50; i++) {
      const fechaSolicitud = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const plazo = [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)];
      
      creditos.push({
        id: `CRD-2025${String(i).padStart(4, '0')}`,
        clienteId: clientes[Math.floor(Math.random() * clientes.length)].id,
        asesorId: asesores[Math.floor(Math.random() * asesores.length)].id,
        financieraId: financieras[Math.floor(Math.random() * financieras.length)].id,
        bancoId: bancos[Math.floor(Math.random() * bancos.length)].id,
        monto: Math.floor(Math.random() * 95000) + 5000,
        tasa: `${(Math.random() * 15 + 10).toFixed(1)}%`,
        plazo: plazo,
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        garantia: garantias[Math.floor(Math.random() * garantias.length)],
        estado: estado,
        fechaSolicitud: fechaSolicitud,
        fechaRechazo: estado === 'Rechazado' ? new Date(fechaSolicitud.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        fechaAprobacion: estado === 'Aprobado' ? new Date(fechaSolicitud.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        fechaVencimiento: new Date(fechaSolicitud.getTime() + plazo * 30 * 24 * 60 * 60 * 1000),
        observaciones: `Observaciones del crédito ${i}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Creditos', creditos);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Creditos', null, {});
  }
};