'use strict';
module.exports = (sequelize, DataTypes) => {
  var cms_home_page = sequelize.define('cms_home_page', {
    home_page_banner_image: DataTypes.STRING,
    how_it_works_image: DataTypes.STRING,
    how_is_works_description: DataTypes.TEXT,
    hot_wallet_image: DataTypes.STRING,
    hot_wallet_desc: DataTypes.TEXT,
    cold_wallet_image: DataTypes.STRING,
    cold_wallet_desc: DataTypes.TEXT,
    video_upload: DataTypes.STRING,
    how_is_works_reg_description: DataTypes.TEXT,
    how_is_works_deposit_funds_description: DataTypes.TEXT,
    how_is_works_safe_and_secure_description: DataTypes.TEXT
  }, {});
  cms_home_page.associate = function(models) {
    // associations can be defined here
  };
  return cms_home_page;
};