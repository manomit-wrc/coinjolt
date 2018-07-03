'use strict';
module.exports = (sequelize, DataTypes) => {
  var company_setting = sequelize.define('company_setting', {
    phone_number: DataTypes.INTEGER,
    email: DataTypes.STRING,
    website_url: DataTypes.STRING,
    facebook_url: DataTypes.STRING,
    twitter_url: DataTypes.STRING,
    linkedin_url: DataTypes.STRING,
    instagram_url: DataTypes.STRING
  }, {});
  company_setting.associate = function(models) {
    // associations can be defined here
  };
  return company_setting;
};