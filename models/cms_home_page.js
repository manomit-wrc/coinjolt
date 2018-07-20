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
    how_is_works_safe_and_secure_description: DataTypes.TEXT,
    industry_leading_div1_image: DataTypes.STRING,
    industry_leading_div2_image: DataTypes.STRING,
    industry_leading_div3_image: DataTypes.STRING,
    industry_leading_div4_image: DataTypes.STRING,
    industry_leading_div5_image: DataTypes.STRING,
    industry_leading_div6_image: DataTypes.STRING,
    div1_heading: DataTypes.STRING,
    div2_heading: DataTypes.STRING,
    div3_heading: DataTypes.STRING,
    div4_heading: DataTypes.STRING,
    div5_heading: DataTypes.STRING,
    div6_heading: DataTypes.STRING,
    div1_desc: DataTypes.TEXT,
    div2_desc: DataTypes.TEXT,
    div3_desc: DataTypes.TEXT,
    div4_desc: DataTypes.TEXT,
    div5_desc: DataTypes.TEXT,
    div6_desc: DataTypes.TEXT
  }, {});
  cms_home_page.associate = function(models) {
    // associations can be defined here
  };
  return cms_home_page;
};