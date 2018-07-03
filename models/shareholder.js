'use strict';
module.exports = (sequelize, DataTypes) => {
  var shareholder = sequelize.define('shareholder', {
    user_id: DataTypes.STRING,
    shareholder_name: DataTypes.STRING,
    address_proof: DataTypes.STRING,
    government_issued_id: DataTypes.STRING
  }, {});
  shareholder.associate = function(models) {
    // associations can be defined here
  };
  return shareholder;
};