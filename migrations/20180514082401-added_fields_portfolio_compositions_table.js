'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'portfolio_compositions',
        'street',
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'portfolio_compositions',
        'city',
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'portfolio_compositions',
        'state',
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'portfolio_compositions',
        'phone_number',
        {
          type: Sequelize.STRING(255),
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'portfolio_compositions',
        'email_address',
        {
          type: Sequelize.STRING(255),
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
