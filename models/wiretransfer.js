'use strict';
module.exports = (sequelize, DataTypes) => {
  var WireTransfer = sequelize.define('WireTransfer', {
    user_id: DataTypes.INTEGER,
    amount_usd: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  WireTransfer.associate = function(models) {
    // associations can be defined here
  };
  return WireTransfer;
};