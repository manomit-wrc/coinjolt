'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'portfolio_compositions',
        'street',   
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'portfolio_compositions',
        'city',   
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'portfolio_compositions',
        'postal_code',   
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'portfolio_compositions',
        'state',   
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      )
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
