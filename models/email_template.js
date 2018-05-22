'use strict';
module.exports = (sequelize, DataTypes) => {
  var email_template = sequelize.define('email_template', {
    template_name: DataTypes.STRING,
    template_desc: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {});
  email_template.associate = function(models) {
    // associations can be defined here
  };
  return email_template;
};