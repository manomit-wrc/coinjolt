const bCrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
module.exports = (passport, User, Deposit, Currency, models) => {
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
                       //console.log(currency_list);

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

                        var bank_details = await models.Bank_Details.findAll({
                            where: {user_id: id}
                        });
                        var mcp_final = mcp_invest[0].get('MCP_INVEST_AMT') - mcp_withdraw[0].get('MCP_WITHDRAW_AMT');

                       user = user.toJSON();
                       user.currentUsdBalance = final;
                       user.currency = currency_list;
                       user.currencyBalance = currencyBalance;
                       //console.log(user.currencyBalance.length);
                       user.mcpTotalBalance = mcp_final_blnc;
                       user.bankInfo = bank_details[0];

                       done(null, user);

                    } catch (err) {
                      console.log('Opps, an error occurred', err);
                    }
                    
                  }
                  calUsdBalance(id);
                  
            } else {

                done(user.errors, null);
            }

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
                      if (req.cookies.referral_id === undefined) {
                        const activation_key = encrypt(email);
    
                        User.create({
                            email: req.body.email,
                            password: bCrypt.hashSync(req.body.password),
                            activation_key: activation_key,
                            referral_id: 0
    
                        }).then(function(result){
                            /* sendgrid mail sending code for activation link */
    
                            return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));
                        }).catch(function(err){
                            console.log('error');
                        });
    
                    }
                      else {
                        const activation_key = encrypt(email);
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
                                referral_id: user.id
        
                            }).then(function(result){
                                /* sendgrid mail sending code for activation link */
        
                                return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));

                            }).catch(function(err){
                                console.log('error');
                            });
                            // end

                        }).catch(function (err) {
        
                            console.log("Error:", err);
        
                            return done(null, false, req.flash('loginMessage', 'Something wrong.Please try again.'));
        
                        });
                        // end find

                        //const getuserData = 'SELECT id FROM users WHERE '+condition;
                        /* connection.query(getuserData, function(err, rows, fields) {
                            const activation_key = encrypt(email);
                            var today = new Date();
                            var users = {
                                "email": email,
                                "password": bCrypt.hashSync(password),
                                "status": 1,
                                "created_at": today,
                                "updated_at": today,
                                "activation_key": activation_key,
                                "referral_id": rows[0].id
                            }
                            var newUserMysql = new Object();
                            newUserMysql.email = email;
                            newUserMysql.password = password;
                            connection.query('INSERT INTO users SET ?', users, function (error, rows, fields) {
                                var fromEmail = new helper.Email('nilesh@wrctpl.com');
                                var toEmail = new helper.Email(email);
                                var subject = 'Registration Complete';
                                const emailUrl = `
                                                <html>
                                                <body>
                                                <div style="text-align: center;">
                                                Thank you for registered with us. Please copy the below link and paste into your browser
                                                <br />
                                                <a href="http://localhost:8080/activated/"${activation_key}>
                                                http://localhost:8080/activated/${activation_key}
                                                </a>
                                                </div>
                                                </body>
                                                </html>
                                            `;
                                var content = new helper.Content('text/html', emailUrl);
                                var mail = new helper.Mail(fromEmail, subject, toEmail, content);
                                var request = sg.emptyRequest({
                                    method: 'POST',
                                    path: '/v3/mail/send',
                                    body: mail.toJSON()
                                });
                                sg.API(request, function (error, response) {
                                    if (error) {
                                        console.log("In Error");
                                        return done(null, false, req.flash('signupErrorMessage', 'Something not right. Please try again'));
                                    }
                                    return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));
                                });
                            });  
                            
                        }); */
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