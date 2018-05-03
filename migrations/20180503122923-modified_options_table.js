'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'options',
        'option',
        {
          type: Sequelize.STRING(300),
          allowNull: false
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
