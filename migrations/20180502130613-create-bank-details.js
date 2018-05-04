'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Bank_Details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING
      },
      acc_holder_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      bank_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      bank_address: {
        allowNull: true,
        type: Sequelize.STRING
      },
      acc_no: {
        allowNull: true,
        type: Sequelize.STRING
      },
      swift_code: {
        allowNull: true,
        type: Sequelize.STRING
      },
      branch_no: {
        allowNull: true,
        type: Sequelize.STRING
      },
      institution_no: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('bank_details');
  }
};