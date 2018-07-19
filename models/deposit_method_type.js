'use strict';
module.exports = (sequelize, DataTypes) => {
  var deposit_method_type = sequelize.define('deposit_method_type', {
    deposit_method_id: DataTypes.INTEGER,
    ecorepay_account_id: DataTypes.STRING,
    ecorepay_authentication_id: DataTypes.STRING,
    bank_name: DataTypes.STRING,
    account_name: DataTypes.STRING,
    bank_address: DataTypes.TEXT,
    branch_number: DataTypes.STRING,
    institution_number: DataTypes.STRING,
    account_number: DataTypes.STRING,
    routing_number: DataTypes.STRING,
    swift_code: DataTypes.STRING,
    reference_email: DataTypes.STRING,
    paypal_payment_mode: DataTypes.STRING,
    paypal_client_id: DataTypes.STRING,
    paypal_client_secret: DataTypes.STRING
  }, {});
  deposit_method_type.associate = function(models) {
    // associations can be defined here
  };
  return deposit_method_type;
};