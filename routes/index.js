var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'test'
});
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

        models.company_setting.findAll({

        }).then(function(companySettingsData){  
            res.render('cms_body', {layout: 'cms/dashboard', companySettingsData: companySettingsData});
        });
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

        res.render('login', {
            message: msg
        });
    });

    app.get('/forgot-password', (req, res) =>{

        var msg = req.flash('forgotPassMsg')[0];

        res.render('forgot_password', {message: msg});
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
                                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Forgot Password</title>
    <!-- 
    The style block is collapsed on page load to save you some scrolling.
    Postmark automatically inlines all CSS properties for maximum email client 
    compatibility. You can just update styles here, and Postmark does the rest.
-->
<style type="text/css" rel="stylesheet" media="all">
/* Base ------------------------------ */

*:not(br):not(tr):not(html) {
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  box-sizing: border-box;
}

body {
  width: 100% !important;
  height: 100%;
  margin: 0;
  line-height: 1.4;
  background-color: #F2F4F6;
  color: #74787E;
  -webkit-text-size-adjust: none;
}

p,
ul,
ol,
blockquote {
  line-height: 1.4;
  text-align: left;
}

a {
  color: #3869D4;
}

a img {
  border: none;
}

td {
  word-break: break-word;
}
/* Layout ------------------------------ */

.email-wrapper {
  width: 100%;
  margin: 0;
  padding: 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
  background-color: #F2F4F6;
}

.email-content {
  width: 100%;
  margin: 0;
  padding: 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
}
/* Masthead ----------------------- */

.email-masthead {
  padding: 15px 0;
  text-align: center;
}

.email-masthead_logo {
  width: 94px;
}

.email-masthead_name {
  font-size: 16px;
  font-weight: bold;
  color: #bbbfc3;
  text-decoration: none;
  text-shadow: 0 1px 0 white;
}
/* Body ------------------------------ */

.email-body {
  width: 100%;
  margin: 0;
  padding: 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
  border-top: 1px solid #EDEFF2;
  border-bottom: 1px solid #EDEFF2;
  background-color: #FFFFFF;
}

#email-body_inner {
  width: 570px;
  padding: 25px;
  -premailer-width: 570px;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
  background-color: #FFFFFF;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  -ms-border-radius: 5px;
  -o-border-radius: 5px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25);
  -webkit-box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25);
  -moz-box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25);
  -ms-box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25);
  -o-box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25);
  
  margin: 20px auto !important;
}

.email-footer {
  width: 570px;
  margin: 0 auto;
  padding: 0;
  -premailer-width: 570px;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
  text-align: center;
}

.email-footer p {
  color: #AEAEAE;
}

.body-action {
  width: 100%;
  margin: 30px auto;
  padding: 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
  text-align: center;
}

.body-sub {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #EDEFF2;
}

.content-cell {
  padding: 15px 0 15px;
}

.preheader {
  display: none !important;
  visibility: hidden;
  mso-hide: all;
  font-size: 1px;
  line-height: 1px;
  max-height: 0;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
}
/* Attribute list ------------------------------ */

.attributes {
  margin: 0 0 21px;
}

.attributes_content {
  background-color: #EDEFF2;
  padding: 16px;
}

.attributes_item {
  padding: 0;
}
/* Related Items ------------------------------ */

.related {
  width: 100%;
  margin: 0;
  padding: 25px 0 0 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
}

.related_item {
  padding: 10px 0;
  color: #74787E;
  font-size: 15px;
  line-height: 18px;
}

.related_item-title {
  display: block;
  margin: .5em 0 0;
}

.related_item-thumb {
  display: block;
  padding-bottom: 10px;
}

.related_heading {
  border-top: 1px solid #EDEFF2;
  text-align: center;
  padding: 25px 0 10px;
}
/* Discount Code ------------------------------ */

.discount {
  width: 100%;
  margin: 0;
  padding: 24px;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
  background-color: #EDEFF2;
  border: 2px dashed #9BA2AB;
}

.discount_heading {
  text-align: center;
}

.discount_body {
  text-align: center;
  font-size: 15px;
}
/* Social Icons ------------------------------ */

.social {
  width: auto;
}

.social td {
  padding: 0;
  width: auto;
}

.social_icon {
  height: 20px;
  margin: 0 8px 10px 8px;
  padding: 0;
}
/* Data table ------------------------------ */

.purchase {
  width: 100%;
  margin: 0;
  padding: 35px 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
}

.purchase_content {
  width: 100%;
  margin: 0;
  padding: 25px 0 0 0;
  -premailer-width: 100%;
  -premailer-cellpadding: 0;
  -premailer-cellspacing: 0;
}

.purchase_item {
  padding: 10px 0;
  color: #74787E;
  font-size: 15px;
  line-height: 18px;
}

.purchase_heading {
  padding-bottom: 8px;
  border-bottom: 1px solid #EDEFF2;
}

.purchase_heading p {
  margin: 0;
  color: #9BA2AB;
  font-size: 12px;
}

.purchase_footer {
  padding-top: 15px;
  border-top: 1px solid #EDEFF2;
}

.purchase_total {
  margin: 0;
  text-align: right;
  font-weight: bold;
  color: #2F3133;
}

.purchase_total--label {
  padding: 0 15px 0 0;
}
/* Utilities ------------------------------ */

.align-right {
  text-align: right;
}

.align-left {
  text-align: left;
}

.align-center {
  text-align: center;
}
/*Media Queries ------------------------------ */

@media only screen and (max-width: 600px) {
  .email-body_inner,
  .email-footer {
    width: 100% !important;
}
}

@media only screen and (max-width: 500px) {
  .button {
    width: 100% !important;
}
}
/* Buttons ------------------------------ */

.button {
  background-color: #3869D4;
  border-top: 10px solid #3869D4;
  border-right: 18px solid #3869D4;
  border-bottom: 10px solid #3869D4;
  border-left: 18px solid #3869D4;
  display: inline-block;
  color: #FFF;
  text-decoration: none;
  border-radius: 3px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
  -webkit-text-size-adjust: none;
}

.button--green {
  background-color: #025FDF;
  border-top: 10px solid #025FDF;
  border-right: 18px solid #025FDF;
  border-bottom: 10px solid #025FDF;
  border-left: 18px solid #025FDF;
}

.button--red {
  background-color: #FF6136;
  border-top: 10px solid #FF6136;
  border-right: 18px solid #FF6136;
  border-bottom: 10px solid #FF6136;
  border-left: 18px solid #FF6136;
}
/* Type ------------------------------ */

h1 {
  margin-top: 0;
  color: #2F3133;
  font-size: 19px;
  font-weight: bold;
  text-align: left;
}

h2 {
  margin-top: 0;
  color: #2F3133;
  font-size: 16px;
  font-weight: bold;
  text-align: left;
}

h3 {
  margin-top: 0;
  color: #2F3133;
  font-size: 14px;
  font-weight: bold;
  text-align: left;
}

p {
  margin-top: 0;
  color: #74787E;
  font-size: 16px;
  line-height: 1.5em;
  text-align: left;
}

p.sub {
  font-size: 12px;
}

p.center {
  text-align: center;
}
</style>
</head>
<body>
    <span class="preheader">Use this link to reset your password. The link is only valid for 24 hours.</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="email-masthead">
                <a href="javascript:void(0);" class="email-masthead_name">
                    <img src="${keys.BASE_URL}dist/img/forgot_template_logo.png" alt="logo" />
                </a>
            </td>
        </tr>
        <!-- Email Body -->
        <tr>
          <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
          <table id="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="border: 1px solid #ccc;">
              <!-- Body content -->
              <tr>
                <td class="content-cell"> <!-- END STATIC CONTENT -->
                                `;
                                
                                complete_mail_content += upper_static_content;

                                complete_mail_content += editor_content_body;

                                var email_lower_static_content = `
                                <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td align="center">
                                        <!-- Border based button
                                           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                                           <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                              <tr>
                                                <td align="center">
                                                  <table border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                      <td>
                                                        <a href="${keys.BASE_URL}reset_password/${email_key}" class="button button--green" target="_blank">Reset Password</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                                    <p>
                                    <a href="${keys.BASE_URL}reset_password/${email_key}">${keys.BASE_URL}reset_password/${email_key}</a></p>
                                    <p>If you did not request this, please email support@coinjolt.com immediately.</p>    
                                    <p>Additionally, if you have any questions, we’re always happy to help out - just reply to this email.</p>
                                        <p>Sincerely,</p>
                                        <p>Coin Jolt Support</p>
                                        <!-- Sub copy -->
                                    </td>
                                </tr>
                            </table>
                            </td>
                            </tr>
                            <tr>
                            <td>
                                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td class="content-cell" align="center">
                                        <p class="sub align-center" style="margin-bottom: 0;">Copyright &copy; 2011 - 2018 CoinJolt.com. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                            </td>
                            </tr>
                            </table>
                            </td>
                            </tr>
                            </table>
                            </body>
                            </html>
                                `;

                                

                                complete_mail_content += email_lower_static_content;
   
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
            // if(req.user.two_factorAuth_status == 1){
                // res.render('two_factor_authentication');
            // }else{
                bitgo.authenticate({ username: keys.BITGO_USERNAME, password: keys.BITGO_PASSWORD, otp: keys.BITGO_OTP })
                .then(function(response) {
                    console.log(response.access_token);
                    res.cookie('BITGO_ACCESS_TOKEN',response.access_token);
                    res.redirect('/dashboard');
                }).catch(function (err) {
                    res.redirect('/dashboard');
                });
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
        models.Country.findAll().then(function (country) {
            res.render('signup', {
                message: msg,
                errorMsg: errorMsg,
                countries: country
            });
        });
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
                        bitgo.authenticate({
                            username: keys.BITGO_USERNAME,
                            password: keys.BITGO_PASSWORD,
                            otp: keys.BITGO_OTP
                        }, function (err, result) {
                            if (err) {
                                return console.log(err);
                            }
                            var accessToken = result.access_token;
                            var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: accessToken});
                            var data = {
                                "passphrase": keys.BITGO_PASSWORD,
                                "label": "Coinjolt Bitgo Wallet"
                            }
                            bitgoVerify.wallets().createWalletWithKeychains(data, function (walleterr, walletResult) {
                                if (walleterr) {
                                    console.dir(walleterr);
                                    throw new Error("Could not create wallet!");
                                }
                                console.dir(walletResult);
                                // console.log("User keychain encrypted xPrv: " + walletResult.userKeychain.encryptedXprv);
                                // console.log("Backup keychain xPub: " + walletResult.backupKeychain.xPub);
                                walletId = walletResult.wallet.wallet.id;
                                label = walletResult.wallet.wallet.label;
                                userkeychain_public = walletResult.userKeychain.xpub;
                                userkeychain_private = walletResult.userKeychain.xprv;
                                backupkeychain_private = walletResult.backupKeychain.xprv;
                                backupkeychain_public = walletResult.backupKeychain.xpub;
                                bitgokeychain_public = walletResult.bitgoKeychain.xpub;
                            }).then(function (createWallet) {
                                models.wallet.create({
                                    user_id: user_id,
                                    bitgo_wallet_id: walletId,
                                    label: label,
                                    userkeychain_public: userkeychain_public,
                                    userkeychain_private: userkeychain_private,
                                    backupkeychain_private: backupkeychain_private,
                                    backupkeychain_public: backupkeychain_public,
                                    bitgokeychain_public: bitgokeychain_public
                                });
                            });
                        });

                        req.flash('loginMessage', 'Your account activated successfully. We have created a Bitgo wallet for you. Please login to continue.');
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

     app.get('/blog/:blogDetail', (req,res) =>{
        
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
