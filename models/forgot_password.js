'use strict';
module.exports = (sequelize, DataTypes) => {
  var forgot_password = sequelize.define('forgot_password', {
    key: DataTypes.TEXT,
    ip_address: DataTypes.STRING,
    status: DataTypes.INTEGER,
    user_email: DataTypes.STRING
  }, {});
  forgot_password.associate = function(models) {
    // associations can be defined here
  };
  return forgot_password;
};