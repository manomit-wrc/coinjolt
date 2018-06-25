const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
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

      var restrictImgType = function(req, file, cb) {

        var allowedTypes = ['image/jpeg','image/gif','image/png'];
          if (allowedTypes.indexOf(req.file.mimetype) !== -1){
            cb(null, true);
          } else {
            cb(null, false);
          }
    };

    var blogImageUpload = multer({ storage: blogImageStorage, limits: {fileSize:3000000, fileFilter:restrictImgType} });

    app.post('/admin/post_blog_content', acl, blogImageUpload.single('post_featured_image'), (req,res) => {
        var photo = null;
        var allowedTypes = ['image/jpeg','image/gif','image/png'];
        photo = fileName;

        console.log(req.body);


        /* models.cms_about_us.create({
            about_us_header_desc: req.body.about_us_header_description,
            about_us_header_image: photo,
            about_us_description: req.body.description
        }).then( function (result) {
            if(result) {
                res.json({
                    status: true,
                    msg: "Submit successfully."
                });
            }
        }); */




    });    


};