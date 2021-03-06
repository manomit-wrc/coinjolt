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
var QRCode = require('qrcode');
const request = require('request');

// var twoFactor = require('node-2fa');

//end

const auth = require('../middlewares/auth');

module.exports = function (app, passport, models, User) {
    
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
                    post_category_id: 1,
                    createdAt: {
                        lte: new Date()
                    }
                },
                limit: 6,
                order: [
                    ['createdAt', 'DESC']
                ]
            }),

            models.blog_post.findAll({  // latest news
                where: {
                    post_category_id: 3,
                    createdAt: {
                        lte: new Date()
                    }
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
        var loginActivationMessage = req.flash('loginActivationMessage')[0];
        var resendActivationMessage = req.flash('resendActivationMessage')[0];

        var resendEmailSuccessMessage = req.flash('resendEmailSuccessMessage')[0]; 
        if(req.user != undefined && req.user.type == '2'){
            res.redirect('/account/dashboard');
        }

        else if(req.user != undefined && req.user.type == '1'){
            res.redirect('/admin/dashboard');
        }

        else{
            res.render('login', {
                message: msg,
                loginActivationMessage: loginActivationMessage,
                resendActivationMessage: resendActivationMessage,
                resendEmailSuccessMessage: resendEmailSuccessMessage
            });
        }

        
    });

    app.get('/get_crypto_rates', function(req, res){
        const coincap_key = keys.COINCAP_KEY;
        
        var options = {
            url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,XRP,LTC,BCH',
            method: "GET",
            headers: {
              'X-CMC_PRO_API_KEY': coincap_key
            }
          };
           
          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

              var crypto_info = JSON.parse(body);
                
              var btc_usd_value = parseFloat(crypto_info.data.BTC.quote.USD.price);
              
              var eth_usd_value = parseFloat(crypto_info.data.ETH.quote.USD.price);

              var xrp_usd_value = parseFloat(crypto_info.data.XRP.quote.USD.price);

              var ltc_usd_value = parseFloat(crypto_info.data.LTC.quote.USD.price);

              var bch_usd_value =  parseFloat(crypto_info.data.BCH.quote.USD.price); 

               
              res.json({success: "true", btc_usd_value: btc_usd_value, eth_usd_value: eth_usd_value, xrp_usd_value: xrp_usd_value, ltc_usd_value: ltc_usd_value, bch_usd_value: bch_usd_value });

            }
          }
           
          request(options, callback); 


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
                            res.json({status: 1, msg: 'Your password has been updated, please login.'});
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
                else{
                    res.json({status: 2, msg: 'The link has been expired, please try again.'});
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
        var subject = 'Request received for a password reset.';
        email_key = rand_key+"/";

        models.User.count({ where: {email: prevEmail} }).then(function(count){
            if(count > 0){
                models.User.findAll({
                    where: {status: 1,email: prevEmail}
                }).then(function(response){
                    if(response.length === 0){
                        res.json({status: 1, msg: "Your account has not yet been activated"});

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
                                  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
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
                                        Alternatively, you can click here to take the same action.
                                        </a>
                                    </p>
                                    </td>
                                </tr> <!-- Static Content -->
                                <tr>
                                    <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                                    <p style="margin: 0;">If you have any questions, just reply to this email — we're always happy to help out.</p>
                                    </td>
                                </tr> <!-- Static Content -->
                                
                                <!-- Starts Footer Sec -->
                                <tr>
                                  <td bgcolor="#ffffff" style="text-align: center;"><a href="#" target="_blank">
                                      <img alt="Logo" src="${keys.BASE_URL}dist/img/template_logo_black.png" style="display: table;  max-width: 100%; height: auto, font-family: 'AvenirNextLTPro-Regular', sans-serif; color: #ffffff; font-size: 16px; filter: invert(1);margin: 0 auto;" border="0">
                                    </a>
                                  </td>
                                </tr>
                                <tr>
                                  <td  bgcolor="#ffffff" style="text-align: center;"> 
                                    <ul style="list-style-type: none;margin: 30px 0 30px 0; padding: 0;">
                                      <li style="display: inline-block;margin-right: 10px">
                                        <a href="https://www.facebook.com/coinjolt" style="text-decoration: none; display: block;">
                                            <img  src="${keys.BASE_URL}dist/img/fb-icon.png" alt="">
                                        </a>
                                      </li>
                                      <li style="display: inline-block;margin-right: 10px">
                                        <a href="https://www.linkedin.com/in/coinjolt/" style="text-decoration: none; display: block;">
                                            <img  src="${keys.BASE_URL}dist/img/li-icon.png" alt="">
                                        </a>
                                      </li>
                                    <li style="display: inline-block;margin-right: 10px">
                                     <a href="https://twitter.com/coinjolt" style="text-decoration: none; display: block;">
                                       <img  src="${keys.BASE_URL}dist/img/tw-icon.png" alt="">
                                      </a>
                                    </li>
                                     <li style="display: inline-block;">
                                       <a href="tel:1-888-998-9980" style="text-decoration: none; display: block;">
                                          <img  src="${keys.BASE_URL}dist/img/sk-icon.png" alt="">
                                        </a>
                                      </li>
                                    </ul>
                                  </td>
                                </tr>
                                <tr>
                                  <td bgcolor="#ffffff" style="text-align: center;">
                                    <p style="margin-bottom: 30px; font-size: 16px;">
                                                
                                    Copyright &copy; 2018   <strong style="font-size: 16px;">Coin Jolt</strong>. All Rights Reserved.
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td bgcolor="#ffffff" style="text-align: center;">
                                   <p style="font-size: 14px; ">
                                     <strong style="font-size: 16px; margin-bottom: 10px;display: block;">
                                       Our mailing address is:
                                     </strong>
                                      Ontario,Canada
                                   </p> 
                                  </td>
                                </tr>
                                
                                <tr>
                                  <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 30px 30px; border-radius: 0px 0px 4px 4px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 11px; font-weight: 400; line-height: 20px;" >
                                      <p style="font-size: 14px; ">
                                         These Website Terms and Conditions of Use (“Terms”) are effective as of July 11, 2018.
                                        <br>
                                        COINJOLT.COM (“Coin Jolt,” “we” or “us”) reserves the right to change, modify, add or remove portions of the Terms at any time for any reason and in our sole discretion. We suggest that you (“you,” “your” or “User”) periodically review the Terms for amendments.
                                      
                                    </p>
                                     
                                  </td>
                                </tr>
                                <tr>
                                 <td bgcolor="#ffffff" align="center" style="padding: 0px 30px 30px 30px; border-radius: 0px 0px 4px 4px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 11px; font-weight: 400; line-height: 20px;" >
                                    <a href="http://www.coinjolt.com/terms-of-service" style="color: #025fdf; font-size: 14px; margin-right: 10px;">Terms of Service</a>
                                       <a href="http://www.coinjolt.com/privacy-policy" style="color: #025fdf; font-size: 14px; margin-right: 10px;">Privacy Policy</a>
                                        <a href="http://www.coinjolt.com/risk-disclosures" style="color: #025fdf; font-size: 14px;">Risk Disclosure</a>
                                  </td>
                                </tr>
                                <!-- Ends Footer Sec -->
                                
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
                            res.json({status: 0, msg: "An email has been sent to your inbox with instructions on how to reset your password."});
                        });

                    });

            }
            else{
                res.json({status: 2, msg: "User not found, please try again."});
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

            if(req.user.two_factorAuth_status == 2){
              res.redirect('/account/dashboard');
            }
            if (req.user.two_factorAuth_status == 1) {
                res.redirect('/login/2FA-Verification');
            }
           
        }
    });

    app.get('/login/2FA-Verification', async (req,res) => {
      var user = await User.findById(req.user.id);
      console.log(JSON.stringify(user, undefined, 2));

      var secret = speakeasy.generateSecret({
          issuer: 'Coin Jolt',
          length: 30,
          name: 'Coin Jolt'
      });



      QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
        if(user.two_factorAuth_scan_verified == 1){
            console.log(user.two_factorAuth_scan_verified);
            //return false;

          res.render('two_factor_authentication', {
              user_details: user,
              two_factorAuth_status: user.two_factorAuth_status,
              two_factorAuth_scan_verified: user.two_factorAuth_scan_verified,
              title:"2FA Verification"
          });

        }else{
            console.log("ok");
            //return false;
          User.update({
              two_factorAuth_secret_key: secret.base32,
              two_factorAuth_qr_code_image: image_data
          },{
              where:{
                  id: req.user.id
              }
          }).then( result => {
              if(result) {
                  User.findById(req.user.id).then(user_update_result => {
                      var data = JSON.parse(JSON.stringify(user_update_result));
                      res.render('two_factor_authentication', {
                          user_details: data,
                          two_factorAuth_status: data.two_factorAuth_status,
                          title:"2FA Verification"
                      });
                  });
              }
          });
        }
          
      });
    });

    app.get('/scan/2FA-Verification', async (req,res) => {
      var secret = speakeasy.generateSecret({
          issuer: 'Coin Jolt',
          length: 30,
          name: 'Coin Jolt'
      });



      QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {

        User.update({
            two_factorAuth_secret_key: secret.base32,
            two_factorAuth_qr_code_image: image_data
        },{
            where:{
                id: req.user.id
            }
        }).then( result => {
            if(result) {
                User.findById(req.user.id).then(user_update_result => {
                    var data = JSON.parse(JSON.stringify(user_update_result));
                    res.render('two_factior_authentication_from_dashboard', {
                        // layout: 'dashboard',
                        user_details: data,
                        two_factorAuth_status: data.two_factorAuth_status,
                        title:"2FA Verification"
                    });
                });
            }
        });
        
      });
    });

    app.post('/two_factor_skip', async(req,res) => {
      var user = await User.findById(req.user.id);

      User.update({
          two_factorAuth_secret_key: '',
          two_factorAuth_qr_code_image: '',
          two_factorAuth_scan_verified: 0,
          two_factorAuth_verified : 'Inactive'
      },{
          where:{
              id: req.user.id
          }
      }).then(function (result) {
        res.json({
          status: true
        });
      });
    }); 


    app.post('/check_two_factor_authentication', async (req,res) => {
        var two_factor_auth_secret_key = req.body.two_factor_auth_secret_key;
        var userToken = req.body.user_secret_key;

        var verified = await speakeasy.totp.verify({
          secret: two_factor_auth_secret_key,
          encoding: 'base32',
          token: userToken
        });

        if(verified == true) {
            User.update({
                two_factorAuth_status: 1,
                two_factorAuth_scan_verified: 1
            },{
                where:{
                    id: req.user.id
                }
            });
        }

        res.json({
            status: verified
        });
    });

    app.post('/check_two_factor_authentication_from_accountSettings', async (req,res) => {
        var two_factor_auth_secret_key = req.body.two_factor_auth_secret_key;
        var userToken = req.body.user_secret_key;

        var verified = await speakeasy.totp.verify({
          secret: two_factor_auth_secret_key,
          encoding: 'base32',
          token: userToken
        });

        if(verified == true) {
            User.update({
                two_factorAuth_status: 1,
                two_factorAuth_scan_verified: 1
            },{
                where:{
                    id: req.user.id
                }
            });
        }

        res.json({
            status: verified
        });
    });

    app.post('/change_2faAuthVerified_status', async (req,res) => {
      var user = await User.findOne({id : req.user.id});
      if(user){
        // user.two_factorAuth_verified = req.body.status;
        // if(user.save()){
        //   res.json({
        //     status: true
        //   })
        // }
        User.update({
            two_factorAuth_verified : req.body.status
        }, {
            where: {
                id: req.user.id
            }
        }).then(result => {
            if(result){
                res.json({
                        status: true
                      })
            }
        });
      }
    });



    // app.post('/two_factor_auth_checking_for_login', (req,res) => {
    //     var userToken = req.body.user_token;

    //     var verified = speakeasy.totp.verify({
    //       secret: req.user.two_factorAuth_secret_key,
    //       encoding: 'base32',
    //       token: userToken,
    //       window: 6
    //     });
    //     res.json({
    //         status: verified
    //     });
    // });

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
                req.flash('loginActivationMessage', 'This account has already been activated. Please login to continue.');
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
                            /* bitgo.coin('btc').wallets()
                            .generateWallet({ label: user.email + "-btc", passphrase: 'COinjolt123!!' })
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
                            }); */
                        // });

                        req.flash('loginActivationMessage', 'Your account has been activated successfully. Please login to continue.');
                        res.redirect('/login');
                    })

                }).catch(function (err) {});
            }
        });
    });

    app.get('/resend_request/:resend_email', (req, res) =>{
        const resendEmail = req.params['resend_email'];
        var activation_key = encrypt(resendEmail);
       
        models.email_template.belongsTo(models.email_template_type, {foreignKey: 'template_type'});
                            models.email_template.findAll({
                                where: {
                                    template_type: 4 // for Account Activation template
                                },
                                include: [{
                                    model: models.email_template_type
                                }],
                                    order: [
                                    ['id', 'DESC']
                                ]
                            }).then(function(resp){
                                
                                
                                models.User.update({
                                    activation_key: activation_key
                                }, {
                                    where: {
                                        status: 0
                                    }
                                }).then(function (result) {
                                    
                                    
                                    var editor_content_body = resp[0].template_desc;
                                    var ses = new AWS.SES({apiVersion: '2010-12-01'});
                                    var user_email = resendEmail;
                                    var subject = 'Account Activation Notification. You are only a click away from activating your account.';
                                    
                                    var complete_mail_content = ''; 

                                    var activate_btn_content = '';

                                    var lower_static_content = '';

                                    var activation_key = encrypt(user_email);

                                    email_key = activation_key+"/";
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
                                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
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
                                        Copyright © CoinJolt.com | All rights reserved.
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
                                                        <img alt="Display images for support@coinjolt.com" src="${keys.BASE_URL}dist/img/template_logo.png" width="200" height="27" style="display: block; width: 200px; max-width: 200px; min-width: 200px; font-family: 'AvenirNextLTPro-Regular', sans-serif; color: #ffffff; font-size: 18px; filter: invert(1);" border="0">
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
                                                    <td align="center" style="border-radius: 3px;" bgcolor="#025fdf"><a href="${keys.BASE_URL}activated/${email_key}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #025fdf; display: inline-block;">Click Here To Activate Your Account</a></td>
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
                                        
                                        <p style="text-align: center;"> 
                                            <a href="${keys.BASE_URL}activated/${email_key}">
                                            Images not being displayed? Click this link to activate your account.
                                            </a>
                                        </p>
                                        <p style="text-align: center;">You can also copy and paste the following link onto your browser:
                                            </a>
                                        </p>
                                        <p style="text-align: center;"> 
                                            <a href="${keys.BASE_URL}activated/${email_key}">
                                            ${keys.BASE_URL}activated/${email_key}
                                            </a>
                                        </td>
                                    </tr> <!-- Static Content -->
                                    <tr>
                                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                                        <p style="margin: 0;">If you have any questions, just reply to this email —  there has never been a better time to invest in the future!</p>
                                        </td>
                                    </tr> <!-- Static Content -->
                                    
                                    <!-- Starts Footer Sec -->
                                    <tr>
                                    <td  bgcolor="#ffffff" style="text-align: center;"> 
                                        <ul style="list-style-type: none;margin: 30px 0 30px 0; padding: 0;">
                                        <li style="display: inline-block;margin-right: 10px">
                                            <a href="https://www.facebook.com/coinjolt" style="text-decoration: none; display: block;">
                                                <img  src="${keys.BASE_URL}dist/img/email/facebook.png" alt="">
                                            </a>
                                        </li>
                                        <li style="display: inline-block;margin-right: 10px">
                                            <a href="https://www.linkedin.com/in/coinjolt/" style="text-decoration: none; display: block;">
                                                <img  src="${keys.BASE_URL}dist/img/email/linkedin.png" alt="">
                                            </a>
                                        </li>
                                        <li style="display: inline-block;margin-right: 10px">
                                        <a href="https://twitter.com/coinjolt" style="text-decoration: none; display: block;">
                                        <img  src="${keys.BASE_URL}dist/img/email/twitter.png" alt="">
                                        </a>
                                        </li>
                                        <li style="display: inline-block;">
                                        <a href="https://www.youtube.com/channel/UCHLEeVwkxNNadZU9ESoCEdw" style="text-decoration: none; display: block;">
                                            <img  src="${keys.BASE_URL}dist/img/email/youtube.png" alt="">
                                            </a>
                                        </li>
                                        </ul>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td bgcolor="#ffffff" style="text-align: center;">
                                        <p style="margin-bottom: 30px; font-size: 14px;">Copyright &copy; CoinJolt.com. All rights reserved.</p>
                                    </td>
                                    </tr>
                                    <tr>
                                    <td bgcolor="#ffffff" align="center" style="padding: 0px 30px 30px 30px; border-radius: 0px 0px 4px 4px; color: #000000; font-family: 'AvenirNextLTPro-Regular', sans-serif; font-size: 11px; font-weight: 400; line-height: 20px;" >
                                        <a href="${keys.BASE_URL}/terms-of-service" style="color: #f5f5f5; font-size: 14px; margin-right: 10px;">Terms of Service</a>
                                        <a href="${keys.BASE_URL}/privacy-policy" style="color: #f5f5f5; font-size: 14px; margin-right: 10px;">Privacy Policy</a>
                                            <a href="${keys.BASE_URL}/risk-disclosures" style="color: #f5f5f5; font-size: 14px;">Risk Disclosure</a>
                                    </td>
                                    </tr>
                                    <!-- Ends Footer Sec -->
                        
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
                            
                            else{
                                req.flash('resendEmailSuccessMessage', 'An account activation email has been sent successfully. Please check your email and activate account.');
                                res.redirect('/login');
                            }
                        
                        });
                                   

                        });
                                
                    });
    });

    function encrypt(text) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    app.get('/about-us', auth, (req,res) => {

        Promise.all([
            models.company_setting.findAll({  

            }),
            models.cms_about_us.findAll({

            })
        ]).then(function (result) {
            res.render("cms/about_us", {layout: "cms/dashboard", companySettingsData:result[0],details:result[1]})
        });
    });

    app.get('/shareholders', auth, (req,res) => {
        Promise.all([
            models.company_setting.findAll({  

            }),
            models.cms_about_us.findAll({

            })
        ]).then(function (result) {
            res.render("cms/shareholders", {layout: "cms/dashboard", companySettingsData:result[0],details:result[1]})
        });
    });

    app.get('/whitepapers', auth, (req,res) => {
        Promise.all([
            models.company_setting.findAll({  

            }),
            models.cms_about_us.findAll({

            })
        ]).then(function (result) {
            res.render("cms/whitepapers", {layout: "cms/dashboard", companySettingsData:result[0],details:result[1]})
        });
    });
                            
     app.get('/:blogDetail', auth, async(req,res) =>{
        
        var blogPageSlug = req.params.blogDetail;

        models.blog_post.belongsTo(models.blog_category, {foreignKey: 'post_category_id'});
        models.blog_post.belongsTo(models.author, {foreignKey: 'author_id'});
        
        var blogPostDetails = await models.blog_post.findAndCountAll({
            where: {
                post_slug: blogPageSlug
            }
        });
        
        if(blogPostDetails.count == 0){
            res.render('error');
        }

        else{
            Promise.all([
                models.blog_post.findAndCountAll({
                    where: {
                        post_slug: blogPageSlug
                    }
                }),
    
                models.blog_post.findAll({  // featured 
                    where: {
                        post_category_id: 1,
                        createdAt: {
                            lte: new Date()
                        }
                    },
                    limit: 6,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }),
    
                models.blog_post.findAll({  // latest news
                    where: {
                        post_category_id: 3,
                        createdAt: {
                            lte: new Date()
                        }
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
                    include: [
                        {
                            model: models.blog_category
                        },
                        {
                            model: models.author
                        }
                    ],
                    order: [
                        ['id', 'DESC']
                    ]
            })
    
            ]).then(function (results) {
                //console.log(JSON.stringify(results[4], undefined, 2));
                res.render("cms/blog_content", {layout: "cms/dashboard", blogContent: results[0].rows,featured_posts: results[1], latest_news: results[2], companySettingsData: results[3], postTitle: results[4]});
            });
        }

    });
    

    function encrypt(text) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

};


