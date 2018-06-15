const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
module.exports = function (app, models) {

    //
    var multer  = require('multer');
	//var multerS3 = require('multer-s3');
	var fs = require('fs');
	//var s3 = new AWS.S3();
	
	var fileExt = '';
    var termsOfServiceFileName = '';
    var riskDisclosuresFileName = '';
    var privacyPolicyFileName = '';
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
      });

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

	var termsOfServicestorage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/cms/terms_of_services');
		},

		filename: function (req, file, cb) {
			fileExt = file.mimetype.split('/')[1];
			if (fileExt == 'jpeg') fileExt = 'jpg';
			termsOfServiceFileName = req.user.id + '-' + Date.now() + '.' + fileExt;
			cb(null, termsOfServiceFileName);
		}
    });
    
    var restrictTermsOfServiceImgType = function(req, file, cb) {

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

    var termsOfServiceUpload = multer({ storage: termsOfServicestorage, limits: {fileSize:3000000, fileFilter:restrictTermsOfServiceImgType} });
    
    
    var risk_disclosuresStorage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/cms/risk_disclosures');
		},

		filename: function (req, file, cb) {
			fileExt = file.mimetype.split('/')[1];
			if (fileExt == 'jpeg') fileExt = 'jpg';
			riskDisclosuresFileName = req.user.id + '-' + Date.now() + '.' + fileExt;
			cb(null, riskDisclosuresFileName);
		}
    });
    
    var restrictRiskDisclosureImgType = function(req, file, cb) {

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

	var risk_disclosuresUpload = multer({ storage: risk_disclosuresStorage, limits: {fileSize:3000000, fileFilter:restrictRiskDisclosureImgType} });
    
    
    var privacyPolicyStorage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/cms/privacy_policy');
		},

		filename: function (req, file, cb) {
			fileExt = file.mimetype.split('/')[1];
			if (fileExt == 'jpeg') fileExt = 'jpg';
			privacyPolicyFileName = req.user.id + '-' + Date.now() + '.' + fileExt;
			cb(null, privacyPolicyFileName);
		}
    });
    
    var restrictPrivacyPolicyImgType = function(req, file, cb) {

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

    var privacyPolicyUpload = multer({ storage: privacyPolicyStorage, limits: {fileSize:3000000, fileFilter:restrictPrivacyPolicyImgType} });
    

    app.get('/admin/cms/quick-links/terms-of-service', acl, (req, res) =>{

        models.cms_terms_of_service.find({}).then(function(terms_of_service){
            res.render('admin/cms/terms_of_service',{layout: 'dashboard', terms_of_service: terms_of_service});
        });
    });

    app.get('/admin/cms/quick-links/risk-disclosures', acl, (req, res) =>{

        models.cms_risk_disclosures.find({}).then(function(risk_disclosures){
            res.render('admin/cms/risk_disclosures',{layout: 'dashboard', risk_disclosures: risk_disclosures});
        });
    });

    app.get('/admin/cms/quick-links/privacy-policy', acl, (req, res) =>{
        models.cms_privacy_policy.find({}).then(function(privacy_policy){
            res.render('admin/cms/privacy_policy',{layout: 'dashboard', privacy_policy: privacy_policy});
        });
    });

    app.post('/admin/submit-terms-of-service', acl, termsOfServiceUpload.single('banner_image'), async (req, res) =>{

        const data = await models.cms_terms_of_service.findAll({});

        if(data.length === 0) {
            const insert = await models.cms_terms_of_service.create({
                terms_of_service_header_desc: req.body.banner_image_title,
                terms_of_service_content: req.body.terms_of_service_description,
                terms_of_service_header_image: termsOfServiceFileName
            });

            res.json({
                status:true,
                msg: "Terms Of Service Added Successfully"
            });
        }
        else {
            const update = await models.cms_terms_of_service.update({
                terms_of_service_header_desc: req.body.banner_image_title,
                terms_of_service_content: req.body.terms_of_service_description,
                terms_of_service_header_image: termsOfServiceFileName
            }, {
                where: {
                    id: data[0].id
                }
            });
            res.json({
                status:true,
                msg: "Terms Of Service Modified Successfully"
            });
        }


    });

    app.post('/admin/submit-risk-disclosures', acl, risk_disclosuresUpload.single('risk_disclosures_banner_image'), async (req, res) =>{

        const data = await models.cms_risk_disclosures.findAll({});

        if(data.length === 0) {
            const insert = await models.cms_risk_disclosures.create({
                risk_disclosures_header_desc: req.body.risk_disclosures_image_title,
                risk_disclosures_content: req.body.risk_disclosures_description,
                risk_disclosures_header_image: riskDisclosuresFileName
            });

            res.json({
                status:true,
                msg: "Risk Disclosure Added Successfully"
            });
        }
        else {
            const update = await models.cms_risk_disclosures.update({
                risk_disclosures_header_desc: req.body.risk_disclosures_image_title,
                risk_disclosures_content: req.body.risk_disclosures_description,
                risk_disclosures_header_image: riskDisclosuresFileName
            }, {
                where: {
                    id: data[0].id
                }
            });
            res.json({
                status:true,
                msg: "Risk Disclosure Modified Successfully"
            });
        }

    });

    app.post('/admin/submit-privacy-policy', acl, privacyPolicyUpload.single('privacy_policy_banner_image'), async (req, res) =>{

        const data = await models.cms_privacy_policy.findAll({});

        if(data.length === 0) {
            const insert = await models.cms_privacy_policy.create({
                privacy_policy_header_desc: req.body.privacy_policy_image_title,
                privacy_policy_content: req.body.privacy_policy_description,
                privacy_policy_header_image: privacyPolicyFileName
            });

            res.json({
                status:true,
                msg: "Privacy Policy Added Successfully"
            });
        }
        else {
            const update = await models.cms_privacy_policy.update({
                privacy_policy_header_desc: req.body.privacy_policy_image_title,
                privacy_policy_content: req.body.privacy_policy_description,
                privacy_policy_header_image: privacyPolicyFileName
            }, {
                where: {
                    id: data[0].id
                }
            });
            res.json({
                status:true,
                msg: "Privacy Policy Modified Successfully"
            });
        }

    });
    var upload = multer({ storage: storage, limits: {fileSize:3000000, fileFilter:restrictImgType} });

	app.get('/admin/cms/quick-links/about-us', acl, (req,res) => {

		models.cms_about_us.findAll({

		}).then(function (result) {
			var data = JSON.parse(JSON.stringify(result));
			res.render('admin/cms/about_us', {layout: 'dashboard', details:data});
		});
		
	});

	app.post('/admin/cms/about-us-submit', acl, upload.single('about_us_header_image'), (req,res) => {
		var photo = null;
	    var allowedTypes = ['image/jpeg','image/gif','image/png'];
        photo = fileName;

		models.cms_about_us.create({
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

	app.post('/admin/cms/about-us-edit', acl, upload.single('about_us_header_image'), (req,res) => {
		var photo = null;
	    var allowedTypes = ['image/jpeg','image/gif','image/png'];
        photo = fileName;

        models.cms_about_us.update({
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
    
};