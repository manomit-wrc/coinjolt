'use strict';
module.exports = (sequelize, DataTypes) => {
  var deposit_method = sequelize.define('deposit_method', {
    method_name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  deposit_method.associate = function(models) {
    // associations can be defined here
  };
  return deposit_method;
};