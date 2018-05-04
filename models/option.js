'use strict';
module.exports = (sequelize, DataTypes) => {
  var Option = sequelize.define('option', {
    option: DataTypes.STRING,
    question_id: DataTypes.INTEGER
  }, {});
  Option.associate = function(models) {
    // associations can be defined here
  };
  return Option;
};