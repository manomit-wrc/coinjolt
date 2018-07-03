'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return[
      queryInterface.addColumn(
        'Referral_data',
        'referral_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'Referral_data',
        'deposit_amount',
        {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'Referral_data',
        'referral_amount',
        {
          type: Sequelize.DECIMAL(10, 2),
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
