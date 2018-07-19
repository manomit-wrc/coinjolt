'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('deposit_method_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deposit_method_id: {
        type: Sequelize.INTEGER
      },
      ecorepay_account_id: {
        type: Sequelize.STRING
      },
      ecorepay_authentication_id: {
        type: Sequelize.STRING
      },
      bank_name: {
        type: Sequelize.STRING
      },
      account_name: {
        type: Sequelize.STRING
      },
      bank_address: {
        type: Sequelize.TEXT
      },
      branch_number: {
        type: Sequelize.STRING
      },
      institution_number: {
        type: Sequelize.STRING
      },
      account_number: {
        type: Sequelize.STRING
      },
      routing_number: {
        type: Sequelize.STRING
      },
      swift_code: {
        type: Sequelize.STRING
      },
      reference_email: {
        type: Sequelize.STRING
      },
      paypal_payment_mode: {
        type: Sequelize.STRING
      },
      paypal_client_id: {
        type: Sequelize.STRING
      },
      paypal_client_secret: {
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
    return queryInterface.dropTable('deposit_method_types');
  }
};