const db = require('../../models');
const Credito = db.Credito;

exports.getCreditos = async (req, res) => {
  try {
    const creditos = await Credito.findAll({
      include: [
        {
          association: 'cliente',
          attributes: ['nombre', 'apellido']
        },
        {
          association: 'asesor',
          attributes: ['nombre']
        },
        {
          association: 'banco',
          attributes: ['nombre']
        },
        {
          association: 'financiera',
          attributes: ['nombre']
        }
      ]
    });
    res.json(creditos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createCredito = async (req, res) => {
  try {
    const credito = await Credito.create(req.body);
    res.status(201).json(credito);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCredito = async (req, res) => {
  try {
    const [updated] = await Credito.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCredito = await Credito.findByPk(req.params.id, {
        include: ['cliente', 'asesor', 'banco']
      });
      return res.json(updatedCredito);
    }
    throw new Error('Crédito no encontrado');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCredito = async (req, res) => {
  try {
    const deleted = await Credito.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.json({ message: 'Crédito eliminado correctamente' });
    }
    throw new Error('Crédito no encontrado');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCreditosByCliente = async (req, res) => {
  try {
    const creditos = await Credito.findAll({
      where: { cliente_id: req.params.clienteId },
      include: ['Asesor', 'Banco']
    });
    res.json(creditos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCreditosByAsesor = async (req, res) => {
  try {
    const creditos = await Credito.findAll({
      where: { asesor_id: req.params.asesorId },
      include: ['Cliente', 'Banco']
    });
    res.json(creditos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCreditoById = async (req, res) => {
  try {
    const credito = await Credito.findByPk(req.params.id, {
      include: ['cliente', 'asesor', 'banco']
    });
    if (!credito) {
      return res.status(404).json({ message: 'Crédito no encontrado' });
    }
    res.json(credito);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};