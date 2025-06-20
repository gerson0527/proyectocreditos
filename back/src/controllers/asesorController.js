const db = require('../../models');
const Asesor = db.Asesor;

exports.getAllAsesores = async (req, res) => {
  try {
    const asesores = await Asesor.findAll();
    res.json(asesores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAsesor = async (req, res) => {
  try {
    // En Sequelize no se usa 'new', se usa directamente el método create
    const nuevoAsesor = await Asesor.create(req.body);
    res.status(201).json(nuevoAsesor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateAsesor = async (req, res) => {
  try {
    const [updated] = await Asesor.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const asesorActualizado = await Asesor.findByPk(req.params.id);
      res.json(asesorActualizado);
    } else {
      res.status(404).json({ message: 'Asesor no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAsesor = async (req, res) => {
  try {
    // Sequelize usa destroy en lugar de findByIdAndDelete
    const deleted = await Asesor.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted) {
      res.json({ message: 'Asesor eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Asesor no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAsesorById = async (req, res) => {
  try {
    // Sequelize usa findByPk (find by primary key) en lugar de findById
    const asesor = await Asesor.findByPk(req.params.id);
    if (!asesor) {
      return res.status(404).json({ message: 'Asesor no encontrado' });
    }
    res.json(asesor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};