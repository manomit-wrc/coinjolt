'use strict';
module.exports = (sequelize, DataTypes) => {
  var Answer = sequelize.define('answer', {
    question_id: DataTypes.INTEGER,
    option_id: DataTypes.INTEGER
  }, {});
  Answer.associate = function(models) {
    // associations can be defined here
  };
  return Answer;
};