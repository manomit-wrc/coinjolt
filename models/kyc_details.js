'use strict';
module.exports = (sequelize, DataTypes) => {
  var Kyc_details = sequelize.define('Kyc_details', {
    user_id: DataTypes.INTEGER,
    files: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  Kyc_details.associate = function(models) {
    // associations can be defined here
  };
  return Kyc_details;
};