'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return[
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div1_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div2_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div3_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div4_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div1_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div2_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div3_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div4_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div1_desc',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div2_desc',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div3_desc',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'buy_sell_div4_desc',   
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      )
    ]
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
