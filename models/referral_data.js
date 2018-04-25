'use strict';
module.exports = (sequelize, DataTypes) => {
  var Referral_data = sequelize.define('Referral_data', {
    user_id: DataTypes.INTEGER,
    referral_id: DataTypes.INTEGER,
    deposit_amount: DataTypes.DECIMAL(10, 2),
    referral_amount: DataTypes.DECIMAL(10, 2)

  }, {});
  Referral_data.associate = function(models) {
    // associations can be defined here
  };
  return Referral_data;
};