'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return[
      queryInterface.addColumn(
        'send_emails',
        'send_email_address',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      )
     ]
  },

  down: (queryInterface, Sequelize) => {
    
  }
};
