'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'blog_posts',
        'meta_keywords',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
   
  }
};
