'use strict';
module.exports = (sequelize, DataTypes) => {
  var portfolio_calculation = sequelize.define('portfolio_calculation', {
    user_id: DataTypes.INTEGER,
    total_amount_invested: DataTypes.STRING,
    first_year_earnings: DataTypes.STRING,
    dividend_payouts: DataTypes.STRING,
    interest_earned: DataTypes.STRING
  }, {});
  portfolio_calculation.associate = function(models) {
    // associations can be defined here
  };
  return portfolio_calculation;
};