const db = require('../../models');
const Cliente = db.Cliente
const Op = db.Sequelize.Op;

exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll(); // Cambiado de find() a findAll()
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id); // Cambiado de findById a findByPk
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body); // Cambiado de new Cliente a Cliente.create
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const [updated] = await Cliente.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCliente = await Cliente.findByPk(req.params.id);
      res.json(updatedCliente);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const deleted = await Cliente.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Cliente eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchCliente = async (req, res) => {
  try {
    const term = req.query.term;
    const clientes = await Cliente.findAll({
      where: {
        dni: {
          [Op.like]: `%${term}%`
        }
      }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
