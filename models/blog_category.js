'use strict';
module.exports = (sequelize, DataTypes) => {
  var blog_category = sequelize.define('blog_category', {
    category_name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  blog_category.associate = function(models) {
    // associations can be defined here
  };
  return blog_category;
};