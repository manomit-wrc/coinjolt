'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.changeColumn(
        'countries',
        'iso',
        {
          type: Sequelize.STRING(2),
          allowNull: false
        }
      ),
      queryInterface.changeColumn(
        'countries',
        'name',
        {
          type: Sequelize.STRING(80),
          allowNull: false
        }
      ),
      queryInterface.changeColumn(
        'countries',
        'nicename',
        {
          type: Sequelize.STRING(80),
          allowNull: false
        }
      ),
      queryInterface.changeColumn(
        'countries',
        'iso3',
        {
          type: Sequelize.STRING(3),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'countries',
        'numcode',
        {
          type: Sequelize.INTEGER(6),
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'countries',
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
