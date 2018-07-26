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
    

    app.get('/admin/configuration/quick-links/terms-of-service', acl, (req, res) =>{

        models.cms_terms_of_service.find({}).then(function(terms_of_service){
            res.render('admin/cms/terms_of_service',{layout: 'dashboard', terms_of_service: terms_of_service, title:"CMS- Terms of Service"});
        });
    });

    app.get('/admin/configuration/quick-links/risk-disclosures', acl, (req, res) =>{

        models.cms_risk_disclosures.find({}).then(function(risk_disclosures){
            res.render('admin/cms/risk_disclosures',{layout: 'dashboard', risk_disclosures: risk_disclosures, title:"CMS- Risk Disclosure"});
        });
    });

    app.get('/admin/configuration/quick-links/privacy-policy', acl, (req, res) =>{
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

	app.get('/admin/configuration/quick-links/about-us', acl, (req,res) => {

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

    app.get('/admin/configuration/home-page', acl, (req,res) => {
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
        name: 'div1', maxCount: 1  
      },{
        name: 'div2', maxCount: 1  
      },{
        name: 'div3', maxCount: 1  
      },{
        name: 'div4', maxCount: 1  
      },{
        name: 'div5', maxCount: 1  
      },{
        name: 'div6', maxCount: 1  
      },{
        name: 'buy_sell_div1_image', maxCount: 1  
      },{
        name: 'buy_sell_div2_image', maxCount: 1  
      },{
        name: 'buy_sell_div3_image', maxCount: 1  
      },{
        name: 'buy_sell_div4_image', maxCount: 1  
      },{
        name: 'risk_disclousure_div1_image', maxCount: 1  
      },{
        name: 'risk_disclousure_div2_image', maxCount: 1  
      },{
        name: 'risk_disclousure_div3_image', maxCount: 1  
      }]), (req, res) => {

        var home_page_banner_image,how_it_works_image,hot_wallet_image,cold_wallet_image,video_uploadindustry_Leading_Div_1_Image, industry_Leading_Div_2_Image, industry_Leading_Div_3_Image, industry_Leading_Div_4_Image, industry_Leading_Div_5_Image, industry_Leading_Div_6_Image, buy_sell_div1_image, buy_sell_div2_image, buy_sell_div3_image, buy_sell_div4_image, risk_disclousure_div1_image, risk_disclousure_div2_image, risk_disclousure_div3_image;

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

        if (req.files.div1 && req.files.div1.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_1_Image = req.files.div1[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div1[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div1[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_1_Image = '';
        }

        if (req.files.div2 && req.files.div2.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_2_Image = req.files.div2[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div2[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div2[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_2_Image = '';
        }

        if (req.files.div3 && req.files.div3.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_3_Image = req.files.div3[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div3[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div3[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_3_Image = '';
        }

        if (req.files.div4 && req.files.div4.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_4_Image = req.files.div4[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div4[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div4[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_4_Image = '';
        }

        if (req.files.div5 && req.files.div5.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_5_Image = req.files.div5[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div5[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div5[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_5_Image = '';
        }

        if (req.files.div6 && req.files.div6.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_6_Image = req.files.div6[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div6[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div6[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_6_Image = '';
        }

        if (req.files.buy_sell_div1_image && req.files.buy_sell_div1_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div1_image = req.files.buy_sell_div1_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div1_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div1_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div1_image = '';
        }

        if (req.files.buy_sell_div2_image && req.files.buy_sell_div2_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div2_image = req.files.buy_sell_div2_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div2_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div2_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div2_image = '';
        }

        if (req.files.buy_sell_div3_image && req.files.buy_sell_div3_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div3_image = req.files.buy_sell_div3_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div3_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div3_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div3_image = '';
        }

        if (req.files.buy_sell_div4_image && req.files.buy_sell_div4_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div4_image = req.files.buy_sell_div4_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div4_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div4_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div4_image = '';
        }

        if (req.files.risk_disclousure_div1_image && req.files.risk_disclousure_div1_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            risk_disclousure_div1_image = req.files.risk_disclousure_div1_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.risk_disclousure_div1_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.risk_disclousure_div1_image[0].filename,
              width: 100,
              height: 100
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            risk_disclousure_div1_image = '';
        }

        if (req.files.risk_disclousure_div2_image && req.files.risk_disclousure_div2_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            risk_disclousure_div2_image = req.files.risk_disclousure_div2_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.risk_disclousure_div2_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.risk_disclousure_div2_image[0].filename,
              width: 100,
              height: 100
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            risk_disclousure_div2_image = '';
        }

        if (req.files.risk_disclousure_div3_image && req.files.risk_disclousure_div3_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            risk_disclousure_div3_image = req.files.risk_disclousure_div3_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.risk_disclousure_div3_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.risk_disclousure_div3_image[0].filename,
              width: 100,
              height: 100
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            risk_disclousure_div3_image = '';
        }
        

        models.cms_home_page.create({
            home_page_banner_image: home_page_banner_image,
            how_it_works_image: how_it_works_image,

            how_is_works_reg_description: req.body.how_is_works_reg_description[1],
            
            how_is_works_deposit_funds_description: req.body.how_is_works_deposit_funds_description[1],
            
            how_is_works_safe_and_secure_description: req.body.how_is_works_safe_and_secure_description[1],
            
            hot_wallet_image: hot_wallet_image,
            hot_wallet_desc: req.body.hot_wallet_desc[1],
            cold_wallet_image: cold_wallet_image,
            cold_wallet_desc: req.body.cold_wallet_desc[1],
            industry_leading_div1_image : industry_Leading_Div_1_Image,
            industry_leading_div2_image : industry_Leading_Div_2_Image,
            industry_leading_div3_image : industry_Leading_Div_3_Image,
            industry_leading_div4_image : industry_Leading_Div_4_Image,
            industry_leading_div5_image : industry_Leading_Div_5_Image,
            industry_leading_div6_image : industry_Leading_Div_6_Image,
            div1_heading : req.body.div1_heading,
            div2_heading : req.body.div2_heading,
            div3_heading : req.body.div3_heading,
            div4_heading : req.body.div4_heading,
            div5_heading : req.body.div5_heading,
            div6_heading : req.body.div6_heading,
            div1_desc : req.body.div1_desc[1],
            div2_desc : req.body.div2_desc[1],
            div3_desc : req.body.div3_desc[1],
            div4_desc : req.body.div4_desc[1],
            div5_desc : req.body.div5_desc[1],
            div6_desc : req.body.div6_desc[1],
            buy_sell_div1_image: buy_sell_div1_image,
            buy_sell_div2_image: buy_sell_div2_image,
            buy_sell_div3_image: buy_sell_div3_image,
            buy_sell_div4_image: buy_sell_div4_image,
            buy_sell_div1_heading : req.body.buy_sell_div1_heading,
            buy_sell_div2_heading : req.body.buy_sell_div2_heading,
            buy_sell_div3_heading : req.body.buy_sell_div3_heading,
            buy_sell_div4_heading : req.body.buy_sell_div4_heading,
            buy_sell_div1_desc : req.body.buy_sell_div1_desc[1],
            buy_sell_div2_desc : req.body.buy_sell_div2_desc[1],
            buy_sell_div3_desc : req.body.buy_sell_div3_desc[1],
            buy_sell_div4_desc : req.body.buy_sell_div4_desc[1],
            risk_disclousure_div1_image : risk_disclousure_div1_image,
            risk_disclousure_div2_image : risk_disclousure_div2_image,
            risk_disclousure_div3_image : risk_disclousure_div3_image,
            risk_disclousure_div1_heading : req.body.risk_disclousure_div1_heading,
            risk_disclousure_div2_heading : req.body.risk_disclousure_div2_heading,
            risk_disclousure_div3_heading : req.body.risk_disclousure_div3_heading,
            risk_disclousure_div1_desc : req.body.risk_disclousure_div1_desc[1],
            risk_disclousure_div2_desc : req.body.risk_disclousure_div2_desc[1],
            risk_disclousure_div3_desc : req.body.risk_disclousure_div3_desc[1]
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
      },{
        name: 'div1', maxCount: 1  
      },{
        name: 'div2', maxCount: 1  
      },{
        name: 'div3', maxCount: 1  
      },{
        name: 'div4', maxCount: 1  
      },{
        name: 'div5', maxCount: 1  
      },{
        name: 'div6', maxCount: 1  
      },{
        name: 'buy_sell_div1_image', maxCount: 1  
      },{
        name: 'buy_sell_div2_image', maxCount: 1  
      },{
        name: 'buy_sell_div3_image', maxCount: 1  
      },{
        name: 'buy_sell_div4_image', maxCount: 1  
      },{
        name: 'risk_disclousure_div1_image', maxCount: 1  
      },{
        name: 'risk_disclousure_div2_image', maxCount: 1  
      },{
        name: 'risk_disclousure_div3_image', maxCount: 1  
      }]), (req, res) => {

        var home_page_banner_image,how_it_works_image,hot_wallet_image,cold_wallet_image,video_upload, industry_Leading_Div_1_Image, industry_Leading_Div_2_Image, industry_Leading_Div_3_Image, industry_Leading_Div_4_Image, industry_Leading_Div_5_Image, industry_Leading_Div_6_Image, buy_sell_div1_image, buy_sell_div2_image, buy_sell_div3_image, buy_sell_div4_image, risk_disclousure_div1_image, risk_disclousure_div2_image, risk_disclousure_div3_image;

        
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


        if (req.files.div1 && req.files.div1.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_1_Image = req.files.div1[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div1[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div1[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_1_Image = req.body.existing_div1_image;
        }

        if (req.files.div2 && req.files.div2.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_2_Image = req.files.div2[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div2[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div2[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_2_Image = req.body.existing_div2_image;
        }

        if (req.files.div3 && req.files.div3.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_3_Image = req.files.div3[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div3[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div3[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_3_Image = req.body.existing_div3_image;
        }

        if (req.files.div4 && req.files.div4.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_4_Image = req.files.div4[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div4[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div4[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_4_Image = req.body.existing_div4_image;
        }

        if (req.files.div5 && req.files.div5.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_5_Image = req.files.div5[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div5[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div5[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_5_Image = req.body.existing_div5_image;
        }

        if (req.files.div6 && req.files.div6.length > 0){

            // save thumbnail -- should this part go elsewhere?
            industry_Leading_Div_6_Image = req.files.div6[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.div6[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.div6[0].filename,
              width: 72,
              height: 72
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            industry_Leading_Div_6_Image = req.body.existing_div6_image;
        }

        if (req.files.buy_sell_div1_image && req.files.buy_sell_div1_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div1_image = req.files.buy_sell_div1_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div1_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div1_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div1_image = req.body.existing_buy_sell_div1_image;
        }

        if (req.files.buy_sell_div2_image && req.files.buy_sell_div2_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div2_image = req.files.buy_sell_div2_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div2_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div2_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div2_image = req.body.existing_buy_sell_div2_image;
        }

        if (req.files.buy_sell_div3_image && req.files.buy_sell_div3_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div3_image = req.files.buy_sell_div3_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div3_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div3_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div3_image = req.body.existing_buy_sell_div3_image;
        }

        if (req.files.buy_sell_div4_image && req.files.buy_sell_div4_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            buy_sell_div4_image = req.files.buy_sell_div4_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.buy_sell_div4_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.buy_sell_div4_image[0].filename,
              width: 118,
              height: 112
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            buy_sell_div4_image = req.body.existing_buy_sell_div4_image;
        }

        if (req.files.risk_disclousure_div1_image && req.files.risk_disclousure_div1_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            risk_disclousure_div1_image = req.files.risk_disclousure_div1_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.risk_disclousure_div1_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.risk_disclousure_div1_image[0].filename,
              width: 100,
              height: 100
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            risk_disclousure_div1_image = req.body.existing_risk_disclousure_div1_image;
        }

        if (req.files.risk_disclousure_div2_image && req.files.risk_disclousure_div2_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            risk_disclousure_div2_image = req.files.risk_disclousure_div2_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.risk_disclousure_div2_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.risk_disclousure_div2_image[0].filename,
              width: 100,
              height: 100
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            risk_disclousure_div2_image = req.body.existing_risk_disclousure_div2_image;
        }

        if (req.files.risk_disclousure_div3_image && req.files.risk_disclousure_div3_image.length > 0){

            // save thumbnail -- should this part go elsewhere?
            risk_disclousure_div3_image = req.files.risk_disclousure_div3_image[0].filename;
            im.crop({
              srcPath: 'public/cms/home_page/'+ req.files.risk_disclousure_div3_image[0].filename,
              dstPath: 'public/cms/home_page/resize/'+ req.files.risk_disclousure_div3_image[0].filename,
              width: 100,
              height: 100
            }, function(err, stdout, stderr){
              if (err) throw err;
              
            });
        }else{
            risk_disclousure_div3_image = req.body.existing_risk_disclousure_div3_image;
        }

        models.cms_home_page.update({
        	home_page_banner_image: home_page_banner_image,
            how_it_works_image: how_it_works_image,
            
            how_is_works_reg_description: req.body.how_is_works_reg_description[1],
            
            how_is_works_deposit_funds_description: req.body.how_is_works_deposit_funds_description[1],
            
            how_is_works_safe_and_secure_description: req.body.how_is_works_safe_and_secure_description[1],
            
            hot_wallet_image: hot_wallet_image,
            hot_wallet_desc: req.body.hot_wallet_desc[1],
            cold_wallet_image: cold_wallet_image,
            cold_wallet_desc: req.body.cold_wallet_desc[1],
            industry_leading_div1_image : industry_Leading_Div_1_Image,
            industry_leading_div2_image : industry_Leading_Div_2_Image,
            industry_leading_div3_image : industry_Leading_Div_3_Image,
            industry_leading_div4_image : industry_Leading_Div_4_Image,
            industry_leading_div5_image : industry_Leading_Div_5_Image,
            industry_leading_div6_image : industry_Leading_Div_6_Image,
            div1_heading : req.body.div1_heading,
            div2_heading : req.body.div2_heading,
            div3_heading : req.body.div3_heading,
            div4_heading : req.body.div4_heading,
            div5_heading : req.body.div5_heading,
            div6_heading : req.body.div6_heading,
            div1_desc : req.body.div1_desc[1],
            div2_desc : req.body.div2_desc[1],
            div3_desc : req.body.div3_desc[1],
            div4_desc : req.body.div4_desc[1],
            div5_desc : req.body.div5_desc[1],
            div6_desc : req.body.div6_desc[1],
            buy_sell_div1_image: buy_sell_div1_image,
            buy_sell_div2_image: buy_sell_div2_image,
            buy_sell_div3_image: buy_sell_div3_image,
            buy_sell_div4_image: buy_sell_div4_image,
            buy_sell_div1_heading : req.body.buy_sell_div1_heading,
            buy_sell_div2_heading : req.body.buy_sell_div2_heading,
            buy_sell_div3_heading : req.body.buy_sell_div3_heading,
            buy_sell_div4_heading : req.body.buy_sell_div4_heading,
            buy_sell_div1_desc : req.body.buy_sell_div1_desc[1],
            buy_sell_div2_desc : req.body.buy_sell_div2_desc[1],
            buy_sell_div3_desc : req.body.buy_sell_div3_desc[1],
            buy_sell_div4_desc : req.body.buy_sell_div4_desc[1],
            risk_disclousure_div1_image : risk_disclousure_div1_image,
            risk_disclousure_div2_image : risk_disclousure_div2_image,
            risk_disclousure_div3_image : risk_disclousure_div3_image,
            risk_disclousure_div1_heading : req.body.risk_disclousure_div1_heading,
            risk_disclousure_div2_heading : req.body.risk_disclousure_div2_heading,
            risk_disclousure_div3_heading : req.body.risk_disclousure_div3_heading,
            risk_disclousure_div1_desc : req.body.risk_disclousure_div1_desc[1],
            risk_disclousure_div2_desc : req.body.risk_disclousure_div2_desc[1],
            risk_disclousure_div3_desc : req.body.risk_disclousure_div3_desc[1]
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