'use strict';
module.exports = (sequelize, DataTypes) => {
  var cms_terms_of_service = sequelize.define('cms_terms_of_service', {
    terms_of_service_header_image: DataTypes.STRING,
    terms_of_service_header_desc: DataTypes.TEXT,
    terms_of_service_content: DataTypes.TEXT
  }, {});
  cms_terms_of_service.associate = function(models) {
    // associations can be defined here
  };
  return cms_terms_of_service;
};