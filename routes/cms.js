module.exports = function (app, cms_about_us) {
	var multer  = require('multer');
	var im = require('imagemagick');
	var fileExt = '';
	var fileName = '';
	var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
	    cb(null, 'public/cms/about_us_image');
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
	})

	var restrictImgType = function(req, file, cb) {

	    var allowedTypes = ['image/jpeg','image/gif','image/png'];
	      if (allowedTypes.indexOf(req.file.mimetype) !== -1){
	        // To accept the file pass `true`
	        cb(null, true);
	      } else {
	        // To reject this file pass `false`
	        cb(null, false);
	       //cb(new Error('File type not allowed'));// How to pass an error?
	      }
	};
	var upload = multer({ storage: storage, limits: {fileSize:3000000, fileFilter:restrictImgType} });


	app.get('/admin/cms/quick-links/about-us', (req,res) => {

		cms_about_us.findAll({

		}).then(function (result) {
			var data = JSON.parse(JSON.stringify(result));
			res.render('admin/cms/about_us', {layout: 'dashboard', details:data});
		});
		
	});

	app.post('/admin/cms/about-us-submit', upload.single('about_us_header_image'), (req,res) => {
		var photo = null;
	    var allowedTypes = ['image/jpeg','image/gif','image/png'];
        photo = fileName;

		cms_about_us.create({
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
		});
	});

	app.post('/admin/cms/about-us-edit', upload.single('about_us_header_image'), (req,res) => {
		// console.log(req.body);
		// return false;
		var photo = null;
	    var allowedTypes = ['image/jpeg','image/gif','image/png'];
        photo = fileName;

        cms_about_us.update({
        	about_us_header_desc: req.body.about_us_header_description,
			about_us_header_image: photo,
			about_us_description: req.body.description
        },{
        	where:{
        		id: req.body.row_id
        	}
        }).then(function (result) {
        	if(result) {
				res.json({
					status: true,
					msg: "Edit successfully."
				});
			}
        });
	});

	app.get('/admin/cms/quick-links/privacy-policy', (req,res) => {
		res.render('admin/cms/privact_plocy', {layout: 'dashboard'});
	});
};