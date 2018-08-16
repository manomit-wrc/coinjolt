'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return[
      queryInterface.addColumn(
        'send_emails',
        'email_send_status',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      )
    ]
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
