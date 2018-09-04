var bCrypt = require('bcrypt-nodejs');
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
const lodash = require('lodash');
const keys = require('../config/key');
var multer = require('multer');
var multerS3 = require('multer-s3');
const async = require('async');
const request = require('request');

var Client = require('node-rest-client').Client;
 
var client = new Client();

const user_acl = require('../middlewares/user_acl');
const two_factor_checking = require('../middlewares/two_factor_checking');

// var BitGo = require('bitgo');
// var bitgo = new BitGo.BitGo({
//     env: 'test'
// });
var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'prod',
    accessToken: process.env.ACCESS_TOKEN
});
//for two factor authentication
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
//end

const paypal = require('paypal-rest-sdk');

const fs = require('fs');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUATycL0pSdb7ivwQB2fBA8w-rTO68U_GwxTfVhg4U7DisEnADJ1KBisL1DJkwlbaH59BVBx8SDhHUNN',
    'client_secret': 'EPLeyHfz7ZBN304lgZT3NDHiLCjnKJpOnWpFyrTIXi9WF8bcbyU2Bky39FRzaDVDiUm64GAo7O1ZRVQo'
});

module.exports = function (app, Country, User, Currency, Support, Deposit, Referral_data, withdraw, Question, Option, Answer, AWS, Kyc_details, portfolio_composition, currency_balance, shareholder, wallet, wallet_address, wallet_transaction, portfolio_calculation, blog_post, email_template, email_template_type, author, cold_wallet_balance, deposit_method_type, WireTransfer) {

    var s3 = new AWS.S3({ accessKeyId: keys.accessKeyId, secretAccessKey: keys.secretAccessKey });
    var s3bucket = new AWS.S3({accessKeyId: keys.accessKeyId, secretAccessKey: keys.secretAccessKey, params: {Bucket: 'coinjoltdev2018'}});
    var fileExt = '';
    var fileName = '';
    var userUrl = '';
    var profile_upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'coinjoltdev2018/profile',
        acl: 'public-read',
        cacheControl: 'max-age=31536000',
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            fileExt = file.mimetype.split('/')[1];
            if (fileExt == 'jpeg') fileExt = 'jpg';
            fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
            userUrl = keys.S3_URL + 'profile/'+fileName;
            cb(null, fileName);
        }
      })
    });

    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'coinjoltdev2018/id-proof',
        acl: 'public-read',
        cacheControl: 'max-age=31536000',
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            fileExt = file.mimetype.split('/')[1];
            if (fileExt == 'jpeg') fileExt = 'jpg';
            fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
            userUrl = keys.S3_URL + 'id-proof/'+fileName;
            cb(null, fileName);
        }
      })
    });

    var address_proof = multer({
        storage: multerS3({
          s3: s3,
          bucket: 'coinjoltdev2018/id-proof',
          acl: 'public-read',
          cacheControl: 'max-age=31536000',
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
              fileExt = file.mimetype.split('/')[1];
              if (fileExt == 'jpeg') fileExt = 'jpg';
              fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
              userUrl = keys.S3_URL + 'id-proof/'+fileName;
              cb(null, fileName);
          }
        })
      });

      var shareholder_id = multer({
        storage: multerS3({
          s3: s3,
          bucket: 'coinjoltdev2018',
          acl: 'public-read',
          cacheControl: 'max-age=31536000',
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
              fileExt = file.mimetype.split('/')[1];
              if (fileExt == 'jpeg') fileExt = 'jpg';
              fileName = 'government-id/'+req.user.id + '-' + Date.now() + '.' + fileExt;
              userUrl = keys.S3_URL + 'government-id/'+fileName;
              cb(null, fileName);
          }
        })
      });

      var bank_statement = multer({
        storage: multerS3({
          s3: s3,
          bucket: 'coinjoltdev2018/bank-account-statement',
          acl: 'public-read',
          cacheControl: 'max-age=31536000',
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
              fileExt = file.mimetype.split('/')[1];
              if (fileExt == 'jpeg') fileExt = 'jpg';
              fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
              userUrl = keys.S3_URL + 'bank-account-statement/'+fileName;
              cb(null, fileName);
          }
        })
      });
    
    app.get('/account/dashboard', user_acl, two_factor_checking, async (req, res) => {
        blog_post.belongsTo(author, {foreignKey: 'author_id'});
        blog_post.findAll({
            where:{
                //post_category_id: 3
                createdAt: {
                    lte: new Date()
                }
            },
            include: [{
                model: author
            }],
            limit: 4,
            // order: [
            //     ['id', 'DESC']
            // ]
            order: [
                ['createdAt', 'DESC']
            ]
        }).then( function (blogPosts) {
            // console.log(JSON.stringify(blogPosts, undefined, 2));
            User.findById(req.user.id).then( function (result) {
                var result = JSON.parse(JSON.stringify(result));
                res.render('dashboard', {
                    layout: 'dashboard',
                    blogPosts: blogPosts,
                    // two_factorAuth_status: 1,
                    title:"Dashboard"
                });

                // if(result.two_factorAuth_status == 1){
                //     // res.render('two_factor_authentication');
                //     res.render('dashboard', {
                //         layout: 'dashboard',
                //         blogPosts: blogPosts,
                //         two_factorAuth_status: 1,
                //         title:"Dashboard"
                //     });
                // }else if (result.two_factorAuth_status == 2) {
                //     //two factor authentication
                //     var secret = speakeasy.generateSecret({
                //         issuer: 'Coin Jolt',
                //         length: 30,
                //         name: 'Coin Jolt'
                //     });

                //     QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
                //         User.update({
                //             two_factorAuth_secret_key: secret.base32,
                //             two_factorAuth_qr_code_image: image_data
                //         },{
                //             where:{
                //                 id: req.user.id
                //             }
                //         }).then( result => {
                //             if(result) {
                //                 User.findById(req.user.id).then(user_update_result => {
                //                     var data = JSON.parse(JSON.stringify(user_update_result));
                //                     res.render('dashboard', {
                //                         layout: 'dashboard',
                //                         blogPosts: blogPosts,
                //                         user_details: data,
                //                         two_factorAuth_status: data.two_factorAuth_status,
                //                         title:"Dashboard"
                //                     });
                //                 });
                //             }
                //         });
                //     });
                // }
            });
        });
    });

    // app.post('/check_two_factor_authentication', async (req,res) => {
    //     var two_factor_auth_secret_key = req.body.two_factor_auth_secret_key;
    //     var userToken = req.body.user_secret_key;

    //     // var verified = await speakeasy.totp.verify({
    //     //   secret: two_factor_auth_secret_key,
    //     //   encoding: 'base32',
    //     //   token: userToken
    //     // });

    //     var verified = await twoFactor.verifyToken(two_factor_auth_secret_key, userToken, 6);
    //     console.log(verified);
    //     return false;

    //     if(verified == true) {
    //         User.update({
    //             two_factorAuth_status: 1
    //         },{
    //             where:{
    //                 id: req.user.id
    //             }
    //         });
    //     }

    //     res.json({
    //         status: verified
    //     });
    // });

    app.post('/two_factor_auth_enable_disable', async (req,res) => {
        var option = req.body.value;

        var result = await User.findById(req.user.id);
        var data = JSON.parse(JSON.stringify(result));
        var two_factorAuth_status = data.two_factorAuth_status;

        if(option == 'false'){
            if(two_factorAuth_status == 1){
                User.update({
                    two_factorAuth_status: 2,
                    two_factorAuth_secret_key: '',
                    two_factorAuth_qr_code_image: '',
                    two_factorAuth_scan_verified: 0 ,
                    two_factorAuth_verified : 'Inactive'                                              
                },{
                    where:{
                        id: req.user.id
                    }
                }).then(result_data => {
                    if(result_data){
                        res.json({
                            status: option,
                            msg:"Two factor authentication is disabled. "
                        });
                    }
                });
            }
        }else if (option == 'true') {
            if(two_factorAuth_status == 2){
                User.update({
                    // two_factorAuth_status: 1,
                    two_factorAuth_verified : 'Active'
                },{
                    where:{
                        id: req.user.id
                    }
                }).then(result_data => {
                    if(result_data){
                        res.json({
                            status: option,
                            msg:"Two factor authentication is enabled. "
                        });
                    }
                });
            }


            // res.json({
            //     status: option,
            //     msg:"Two factor authentication is disabled. "
            // });
        }
    });

    app.get('/account/logout', async function (req, res) {
        //var user = await User.findOne({id: req.user.id});
        // console.log(user);
        // return false;
        //if(user){
            // user.two_factorAuth_verified = 'Inactive';
            // user.update({
            //     two_factorAuth_verified : 'Inactive'
            // },{
            //     where:{
            //         id: req.user.id
            //     }
            // })
            User.update({
                two_factorAuth_verified : 'Inactive'
            }, {
                where: {
                    id: req.user.id
                }
            }).then(result => {
                if(result){
                    req.logout();
                    res.redirect('/login');
                }
            });
            
        //}
        
    });

    app.get('/account/profile-details', user_acl, two_factor_checking, function (req, res) {

        Kyc_details.findAll({
            where: {
                user_id: req.user.id
            },
            limit: 1,
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(function(kyc_details){ 

            Question.hasMany(Option, {foreignKey: 'question_id'});
            Question.findAll({
                include: [{
                    model: Option
                }]
            }).then(function(qadata){
                Answer.findAll({
                    attributes: ['option_id'],
                    where: {
                        user_id: req.user.id
                    }
                }).then((answer_data) => {
                    for(var i=0;i<qadata.length;i++) {
                        for(var j=0;j<qadata[i].Options.length;j++) {
                            var tempArr = lodash.filter(answer_data, x => x.option_id === qadata[i].Options[j].id);
                            if(tempArr.length > 0) {
                                qadata[i].Options[j].answer_status = true;
                            }
                            else {
                                qadata[i].Options[j].answer_status = false;
                            }
                        }
                    }
                    
                    res.render('profile-details', {
                        layout: 'dashboard',
                        questionAnswers: qadata,
                        answer_data: answer_data,
                        title: 'Profile Details',
                        kyc_details: kyc_details
                    });
                });
                
            });
        });
       
    });

    app.get('/account/account-settings', user_acl, two_factor_checking, async function (req, res) {
        var user_all_details = await User.findById(req.user.id);
        var user_data = JSON.parse(JSON.stringify(user_all_details));

        var kyc_details = await Kyc_details.findAll({
            where: {
                user_id: req.user.id
            },
            limit: 1,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        var p_composition = await portfolio_composition.findAll({
            where: {
                user_id: req.user.id
            }
        });

        var p_institutional_arr = [];
        
        if(!lodash.isEmpty(p_composition)){
        p_institutional_arr.push({
            field_1: p_composition[0].get('business_name'),
            field_2: p_composition[0].get('business_number'),
            field_3: p_composition[0].get('business_registration_country'),
            field_4: p_composition[0].get('investques'),
            field_5: p_composition[0].get('settlement_currency'),
            field_6: p_composition[0].get('street'),
            field_7: p_composition[0].get('city'),
            field_8: p_composition[0].get('state'),
            field_9: p_composition[0].get('phone_number'),
            field_10: p_composition[0].get('postal_code'),
            field_11: p_composition[0].get('email_address')
            });
        }
        var shareholders_info = await shareholder.findAll({
            where: {
                user_id: req.user.id
            }
        });

        const msg = req.flash('profileMessage')[0];
        var country = await Country.findAll();
        res.render('account-settings', {
            layout: 'dashboard',
            message: msg,
            countries: country,
            kyc_details: kyc_details,
            p_institutional_arr: p_institutional_arr,
            shareholders_info: shareholders_info,
            user_data: user_data,
            title: 'Account Settings'
        });
    });

    app.post('/update-password', function (req, res) {
        if (bCrypt.compareSync(req.body.oldpassword, req.user.password)) {
            const password = bCrypt.hashSync(req.body.newpassword);
            User.update({
                password: password
            }, {
                where: {
                    id: req.user.id
                }
            }).then(function (result) {
                res.json({
                    success: true,
                    message: 'Password updated successfully.'
                });
            }).catch(function (err) {

                console.log(err);
            });
        } else {
            res.json({
                success: false,
                message: 'Old password doesn\'t match.'
            });
        }
    });

    app.post('/update-id-proof', upload.single('async_uploads'), function (req, res) {
        Kyc_details.create({
            user_id: req.user.id,
            files: userUrl,
            status: 1
        }).then(function (result) {
            res.json({
                success: true,
                message: 'ID proof uploaded successfully.',
                file_name: fileName
            });
        }).catch(function (err) {

            console.log(err);
        });
    });

    app.post('/update-profile-pic', profile_upload.single('async_upload'), function (req, res) {
        User.update({
            image: userUrl
        }, {
            where: {
                id: req.user.id
            }
        }).then(function(result) {
            res.json({
                success: true,
                message: 'Profile pic uploaded successfully.',
                file_name: fileName
            });
        }).catch(function(err) {
            console.log(err);
        });
    });

    app.post('/account-settings', two_factor_checking, function (req, res) {

        //console.log(JSON.stringify(req.body, undefined, 2));

        var countryId = req.body.country;
        if (countryId === "226") {
            state = req.body.usa_states;
        }  else if(countryId === "240") {
            state = req.body.canada_states;
        } else {
            state = req.body.state;
        }

        User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            user_name: req.body.user_name,
            address: req.body.address,
            contact_no: req.body.contact_no,
            about_me: req.body.about_me,
            dob: req.body.dob,
            city: req.body.city,
            state: state,
            country_id: countryId,
            postal_code: req.body.postcode
        }, {
            where: {
                id: req.user.id
            }
        }).then(function (status) {

            portfolio_composition.findAndCountAll({
                where: {user_id: req.user.id}
              }).then(results => {
                var count = results.count;
                if(count >0){
                    portfolio_composition.update({

                        user_id: req.user.id,
                        business_name: req.body.business_name,
                        business_number: req.body.business_number,
                        business_registration_country: req.body.business_registration_country,
                        investques: req.body.investques,
                        settlement_currency: req.body.settlement_currency,
                        street: req.body.street,
                        city: req.body.city_ins,
                        state: req.body.state_ins,
                        phone_number: req.body.phone_number,
                        postal_code: req.body.postal_code,
                        email_address: req.body.email_address

                    }, {
                        where: {
                            user_id: req.user.id
                        }
                    });
                }
                else{
                    portfolio_composition.create({

                        user_id: req.user.id,
                        business_name: req.body.business_name,
                        business_number: req.body.business_number,
                        business_registration_country: req.body.business_registration_country,
                        investques: req.body.investques,
                        settlement_currency: req.body.settlement_currency,
                        street: req.body.street,
                        city: req.body.city_ins,
                        state: req.body.state_ins,
                        phone_number: req.body.phone_number,
                        postal_code: req.body.postal_code,
                        email_address: req.body.email_address,
                        status: 0
                    });
                }
            }).then(function(result){
                    req.flash('profileMessage', 'Profile updated successfully.');
                    res.redirect('/account/account-settings');
            });
        }).catch(function (err) {
            console.log(err);
        });
    });

    
    var upload_shareholder_docs = multer();
    app.post('/save-shareholderData', upload_shareholder_docs.any(), (req, res) =>{

        
        var upload_docs_dynmc = lodash.filter(req.files, x => x.fieldname === "upload_docs_dynmc");
        
        var upload_docs_dynmc_1 = lodash.filter(req.files, x => x.fieldname === "upload_docs_dynmc-1");

        
        async.eachSeries(upload_docs_dynmc, ( item, cb ) => {

            var tempArr = lodash.filter(JSON.parse(req.body.proof_of_address), x => x.temp_file_name === item.originalname);

            var upload_path = tempArr[0].folder_name+"/"+item.originalname;

            var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};

            s3bucket.upload(params, function(err, data) {
                if (err) {
                    console.log("Error uploading data.", err);
                    cb(err)
                } else {
                    console.log("Success uploading data.");
                    cb()
                }
            })
        
        }, function(err) {
            shareholder.destroy({
                where: {
                    user_id: req.user.id
                }
            });
            async.eachSeries(upload_docs_dynmc_1, (item, cb ) => {
                var index = upload_docs_dynmc_1.indexOf(item);

                var tempArr = lodash.filter(JSON.parse(req.body.proof_of_address), x => x.temp_file_name === item.originalname);
                var upload_path = "govt_id/"+item.originalname;

                shareholder.create({
                    user_id: req.user.id,
                    shareholder_name: req.body.shareholder_name[index] ,
                    address_proof: keys.S3_URL + "address_proof/"+upload_docs_dynmc[index].originalname,
                    government_issued_id: keys.S3_URL + upload_path
                });

                var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};



                s3bucket.upload(params, function(err, data) {
                    if (err) {
                        console.log("Error uploading data.", err);
                        cb(err)
                    } else {
                        console.log("Success uploading data.");
                        cb()
                    }
                })
            }, function(err,data) {
                if(err)
                    console.log(err);
            });

            res.json({ msg: 'Saved', success: "true" });
        });


    });

    app.post('/save-referral-name', function (req, res) {
        var refName = req.body.referral_name;
        User.findAndCountAll({
            where: {
                user_name: {
                    $like: '%'+refName+'%'
                },
                id: {
                    [Op.ne]: req.user.id
                }
            }
        }).then(function(result) {
            var count = result.count;
            if(count > 0) {
                res.json({
                    status: 'false',
                    message: 'User already exists, please try again.'
                });
            } else {
                User.update({
                    user_name: refName
                }, {
                    where: {
                        id: req.user.id
                    }
                }).then(function (result) {
                    res.json({
                        status: 'true',
                        message: 'Referral Name saved successfully'
                    });
                }).catch(function (err) {
                    console.log(err);
                });
            }
        });
    });

    app.get('/account/invite-friends', user_acl, two_factor_checking, function (req,res) {
		Referral_data.belongsTo(User, {foreignKey: 'user_id'});

		Referral_data.findAll({
			where: {
                referral_id: req.user.id
            },
        	include: [{
		    	model: User
	  		}],
	  		order: [
            	['id', 'DESC']
        	]
		}).then(function(invitefrnds){
			res.render('invite-friends',{layout: 'dashboard', invitefrnds: invitefrnds, title: 'Invite Friends'});
		});
	});

    app.get('/account/submit-a-request', user_acl, two_factor_checking, function (req, res) {
        const msg = req.flash('supportMessage')[0];
        res.render('submit-a-request', {
            layout: 'dashboard',
            message: msg,
            title: 'Submit a Request'
        });
    });

    app.post('/account/submit-a-request', function (req, res) {
        Support.create({
            user_id: req.user.id,
            title: req.body.subject.trim(),
            enquiry: req.body.description.trim(),
            status: '0'
        }).then(function (result) {
            req.flash('supportMessage', 'Request sent successfully');
            res.redirect('/account/submit-a-request');
            // var pushNotifications = require("push-notifications");
            // var io = require('socket.io')(8088);
            // io.on('connection', function(socket){
            //     socket.on('pushNotification', function(msg){
            //         io.emit('pushNotification', msg);
            //     });

            //     pushNotifications.push(io, {title: req.body.subject.trim(), body : req.body.description.trim()});  
            // });
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/account/requests-support', user_acl,two_factor_checking, function (req, res) {
        Support.findAll({
            where: {
                user_id: req.user.id
            }
        }).then(function (supports) {
            res.render('requests-support', {
				layout: 'dashboard',
                supports: supports,
                title: 'Request Support'
			});
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/account/buy-and-sell-coins', user_acl,two_factor_checking, async (req, res) => {
        var values = '';
        var buy_history = '';
        
        function notOnlyALogger(msg){
            console.log('****log****');
            console.log(msg);
        }

        Deposit.belongsTo(Currency,{foreignKey: 'currency_id'});
        let currencyCodes = await Deposit.findAll(
        { 
            where: {
                user_id: req.user.id,
                type: {
                    [Op.or]: [1, 2]
                }
            },
            limit: 5,
            order: [
                ['createdAt', 'DESC']
            ],
            //logging: notOnlyALogger,
            include: [{ 
                model: Currency, required: true
                
            }] 
        }); 
        values = await Currency.findAll({
            attributes: ['alt_name','currency_id','display_name']
        });
        res.render('buy-and-sell-coins', {layout: 'dashboard',contents: values,currencyCodes: currencyCodes, title: 'Buy And Sell Coins' });
    });

    app.post('/buy-coin', async (req, res) => {
		var amtVal = req.body.amtVal;
		var coinRate = req.body.coinRate;
		var currencyType = req.body.currencyBuyType;
		var curr_crypto_bal = 0;
		var curr_brought = 0;
        var curr_sold = 0;
        var curr_id = 0;
        
        curr_id = await Currency.findAll({
            where: {alt_name: currencyType },
            attributes: ['id']
        });
        curr_id = curr_id[0].id;

        function notOnlyALogger(msg){
            console.log('****log****');
            console.log(msg);
        }

        // calculating cryptocurrency wallet current balance
        var balance_count = await Deposit.count({
            where: {
                user_id: req.user.id,
                currency_id: curr_id
            }
        });
        if(balance_count > 0) {
            let currCrypto_bal = await Deposit.findAll(
                { 
                    attributes: ['balance'],
                    //logging: notOnlyALogger,
                    where: {
                        user_id: req.user.id,
                        currency_id: curr_id
                    },
                    limit: 1,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                    
                }); 
            var cryptoBalance = currCrypto_bal[0].balance;
        } else {
            let cryptoBalance = 0;
        }
        res.json({message: 'Success', status: true, crypto_balance: cryptoBalance, curr_id: curr_id}); 

    });

    app.post('/sell-coin', async (req, res) => {
		var amtVal = req.body.amtVal;
		var coinRate = req.body.coinRate;
		var currencyType = req.body.currencySellType;
		var curr_crypto_bal = 0;
		var curr_brought = 0;
        var curr_sold = 0;
        var curr_id = 0;

        curr_id = await Currency.findAll({
            where: {alt_name: currencyType },
            attributes: ['id']
        });
        curr_id = curr_id[0].id;
        
        var balance_count = await Deposit.count({
            where: {
                user_id: req.user.id,
                currency_id: curr_id
            }
        });
        if(balance_count > 0) {
            let currCrypto_bal = await Deposit.findAll(
                { 
                    attributes: ['balance'],
                    //logging: notOnlyALogger,
                    where: {
                        user_id: req.user.id,
                        currency_id: curr_id
                    },
                    limit: 1,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                    
                });
                var cryptoBalance = currCrypto_bal[0].balance;
        } else {
            let cryptoBalance = 0;
        }
        res.json({message: 'Success', status: true, crypto_balance: cryptoBalance, curr_id: curr_id});
	});

    app.post('/confirm_coin_buy', function(req, res) {
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
        
        Deposit.create({
            user_id: req.user.id,
            transaction_id: randomNum,
            checkout_id: randomNum,
            amount: req.body.amtVal,
            current_rate: req.body.coinRate,
            converted_amount: req.body.actualAmtExpect,
            type: 1,
            balance: req.body.balance,
            currency_id: req.body.currency_id,
            payment_method: 0
        }).then(function (result) {

            currency_balance.findAndCountAll({
                where: {user_id: req.user.id, currency_id: req.body.currency_id}
              }).then(results => {
                var count = results.count;
                if(count >0){
                    currency_balance.update({

                        balance: req.body.balance
                        

                    }, {
                        where: {
                            user_id: req.user.id, currency_id: req.body.currency_id
                        }
                    });
                }
                else{
                    currency_balance.create({

                        user_id: req.user.id,
                        balance: req.body.balance,
                        currency_id: req.body.currency_id

                    });
                }
                res.json({success: true});
            });
        }).catch(function (err) {
            console.log(err);
        });
    });
    
    app.post('/confirm_coin_sell', function(req, res){
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
        var currencyAmount = parseFloat(req.body.amtVal * req.body.coinRate);
        Deposit.create({
            user_id: req.user.id,
            transaction_id: randomNum,
            checkout_id: randomNum,
            amount: currencyAmount,
            current_rate: req.body.coinRate,
            type: 2,            
            base_currency: req.body.currencySellType,
            converted_amount: req.body.amtVal,
            balance: req.body.balance,
            currency_id: req.body.currency_id,
            payment_method: 0
        }).then(function (result) {
            
            currency_balance.findAndCountAll({
                where: {user_id: req.user.id, currency_id: req.body.currency_id}
              }).then(results => {
                var count = results.count;
                if(count >0){
                    currency_balance.update({

                        balance: req.body.balance
                        

                    }, {
                        where: {
                            user_id: req.user.id, currency_id: req.body.currency_id
                        }
                    });
                }
                else{
                    currency_balance.create({

                        user_id: req.user.id,
                        balance: req.body.balance,
                        currency_id: req.body.currency_id

                    });
                }
                res.json({success: true});
            });
        }).catch(function (err) {
            console.log(err);
        });
    });
    
    app.get('/account/transaction-history', user_acl, two_factor_checking, async (req, res) =>{
        var buy_arr = [];
        var sell_arr = [];
        var deposit_arr = [];
        var withdraw_arr = [];

        Deposit.belongsTo(Currency,{foreignKey: 'currency_id'});
        let buy_history = await Deposit.findAll(
        { 
            where: {
                user_id: req.user.id,
                type: 1
            },
            limit: 1000,
            order: [
                ['id', 'DESC']
            ],
            //logging: notOnlyALogger,
            include: [{ 
                model: Currency, required: true,
                attributes: ['currency_id']
                
            }] 
        }); 

        Deposit.belongsTo(Currency,{foreignKey: 'currency_id'});
        let sell_history = await Deposit.findAll(
        { 
            where: {
                user_id: req.user.id,
                type: 2
            },
            limit: 1000,
            order: [
                ['id', 'DESC']
            ],
            //logging: notOnlyALogger,
            include: [{ 
                model: Currency, required: true,
                attributes: ['currency_id']
                
            }] 
        }); 

        deposit_history = await Deposit.findAll({
            where: {user_id: req.user.id, type: 0},
            limit: 1000,
            order: [
                ['id', 'DESC']
            ]
        });
        withdrawal_history = await Deposit.findAll({
            where: {user_id: req.user.id, type: 3},
            limit: 1000,
            order: [
                ['id', 'DESC']
            ]
        });

        // var currentYear = "2017";    
        var currentYear = (new Date).getFullYear();
        for(var j = 1; j <= 12; j++){
            var buy_amt = 0;
            var sell_amt = 0;
            var deposit_amt = 0;
            var withdraw_amt = 0;
            for(var i in buy_history){
                var buy_date = new Date(buy_history[i].createdAt).getMonth() + 1;
                var buy_year = new Date(buy_history[i].createdAt).getFullYear();
                if(buy_date === j && buy_year === currentYear){
                    buy_amt = buy_amt + parseFloat(buy_history[i].amount);
                }
            }

            for(var i in sell_history){
                var sell_date = new Date(sell_history[i].createdAt).getMonth() + 1;
                var sell_year = new Date(sell_history[i].createdAt).getFullYear();
                if(sell_date == j && sell_year === currentYear){
                    sell_amt = sell_amt + parseFloat(sell_history[i].amount);
                }
            }

            for(var i in deposit_history){
                var deposit_date = new Date(deposit_history[i].createdAt).getMonth() + 1;
                var deposit_year = new Date(deposit_history[i].createdAt).getFullYear();
                if(deposit_date == j && deposit_year === currentYear){
                    deposit_amt = deposit_amt + parseFloat(deposit_history[i].amount);
                }
            }

            for(var i in withdrawal_history){
                var withdraw_date = new Date(withdrawal_history[i].createdAt).getMonth() + 1;
                var withdraw_year = new Date(withdrawal_history[i].createdAt).getFullYear();
                if(withdraw_date == j && withdraw_year === currentYear){
                    withdraw_amt = withdraw_amt + parseFloat(withdrawal_history[i].amount);
                }
            }
            buy_arr.push(buy_amt);
            sell_arr.push(sell_amt);
            deposit_arr.push(deposit_amt);
            withdraw_arr.push(withdraw_amt);
            
        }

        res.render('transaction-history', {layout: 'dashboard', buy_history:buy_history,sell_history:sell_history,deposit_history:deposit_history,withdrawal_history:withdrawal_history,buy_arr:buy_arr,sell_arr:sell_arr,deposit_arr:deposit_arr,withdraw_arr:withdraw_arr, title: 'Transaction History' });
    });

    app.get('/account/managed-cryptocurrency-portfolio', user_acl, two_factor_checking, async(req, res) => {
        var investedamount = 0;
		var firstyear = 0;
		var secondyear = 0;
		var thirdyear = 0;
		var accumulatedInterest = 0;
		var interest_earned = 0;
        const msg = req.flash('investStatusMessage')[0];
        investedamount = await Deposit.findAll({
            where: {user_id: req.user.id, type: 4},
            attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'TOT_INVESTED_AMT']]
        });
        investedamount = parseFloat(investedamount[0].get('TOT_INVESTED_AMT'));
        if (!isNaN(investedamount)) {
            investedamount = parseFloat(Math.round(investedamount * 100) / 100).toFixed(2);

            firstyear = parseFloat(parseFloat(200 * investedamount) / 100)+parseFloat(investedamount);
            firstyear = parseFloat(Math.round(firstyear * 100) / 100).toFixed(2);

            secondyear = parseFloat(parseFloat(200 * firstyear) / 100)+parseFloat(firstyear);
            secondyear = parseFloat(Math.round(secondyear * 100) / 100).toFixed(2);

            thirdyear = parseFloat(parseFloat(200 * secondyear) / 100) + parseFloat(secondyear);
            thirdyear = parseFloat(Math.round(thirdyear * 100) / 100).toFixed(2);

            accumulatedInterest =  parseFloat(0.01) * parseFloat(investedamount);
            accumulatedInterest = parseFloat(Math.round(accumulatedInterest * 100) / 100).toFixed(2);
                
           let portfolioCalculationCount = await portfolio_calculation.findAndCountAll({
                where: {
                    user_id: req.user.id
                }
            });
            var pcount = portfolioCalculationCount.count;

            if(pcount > 0){
                interest_earned = portfolioCalculationCount.rows[0].interest_earned;
            }
            else{
                interest_earned = accumulatedInterest;
                
            }

        } else {
            investedamount = 0;
        }

        var p_institutional_arr = [];

        var p_individual_arr = [];

        var p_institutional_modal_arr = [];

        var p_composition = await portfolio_composition.findAll({
            where: {
                user_id: req.user.id
            }
        });
        if(p_composition.length > 0) {
                p_individual_arr.push({
                    field_1: p_composition[0].get('first_name'),
                    field_2: p_composition[0].get('last_name'),
                    field_3: p_composition[0].get('residence_country'),
                    field_4: p_composition[0].get('investques'),
                    field_5: p_composition[0].get('settlement_currency')
                });

                p_institutional_arr.push({
                    field_1: p_composition[0].get('business_name'),
                    field_2: p_composition[0].get('business_number'),
                    field_3: p_composition[0].get('business_registration_country'),
                    field_4: p_composition[0].get('investques'),
                    field_5: p_composition[0].get('settlement_currency')
                });

                p_institutional_modal_arr.push({
                    field_1: p_composition[0].get('account_name'),
                    field_2: p_composition[0].get('bank_country'),
                    field_3: p_composition[0].get('account_number'),
                    field_4: p_composition[0].get('routing_number'),
                    field_5: p_composition[0].get('phone_number'),
                    field_6: p_composition[0].get('email_address'),
                    address_proof: p_composition[0].get('address_proof'),
                    bank_statement: p_composition[0].get('bank_statement'),
                    government_issued_id: p_composition[0].get('government_issued_id'),
                    incorporation_certificate: p_composition[0].get('incorporation_certificate'),
                    bank_statement: p_composition[0].get('bank_statement')
                });
        }
        res.render('managed-cryptocurrency-portfolio', {layout: 'dashboard', amountInvested: investedamount, firstYearEarning: firstyear,interestEarned: interest_earned, message: msg, p_individual_arr:p_individual_arr, p_institutional_arr: p_institutional_arr, p_individual_arr_length:p_individual_arr.length, p_institutional_arr_length: p_institutional_arr.length, p_institutional_modal_arr: p_institutional_modal_arr, title: 'Managed Cryptocurrency Portfolio' });

    });

    app.post('/save-invest', function(req, res){
        console.log("mcp invest");
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;

		var amountInvest = req.body.amount_invest;
		var currency_purchased_code = req.body.currency_purchased;
        var coinRate = 1;
        var type = 4;
		var converted_amount = req.body.amount_invest;
        var userid = req.user.id;
        
        Deposit.create({
            checkout_id: randomNum,
			transaction_id: randomNum,
			user_id: userid,
			amount: amountInvest,
			current_rate: coinRate,
			converted_amount: converted_amount,
            type: type,
            payment_method: 0,
            balance: 0,
            currency_id: 0
        }).then(function (result) {
            req.flash('investStatusMessage', 'Your investment was made successfully!');
            res.redirect('/account/managed-cryptocurrency-portfolio');
        }).catch(function (err) {
            console.log(err);
        });
    });
    
    app.post('/save-withdraw', function(req, res){
		var amountWithdraw = req.body.amount_withdraw;
        var coinRate = 1;
        var type = 3;
        var status = 0;
        var userid = req.user.id;
        
        withdraw.create({
			user_id: userid,
            amount_usd: amountWithdraw,
            status: status,
			withdraw_type: type
        }).then(function (result) {
            req.flash('investStatusMessage', 'Your withdraw request has been received successfully!');
            res.redirect('/account/managed-cryptocurrency-portfolio');
        }).catch(function (err) {
        });
    });

    app.post('/save-notes', function (req, res) {
        User.update({
            notes: req.body.notes
        }, {
            where: {
                id: req.user.id

            }
        }).then(function (result) {
            res.redirect('/account/profile-details');
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/account/get-donut-chart', user_acl, two_factor_checking, (req, res)=> {
        var response_arr = [];
        lodash.each(req.user.currencyBalance, x => {
            response_arr.push({
                label: x.Currency.currency_id,
                value: parseFloat(x.balance).toFixed(2)
            });
        });
        response_arr.push({
            label: "USD",
            value: parseFloat(req.user.currentUsdBalance).toFixed(2)
        });
        response_arr.push({
            label: "MCP",
            value: parseFloat(req.user.mcpTotalBalance).toFixed(2)
        });
        res.json({'chart_array':response_arr});
    });

    app.post('/save-questionnaire', (req, res) => {  

        Answer.destroy({
            where: {
                user_id: req.user.id
            }
        }).then(function (result) {
            for (var i in req.body.finalcialData) {
                financeData = req.body.finalcialData[i];
                Answer.create({
                    user_id: req.user.id,
                    question_id: financeData.name,
                    option_id: financeData.value
                }).then(function (result) {
                    res.json({success: 1, msg: 'Questionaire saved successfully!'});
                }).catch(function (err) {
                    console.log(err);
                });
            } 
        });
    });

    app.post('/save-institutionalIndividual-data', (req, res) => {


        var businessName = req.body.business_name;
        var businessNumber = req.body.business_number;
        var businessCountry = req.body.business_registration_country;
        var investedAmount = req.body.invest_amount;
        var settlementCurrency = req.body.settlement_currency;
        var typeOfSelection = req.body.individualOrInstitutional_type;

        
        var firstName = req.body.first_name;
        var lastName = req.body.last_name;
        var individualCountry = req.body.residence_country_individual;
        var individualInvestAmount = req.body.invest_amount_individual;
        var individualSettlementCurrency = req.body.settlement_currency_individual;
        
        if(typeOfSelection === 'Institution'){
            portfolio_composition.findAndCountAll({
                where: {user_id: req.user.id}
              }).then(results => {
                var count = results.count;
                if(count >0){
                    portfolio_composition.update({

                        user_id: req.user.id,
                        investor_type: 1,
                        business_name: businessName,
                        business_number: businessNumber,
                        business_registration_country: businessCountry,
                        investques: investedAmount,
                        settlement_currency: settlementCurrency

                    }, {
                        where: {
                            user_id: req.user.id
                        }
                    });
                }
                else{
                    portfolio_composition.create({

                        user_id: req.user.id,
                        investor_type: 1,
                        business_name: businessName,
                        business_number: businessNumber,
                        business_registration_country: businessCountry,
                        investques: investedAmount,
                        settlement_currency: settlementCurrency,
                        status: 0
                    });
                }
                res.json({ msg: 'Saved' });
            }).then(insertStatus => {
                User.update({ 
                    investor_type: 1
                }, {
                    where: {
                        id: req.user.id
                    }
                });
            });
        }
        else{
            portfolio_composition.findAndCountAll({
                where: {user_id: req.user.id}
              }).then(results => {
                var count = results.count;
                if(count >0){
                    portfolio_composition.update({ 

                        user_id: req.user.id,
                        investor_type: 2,
                        first_name: firstName,
                        last_name: lastName,
                        residence_country: individualCountry,
                        investques: individualInvestAmount,
                        settlement_currency: individualSettlementCurrency


                    }, {
                        where: {
                            user_id: req.user.id
                        }
                    });
                }
                else{
                    portfolio_composition.create({
                        user_id: req.user.id,
                        investor_type: 2,
                        first_name: firstName,
                        last_name: lastName,
                        residence_country: individualCountry,
                        investques: individualInvestAmount,
                        settlement_currency: individualSettlementCurrency,
                        status: 0
                    });
                }
                res.json({ msg: 'Saved' });
            }).then(updateStatus => {
                User.update({ 
                    investor_type: 2
                }, {
                    where: {
                        id: req.user.id
                    }
                });

            });
        }

    });
    var upload_docs_inst = multer();
    app.post('/save-institutionalModalData', upload_docs_inst.any(), (req, res) => {

        portfolio_composition.findAndCountAll({
            where: {user_id: req.user.id}
          }).then(results => {
            var count = results.count;
            var bank_statement_url = '';
            var cert_incorp_url = '';
            var upload_docs = lodash.filter(req.files, x => x.fieldname === "upload_docs");
            var upload_docs_dynmc = lodash.filter(req.files, x => x.fieldname === "upload_docs_dynmc");
            var upload_docs_dynmc_1 = lodash.filter(req.files, x => x.fieldname === "upload_docs_dynmc-1");
            async.eachSeries(upload_docs, ( item, cb ) => {
                console.log("Here");
                var tempArr = lodash.filter(JSON.parse(req.body.upload_file_name), x => x.temp_file_name === item.originalname);
                console.log('****');
                console.log(JSON.stringify(tempArr, undefined, 2));
                console.log('****');
                var upload_path = tempArr[0].folder_name+"/"+item.originalname;
                
                var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};

                if(tempArr[0].folder_name === "cert_incorp") {
                    cert_incorp_url = keys.S3_URL + upload_path;
                }
                if(tempArr[0].folder_name === "bank_statement") {
                    bank_statement_url = keys.S3_URL + upload_path;
                }

                s3bucket.upload(params, function(err, data) {
                    if (err) {
                        console.log("Error uploading data.", err);
                        cb(err)
                    } else {
                        console.log("Success uploading data.");
                        cb()
                    }
                })
            }, function(err) {
                async.eachSeries(upload_docs_dynmc, ( item, cb ) => {
                    
                    var tempArr = lodash.filter(JSON.parse(req.body.proof_of_address), x => x.temp_file_name === item.originalname);
                    var upload_path = tempArr[0].folder_name+"/"+item.originalname;

                    var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};

                    s3bucket.upload(params, function(err, data) {
                        if (err) {
                            console.log("Error uploading data.", err);
                            cb(err)
                        } else {
                            console.log("Success uploading data.");
                            cb()
                        }
                    })
                }, function(err) {
                    shareholder.destroy({
                        where: {
                            user_id: req.user.id
                        }
                    });
                    async.eachSeries(upload_docs_dynmc_1, (item, cb ) => {
                        var index = upload_docs_dynmc_1.indexOf(item);

                        var tempArr = lodash.filter(JSON.parse(req.body.proof_of_address), x => x.temp_file_name === item.originalname);
                        var upload_path = "govt_id/"+item.originalname;

                        shareholder.create({
                            user_id: req.user.id,
                            shareholder_name: req.body.shareholder_name[index] ,
                            address_proof: keys.S3_URL + "address_proof/"+upload_docs_dynmc[index].originalname,
                            government_issued_id: keys.S3_URL + upload_path
                        });

                        var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};



                        s3bucket.upload(params, function(err, data) {
                            if (err) {
                                console.log("Error uploading data.", err);
                                cb(err)
                            } else {
                                console.log("Success uploading data.");
                                cb()
                            }
                        })
                    }, function(err) {
                        if(count >0){
                            portfolio_composition.update({
                                account_name: req.body.account_name,
                                bank_country: req.body.bank_country,
                                account_number: req.body.account_number,
                                routing_number: req.body.routing_number,
                                phone_number: req.body.phone_number,
                                email_address: req.body.email_address,
                                bank_statement: bank_statement_url ? bank_statement_url : results.bank_statement,
                                incorporation_certificate: cert_incorp_url ? cert_incorp_url : results.incorporation_certificate,
                                status: 0
            
                            }, {
                                where: {
                                    user_id: req.user.id
                                }
                            });
                        }
                        else{
                            portfolio_composition.create({
            
                                account_name: req.body.account_name,
                                bank_country: req.body.bank_country,
                                account_number: req.body.account_number,
                                routing_number: req.body.routing_number,
                                phone_number: req.body.phone_number,
                                email_address: req.body.email_address,
                                bank_statement: bank_statement_url,
                                incorporation_certificate: cert_incorp_url
            
                            });
                        }
                        res.json({ msg: 'Saved', success: "true" });
                    })
                    
                });
            });
        });
    });
    var upload_docs = multer();
    app.post('/save-individualModalData',upload_docs.array('upload_docs'),  (req, res) => {
        portfolio_composition.findAndCountAll({
            where: {user_id: req.user.id}
          }).then(results => {
            var count = results.count;
            var address_proof_url = '';
            var government_issued_id_url = '';
            var bank_statement_url = '';
            async.eachSeries(req.files, function(item, cb) {
                var tempArr = lodash.filter(JSON.parse(req.body.upload_file_name), x => x.temp_file_name === item.originalname);
                var upload_path = tempArr[0].folder_name+"/"+item.originalname;
                
                var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};
                if(tempArr[0].folder_name === "address_proof") {
                    address_proof_url = keys.S3_URL + upload_path;
                }
                if(tempArr[0].folder_name === "govt_id") {
                    government_issued_id_url = keys.S3_URL + upload_path;
                }
                if(tempArr[0].folder_name === "bank_statement") {
                    bank_statement_url = keys.S3_URL + upload_path;
                }
                s3bucket.upload(params, function(err, data) {
                    if (err) {
                        console.log("Error uploading data. ", err);
                        cb(err)
                    } else {
                        console.log("Success uploading data");
                        cb()
                    }
                })
            }, function(err) {
                if(count >0){
                    portfolio_composition.update({
                        account_name: req.body.account_name_individual,
                        bank_country: req.body.bank_country_individual,
                        account_number: req.body.account_number_individual,
                        routing_number: req.body.routing_number_individual,
                        phone_number: req.body.phone_number_individual,
                        email_address: req.body.email_address_individual,
                        address_proof: address_proof_url ? address_proof_url: results.address_proof,
                        government_issued_id: government_issued_id_url ? government_issued_id_url : results.government_issued_id,
                        bank_statement: bank_statement_url ? bank_statement_url : results.bank_statement

                    }, {
                        where: {
                            user_id: req.user.id
                        }
                    });
                }
                else{
                    portfolio_composition.create({

                        account_name: req.body.account_name_individual,
                        bank_country: req.body.bank_country_individual,
                        account_number: req.body.account_number_individual,
                        routing_number: req.body.routing_number_individual,
                        phone_number: req.body.phone_number_individual,
                        email_address: req.body.email_address_individual,
                        address_proof: address_proof_url,
                        government_issued_id: government_issued_id_url,
                        bank_statement: bank_statement_url

                    });
                }
                res.json({ msg: 'Saved', success: "true" });
            });
        });
    });

    // app.get('/wallets', function (req, res) {
    //     res.render('wallets', {
    //         layout: 'dashboard'
    //     });
    // });
    
    /* app.post('/save-shareholderData', upload_shareholder_docs.any(), (req, res) =>{

        
        var upload_docs_dynmc = lodash.filter(req.files, x => x.fieldname === "upload_docs_dynmc");
        
        var upload_docs_dynmc_1 = lodash.filter(req.files, x => x.fieldname === "upload_docs_dynmc-1");

        
        async.eachSeries(upload_docs_dynmc, ( item, cb ) => {

            var tempArr = lodash.filter(JSON.parse(req.body.proof_of_address), x => x.temp_file_name === item.originalname);

            var upload_path = tempArr[0].folder_name+"/"+item.originalname;

            var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};

            s3bucket.upload(params, function(err, data) {
                if (err) {
                    console.log("Error uploading data. ", err);
                    cb(err)
                } else {
                    console.log("Success uploading data");
                    cb()
                }
            })
        
        }, function(err) {
            shareholder.destroy({
                where: {
                    user_id: req.user.id
                }
            });
            async.eachSeries(upload_docs_dynmc_1, (item, cb ) => {
                var index = upload_docs_dynmc_1.indexOf(item);

                var tempArr = lodash.filter(JSON.parse(req.body.proof_of_address), x => x.temp_file_name === item.originalname);
                var upload_path = "govt_id/"+item.originalname;

                shareholder.create({
                    user_id: req.user.id,
                    shareholder_name: req.body.shareholder_name[index] ,
                    address_proof: keys.S3_URL + "address_proof/"+upload_docs_dynmc[index].originalname,
                    government_issued_id: keys.S3_URL + upload_path
                });

                var params = {Key: upload_path, Body: item.buffer, ACL:'public-read'};



                s3bucket.upload(params, function(err, data) {
                    if (err) {
                        console.log("Error uploading data. ", err);
                        cb(err)
                    } else {
                        console.log("Success uploading data");
                        cb()
                    }
                })
            }, function(err,data) {
                if(err)
                    console.log(err);
            });

            res.json({ msg: 'Saved', success: "true" });
        });


    }); */

    app.post('/remove-shareholderInfo', (req, res) =>{
        var shareHolderId = req.body.shareholderId;
        shareholder.destroy({
            where: {
                user_id: req.user.id,
                id: shareHolderId
            }
        }).then(function (result) {
            res.json({success: "true"});
        });
    });

    app.post('/ecorepay-payment', (req, res) =>{

        var firstname = req.body.firstname; 
        var lastname = req.body.lastname;
        var email = req.body.email;
        var phone = req.body.phone;
        var dob = req.body.dob;
        var address = req.body.address;
        var city = req.body.city;
        var state = req.body.state;
        var postcode = req.body.postcode;
        var country = "IN";
        var card_number = req.body.card_number.split(" ").join("");
        var cardexpmonth = req.body.cardexpmonth;
        var cardexpyear = req.body.cardexpyear;
        var cvv = req.body.cvv;
        var amount = req.body.amount;
        var userID = req.body.userID;
        var IPAddress = '127.0.0.1';
        var AccountID = 12088682;
        var AccountAuth = "tIhBgFWNGDmpxxpQ";
        var Reference = "X53222389-21";
        var currency = "USD";
        var ssn = '4344';

        request({
            uri: "http://www.coinjolt.com/ecorepay.php",
            //uri: "http://localhost:8080/ecorepay.php",
            method: "POST",
            //json: true,
            form: {
                userid: userID,
                amount: amount,
                fname: firstname,
                lname: lastname,
                email: email,
                phn: phone,
                dob: dob,
                add: address,
                city: city,
                state: state,
                postcode: postcode,
                country: country,
                cardno: parseInt(card_number),
                cardexpmonth: cardexpmonth,
                cardexpyear: cardexpyear,
                cvv: parseInt(cvv)
            }
          }, function(error, response, body) {
              //console.log(response);
              //console.log('ECorepay body');
              //console.log(body);
              //console.log(JSON.stringify(body, undefined, 2));
              //console.log(body);
             if(error === null && body === '1') {
                 res.json({success: "true"});
             }
             else {
                 console.log('Ecorepay ERROR');
                 console.log(error);
                res.json({success: "false"});
             }
          }); 
        

    });

    /* 
    app.post('/deposit-currency', function(req, res){
        var destinationAddress = "";
        var coin_amount = req.body.coin_amount;
        var amountSatoshis = coin_amount * 1e8;
        var walletPassphrase = 'COinjolt123!!';
        var userid = req.user.id;
        var currency_id = "1";
        var walletDbId;
        var walletId;
        var destinationAddressId;
        var receiver_id;
        var walletBalance;
        var type = "2";

        wallet.findAndCountAll({
            where: {user_id: req.user.id}
        }).then(results => {
            var count = results.count;
            if(count > 0){
                console.log("wallet found");
                // console.log(JSON.stringify(results, undefined, 2));
                walletDbId = results.rows[0].id;
                walletId = results.rows[0].bitgo_wallet_id;
                console.log("walletId");
                console.log(walletDbId);
                console.log(walletId);
                console.log("address found");
                
                        console.log("sender_id");
                        console.log(userid);
                        //var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
                        bitgo.wallets().get({
                            id: walletId
                        }, function (err, wallet) {
                            if (err) {
                                console.log("Error getting wallet!");
                                console.dir(err);
                                // return process.exit(-1);
                            }
                            walletBalance = (wallet.balance() / 1e8).toFixed(4);
                            console.log("walletBalance");
                            console.log(walletBalance);
                            if((walletBalance == 0) || (walletBalance < amountSatoshis)){
                                res.json({success: "2", message: "You have not enough wallet balance to send coin."});
                            } else {
                                wallet.sendCoins({
                                    address: destinationAddress,
                                    amount: amountSatoshis,
                                    walletPassphrase: walletPassphrase
                                }, function (err, result) {
                                    if (err) {
                                        console.log("Error sending coins!");
                                        console.dir(err);
                                        return process.exit(-1);
                                    }
                                    console.dir(result);
                                }).then(function (walletTransaction) {
                                    wallet_transaction.create({
                                        sender_id: userid,
                                        receiver_id: "0",
                                        currency_id: currency_id,
                                        wallet_id: walletDbId,
                                        address_id: "0",
                                        amount: amountSatoshis,
                                        type: type
                                    }).then(function (result) {
                                        res.json({success: "1", message: "You have sent coin successfully."});
                                    });
                                });
                            }
                        });
                    
                
            }
            else{
                res.json({success: "0", message: "Wallet not found. Please create wallet."});
            }
        });
    });
    */

    app.post('/deposit-currency', function(req, res){
        var coin_amount = req.body.coin_amount;
        var amountSatoshis = coin_amount * 1e8;
        var walletPassphrase = 'COinjolt123!!';
        var userid = req.user.id;
        // var currency_id = "1";
        var walletDbId;
        var walletId;
        //var destinationAddressId;
        var receiver_id;
        var walletBalance;
        var type = "2";
        var currency_id = req.body.currency_id;
        var currency_code;
        var destinationAddress;
        if(currency_id == '1'){
            currency_code = "btc";
            destinationAddress = "3M7mjWjnpjxtcCKDPZm6TnekuuvCqUFkP6";
        } else if(currency_id == '2'){
            currency_code = "eth";
            destinationAddress = "";
        } else if(currency_id == '3'){
            currency_code = "ltc";
            destinationAddress = "M9Z9aLhj9bvQbkNZaKGfnaDkX5DWXMscsb";
        } else if(currency_id == '5'){
            currency_code = "bch";
            destinationAddress = "3NoziQ69RkHLR9hFSqvJBFUczNt8wDdqBQ";
        } else if(currency_id == '46'){
            currency_code = "rmg";
            destinationAddress = "";
        } else if(currency_id == '4'){
            currency_code = "xrp";
            destinationAddress = "rark8zi3HawtpU7mYsfMCYZE1e7sGdMg1N?dt=0";
        }
        console.log(currency_id);
        console.log(currency_code);
        console.log(destinationAddress);          

        wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: currency_id
            }
        }).then(results => {
            var count = results.count;
            if(count > 0){
                console.log("wallet found");
                // console.log(JSON.stringify(results, undefined, 2));
                walletDbId = results.rows[0].id;
                walletId = results.rows[0].bitgo_wallet_id;
                console.log("walletId");
                console.log(walletDbId);
                console.log(walletId);
                console.log("address found");
                
                        console.log("sender_id");
                        console.log(userid);
                        //var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
                        bitgo.coin(currency_code).wallets().get({ id: walletId })
                        .then(function(wallet) {
                            // walletBalance = (wallet.balance() / 1e8).toFixed(4);
                            if(currency_id == '4') { // ripple (xrp)
                                walletBalance = wallet._wallet.spendableBalanceString;
                            } else {
                                walletBalance = wallet._wallet.balance;
                            }
                            console.log("walletBalance");
                            console.log(walletBalance);
                            if((walletBalance == 0) || (walletBalance < amountSatoshis)){
                                res.json({success: "2", message: "You have not enough wallet balance to send coin."});
                            } else {
                                let params = {
                                    amount: amountSatoshis,
                                    address: destinationAddress,
                                    walletPassphrase: walletPassphrase
                                  };
                                  wallet.send(params)
                                  .then(function (walletTransaction) {
                                    wallet_transaction.create({
                                        sender_id: userid,
                                        receiver_id: "0",
                                        currency_id: currency_id,
                                        wallet_id: walletDbId,
                                        address_id: "0",
                                        amount: amountSatoshis,
                                        type: type
                                    }).then(function (result) {
                                        cold_wallet_balance.findAndCountAll({
                                            where: { user_id: userid, currency_id: currency_id }
                                        }).then(function (cold_wallet_balance) {
                                            if (cold_wallet_balance.count > 0) {
                                                currentBalance = cold_wallet_balance.rows[0].balance;
                                                updatedBalance = currentBalance + amountSatoshis;
                                                cold_wallet_balance.update({
                                                    balance: updatedBalance
                                                }, {
                                                        where: {
                                                            user_id: userid, currency_id: currency_id
                                                        }
                                                }).then(function (result_cold_wallet) {
                                                    res.json({success: "1", message: "You have sent coin successfully."});
                                                });
                                            } else {
                                                currency_balance.create({
                                                    user_id: userid,
                                                    balance: amountSatoshis,
                                                    currency_id: currency_id
                                        
                                                }).then(function (result_cold_wallet) {
                                                    res.json({success: "1", message: "You have sent coin successfully."});
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        });
                    
                
            }
            else{
                res.json({success: "0", message: "Wallet not found. Please create wallet."});
            }
        });
    });



    app.post('/invest-usd-from-mcp', function(req, res){
        var usd_amount = req.body.coin_amount;
        var userid = req.user.id;
        var coinjolt_user_id = "1";
        var user_transaction_type = "6";
        var coinjolt_user_transaction_type = "4";
        var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
        var randomNum =  Math.floor(Math.random() * numfactor) + 1;
        var currentUsdBalance = req.user.currentUsdBalance;
        
        if(parseFloat(currentUsdBalance) < parseFloat(usd_amount)) {
            res.json({success: "0", message: "Invested amount exceeded current USD balance: " + currentUsdBalance});
        } else {
            // create user row for mcp invest
            Deposit.create({
                checkout_id: randomNum,
                transaction_id: randomNum,
                user_id: userid,
                amount: usd_amount,
                type: user_transaction_type,
                payment_method: 0,
                balance: 0,
                currency_id: 0
            }).then(function (mcpInvest) {
                // create coin jolt user row for mcp deposit
                var digits2 = 9;	
                var numfactor2 = Math.pow(10, parseInt(digits2-1));	
                var randomNum2 =  Math.floor(Math.random() * numfactor2) + 1;
                Deposit.create({
                    checkout_id: randomNum2,
                    transaction_id: randomNum2,
                    user_id: coinjolt_user_id,
                    amount: usd_amount,
                    type: coinjolt_user_transaction_type,
                    payment_method: 0,
                    balance: 0,
                    currency_id: 0
                }).then(function (mcpDeposit) {
                    res.json({success: "1", message: "You have invested USD successfully."});
                })
            }).catch(function (err) {
                console.log(err);
            });
        }
        
    });


        
    app.post('/paypal', (req, res) => {
        const price = parseInt(req.body.amount);
        req.session.paypal_price = price;
        const create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": "http://www.coinjolt.com/account/paypal-success",
              "cancel_url": "http://www.coinjolt.com/account/paypal-cancel"
          },
          "transactions": [{
              "item_list": {
                  "items": [{
                      "name": "Red Sox Hat",
                      "sku": "001",
                      "price": price,
                      "currency": "USD",
                      "quantity": 1
                  }]
              },
              "amount": {
                  "currency": "USD",
                  "total": price
              },
              "description": "Hat for the best team ever"
          }]
        };
        var paypalCreate = paypal.payment.create(create_payment_json, function (error, payment) {res.json({success: "1", content: payment});});
        
        
      });
      
      app.get('/account/paypal-success', (req, res) => { 
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const priceVal = req.session.paypal_price;
        const execute_payment_json = {
          "payer_id": payerId,
          "transactions": [{
              "amount": {
                  "currency": "USD",
                  "total": priceVal
              }
          }]
        };
      
        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
          if (error) {
              console.log(error.response);
              throw error;
          } else {
                var digits = 9;	
                var numfactor = Math.pow(10, parseInt(digits-1));	
                var randomNum =  Math.floor(Math.random() * numfactor) + 1;

                Deposit.create({
                    user_id: req.user.id,
                    transaction_id: payment.id,
                    checkout_id: randomNum,
                    account_id: randomNum,
                    type: 0,
                    amount: parseFloat(payment.transactions[0].amount.total),
                    processing_fee: parseFloat(payment.transactions[0].related_resources[0].sale.transaction_fee.value),
                    payer_email: payment.payer.payer_info.email,
                    payer_name: payment.payer.payer_info.shipping_address.recipient_name,
                    payment_method: 6,
                    currency_id: 0
                });
                req.flash('payPalSuccessMsg', 'Your payment has been successful');
                res.redirect('/account/deposit-funds');
          }
        });

      });
      
      app.get('/account/paypal-cancel', (req, res) => {
        req.flash('payPalCancelMsg', 'Your payment has been cancelled');
        res.redirect('/account/deposit-funds');
      });

    app.get('/settings', user_acl, two_factor_checking, (req,res) => {
        res.render('settings', {layout: 'dashboard'});
    });

    app.get('/dashboard/genPdf', user_acl, two_factor_checking, async(req, res) =>{
        let pdf = require('handlebars-pdf');
       
        var timeStmp = 'bankWireTransferData_'+ new Date().getTime()+'.pdf';

        let wireTransferAmt = await WireTransfer.findOne({
            attributes: ['amount_usd'],
            limit: 1,
            order: [
                ['id', 'DESC']
            ]
        });

        let bankWireTransferDetails = await deposit_method_type.findOne({
			where: {
				deposit_method_id: '2' // deposit method is bank wire transfer
			}
        });
        
        var wTransferAmount = JSON.stringify(wireTransferAmt).split(":");

        var onlyWireTransferAmt = wTransferAmount[1];

        onlyWireTransferAmt = onlyWireTransferAmt.replace(/"|}|"/g,'');

        let document = {
            template: `
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 3px; margin-top: 0px;">Pending Wire Transfer Details</h3>
            <p style="font-size: 14px; font-weight: 400; margin-bottom: 15px; margin-top: 0px;">Provide the following banking details at your local branch.</p>  
            <form method="post">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">
                    Total Amount:</label>
                    <input type="text" class="form-control" placeholder="Total Amount" name="totalamount" id="totalamount" value="${ onlyWireTransferAmt}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Bank Name:</label>
                <input type="text" class="form-control" placeholder="Bank of Nova Scotia" name="bankname" id="bankname" value="${bankWireTransferDetails.bank_name}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Account Name:</label>
                <input type="text" class="form-control" placeholder="Kano Investments Inc" name="accountnumber" id="accountnumber"  value="${bankWireTransferDetails.account_name}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Bank Address:</label>
                <input type="text" class="form-control" placeholder="11666 Steveston Hwy #3020, Richmond, BC, V7A 5J3" name="bankaddress" id="bankaddress" value="${bankWireTransferDetails.bank_address}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Branch Number:</label>
                <input type="text" class="form-control" placeholder="51920" name="branchnumber" id="branchnumber" value="${bankWireTransferDetails.branch_number}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Institution Number:</label>
                <input type="text" class="form-control" placeholder="002" name="institutionnumber" id="institutionnumber" value="${bankWireTransferDetails.institution_number}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Account Number:</label>
                <input type="text" class="form-control" placeholder="0091782" name="accountnumber" id="accountnumber" value="${bankWireTransferDetails.account_number}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Routing Number (USA):</label>
                <input type="text" class="form-control" placeholder="026002532" name="routingnumber" id="routingnumber" value="${bankWireTransferDetails.routing_number}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Swift Code:</label>
                <input type="text" class="form-control" placeholder="NOSCCATT" name="swiftcode" id="swiftcode" value="${bankWireTransferDetails.swift_code}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                <label style="display: inline-block;max-width: 100%;margin-bottom: 5px;font-size: 12px;font-weight: 700;">Reference:</label>
                <input type="text" class="form-control" placeholder="support@coinjolt.com" name="reference" id="reference" value="${bankWireTransferDetails.reference_email}" readonly style="display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #eeeeee; background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);box-shadow: inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;font-size: 14px; font-weight: 400;">
                </div>
                </div>
         
          </form>`,
            context: {
                msg: 'Hello world'
            },
            path: 'public/wireTransfer_pdfs/'+timeStmp
        };
     
        pdf.create(document)
            .then(result => {
                res.redirect(keys.BASE_URL+'wireTransfer_pdfs/'+timeStmp);
                
            })
            .catch(error => {
                console.error(error)
            });


    });
    
    app.get('/account/shareholders', user_acl, two_factor_checking, (req,res) => {
        res.render('shareholders', {layout: 'dashboard', title:"Shareholders"});
    });

    app.post('/get_singleCrypto_blnc', user_acl, two_factor_checking, (req, res) => {
        const coincap_key = keys.COINCAP_KEY;

        var currencyType = req.body.currencyType;

        var options = {
            url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${currencyType}`,
            method: "GET",
            headers: {
              'X-CMC_PRO_API_KEY': coincap_key
            }
          };
           
          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

              var crypto_info = JSON.parse(body);

              var rate = crypto_info.data;

                var result = lodash.filter(rate, function(value, key) {
                  usd_price_for_single_crypto = value.quote.USD.price;
                });
               
                res.json({success: "true", crypto_info: usd_price_for_single_crypto });

            }
          }
           
          request(options, callback);

    });

    app.get('/account/get_allCrypto_blnc', async (req, res) =>{
        const coincap_key = keys.COINCAP_KEY;
        var currency_list = await Currency.findAll({
            where: {
                currency_id: {
                    [Op.ne]: "RMG"
                }
            },
            order: [
                ['id', 'ASC']
            ]
        });

        var currencyIdArr = [];

        var currencyType = '';

        currency_list.forEach(function(element) {
    
            currencyIdArr.push(element.currency_id);
          
        });

        lodash.join(currencyIdArr, ',');

        currencyType =  currencyIdArr.toString();


        var options = {
            url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${currencyType}`,
            method: "GET",
            headers: {
              'X-CMC_PRO_API_KEY': coincap_key
            }
          };
           
          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                var all_crypto_info = JSON.parse(body);

                var rate = all_crypto_info.data;

                var usd_price_for_all_crypto = [];

                var result = lodash.filter(rate, function(value, key) {

                    usd_price_for_all_crypto.push({[value.symbol] : value.quote.USD.price});

                });
               
                res.json({success: "true", all_crypto_info: usd_price_for_all_crypto });
                
            }
          }

          request(options, callback);

    });

};
