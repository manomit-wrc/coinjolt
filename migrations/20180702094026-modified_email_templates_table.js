'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'email_templates',
        'template_type',   
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
   
  }
};
