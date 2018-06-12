'use strict';
module.exports = (sequelize, DataTypes) => {
  var wallet_transaction = sequelize.define('wallet_transaction', {
    sender_id: DataTypes.INTEGER,
    receiver_id: DataTypes.INTEGER,
    currency_id: DataTypes.INTEGER,
    wallet_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    amount: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  wallet_transaction.associate = function(models) {
    // associations can be defined here
  };
  return wallet_transaction;
};