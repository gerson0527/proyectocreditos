module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Asesor', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cargo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING
      },
      sucursal: {
        type: Sequelize.STRING
      },
      creditos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tasaAprobacion: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      rendimiento: {
        type: Sequelize.ENUM('Alto', 'Medio', 'Bajo', 'Nuevo'),
        defaultValue: 'Nuevo'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      experienciaPrev: {
        type: Sequelize.TEXT
      },
      fechaIngreso: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Asesor');
  }
};