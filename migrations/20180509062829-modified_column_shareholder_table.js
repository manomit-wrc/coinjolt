'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'shareholders',
        'user_id',   
        {
          type: Sequelize.STRING(500),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'shareholders',
        'shareholder_name',   
        {
          type: Sequelize.STRING(500),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'shareholders',
        'address_proof',   
        {
          type: Sequelize.STRING(5000),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'shareholders',
        'government_issued_id',   
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
