var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'prod',
    accessToken: process.env.ACCESS_TOKEN
});
// var BitGoJS = require('bitgo');
const keys = require('../config/key');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const bCrypt = require('bcrypt-nodejs');
var speakeasy = require('speakeasy');
const auth = require('../middlewares/auth');

module.exports = function (app, passport, models) {
    
    app.get('/', auth, function(req, res) {
        Promise.all([
            models.company_setting.findAll({}),
            models.cms_home_page.findAll({})
        ]).then(function (result) {
            var result = JSON.parse(JSON.stringify(result));
            res.render('cms_body', {layout: 'cms/dashboard', companySettingsData: result[0], home_sttings:result[1]});
        });

        // models.company_setting.findAll({

        // }).then(function(companySettingsData){  
        //     res.render('cms_body', {layout: 'cms/dashboard', companySettingsData: companySettingsData});
        // });
    });

    app.get('/terms-of-service', auth, function(req, res) {

        Promise.all([
            models.company_setting.findAll({

            }),
            
            models.cms_terms_of_service.findAll({
                
            })
        ]).then(function (result) {
            var result = JSON.parse(JSON.stringify(result, undefined, 2));
	        res.render('cms_terms_of_service',{layout: 'cms/dashboard',companySettingsData:result[0],termsOfServiceData:result[1]});
        });

    });    

    app.get('/privacy-policy', auth, function(req, res) {


        Promise.all([
            models.company_setting.findAll({

            }),
            
            models.cms_privacy_policy.findAll({
                
            })
        ]).then(function (result) {
            var result = JSON.parse(JSON.stringify(result, undefined, 2));
	        res.render('cms_privacy_policy',{layout: 'cms/dashboard',companySettingsData:result[0],privacyPolicyData:result[1]});
        });

    });    

    app.get('/risk-disclosures',auth, function(req, res){

        Promise.all([
            models.company_setting.findAll({

            }),
            
            models.cms_risk_disclosures.findAll({
                
            }),

            models.blog_post.findAll({  // featured 
                where: {
                    post_category_id: 1
                },
                limit: 6,
                order: [
                    ['createdAt', 'DESC']
                ]
            }),

            models.blog_post.findAll({  // latest news
                where: {
                    post_category_id: 3
                },
                limit: 6,
                order: [
                    ['createdAt', 'DESC']
                ]
            })

        ]).then(function (result) {
            
            var result = JSON.parse(JSON.stringify(result, undefined, 2));
	        res.render('cms_risk_disclosures',{layout: 'cms/dashboard',companySettingsData:result[0],riskDisclosuresData:result[1], featured_posts: result[2], latest_news: result[3]});
        });

    });

    app.get('/charts', auth, (req, res) =>{

        models.company_setting.findAll({}).then(function(result){
            res.render('cms_charts',{layout: 'cms/dashboard',companySettingsData:result});
        });
    });

    app.get('/login', function (req, res) {

        var msg = req.flash('loginMessage')[0];

        if(req.user != undefined && req.user.type == '2'){
            res.redirect('/account/dashboard');
        }

        else if(req.user != undefined && req.user.type == '1'){
            res.redirect('/admin/dashboard');
        }

        else{
            res.render('login', {
                message: msg
            });
        }

        
    });

    app.get('/forgot-password', (req, res) =>{

        var msg = req.flash('forgotPassMsg')[0];

        if(req.user != undefined && req.user.type == '2'){
            res.redirect('/account/dashboard');
         }
        
        else if(req.user != undefined && req.user.type == '1'){
            res.redirect('/admin/dashboard');
        }
        
        else{
            res.render('forgot_password', {message: msg}); 
        }
    });    

    app.post('/update-password2', (req, res) =>{
        const secretKey = req.body.forgot_key;
        const newPassword = bCrypt.hashSync(req.body.passWord);
        models.forgot_password.findAndCountAll({ where: {key: secretKey,status: 0} }).then(function(results){
                var count = results.count;
                if(count > 0){
                    userEmail = results.rows[0].user_email;
                    models.forgot_password.update({
                        status: 1
                    }, {
                        where: {
                            key: secretKey
                        }
                    }).then(function (result) {
                        models.User.update({
                            password: newPassword
                        }, {
                            where: {email: userEmail}
                        }).then(function(response){
                            res.json({status: 1, msg: 'Your password has been updated, please login'});
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
                else{
                    res.json({status: 2, msg: 'The link has been expired please try again'});
                }
            
        });

    });

    app.post('/forgot-password', (req, res) =>{
        const prevEmail = req.body.prevEmail;
        const ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;

        function genRandomKeys() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 10; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
          }
          
        const rKeys = genRandomKeys();
        const rand_key = encrypt(rKeys);
        var ses = new AWS.SES({apiVersion: '2010-12-01'});
        var user_email = req.body.prevEmail;
        var subject = 'Request received for Forgot Password';
        email_key = rand_key+"/";

        models.User.count({ where: {email: prevEmail} }).then(function(count){
            if(count > 0){
                models.User.findAll({
                    where: {status: 1,email: prevEmail}
                }).then(function(response){
                    if(response.length === 0){
                        res.json({status: 1, msg: "Your Account is not activated"});

                    }
                    else{

                        // function genRandomKeys() {
                        //     var text = "";
                        //     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        //     for (var i = 0; i < 10; i++)
                        //       text += possible.charAt(Math.floor(Math.random() * possible.length));
                          
                        //     return text;
                        //   }
                          
                        // const rKeys = genRandomKeys();
                        // const rand_key = encrypt(rKeys);
                        // var ses = new AWS.SES({apiVersion: '2010-12-01'});
                        // var user_email = req.body.prevEmail;
                        // var subject = 'Request received for Forgot Password';
                        // email_key = rand_key+"/";

                        models.email_template.belongsTo(models.email_template_type, {foreignKey: 'template_type'});
                            models.email_template.findAll({
                                where: {
                                    template_type: 2 // for forgot password template
                                },
                                include: [{
                                    model: models.email_template_type
                                }],
                                    order: [
                                    ['id', 'DESC']
                                ]
                            }).then(function(resp){
                                var editor_content_body = resp[0].template_desc;
                                
                                var complete_mail_content = ''; 

                                var activate_btn_content = '';

                                var lower_static_content = '';

                            

                                var upper_static_content = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                  <meta name="viewport" content="width=device-width, initial-scale=1">
                                  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                                  <!-- Favicon -->
                                  <link rel="shortcut icon" href="/dist/img/favicon.ico" type="image/x-icon">
                                  <link rel="icon" href="/dist/img/favicon.ico" type="image/x-icon">
                                  <style type="text/css">
                                  /* FONTS */
                                  @media screen {
                                    @font-face {
                                  font-family: 'AvenirNextLTPro-Regular';
                                  src: url('/email_template_fonts/fonts/AvenirNextLTPro-Regular.eot');
                                  src: url('/email_template_fonts/fonts/AvenirNextLTPro-Regular.woff2') format('woff2'),
                                  url('/email_template_fonts/fonts/AvenirNextLTPro-Regular.woff') format('woff'),
                                  url('/email_template_fonts/fonts/AvenirNextLTPro-Regular.ttf') format('truetype'),
                                  url('/email_template_fonts/fonts/AvenirNextLTPro-Regular.svg#AvenirNextLTPro-Regular') format('svg'),
                                  url('/email_template_fonts/fonts/AvenirNextLTPro-Regular.eot?#iefix') format('embedded-opentype');
                                  font-weight: normal;
                                  font-style: normal;
                                }
                                
                                @font-face {
                                  font-family: 'AvenirNextLTProBold';
                                  src: url('/email_template_fonts/fonts/AvenirNextLTProBold.eot');
                                  src: url('/email_template_fonts/fonts/AvenirNextLTProBold.eot') 
                                  format('embedded-opentype'), url('/email_template_fonts/fonts/AvenirNextLTProBold.woff2') 
                                  format('woff2'), url('/email_template_fonts/fonts/AvenirNextLTProBold.woff') 
                                  format('woff'), url('/email_template_fonts/fonts/AvenirNextLTProBold.ttf') 
                                  format('truetype'), url('/email_template_fonts/fonts/AvenirNextLTProBold.svg#AvenirNextLTProBold') 
                                  format('svg');
                                }
                                  }
                                
                                  /* CLIENT-SPECIFIC STYLES */
                                  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: 'AvenirNextLTPro-Regular', sans-serif; }
                                  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                                  img { -ms-interpolation-mode: bicubic; }
                                
                                  /* RESET STYLES */
                                  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                                  table { border-collapse: collapse !important; }
                                  body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
                                
                                  /* iOS BLUE LINKS */
                                  a[x-apple-data-detectors] {
                                    color: inherit !important;
                                    text-decoration: none !important;
                                    font-size: inherit !important;
                                    font-family: inherit !important;
                                    font-weight: inherit !important;
                                    line-height: inherit !important;
                                  }
                                
                                  /* MOBILE STYLES */
                                  @media screen and (max-width:600px){
                                    h1 {
                                      font-size: 32px !important;
                                      line-height: 32px !important;
                                    }
                                  }
                                
                                  /* ANDROID CENTER FIX */
                                  div[style*="margin: 16px 0;"] { margin: 0 !important; }
                                </style>
                                </head>
                                <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
                                
                                  <!-- HIDDEN PREHEADER TEXT -->
                                  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'AvenirNextLTPro-Regular', sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                                        Use this link to reset your password.
                                  </div>
                                
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    
                                    <tr>
                                      <td bgcolor="#025fdf" align="center">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                                              <tr>
                                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                                                  <a href="#" target="_blank">
                                                    <img alt="Logo" src="${keys.BASE_URL}dist/img/template_logo.png" width="200" height="27" style="display: block; width: 200px; max-width: 200px; min-width: 200px; font-family: 'AvenirNextLTPro-Regular', sans-serif; color: #ffffff; font-size: 18px; filter: invert(1);" border="0">
                                                  </a>
                                                </td>
                                              </tr>
                                            </table>
                                            <!--[if (gte mso 9)|(IE)]>
                                            </td>
                                            </tr>
                                            </table>
                                          <![endif]-->
                                        </td>
                                      </tr> <!-- Static Content -->
                                     
                                      <tr>
                                        <td bgcolor="#025fdf" align="center" style="padding: 0px 10px 0px 10px;">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                                              <tr>
                                                <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                                  <h1 style="font-size: 48px; font-weight: bold; margin: 0;"></h1>
                                                </td>
                                              </tr>
                                            </table>
                                            <!--[if (gte mso 9)|(IE)]>
                                            </td>
                                            </tr>
                                            </table>
                                          <![endif]-->
                                        </td>
                                      </tr> <!-- Static Content -->
                                     
                                      <tr>
                                        <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                                              
                                              <tr>
                                                <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                                `;
                                
                                complete_mail_content += upper_static_content;
                                
                                var mid_dynamic_content = editor_content_body;

                                complete_mail_content += mid_dynamic_content;
                                
                                complete_mail_content += `</td></tr>`;
                                
                                activate_btn_content = `
                                    <tr>
                                    <td bgcolor="#ffffff" align="left">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                        <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 3px;" bgcolor="#025fdf"><a href="${keys.BASE_URL}reset_password/${email_key}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #025fdf; display: inline-block;">Reset Password</a></td>
                                            </tr>
                                            </table>
                                        </td>
                                        </tr>
                                    </table>
                                    </td>
                                </tr>
                                `;

                                complete_mail_content += activate_btn_content;

                                lower_static_content = `
                                    <tr>
                                    <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                                    
                                    <p> 
                                        <a href="${keys.BASE_URL}reset_password/${email_key}">
                                        ${keys.BASE_URL}reset_password/${email_key}
                                        </a>
                                    </p>
                                    </td>
                                </tr> <!-- Static Content -->
                                <tr>
                                    <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                                    <p style="margin: 0;">If you have any questions, just reply to this email—we're always happy to help out.</p>
                                    </td>
                                </tr> <!-- Static Content -->
                                
                                <tr>
                                    <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                                    <p style="margin: 0;">Cheers,<br>The Coin Jolt Team</p>
                                    </td>
                                </tr> <!-- Static Content -->
                    
                                </table>
                    
                    
                                <!--[if (gte mso 9)|(IE)]>
                                </td>
                                </tr>
                                </table>
                            <![endif]-->
                            </td>
                        </tr>
                        <!-- SUPPORT CALLOUT -->
                        <tr>
                            <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                                <!--[if (gte mso 9)|(IE)]>
                                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                                <tr>
                                <td align="center" valign="top" width="600">
                                <![endif]-->
                                
                                <!--[if (gte mso 9)|(IE)]>
                                </td>
                                </tr>
                                </table>
                            <![endif]-->
                            </td>
                        </tr> <!-- Static Content -->
                        <!-- FOOTER -->
                        <tr>
                            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                                <!--[if (gte mso 9)|(IE)]>
                                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                                <tr>
                                <td align="center" valign="top" width="600">
                                <![endif]-->
                                
                                <!--[if (gte mso 9)|(IE)]>
                                </td>
                                </tr>
                                </table>
                            <![endif]-->
                            </td>
                        </tr> <!-- Static Content -->
                        </table>
                        
                    </body>
                    </html>
                                `;

                                complete_mail_content += lower_static_content;
   
                                ses.sendEmail({ 
                                    Source: keys.senderEmail, 
                                    Destination: { ToAddresses: [user_email] },
                                    Message: {
                                        Subject: {
                                            Data: subject
                                        },
                                        Body: {
                                            Html: {
                                                Charset: "UTF-8",
                                                Data: complete_mail_content
                                            }
                                        }
                                    }
                                }, function(err, data) {
                                    if(err) throw err;
                                });

                            });  
                        }    

                        models.forgot_password.create({
                            key: rand_key,
                            ip_address: ipAddress,
                            status: 0,
                            user_email: user_email
                        }).then(function(result){
                            res.json({status: 0, msg: "An email has been sent to your inbox with instructions on how to reset your password"});
                        });

                    });

            }
            else{
                res.json({status: 2, msg: "User not found"});
            }
            
        });  

    });

    app.get('/reset_password/:reset_key', (req, res) =>{
        res.render('update_password');
    });

    app.post('/login', passport.authenticate('local-login', {
            //successRedirect : '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
    }),
    function (req, res) {
        
        if (req.user.type === '1') {
            res.redirect('/admin/dashboard');
        } else {
            console.log(process.env.ACCESS_TOKEN);
            // bitgo.session({}, function callback(err, session) {
            // if (err) {
            //     // handle error
            //     console.log(err);
            // }
            // res.redirect('/dashboard');
            // //res.send(session);
            // console.log(session);
            // });
            
            // added today
            res.redirect('/account/dashboard');
           
            // if(req.user.two_factorAuth_status == 1){
                // res.render('two_factor_authentication');
            // }else{
                // bitgo.authenticate({ username: keys.BITGO_USERNAME, password: keys.BITGO_PASSWORD, otp: keys.BITGO_OTP })
                // .then(function(response) {
                //     console.log("Response Access Token");
                //     console.log(response.access_token);
                //     res.cookie('BITGO_ACCESS_TOKEN',response.access_token);
                //     res.redirect('/dashboard');
                // })
                // .catch(function (err) {
                //     console.log("dashboard2");
                //     console.log(err);
                //     res.cookie('BITGO_ACCESS_TOKEN','v2xb1e1a1487f5b606c7982c4bd14370841eadaa48509f244f6672a4a587e36d018');
                //     res.redirect('/dashboard');
                // });

                // var bitgo = new BitGoJS.BitGo({ env: 'test', accessToken:'v2xb1e1a1487f5b606c7982c4bd14370841eadaa48509f244f6672a4a587e36d018'});
                // bitgo.session({}, function callback(err, session) {
                //   if (err) {
                //     // handle error
                //     console.log(err);
                //   }
                //   console.dir(session);
                // });
            // }
        }
    });



    app.post('/two_factor_auth_checking_for_login', (req,res) => {
        var userToken = req.body.user_token;

        var verified = speakeasy.totp.verify({
          secret: req.user.two_factorAuth_secret_key,
          encoding: 'base32',
          token: userToken
        });
        res.json({
            status: verified
        });
    });

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/signup',
            failureRedirect: '/signup',
            failureFlash: true
        }),
        function (req, res) {

        });

    app.get('/signup', function (req, res) {

        var msg = req.flash('signupMessage')[0];
        var errorMsg = req.flash('signupErrorMessage')[0];

        if(req.user != undefined && req.user.type == '2'){
            res.redirect('/account/dashboard');
         }
        
        else if(req.user != undefined && req.user.type == '1'){
            res.redirect('/admin/dashboard');
        }
        
        else{
            models.Country.findAll().then(function (country) {
                res.render('signup', {
                    message: msg,
                    errorMsg: errorMsg,
                    countries: country
                });
            });
        }
    });


    app.get('/user/:userid', function (req, res) {
        var uid = req.params['userid'];
        res.cookie('referral_id', uid);
        req.session.cookie.maxAge = 30 * 24 * 3600 * 1000;
        res.redirect('/signup');
    });

    app.get('/activated/:activation_key', (req, res) => {
        const key = req.params['activation_key'];
        var walletId;
        var label;
        var userkeychain_public;
        var userkeychain_private;
        var backupkeychain_private;
        var backupkeychain_public;
        var bitgokeychain_public;
        models.User.count({
            where: {
                activation_key: key,
                status: 1
            }
        }).then(function (count) {
            if (count > 0) {
                req.flash('loginMessage', 'Account is already activated. Please login to continue.');
                res.redirect('/login');
            } else {
                models.User.update({
                    status: 1
                }, {
                    where: {
                        activation_key: key
                    }
                }).then(function (result) {
                    models.User.findOne({
                        where: {
                            activation_key: key
                        }
                    }).then(function (user) {
                        var user_id = user.id;
                        // bitgo.authenticate({
                        //     username: keys.BITGO_USERNAME,
                        //     password: keys.BITGO_PASSWORD,
                        //     otp: keys.BITGO_OTP
                        // }, function (err, result) {
                            // if (err) {
                            //     return console.log(err);
                            // }
                            //var accessToken = result.access_token;
                            //var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: accessToken});
                            var data = {
                                "passphrase": 'COinjolt123!!',
                                "label": "Coin Jolt"
                            }
                            // bitgo.wallets().createWalletWithKeychains(data, function (walleterr, walletResult) {
                            //     if (walleterr) {
                            //         console.dir(walleterr);
                            //         throw new Error("Could not create wallet!");
                            //     }
                            //     console.dir(walletResult);
                            //     // console.log("User keychain encrypted xPrv: " + walletResult.userKeychain.encryptedXprv);
                            //     // console.log("Backup keychain xPub: " + walletResult.backupKeychain.xPub);
                            //     walletId = walletResult.wallet.wallet.id;
                            //     label = walletResult.wallet.wallet.label;
                            //     userkeychain_public = walletResult.userKeychain.xpub;
                            //     userkeychain_private = walletResult.userKeychain.xprv;
                            //     backupkeychain_private = walletResult.backupKeychain.xprv;
                            //     backupkeychain_public = walletResult.backupKeychain.xpub;
                            //     bitgokeychain_public = walletResult.bitgoKeychain.xpub;
                            // })
                            bitgo.coin('btc').wallets()
                            .generateWallet({ label: 'Coin Jolt Wallet-' + user.email + "-btc", passphrase: 'COinjolt123!!' })
                            .then(function (createWallet) {
                                walletId = createWallet.wallet._wallet.id;
                                label = createWallet.wallet._wallet.label;
                                userkeychain_public = createWallet.userKeychain.pub;
                                userkeychain_private = createWallet.userKeychain.prv;
                                backupkeychain_private = createWallet.backupKeychain.prv;
                                backupkeychain_public = createWallet.backupKeychain.pub;
                                bitgokeychain_public = createWallet.bitgoKeychain.pub;

                                models.wallet.create({
                                    user_id: user_id,
                                    currency_id: '1',
                                    bitgo_wallet_id: walletId,
                                    label: label,
                                    userkeychain_public: userkeychain_public,
                                    userkeychain_private: userkeychain_private,
                                    backupkeychain_private: backupkeychain_private,
                                    backupkeychain_public: backupkeychain_public,
                                    bitgokeychain_public: bitgokeychain_public
                                });
                            });
                        // });

                        req.flash('loginMessage', 'Your account activated successfully. We have created a Bitgo Bitcoin wallet for you. Please login to continue.');
                        res.redirect('/login');
                    })

                }).catch(function (err) {});
            }
        });
    });

    app.get('/about-us', (req,res) => {

        Promise.all([
            models.company_setting.findAll({  

            }),
            models.cms_about_us.findAll({

            })
        ]).then(function (result) {
            res.render("cms/about_us", {layout: "cms/dashboard", companySettingsData:result[0],details:result[1]})
        });
    });

     app.get('/:blogDetail', auth, (req,res) =>{
        
        var blogPageSlug = req.params.blogDetail;

        models.blog_post.belongsTo(models.blog_category, {foreignKey: 'post_category_id'});

        Promise.all([
            models.blog_post.findAndCountAll({
                where: {
                    post_slug: blogPageSlug
                }
            }),

            models.blog_post.findAll({  // featured 
                where: {
                    post_category_id: 1
                },
                limit: 6,
                order: [
                    ['createdAt', 'DESC']
                ]
            }),

            models.blog_post.findAll({  // latest news
                where: {
                    post_category_id: 3
                },
                limit: 6,
                order: [
                    ['createdAt', 'DESC']
                ]
            }),

            models.company_setting.findAll({

            }),

             
            models.blog_post.findAll({
               where: {
                    post_slug: blogPageSlug
                },
                include: [{
                    model: models.blog_category
                }],
                order: [
                    ['id', 'DESC']
                ]
        })

        ]).then(function (results) {
            
            res.render("cms/blog_content", {layout: "cms/dashboard", blogContent: results[0].rows,featured_posts: results[1], latest_news: results[2], companySettingsData: results[3], postTitle: results[4]});
        });


    }); 

    function encrypt(text) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

};


