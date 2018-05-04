'use strict';
module.exports = (sequelize, DataTypes) => {
  var Support = sequelize.define('Support', {
    user_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    enquiry: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  Support.associate = function(models) {
    // associations can be defined here
  };
  return Support;
};