'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'forgot_passwords',
        'user_email',   
        {
          type: Sequelize.STRING(255),
          allowNull: true
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
    
  }
};
