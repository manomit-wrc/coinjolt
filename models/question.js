'use strict';
module.exports = (sequelize, DataTypes) => {
  var Question = sequelize.define('question', {
    question: DataTypes.STRING
  }, {});
  Question.associate = function(models) {
    // associations can be defined here
  };
  return Question;
};