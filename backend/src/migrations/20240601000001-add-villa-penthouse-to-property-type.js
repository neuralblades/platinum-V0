'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'villa' and 'penthouse' to the ENUM for MySQL
    await queryInterface.sequelize.query(`
      ALTER TABLE Properties 
      MODIFY COLUMN propertyType 
      ENUM('house', 'apartment', 'condo', 'townhouse', 'villa', 'penthouse', 'land', 'commercial', 'other') 
      NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'villa' and 'penthouse' from the ENUM for MySQL
    await queryInterface.sequelize.query(`
      ALTER TABLE Properties 
      MODIFY COLUMN propertyType 
      ENUM('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'other') 
      NOT NULL;
    `);
  }
}; 