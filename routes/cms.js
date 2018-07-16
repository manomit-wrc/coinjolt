const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
module.exports = function (app, models) {

    //
    var multer  = require('multer');
    var im = require('imagemagick');
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


    var home_page_storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public/cms/home_page');
        },
        filename: function (req, file, cb) {
          fileExt = file.mimetype.split('/')[1];
          
          fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
          cb(null, fileName);
        }
    });

    var home_page_restrictImgType = function(req, file, cb) {

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
            res.render('admin/cms/terms_of_service',{layout: 'dashboard', terms_of_service: terms_of_service, title:"CMS- Terms of Service"});
        });
    });

    app.get('/admin/cms/quick-links/risk-disclosures', acl, (req, res) =>{

        models.cms_risk_disclosures.find({}).then(function(risk_disclosures){
            res.render('admin/cms/risk_disclosures',{layout: 'dashboard', risk_disclosures: risk_disclosures, title:"CMS- Risk Disclosure"});
        });
    });

    app.get('/admin/cms/quick-links/privacy-policy', acl, (req, res) =>{
        models.cms_privacy_policy.find({}).then(function(privacy_policy){
            res.render('admin/cms/privacy_policy',{layout: 'dashboard', privacy_policy: privacy_policy, title:"CMS- Privacy Plocy"});
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
			res.render('admin/cms/about_us', {layout: 'dashboard', details:data, title:"CMS- About US"});
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

    app.get('/admin/cms/home-page', acl, (req,res) => {
        models.cms_home_page.findAll({}).then(function (result) {
            var data = JSON.parse(JSON.stringify(result));
            res.render('admin/cms/home_page', {layout: 'dashboard', title:"CMS- Home", home_data:data});
        });
    });

    var home_page_all_upload = multer({ storage: home_page_storage, limits: {fileSize:3000000} });

    app.post('/admin/cms/home-page-submit', acl, home_page_all_upload.fields([{
        name: 'home_page_banner_image', maxCount: 1
      }, {
        name: 'how_it_works_image', maxCount: 1
      }, {
        name: 'hot_wallet_image', maxCount: 1  
      }, {
        name: 'cold_wallet_image', maxCount: 1  
      },{
        name: 'video_upload', maxCount: 1  
      }]), (req, res) => {

        var home_page_banner_image,how_it_works_image,hot_wallet_image,cold_wallet_image,video_upload;
        if (req.files.home_page_banner_image && req.files.home_page_banner_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            home_page_banner_image = req.files.home_page_banner_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ home_page_banner_image,
              dstPath: 'public/cms/home_page/resize/'+ home_page_banner_image.filename,
              width: 1920,
              height: 652
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            home_page_banner_image = '';
        }
        
        if (req.files.how_it_works_image && req.files.how_it_works_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            how_it_works_image = req.files.how_it_works_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ how_it_works_image,
              dstPath: 'public/cms/home_page/resize/'+ how_it_works_image,
              width: 667,
              height: 552
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            how_it_works_image = '';
        }
        
        if (req.files.hot_wallet_image && req.files.hot_wallet_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            hot_wallet_image = req.files.hot_wallet_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ hot_wallet_image,
              dstPath: 'public/cms/home_page/resize/'+ hot_wallet_image,
              width: 200,
              height: 200
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            hot_wallet_image = '';
        }
        
        if (req.files.cold_wallet_image && req.files.cold_wallet_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            cold_wallet_image = req.files.cold_wallet_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ cold_wallet_image,
              dstPath: 'public/cms/home_page/resize/'+ cold_wallet_image,
              width: 200,
              height: 200
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
	    }else{
            cold_wallet_image = '';
        }

        if(req.files.video_upload && req.files.video_upload.length > 0) {
            video_upload = req.files.video_upload[0].filename;
        }else{
            video_upload = '';
        }
        

        models.cms_home_page.create({
            home_page_banner_image: home_page_banner_image,
            how_it_works_image: how_it_works_image,
            how_is_works_description: req.body.how_is_works_description[1],
            hot_wallet_image: hot_wallet_image,
            hot_wallet_desc: req.body.hot_wallet_desc[1],
            cold_wallet_image: cold_wallet_image,
            cold_wallet_desc: req.body.cold_wallet_desc[1],
            video_upload: video_upload
        }).then( function (result) {
            if(result) {
                res.json({
                    status: true,
                    msg: "Submit successfully."
                });
            }
        }).catch(function (err) {
            console.log("err");
            console.log(err);
        });
    });

    app.post('/admin/cms/home-page-edit', acl, home_page_all_upload.fields([{
        name: 'home_page_banner_image', maxCount: 1
      }, {
        name: 'how_it_works_image', maxCount: 1
      }, {
        name: 'hot_wallet_image', maxCount: 1  
      }, {
        name: 'cold_wallet_image', maxCount: 1  
      },{
        name: 'video_upload', maxCount: 1  
      }]), (req, res) => {
        // console.log(req.body);
        // console.log(req.body.how_is_works_description[1],'desc');
        // console.log(req.body.hot_wallet_desc[1],'hot wallet');
        // console.log(req.body.cold_wallet_desc[1],'cold');
        // console.log(req.files);
        // return false;

        var home_page_banner_image,how_it_works_image,hot_wallet_image,cold_wallet_image,video_upload;
        if (req.files.home_page_banner_image && req.files.home_page_banner_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            home_page_banner_image = req.files.home_page_banner_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.home_page_banner_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.home_page_banner_image[0].filename,
              width: 1920,
              height: 652
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            home_page_banner_image = req.body.existing_banner_image;
        }
        
        if (req.files.how_it_works_image && req.files.how_it_works_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            how_it_works_image = req.files.how_it_works_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.how_it_works_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.how_it_works_image[0].filename,
              width: 667,
              height: 552
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            how_it_works_image = req.body.existing_hot_wallet_image_image;
        }
        
        if (req.files.hot_wallet_image && req.files.hot_wallet_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            hot_wallet_image = req.files.hot_wallet_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.hot_wallet_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.hot_wallet_image[0].filename,
              width: 200,
              height: 200
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            hot_wallet_image = req.body.existing_hot_wallet_image;
        }
        
        if (req.files.cold_wallet_image && req.files.cold_wallet_image.length > 0){
            // save thumbnail -- should this part go elsewhere?
            cold_wallet_image = req.files.cold_wallet_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.cold_wallet_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.cold_wallet_image[0].filename,
              width: 200,
              height: 200
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
	    }else{
            cold_wallet_image = req.body.existing_cold_wallet_image_image_image;
        }

        if(req.files.video_upload && req.files.video_upload.length > 0){
            video_upload = req.files.video_upload[0].filename;
        }else{
            video_upload = req.body.existing_video_upload;
        }

        models.cms_home_page.update({
        	home_page_banner_image: home_page_banner_image,
            how_it_works_image: how_it_works_image,
            how_is_works_description: req.body.how_is_works_description[1],
            hot_wallet_image: hot_wallet_image,
            hot_wallet_desc: req.body.hot_wallet_desc[1],
            cold_wallet_image: cold_wallet_image,
            cold_wallet_desc: req.body.cold_wallet_desc[1],
            video_upload: video_upload
        },{
        	where:{
        		id: req.body.row_id
        	}
        }).then(function (result) {
            console.log(result);
        	if(result) {
				res.json({
					status: true,
					msg: "Edit successfully."
				});
			}
        });
    });
    
};