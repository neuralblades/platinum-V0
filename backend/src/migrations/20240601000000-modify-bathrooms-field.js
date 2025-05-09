'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, update existing records to remove .0 from bathrooms
      await queryInterface.sequelize.query(`
        UPDATE "Properties"
        SET "bathrooms" = FLOOR("bathrooms")
        WHERE "bathrooms" = FLOOR("bathrooms");
      `);

      console.log('Updated bathrooms values to remove decimal points where not needed');

      return Promise.resolve();
    } catch (error) {
      console.error('Error in migration:', error);
      return Promise.reject(error);
    }
  },

  async down(queryInterface, Sequelize) {
    // This is a data transformation, no need for down migration
    return Promise.resolve();
  }
};
