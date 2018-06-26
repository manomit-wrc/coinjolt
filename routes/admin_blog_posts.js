const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
var multer = require('multer');
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
            author_id: req.user.id,
            status: 1
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Blog Post created successfully"
            });
        });
        
    });

    app.get('/admin/edit_blog_content/:blogId', (req, res) =>{
        var blogId = req.params.blogId;

        models.blog_post.findAll({ where: { id : blogId}}).then(blogDetail => {
            res.render('admin/blog/blog_edit', { layout: 'dashboard', blogDetail: blogDetail});
            
		});

    });

    app.post('/admin/update_blog_content', (req, res) =>{



        console.log('Edit content',req.body);

      
    });


};