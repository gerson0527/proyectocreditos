'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
  });

  User.associate = function(models) {
    // Define aquí las asociaciones si las hay
  };

  return User;
};