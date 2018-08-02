const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
var multer = require('multer');
module.exports = function (app, models) {

    var blogAuthorImageStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public/author_images');
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

      var restrictAuthorImgType = function(req, file, cb) {

        var allowedTypes = ['image/jpeg','image/gif','image/png'];
          if (allowedTypes.indexOf(req.file.mimetype) !== -1){
            cb(null, true);
          } else {
            cb(null, false);
          }
    };  

    var blogAuthorImageUpload = multer({ storage: blogAuthorImageStorage, limits: {fileSize:3000000, fileFilter:restrictAuthorImgType} });


    app.get('/admin/blog-authors', acl, async(req, res) =>{

        var authorDetails = await models.author.findAll({});

        //console.log(JSON.stringify(authorDetails, undefined, 2));

        res.render('admin/blog/blog_authors', { layout: 'dashboard', title:"Blog Authors", authorDetails: authorDetails});
    });

    app.get('/admin/add-blog-author', acl,(req, res) =>{
            res.render('admin/blog/author_create', { layout: 'dashboard', title:"Add Blog Author"});
		
    });

    app.post('/admin/post_blog_author', blogAuthorImageUpload.single('author_image'),async(req, res) =>{
        //console.log(JSON.stringify(req.body, undefined, 2));

        if(req.file !== undefined){

            authorImage = req.file.filename;
        }
        else{
            authorImage = '';
        }

        const insert = await models.author.create({
            author_name: req.body.author_name,
            author_bio: req.body.author_bio,
            author_image: authorImage
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Author created successfully."
            });
        });


    });

};