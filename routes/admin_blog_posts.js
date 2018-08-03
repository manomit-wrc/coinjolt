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

    app.post('/admin/post_blog_content', acl, blogImageUpload.single('post_featured_image'), async(req,res) => {

        // console.log(req.body);

        var photo = null;
        var allowedTypes = ['image/jpeg','image/gif','image/png'];
        var postImage = '';
        if(req.file !== undefined){

            postImage = req.file.filename;
        }
        else{
            postImage = '';
        }

        const insert = await models.blog_post.create({
            post_title: req.body.blog_post_title,
            post_description: req.body.post_description,
            post_slug: req.body.post_slug,
            featured_image: postImage,
            meta_title: req.body.meta_title,
            meta_description: req.body.meta_description,
            status: 1,
            post_category_id: req.body.post_category,
            meta_keywords: req.body.meta_keywords,
            author_id: req.body.post_author_name
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Blog post created successfully."
            });
        });
        
    });

    app.get('/admin/edit_blog_content/:blogId', acl, async(req, res) =>{
        var blogId = req.params.blogId;

        var blogDetail = await models.blog_post.findAll({ where: { id : blogId}});

        var blog_categories = await models.blog_category.findAll({where: {status: 1}});
        var authors = await models.author.findAll();
        res.render('admin/blog/blog_edit', { layout: 'dashboard', blogDetail: blogDetail, blog_categories: blog_categories, title:"Edit Blog Post", authors: authors});
            

    });

    app.post('/admin/update_blog_content', acl, blogImageUpload.single('edit_post_featured_image'), async(req, res) =>{

        var postImage = '';
        var prevImage = '';

        var blog_Id = req.body.blog_id;

        prevImage = await models.blog_post.findAll({where: {id: blog_Id}});

        if(req.file !== undefined){

            postImage = req.file.filename;
        }
        else{
            postImage = prevImage[0].featured_image; 
        }

        const update = await models.blog_post.update({
            post_title: req.body.edit_blog_post_title,
            post_description: req.body.edit_post_description,
            post_slug: req.body.edit_post_slug,
            featured_image: postImage,
            meta_title: req.body.edit_meta_title,
            meta_description: req.body.edit_meta_description,
            status: 1,
            post_category_id: req.body.edit_post_category,
            meta_keywords: req.body.edit_meta_keywords,
            author_id: req.body.edit_post_author_name
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