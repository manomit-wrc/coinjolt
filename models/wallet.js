'use strict';
module.exports = (sequelize, DataTypes) => {
  var wallet = sequelize.define('wallet', {
    user_id: DataTypes.INTEGER,
    bitgo_wallet_id: DataTypes.STRING,
    label: DataTypes.STRING,
    userkeychain_public: DataTypes.TEXT,
    userkeychain_private: DataTypes.TEXT,
    backupkeychain_private: DataTypes.TEXT,
    backupkeychain_public: DataTypes.TEXT,
    bitgokeychain_public: DataTypes.TEXT,
    bitgokeychain_private: DataTypes.TEXT,
    currency_id: DataTypes.INTEGER
  }, {});
  wallet.associate = function(models) {
    // associations can be defined here
  };
  return wallet;
};