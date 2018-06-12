const sequelize = require('sequelize');
module.exports = function (app, models) {
    var multer  = require('multer');
	//var multerS3 = require('multer-s3');
	var fs = require('fs');
	//var s3 = new AWS.S3();
	
	var fileExt = '';
    var fileName = '';
    var storage = multer.diskStorage({
		destination: function (req, file, cb) {
            cb(null, 'public/cms/terms_of_services');
		},

		filename: function (req, file, cb) {
			fileExt = file.mimetype.split('/')[1];
			if (fileExt == 'jpeg') fileExt = 'jpg';
			fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
			cb(null, fileName);
		}
	});

	var upload = multer({ storage: storage, limits: {fileSize:3000000} });

    app.get('/admin/cms/terms-of-service', (req, res) =>{

        models.cms_terms_of_service.find({}).then(function(terms_of_service){
            res.render('admin/cms/terms_of_service',{layout: 'dashboard', terms_of_service: terms_of_service});
        });
    });

    app.post('/admin/submit-terms-of-service',upload.single('banner_image'), (req, res) =>{
        //console.log('Body: ',req.body.terms_of_service_header_image);
        //console.log('File extension: ',fileExt);
        models.cms_terms_of_service.findAndCountAll({
            order: [
                sequelize.fn('max', sequelize.col('id'))
            ]
        }).then(function(results){
            var terms_id = results.rows[0].id;
            var count = results.count;
            if(count >0){
                models.cms_terms_of_service.update({
                    terms_of_service_header_desc: req.body.banner_image_title,
                    terms_of_service_content: req.body.terms_of_service_description,
                    terms_of_service_header_image : fileName
                }, {
                    where: {
                        id: terms_id
                    }
                }).then(function(result){
                    res.json({
                        status:true,
                        msg: "Terms of Service Modified Successfully"
                    });
                });
            }
            else{
                models.cms_terms_of_service.create({
                    terms_of_service_header_desc: req.body.banner_image_title,
                    terms_of_service_content: req.body.terms_of_service_description,
                    terms_of_service_header_image : fileName
                }).then(function(result){
                    res.json({
                        status:true,
                        msg: "Terms of Service Added Successfully"
                    });
                });
            }
        });
    });

};