'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return[
    queryInterface.addColumn(
      'users',
      'two_factorAuth_verified',
      {
        type: Sequelize.STRING,
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
