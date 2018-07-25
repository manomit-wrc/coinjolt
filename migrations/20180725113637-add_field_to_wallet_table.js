'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return[
      queryInterface.addColumn(
        'wallets',
        'currency_id',   
        {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      )

    ]
  },

  down: (queryInterface, Sequelize) => {
   
  }
};
