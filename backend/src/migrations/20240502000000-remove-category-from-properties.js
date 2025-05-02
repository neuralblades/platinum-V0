'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column exists
      const tableInfo = await queryInterface.describeTable('Properties');

      if (tableInfo.category) {
        // Remove the column
        await queryInterface.removeColumn('Properties', 'category');

        // Note: MySQL doesn't need to explicitly drop ENUM types
        // They are automatically handled when the column is removed
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Properties');

      if (!tableInfo.category) {
        // Add the column back - MySQL handles ENUM types automatically
        await queryInterface.addColumn('Properties', 'category', {
          type: Sequelize.ENUM('buy', 'rent'),
          allowNull: false,
          defaultValue: 'buy',
        });

        // Update existing properties based on their status
        await queryInterface.sequelize.query(`
          UPDATE \`Properties\`
          SET category = CASE
            WHEN status = 'for-rent' THEN 'rent'
            WHEN status = 'rented' THEN 'rent'
            ELSE 'buy'
          END
        `);
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }
};
