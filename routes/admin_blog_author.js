const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
var multer = require('multer');
var fs = require('fs');
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

        res.render('admin/blog/blog_authors', { layout: 'dashboard', title:"Blog Authors", authorDetails: authorDetails});
    });

    app.get('/admin/add-blog-author', acl,(req, res) =>{
            res.render('admin/blog/author_create', { layout: 'dashboard', title:"Add Blog Author"});
		
    });

    app.get('/admin/edit_author/:authorId', acl, async(req, res) =>{
        var authorId = req.params.authorId;

        var authorDetail = await models.author.findAll({ where: { id : authorId}});
        
        res.render('admin/blog/author_edit', { layout: 'dashboard', authorDetail: authorDetail, title:"Edit Author"});
            

    });

    app.post('/admin/post_blog_author', blogAuthorImageUpload.single('author_image'),async(req, res) =>{

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

    app.post('/admin/update_blog_author', blogAuthorImageUpload.single('edit_author_image'),async(req, res) =>{ 
        
        var postImage = '';
        var prevImage = '';

        var author_Id = req.body.author_id;

        prevImage = await models.author.findAll({where: {id: author_Id}});

        if(req.file !== undefined){

            postImage = req.file.filename;
        }
        else{
            postImage = prevImage[0].author_image; 
        }

        const update = await models.author.update({
            author_name: req.body.edit_author_name,
            author_bio: req.body.edit_author_bio,
            author_image: postImage
        },{
            where: {
                id: author_Id 
    
            }
        }).then(function(resp){
            res.json({
                status:true,
                msg: "Author saved and updated."
            });
        });

    });

    app.post('/admin/remove_author', async(req, res) =>{

        var authorId = req.body.authorId;

        models.author.destroy({
            where: {
                id: authorId
            }
        }).then(function (result) {
            res.json({status: true, msg: "Author deleted successfully."});
        });



    });

};