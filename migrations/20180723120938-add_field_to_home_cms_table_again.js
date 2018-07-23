'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return[
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div1_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div2_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div3_image',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div1_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div2_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div3_heading',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div1_desc',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div2_desc',   
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'cms_home_pages',
        'risk_disclousure_div3_desc',   
        {
          type: Sequelize.STRING,
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
