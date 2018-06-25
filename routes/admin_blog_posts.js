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
        photo = fileName;

        //console.log(req.body.post_description);

        //console.log('post description:: ', typeof req.body.post_description);
        
        const insert = await models.blog_post.create({
            post_title: req.body.blog_post_title,
            post_description: req.body.post_description[0],
            post_slug: req.body.post_slug,
            featured_image: req.file.filename,
            meta_title: req.body.meta_title,
            meta_description: req.body.meta_description,
            post_author: req.body.author_name
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Blog Post created successfully"
            });
        });
    });

    // edit blog post content

    

};