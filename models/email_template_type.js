'use strict';
module.exports = (sequelize, DataTypes) => {
  var email_template_type = sequelize.define('email_template_type', {
    type: DataTypes.STRING
  }, {});
  email_template_type.associate = function(models) {
    // associations can be defined here
  };
  return email_template_type;
};