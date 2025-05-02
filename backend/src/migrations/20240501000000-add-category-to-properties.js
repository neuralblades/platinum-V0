'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column exists
    try {
      const tableInfo = await queryInterface.describeTable('Properties');

      if (!tableInfo.category) {
        // Add the column - MySQL handles ENUMs differently than PostgreSQL
        await queryInterface.addColumn('Properties', 'category', {
          type: Sequelize.ENUM('buy', 'rent'),
          allowNull: false,
          defaultValue: 'buy',
        });
      }

      // Update existing properties based on their status
      await queryInterface.sequelize.query(`
        UPDATE \`Properties\`
        SET category = CASE
          WHEN status = 'for-rent' THEN 'rent'
          WHEN status = 'rented' THEN 'rent'
          ELSE 'buy'
        END
      `);
    } catch (error) {
      console.error('Migration error:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Properties', 'category');
  }
};
