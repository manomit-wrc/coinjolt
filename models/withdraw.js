'use strict';
module.exports = (sequelize, DataTypes) => {
  var withdraw = sequelize.define('withdraw', {
    user_id: DataTypes.INTEGER,
    amount_usd: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    withdraw_type: DataTypes.INTEGER
  }, {});
  withdraw.associate = function(models) {
    // associations can be defined here
  };
  return withdraw;
};