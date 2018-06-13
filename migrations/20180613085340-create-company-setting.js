'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('company_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone_number: {
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      website_url: {
        type: Sequelize.STRING
      },
      facebook_url: {
        type: Sequelize.STRING
      },
      twitter_url: {
        type: Sequelize.STRING
      },
      linkedin_url: {
        type: Sequelize.STRING
      },
      instagram_url: {
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
    return queryInterface.dropTable('company_settings');
  }
};