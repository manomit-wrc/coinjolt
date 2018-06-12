'use strict';
module.exports = (sequelize, DataTypes) => {
  var cms_about_us = sequelize.define('cms_about_us', {
    about_us_header_desc: DataTypes.TEXT,
    about_us_header_image: DataTypes.STRING,
    about_us_description: DataTypes.TEXT
  }, {});
  cms_about_us.associate = function(models) {
    // associations can be defined here
  };
  return cms_about_us;
};