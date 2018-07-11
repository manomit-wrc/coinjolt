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
                        return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));

                    }

                    if (!isValidPassword(user.password, password)) {
                        return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));

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
    <span class="preheader">Registration Successful, Please Activate your account.</span>
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
                                                        <a href="${keys.BASE_URL}activated/${email_key}" class="button button--green" target="_blank">Activate Account</a>
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
                                    <a href="${keys.BASE_URL}activated/${email_key}">${keys.BASE_URL}activated/${email_key}</a></p>
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
    <span class="preheader">Registration Successful, Please Activate your account.</span>
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
                                                        <a href="${keys.BASE_URL}activated/${email_key}" class="button button--green" target="_blank">Activate Account</a>
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
                                    <a href="${keys.BASE_URL}activated/${email_key}">${keys.BASE_URL}activated/${email_key}</a></p>
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