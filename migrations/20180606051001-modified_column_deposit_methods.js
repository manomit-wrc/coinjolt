'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'deposit_methods',
        'method_name',   
        {
          type: Sequelize.STRING(40),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'deposit_methods',
        'status',   
        {
          type: Sequelize.INTEGER(1),
          allowNull: true
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
    
  }
};
