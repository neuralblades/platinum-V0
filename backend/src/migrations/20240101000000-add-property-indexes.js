'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add indexes to improve query performance
      console.log('Adding property indexes...');

      // Add status and propertyType index
      await queryInterface.addIndex('Properties', ['status', 'propertyType'], {
        name: 'properties_status_type_idx'
      });
      console.log('Added status and propertyType index');

      // Add isOffplan index
      await queryInterface.addIndex('Properties', ['isOffplan'], {
        name: 'properties_isoffplan_idx'
      });
      console.log('Added isOffplan index');

      // Add featured index
      await queryInterface.addIndex('Properties', ['featured'], {
        name: 'properties_featured_idx'
      });
      console.log('Added featured index');

      // Add agentId index
      await queryInterface.addIndex('Properties', ['agentId'], {
        name: 'properties_agent_idx'
      });
      console.log('Added agentId index');

      // Add developerId index
      await queryInterface.addIndex('Properties', ['developerId'], {
        name: 'properties_developer_idx'
      });
      console.log('Added developerId index');

      // Add location index
      await queryInterface.addIndex('Properties', ['location'], {
        name: 'properties_location_idx'
      });
      console.log('Added location index');

      // Add price index
      await queryInterface.addIndex('Properties', ['price'], {
        name: 'properties_price_idx'
      });
      console.log('Added price index');

      // Add area index
      await queryInterface.addIndex('Properties', ['area'], {
        name: 'properties_area_idx'
      });
      console.log('Added area index');

      // Add bedrooms and bathrooms index
      await queryInterface.addIndex('Properties', ['bedrooms', 'bathrooms'], {
        name: 'properties_beds_baths_idx'
      });
      console.log('Added bedrooms and bathrooms index');

      console.log('All property indexes added successfully');
    } catch (error) {
      console.error('Error adding indexes:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('Removing property indexes...');

      // Remove indexes
      await queryInterface.removeIndex('Properties', 'properties_status_type_idx');
      await queryInterface.removeIndex('Properties', 'properties_isoffplan_idx');
      await queryInterface.removeIndex('Properties', 'properties_featured_idx');
      await queryInterface.removeIndex('Properties', 'properties_agent_idx');
      await queryInterface.removeIndex('Properties', 'properties_developer_idx');
      await queryInterface.removeIndex('Properties', 'properties_location_idx');
      await queryInterface.removeIndex('Properties', 'properties_price_idx');
      await queryInterface.removeIndex('Properties', 'properties_area_idx');
      await queryInterface.removeIndex('Properties', 'properties_beds_baths_idx');

      console.log('All property indexes removed successfully');
    } catch (error) {
      console.error('Error removing indexes:', error);
      throw error;
    }
  }
};
