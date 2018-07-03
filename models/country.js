'use strict';
module.exports = (sequelize, DataTypes) => {
  var Country = sequelize.define('Country', {
    iso: DataTypes.STRING(2),
    name: DataTypes.STRING(80),
    nicename: DataTypes.STRING(80),
    iso3: DataTypes.STRING(3),
    numcode: DataTypes.INTEGER(6),
    phonecode: DataTypes.INTEGER(5)
  }, {});
  Country.associate = function(models) {
    // associations can be defined here
  };
  return Country;
};