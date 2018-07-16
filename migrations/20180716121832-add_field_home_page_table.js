'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'cms_home_pages',
        'how_is_works_reg_description',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'how_is_works_deposit_funds_description',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'how_is_works_safe_and_secure_description',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),

    ];
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
