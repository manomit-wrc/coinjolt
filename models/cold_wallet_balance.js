'use strict';
module.exports = (sequelize, DataTypes) => {
  var cold_wallet_balance = sequelize.define('cold_wallet_balance', {
    user_id: DataTypes.INTEGER,
    currency_id: DataTypes.INTEGER,
    balance: DataTypes.STRING
  }, {});
  cold_wallet_balance.associate = function(models) {
    // associations can be defined here
  };
  return cold_wallet_balance;
};