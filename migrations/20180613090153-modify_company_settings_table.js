'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'company_settings',
        'phone_number',   
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
