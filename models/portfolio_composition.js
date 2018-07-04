'use strict';
module.exports = (sequelize, DataTypes) => {
  var portfolio_composition = sequelize.define('portfolio_composition', {
    user_id: DataTypes.INTEGER,
    investor_type: DataTypes.INTEGER,
    business_name: DataTypes.STRING,
    business_number: DataTypes.STRING,
    business_registration_country: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    residence_country: DataTypes.STRING,
    investques: DataTypes.STRING,
    settlement_currency: DataTypes.STRING,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    state: DataTypes.STRING,
    incorporation_certificate: DataTypes.STRING,
    shareholders: DataTypes.STRING,
    shareholders_address: DataTypes.STRING,
    shareholders_id: DataTypes.STRING,
    government_issued_id: DataTypes.STRING,
    address_proof: DataTypes.STRING,
    bank_statement: DataTypes.STRING,
    account_name: DataTypes.STRING,
    bank_country: DataTypes.STRING,
    account_number: DataTypes.STRING,
    routing_number: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    email_address: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  portfolio_composition.associate = function(models) {
    // associations can be defined here
  };
  return portfolio_composition;
};