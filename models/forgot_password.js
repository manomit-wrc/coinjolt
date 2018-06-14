'use strict';
module.exports = (sequelize, DataTypes) => {
  var forgot_password = sequelize.define('forgot_password', {
    key: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    ip_address: DataTypes.STRING
  }, {});
  forgot_password.associate = function(models) {
    // associations can be defined here
  };
  return forgot_password;
};