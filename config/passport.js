const bCrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
const keys = require('./key');

module.exports = (passport, User, Deposit, Currency, models, AWS) => {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function (id, done) {

        User.findById(id).then(function (user) {
            if (user) {

                
                async function calUsdBalance(id) {
                    try {         
                      var sold_amount = 0;
                      var withdraw_amount = 0;
                      var transaction_amount = 0;
                      var deposit_amount = 0;
                      var curr_brought = 0;
                      var curr_sold = 0;
                      var mcp_invest = 0;
                      var mcp_withdraw = 0;
                      var accessToken;
                  
                      sold_amount = await Deposit.findAll({   
                          where: {user_id: id, type: 2},
                      attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'SELL_TOTAL_AMT']]
                      });
                    

                      withdraw_amount = await Deposit.findAll({
                      where: {user_id: id, type: 3},
                      attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'TOT_USD_AMT']]
                      });
                  
                      transaction_amount = await Deposit.findAll({
                      where: {user_id: id, type: 1},
                          attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'TOT_AMT']]
                     });
                  
                      deposit_amount = await Deposit.findAll({
                      where: {user_id: id, type: 0},
                          attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'TOT_DEP_AMT']]
                      });
                  
                       var cal_currusd = sold_amount[0].get('SELL_TOTAL_AMT') - withdraw_amount[0].get('TOT_USD_AMT');
                       var new_currusd = cal_currusd - transaction_amount[0].get('TOT_AMT');
                       var curr_usd = new_currusd + deposit_amount[0].get('TOT_DEP_AMT');
                       var final = parseFloat(Math.round(curr_usd * 100) / 100).toFixed(4);
                        
                        function notOnlyALogger(msg){
                            console.log('****log****');
                            console.log(msg);
                        }

                        const tempSQL = models.sequelize.dialect.QueryGenerator.selectQuery('Deposits',
                            { 
                            attributes: [ [sequelize.fn('MAX',sequelize.col('id')),'deposit_id'] ], 
                            group: ['currency_id'] 
                            })
                            .slice(0,-1); 
                        Deposit.belongsTo(Currency,{foreignKey: 'currency_id'}); 
                        let currencyBalance = await Deposit.findAll(
                            { 
                                attributes: ['id','balance'], 
                                //logging: notOnlyALogger,
                                order: [ ['id', 'DESC'], ], 
                                where: { user_id: id, 
                                    id: { $in: sequelize.literal('(' + tempSQL + ')') } 
                                }, 
                                include: [ { model: Currency, required: true, attributes: ['alt_name','currency_id','display_name'] } 
                                ] 
                            });                 
                       var currency_list = await Currency.findAll();

                       mcp_invest = await Deposit.findAll({   
                            where: {user_id: id, type: 4},
                            attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'MCP_INVEST_AMT']]
                        });
                  

                        mcp_withdraw = await Deposit.findAll({
                            where: {user_id: id, type: 5},
                            attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'MCP_WITHDRAW_AMT']]
                        });

                        var mcp_final = mcp_invest[0].get('MCP_INVEST_AMT') - mcp_withdraw[0].get('MCP_WITHDRAW_AMT');
                        var mcp_final_blnc = parseFloat(Math.round(mcp_final * 100) / 100).toFixed(4);

                        var bank_details = await models.bank_details.findAll({
                            where: {user_id: id}
                        });

                        var kyc_count = await models.Kyc_details.count({
                            where: {
                                user_id: id
                            }
                        });
                        if(kyc_count > 0) {
                            var kyc = await models.Kyc_details.findAll({ 
                                attributes: ['status'],
                                where: {
                                    user_id: id
                                },
                                limit: 1
                            });
                            kyc_status = kyc[0].get('status');
                        } else {
                            kyc_status = 0;
                        }
                        

                       user = user.toJSON();
                       user.currentUsdBalance = final;
                       user.currency = currency_list;
                       user.currencyBalance = currencyBalance;
                       user.mcpTotalBalance = mcp_final_blnc;
                       user.bankInfo = bank_details[0];
                       user.kycApproved = kyc_status;

                       done(null, user);

                    } catch (err) {
                      console.log('Opps, an error occurred', err);
                    }
                    
                  }
                  calUsdBalance(id);
                  
            } else {

                done(user.errors, null);
            }

        }).then(function (bitgoLogin) {
        });  
         
    });

    passport.use(
        'local-login',
        new LocalStrategy({

            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, email, password, done) {
                if (req.body.remember_me) {
                    req.session.cookie.maxAge = 1000 * 60 * 3;
                } else {
                    req.session.cookie.expires = false;
                }

                var isValidPassword = function (userpass, password) {
                    return bCrypt.compareSync(password, userpass);

                }

                if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
                    return done(null, false, req.flash('loginMessage', 'Please select captcha'));
                }

                User.findOne({
                    where: {
                        email: email
                    }
                }).then(function (user) {
                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'Wrong username or password'));

                    }

                    if (!isValidPassword(user.password, password)) {
                        return done(null, false, req.flash('loginMessage', 'Wrong username or password'));

                    }

                    if(user.status != "1") {
                        return done(null, false, req.flash('loginMessage', 'Account not activated. Please contact administrator')); 
                    }

                    var userinfo = user.get();
                    return done(null, userinfo);


                }).catch(function (err) {

                    console.log("Error:", err);

                    return done(null, false, req.flash('loginMessage', 'Something wrong.Please try again.'));

                });
            }

    ));

    passport.use('local-signup', new LocalStrategy({

        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {

                User.count({ where: {email: email} }).then(function(count){
                    if (count > 0) {
                      return done(null, false, req.flash('signupErrorMessage', 'That email is already taken.'));
                    } else {
                        var countryId = req.body.country;
                        if(countryId === "226"){
                            state = req.body.usa_states;
                        } else if(countryId === "240") {
                            state = req.body.canada_states;
                        }else {
                            state = req.body.state;
                        }
                      if (req.cookies.referral_id === undefined) {
                        const activation_key = encrypt(email);
                        var email_key = '';
                        User.create({
                            email: req.body.email,
                            password: bCrypt.hashSync(req.body.password),
                            activation_key: activation_key,
                            image: keys.S3_URL + 'profile/nobody.jpg',
                            identity_proof: 'javascript:void(0)',
                            referral_id: 0,
                            type: 2,
                            contact_no: req.body.phone,
                            address: req.body.address,
                            city: req.body.city,
                            state: state,
                            country_id: countryId,
                            postal_code: req.body.zip,
                            two_factorAuth_secret_key: '',
                            two_factorAuth_qr_code_image: '',
                            two_factorAuth_status: 2
                            // investor_type: req.body.investor_type
    
                        }).then(function(result){

                            models.email_template.belongsTo(models.email_template_type, {foreignKey: 'template_type'});
                            models.email_template.findAll({
                                where: {
                                    template_type: 1 // for registration template
                                },
                                include: [{
                                    model: models.email_template_type
                                }],
                                    order: [
                                    ['id', 'DESC']
                                ]
                            }).then(function(resp){
                                
                                var editor_content_body = resp[0].template_desc;
                                var ses = new AWS.SES({apiVersion: '2010-12-01'});
                                var user_email = req.body.email;
                                var subject = 'Registration Complete';

                                email_key = activation_key+"/";
                                
                                var complete_mail_content = ''; 

                                var activate_btn_content = '';

                                var lower_static_content = '';

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
                                    Registration completed successfully, please activate your account.
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
                                                <td align="center" style="border-radius: 3px;" bgcolor="#025fdf"><a href="${keys.BASE_URL}activated/${email_key}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #025fdf; display: inline-block;">Activate Account</a></td>
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
                                        <a href="${keys.BASE_URL}activated/${email_key}">
                                    ${keys.BASE_URL}activated/${email_key}
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
    
                            return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));

                        }).catch(function(err){
                            console.log(err);
                        });
    
                    }
                      else {
                        var activation_key = encrypt(email);
                        var email_key = '';
                        let condition = {};
                        if(isNaN(parseInt(req.cookies.referral_id))) {
                            condition.user_name = req.cookies.referral_id;
                        }
                        else {
                            condition.id = req.cookies.referral_id;
                        }
                      
                        User.findOne({
                            where: condition,
                            attributes: ['id']
                        }).then(function (user) {
                            
                            User.create({
                                email: req.body.email,
                                password: bCrypt.hashSync(req.body.password),
                                activation_key: activation_key,
                                referral_id: user.id,
                                image: keys.S3_URL + 'profile/nobody.jpg',
                                identity_proof: 'javascript:void(0)',
                                type: 2,
                                contact_no: req.body.phone,
                                address: req.body.address,
                                city: req.body.city,
                                state: state,
                                country_id: countryId,
                                postal_code: req.body.zip,
                                two_factorAuth_secret_key: '',
                                two_factorAuth_qr_code_image: '',
                                two_factorAuth_status: 2
                                // investor_type: req.body.investor_type
        
                            }).then(function(result){
                            

                           models.email_template.belongsTo(models.email_template_type, {foreignKey: 'template_type'});
                            models.email_template.findAll({
                                where: {
                                    template_type: 1 // for registration template
                                },
                                include: [{
                                    model: models.email_template_type
                                }],
                                    order: [
                                    ['id', 'DESC']
                                ]
                            }).then(function(resp){
                               
                                var editor_content_body = resp[0].template_desc;
                                var ses = new AWS.SES({apiVersion: '2010-12-01'});
                                var user_email = req.body.email;
                                var subject = 'Registration Complete';

                                

                                email_key = activation_key+"/";
                                
                                var complete_mail_content = ''; 

                                var activate_btn_content = '';

                                var lower_static_content = '';

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
                                    Registration completed successfully, please activate your account.
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
                                                <td align="center" style="border-radius: 3px;" bgcolor="#025fdf"><a href="${keys.BASE_URL}activated/${email_key}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #025fdf; display: inline-block;">Activate Account</a></td>
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
                                        <a href="${keys.BASE_URL}activated/${email_key}">
                                    ${keys.BASE_URL}activated/${email_key}
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

                                return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));

                            }).catch(function(err){
                                console.log('error');
                            });
                            // end

                        }).catch(function (err) {
        
                            console.log("Error:", err);
        
                            return done(null, false, req.flash('loginMessage', 'Something wrong. Please try again.'));
        
                        });
                        // end find
                        }
                    }
                  })
                // end check
        }
    ));
   
    function encrypt(text) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

       

};