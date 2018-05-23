'use strict';
module.exports = (sequelize, DataTypes) => {
  var wallet_address = sequelize.define('wallet_address', {
    user_id: DataTypes.INTEGER,
    wallet_id: DataTypes.INTEGER,
    address: DataTypes.STRING,
    currency_id: DataTypes.INTEGER
  }, {});
  wallet_address.associate = function(models) {
    // associations can be defined here
  };
  return wallet_address;
};