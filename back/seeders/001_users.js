const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('user123', 10);
      
      return queryInterface.bulkInsert('Users', [
        {
          username: 'admin',
          password: adminPassword,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'user1',
          password: userPassword,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { ignoreDuplicates: true }); // Evita duplicados si el seeder se ejecuta múltiples veces
    } catch (error) {
      console.error('Error in user seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      return queryInterface.bulkDelete('Users', {
        username: { [Sequelize.Op.in]: ['admin', 'user1'] }
      }, {});
    } catch (error) {
      console.error('Error undoing user seeder:', error);
      throw error;
    }
  }
};