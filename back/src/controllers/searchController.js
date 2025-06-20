const db = require('../../models');
const { Op } = require('sequelize');
const Cliente = db.Cliente;
const Credito = db.Credito;

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ results: [] });
    }

    const [clientes, creditos] = await Promise.all([
      Cliente.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${q}%` } },
            { apellido: { [Op.like]: `%${q}%` } },
            { dni: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      }),
      Credito.findAll({
        where: {
          [Op.or]: [
            { id: { [Op.like]: `%${q}%` } },
            { '$cliente.nombre$': { [Op.like]: `%${q}%` } },
            { '$cliente.apellido$': { [Op.like]: `%${q}%` } }
          ]
        },
        include: [{
          model: Cliente,
          as: 'cliente',
          attributes: ['nombre', 'apellido']
        }],
        limit: 5
      })
    ]);

    const results = [
      ...clientes.map(cliente => ({
        id: cliente.id,
        type: 'cliente',
        title: `${cliente.nombre} ${cliente.apellido}`,
        subtitle: `DNI/RUC: ${cliente.documento}`
      })),
      ...creditos.map(credito => ({
        id: credito.id,
        type: 'credito',
        title: `Crédito #${credito.id}`,
        subtitle: `Monto: $${credito.monto.toLocaleString()}`,
        estado: credito.estado,
        monto: credito.monto
      }))
    ];

    res.json({ results });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ results: [] });
    }

    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { apellido: { [Op.like]: `%${q}%` } },
          { dni: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 10
    });

    const results = clientes.map(cliente => ({
      id: cliente.id,
      type: 'cliente',
      title: `${cliente.nombre} ${cliente.apellido}`,
      subtitle: `DNI/RUC: ${cliente.documento}`
    }));

    res.json({ results });
  } catch (error) {
    console.error('Error en búsqueda de clientes:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.searchCredits = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ results: [] });
    }

    const creditos = await Credito.findAll({
      where: {
        [Op.or]: [
          { id: { [Op.like]: `%${q}%` } },
          { '$cliente.nombre$': { [Op.like]: `%${q}%` } },
          { '$cliente.apellido$': { [Op.like]: `%${q}%` } }
        ]
      },
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['nombre', 'apellido']
      }],
      limit: 10
    });

    const results = creditos.map(credito => ({
      id: credito.id,
      type: 'credito',
      title: `Crédito #${credito.id}`,
      subtitle: `Monto: $${credito.monto.toLocaleString()}`,
      estado: credito.estado,
      monto: credito.monto
    }));

    res.json({ results });
  } catch (error) {
    console.error('Error en búsqueda de créditos:', error);
    res.status(500).json({ message: error.message });
  }
};