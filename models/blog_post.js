'use strict';
module.exports = (sequelize, DataTypes) => {
  var blog_post = sequelize.define('blog_post', {
    post_title: DataTypes.STRING,
    post_description: DataTypes.TEXT,
    post_slug: DataTypes.STRING,
    featured_image: DataTypes.STRING,
    meta_title: DataTypes.STRING,
    meta_description: DataTypes.TEXT,
    post_category_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    meta_keywords: DataTypes.TEXT,
    post_author: DataTypes.STRING,
    post_author_description: DataTypes.TEXT
  }, {});
  blog_post.associate = function(models) {
    // associations can be defined here
  };
  return blog_post;
};