var bCrypt = require('bcrypt-nodejs');
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
const lodash = require('lodash');
const keys = require('../config/key');
var multer = require('multer');
var multerS3 = require('multer-s3');
module.exports = function (app, Country, User, Currency, Support, Deposit, Referral_data, withdraw, Question, Option, Answer, AWS, Kyc_details, portfolio_composition) {

    var s3 = new AWS.S3({ accessKeyId: keys.accessKeyId, secretAccessKey: keys.secretAccessKey });
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

    app.get('/dashboard', function (req, res) {
        res.render('dashboard', {
            layout: 'dashboard'
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile-details', function (req, res) {

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
                    answer_data: answer_data
                });
            });
            
		});
       
    });

    app.get('/account-settings', async function (req, res) {
        var kyc_details = await Kyc_details.findAll({
            where: {
                user_id: req.user.id
            },
            limit: 1,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        const msg = req.flash('profileMessage')[0];
        var country = await Country.findAll();
        res.render('account-settings', {
            layout: 'dashboard',
            message: msg,
            countries: country,
            kyc_details: kyc_details
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
                    message: 'Password updated successfully'
                });
            }).catch(function (err) {

                console.log(err);
            });
        } else {
            res.json({
                success: false,
                message: 'Old password doesn\'t matched'
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
                message: 'ID Proof uploaded successfully',
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
                message: 'profile pic uploaded successfully',
                file_name: fileName
            });
        }).catch(function(err) {
            console.log(err);
        });
    });

    app.post('/account-settings', function (req, res) {
        var countryId = req.body.country;
        if (countryId === "226") {
            state = req.body.usa_states;
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
        }).then(function (result) {
            if (result > 0) {
                req.flash('profileMessage', 'Profile updated successfully');
                res.redirect('/account-settings');
            } else {
                req.flash('profileMessage', 'Already up to date');
                res.redirect('/account-settings');
            }
        }).catch(function (err) {
            console.log(err);
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
                    message: 'User already exists, please enter another username'
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

    app.get('/invite-friends', function (req,res) {
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
			res.render('invite-friends',{layout: 'dashboard', invitefrnds: invitefrnds});
		});
	});

    app.get('/submit-a-request', function (req, res) {
        const msg = req.flash('supportMessage')[0];
        res.render('submit-a-request', {
            layout: 'dashboard',
            message: msg
        });
    });

    app.post('/submit-a-request', function (req, res) {
        Support.create({
            user_id: req.user.id,
            title: req.body.subject.trim(),
            enquiry: req.body.description.trim()
        }).then(function (result) {
            // req.flash('supportMessage', 'Request sent successfully');
            // res.redirect('/submit-a-request');
            var pushNotifications = require("push-notifications");
            var io = require('socket.io')(8088);
            io.on('connection', function(socket){
                socket.on('pushNotification', function(msg){
                    io.emit('pushNotification', msg);
                });

                pushNotifications.push(io, {title: req.body.subject.trim(), body : req.body.description.trim()});  
            });
            
            res.json({
                success: true
            });
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/requests-support', function (req, res) {
        Support.findAll({
            where: {
                user_id: req.user.id
            }
        }).then(function (supports) {
            res.render('requests-support', {
				layout: 'dashboard',
				supports: supports
			});
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/buy-and-sell-coins', async (req, res) => {
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
            attributes: ['alt_name','currency_id']
        });
        res.render('buy-and-sell-coins', {layout: 'dashboard',contents: values,currencyCodes: currencyCodes });
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
        console.log("buy");
        console.log(curr_id);

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
            currency_id: req.body.currency_id
        }).then(function (result) {
            res.json({success: true});
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
            currency_id: req.body.currency_id
        }).then(function (result) {
            res.json({success: true});
        }).catch(function (err) {
            console.log(err);
        });
    });
    
    app.get('/transaction-history', async (req, res) =>{

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
        res.render('transaction-history', {layout: 'dashboard', buy_history:buy_history,sell_history:sell_history,deposit_history:deposit_history,withdrawal_history:withdrawal_history });
    });

    app.get('/managed-cryptocurrency-portfolio', async(req, res) => {
        var investedamount = 0;
		var firstyear = 0;
		var secondyear = 0;
		var thirdyear = 0;
		var accumulatedInterest = 0;
		var interest_earned = 0;
        const msg = req.flash('investStatusMessage')[0];
        investedamount = await Deposit.findAll({
            where: {user_id: req.user.id, type: 4},
            attributes: [[ sequelize.fn('SUM', sequelize.col('converted_amount')), 'TOT_INVESTED_AMT']]
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

            accumulatedInterest =  parseFloat(0.005) * parseFloat(investedamount);
            accumulatedInterest = parseFloat(Math.round(accumulatedInterest * 100) / 100).toFixed(2);
            
            interest_earned = accumulatedInterest;
        } else {
            investedamount = 0;
        }

        // get all institutional data
       /*  portfolio_composition.findOne({
            where: {
                user_id: req.user.id,
                investor_type: 1
            }
        }).then(function (result) {
            req.flash('investStatusMessage', 'Your investment was made successfully!');
            res.redirect('/managed-cryptocurrency-portfolio');
        }); */
        // end

        res.render('managed-cryptocurrency-portfolio', {layout: 'dashboard', amountInvested: investedamount, firstYearEarning: firstyear,interestEarned: interest_earned, message: msg });
    });

    app.post('/save-invest', function(req, res){
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
			type: type
        }).then(function (result) {
            req.flash('investStatusMessage', 'Your investment was made successfully!');
            res.redirect('/managed-cryptocurrency-portfolio');
        }).catch(function (err) {
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
            req.flash('investStatusMessage', 'Your withdraw request received successfully!');
            res.redirect('/managed-cryptocurrency-portfolio');
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
            res.redirect('/profile-details');
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/get-donut-chart', (req, res)=> {
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
                    res.json({success: 1, msg: 'Questionaire saved successfully'});
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
                        settlement_currency: settlementCurrency

                    });
                }
                res.json({ msg: 'Saved' });
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
                        settlement_currency: individualSettlementCurrency


                    });
                }
                res.json({ msg: 'Saved' });
            });
        }

    });
};