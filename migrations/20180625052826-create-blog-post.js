'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('blog_posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_title: {
        type: Sequelize.STRING
      },
      post_description: {
        type: Sequelize.TEXT
      },
      post_slug: {
        type: Sequelize.STRING
      },
      featured_image: {
        type: Sequelize.STRING
      },
      meta_title: {
        type: Sequelize.STRING
      },
      meta_description: {
        type: Sequelize.TEXT
      },
      post_author: {
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
    return queryInterface.dropTable('blog_posts');
  }
};