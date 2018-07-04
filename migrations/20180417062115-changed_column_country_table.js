'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'Countries',
        'iso',
        {
          type: Sequelize.STRING(2),
          allowNull: false
        }
      ),
      queryInterface.changeColumn(
        'Countries',
        'name',
        {
          type: Sequelize.STRING(80),
          allowNull: false
        }
      ),
      queryInterface.changeColumn(
        'Countries',
        'nicename',
        {
          type: Sequelize.STRING(80),
          allowNull: false
        }
      ),
      queryInterface.changeColumn(
        'Countries',
        'iso3',
        {
          type: Sequelize.STRING(3),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'Countries',
        'numcode',
        {
          type: Sequelize.INTEGER(6),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'Countries',
        'phonecode',
        {
          type: Sequelize.INTEGER(5),
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
