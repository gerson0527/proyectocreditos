'use strict';

module.exports = (sequelize, DataTypes) => {
  const Asesor = sequelize.define('Asesor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING
  },
  sucursal: {
    type: DataTypes.STRING
  },
  experienciaPrev: {
    type: DataTypes.TEXT
  },
  fechaIngreso: {
    type: DataTypes.DATE 
  },
  creditos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tasaAprobacion: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  rendimiento: {
    type: DataTypes.ENUM('Alto', 'Medio', 'Bajo', 'Nuevo'),
    defaultValue: 'Nuevo'
  }
}, {
    tableName: 'asesor'
  });

  Asesor.associate = function(models) {
    Asesor.hasMany(models.Objetivo, {
      foreignKey: 'asesorId',
      as: 'objetivos'
    });
  };

  return Asesor;
};