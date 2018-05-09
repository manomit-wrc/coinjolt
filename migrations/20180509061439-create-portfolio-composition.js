'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('portfolio_compositions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      investor_type: {
        type: Sequelize.INTEGER
      },
      business_name: {
        type: Sequelize.STRING
      },
      business_number: {
        type: Sequelize.STRING
      },
      business_registration_country: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      residence_country: {
        type: Sequelize.STRING
      },
      investques: {
        type: Sequelize.STRING
      },
      settlement_currency: {
        type: Sequelize.STRING
      },
      street: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      postal_code: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      incorporation_certificate: {
        type: Sequelize.STRING
      },
      shareholders: {
        type: Sequelize.STRING
      },
      shareholders_address: {
        type: Sequelize.STRING
      },
      shareholders_id: {
        type: Sequelize.STRING
      },
      government_issued_id: {
        type: Sequelize.STRING
      },
      address_proof: {
        type: Sequelize.STRING
      },
      bank_statement: {
        type: Sequelize.STRING
      },
      account_name: {
        type: Sequelize.STRING
      },
      bank_country: {
        type: Sequelize.STRING
      },
      account_number: {
        type: Sequelize.STRING
      },
      routing_number: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      email_address: {
        type: Sequelize.STRING
      },
      status: {
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('portfolio_compositions');
  }
};