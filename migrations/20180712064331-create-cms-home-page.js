'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cms_home_pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      home_page_banner_image: {
        allowNull: true,
        type: Sequelize.STRING
      },
      how_it_works_image: {
        allowNull: true,
        type: Sequelize.STRING
      },
      how_is_works_description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      hot_wallet_image: {
        allowNull: true,
        type: Sequelize.STRING
      },
      hot_wallet_desc: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      cold_wallet_image: {
        allowNull: true,
        type: Sequelize.STRING
      },
      cold_wallet_desc: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      video_upload: {
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
    return queryInterface.dropTable('cms_home_pages');
  }
};