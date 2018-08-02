const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
var multer = require('multer');
var fs = require('fs');
module.exports = function (app, models) {

    var blogImageStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public/blog_images');
        },
        filename: function (req, file, cb) {
          fileExt = file.mimetype.split('/')[1];
          if (fileExt == 'jpeg'){ 
              fileExt = 'jpg';
          }else if(fileExt == 'png') {
              fileExt = 'png';
          }
          fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
          cb(null, fileName);
        }
      });

      var restrictBlogImgType = function(req, file, cb) {

        var allowedTypes = ['image/jpeg','image/gif','image/png'];
          if (allowedTypes.indexOf(req.file.mimetype) !== -1){
            cb(null, true);
          } else {
            cb(null, false);
          }
    };

    var blogImageUpload = multer({ storage: blogImageStorage, limits: {fileSize:3000000, fileFilter:restrictBlogImgType} });


        app.post('/admin/post_blog_content', acl, blogImageUpload.fields([{
            name: 'post_featured_image', maxCount: 1
          }, {
            name: 'post_author_image', maxCount: 1
          }]), async(req, res) =>{

            var postFeaturedImg, postAuthorImg;

            if (req.files.post_featured_image && req.files.post_featured_image.length > 0){

                postFeaturedImg = req.files.post_featured_image[0].filename;
                
            }else{
                postFeaturedImg = '';        
            }

            
            if (req.files.post_author_image && req.files.post_author_image.length > 0){

                postAuthorImg = req.files.post_author_image[0].filename;
                
            }else{
                postAuthorImg = ''; 
            }

        const insert = await models.blog_post.create({
            post_title: req.body.blog_post_title,
            post_description: req.body.post_description,
            post_slug: req.body.post_slug,
            featured_image: postFeaturedImg,
            meta_title: req.body.meta_title,
            meta_description: req.body.meta_description,
            status: 1,
            post_category_id: req.body.post_category,
            meta_keywords: req.body.meta_keywords,
            post_author: req.body.post_author_name,
            post_author_image: postAuthorImg
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Blog post created successfully."
            });
        });
        
    });

    app.get('/admin/edit_blog_content/:blogId', async(req, res) =>{
        var blogId = req.params.blogId;

        var blogDetail = await models.blog_post.findAll({ where: { id : blogId}});

        var blog_categories = await models.blog_category.findAll({where: {status: 1}});
        res.render('admin/blog/blog_edit', { layout: 'dashboard', blogDetail: blogDetail, blog_categories: blog_categories, title:"Edit Blog Post"});
            

    });

    //app.post('/admin/update_blog_content', acl, blogImageUpload.single('edit_post_featured_image'), async(req, res) =>{

        app.post('/admin/update_blog_content', acl, blogImageUpload.fields([{
            name: 'edit_post_featured_image', maxCount: 1
          }, {
            name: 'edit_author_image', maxCount: 1
          }]), async(req, res) =>{

        var editPostFeaturedImage = '';
        var editPostAuthorImage = '';
        var prevImages;

        var blog_Id = req.body.blog_id;

        prevImages = await models.blog_post.findAll({where: {id: blog_Id}});

        if (req.files.edit_post_featured_image && req.files.edit_post_featured_image.length > 0){

            editPostFeaturedImage = req.files.edit_post_featured_image[0].filename;
            
        }else{
            editPostFeaturedImage = prevImages[0].featured_image;        
        }

        
        if (req.files.edit_author_image && req.files.edit_author_image.length > 0){

            editPostAuthorImage = req.files.edit_author_image[0].filename;
            
        }else{
            editPostAuthorImage = prevImages[0].post_author_image; 
        }

        const update = await models.blog_post.update({
            post_title: req.body.edit_blog_post_title,
            post_description: req.body.edit_post_description,
            post_slug: req.body.edit_post_slug,
            featured_image: editPostFeaturedImage,
            meta_title: req.body.edit_meta_title,
            meta_description: req.body.edit_meta_description,
            status: 1,
            post_category_id: req.body.edit_post_category,
            meta_keywords: req.body.edit_meta_keywords,
            post_author: req.body.post_author_name,
            post_author_image : editPostAuthorImage
        },{
            where: {
                id: blog_Id 
    
            }
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Blog post saved and updated."
            });
        });

      
    });

    app.post('/admin/remove_blog_content', async(req, res) =>{
        
        var blogID = req.body.blogId;
        const getBlogImage = await models.blog_post.findAll({where: {id: blogID}});
        
        var imgName = getBlogImage[0].featured_image;

        if(imgName!= ''){
            fs.unlink('public/blog_images/'+ imgName, (err) => {});
        }

        models.blog_post.destroy({
            where: {
                id: blogID
            }
        }).then(function (result) {
            res.json({status: true, msg: "Blog post deleted successfully."});
        });

    });


};