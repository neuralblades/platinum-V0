'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add bedroomRange field
      await queryInterface.addColumn('Properties', 'bedroomRange', {
        type: Sequelize.STRING,
        allowNull: true,
      });

      console.log('Added bedroomRange column to Properties table');

      // Update existing offplan properties to set bedroomRange based on bedrooms
      const properties = await queryInterface.sequelize.query(
        'SELECT id, bedrooms FROM "Properties" WHERE "isOffplan" = true',
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const property of properties) {
        await queryInterface.sequelize.query(
          'UPDATE "Properties" SET "bedroomRange" = ? WHERE id = ?',
          {
            replacements: [`${property.bedrooms}`, property.id],
            type: Sequelize.QueryTypes.UPDATE,
          }
        );
      }

      console.log('Updated existing offplan properties with bedroomRange values');

      return Promise.resolve();
    } catch (error) {
      console.error('Error in migration:', error);
      return Promise.reject(error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove bedroomRange field
      await queryInterface.removeColumn('Properties', 'bedroomRange');
      console.log('Removed bedroomRange column from Properties table');

      return Promise.resolve();
    } catch (error) {
      console.error('Error in migration rollback:', error);
      return Promise.reject(error);
    }
  }
};
