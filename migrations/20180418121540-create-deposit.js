'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Deposits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      transaction_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      checkout_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      account_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      type: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      amount: {
        allowNull: true,
        type: Sequelize.STRING
      },
      gross: {
        allowNull: true,
        type: Sequelize.STRING
      },
      processing_fee: {
        allowNull: true,
        type: Sequelize.STRING
      },
      payer_email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      payer_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      current_rate: {
        allowNull: true,
        type: Sequelize.STRING
      },
      converted_amount: {
        allowNull: true,
        type: Sequelize.STRING
      },
      base_currency: {
        allowNull: true,
        type: Sequelize.STRING
      },
      currency_purchased: {
        allowNull: true,
        type: Sequelize.STRING
      },
      payment_method: {
        allowNull: true,
        type: Sequelize.STRING
      },
      credit_card_no: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      card_expmonth: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      card_expyear: {
        allowNull: true,
        type: Sequelize.STRING
      },
      cvv: {
        allowNull: true,
        type: Sequelize.INTEGER
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
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Deposits');
  }
};