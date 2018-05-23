'use strict';
module.exports = (sequelize, DataTypes) => {
  var bank_details = sequelize.define('Bank_Details', {
    user_id: DataTypes.STRING,
    acc_holder_name: DataTypes.STRING,
    bank_name: DataTypes.STRING,
    bank_address: DataTypes.STRING,
    acc_no: DataTypes.STRING,
    swift_code: DataTypes.STRING,
    branch_no: DataTypes.STRING,
    institution_no: DataTypes.STRING
  }, {});
  bank_details.associate = function(models) {
    // associations can be defined here
  };
  return bank_details;
};