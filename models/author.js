'use strict';
module.exports = (sequelize, DataTypes) => {
  var author = sequelize.define('author', {
    author_name: DataTypes.STRING,
    author_bio: DataTypes.TEXT,
    author_image: DataTypes.STRING
  }, {});
  author.associate = function(models) {
    // associations can be defined here
  };
  return author;
};