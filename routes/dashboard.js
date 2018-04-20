var bCrypt = require('bcrypt-nodejs');
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
module.exports = function (app, Country, User, Currency, Support, Deposit) {
    var multer = require('multer');
    var fileExt = '';
    var fileName = '';
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/id-proof');
        },

        filename: function (req, file, cb) {
            fileExt = file.mimetype.split('/')[1];
            if (fileExt == 'jpeg') fileExt = 'jpg';
            fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
            cb(null, fileName);
        }
    })

    var upload = multer({
        storage: storage,
        limits: {
            fileSize: 3000000
        }
    });

    var profile = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/profile');
        },

        filename: function (req, file, cb) {
            fileExt = file.mimetype.split('/')[1];
            if (fileExt == 'jpeg') fileExt = 'jpg';
            fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
            cb(null, fileName);
        }
    })

    var profile_upload = multer({
        storage: profile,
        limits: {
            fileSize: 3000000
        }
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
        res.render('profile-details', {
            layout: 'dashboard'
        });
    });

    app.get('/account-settings', function (req, res) {
        const msg = req.flash('profileMessage')[0];
        Country.findAll().then(function (country) {
            res.render('account-settings', {
                layout: 'dashboard',
                message: msg,
                countries: country

            });
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
        User.update({

            identity_proof: fileName
        }, {
            where: {
                id: req.user.id
            }
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

    app.post('/account-settings', profile_upload.single('async_upload'), function (req, res) {

        User.update({

            first_name: req.body.first_name,
            last_name: req.body.last_name,
            user_name: req.body.user_name,
            address: req.body.address,
            contact_no: req.body.contact_no,
            about_me: req.body.about_me,
            image: fileName,
            dob: req.body.dob,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
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
        })
        .then(function(result) {
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

    app.get('/invite-friends', function (req, res) {
        res.render('invite-friends', {
            layout: 'dashboard'
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
            req.flash('supportMessage', 'Request sent successfully');
            res.redirect('/submit-a-request');
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

    
    app.get('/buy-and-sell-coins', function(req, res){
        Currency.findAll({
			attributes: ['alt_name','currency_id']
		}).then(function(values){
            res.render('buy-and-sell-coins', {layout: 'dashboard', contents: values });
		});
    });

    app.post('/buy-coin', async (req, res) => {
		var amtVal = req.body.amtVal;
		var coinRate = req.body.coinRate;
		var currencyType = req.body.currencyBuyType;
		var curr_crypto_bal = 0;
		var curr_brought = 0;
        var curr_sold = 0;
        
        // calculating cryptocurrency wallet current balance
        curr_brought = await Deposit.findAll({
            where: {user_id: req.user.id, type: 1, currency_purchased: currencyType},
            attributes: [[ sequelize.fn('SUM', sequelize.col('converted_amount')), 'TOT_BUY_AMT']]
        });

        curr_sold = await Deposit.findAll({
            where: {user_id: req.user.id, type: 2, currency_purchased: currencyType},
            attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'TOT_SOLD_AMT']]
        });

        curr_crypto_bal = parseFloat(curr_brought[0].get('TOT_BUY_AMT') - curr_sold[0].get('TOT_SOLD_AMT'));
        curr_crypto_bal = parseFloat(Math.round(curr_crypto_bal * 100) / 100).toFixed(4);
        
        res.json({message: 'Success', status: true, crypto_balance: curr_crypto_bal});

    });

    app.post('/sell-coin', async (req, res) =>{
		var amtVal = req.body.amtVal;
		var coinRate = req.body.coinRate;
		var currencyType = req.body.currencySellType;
		var curr_crypto_bal = 0;
		var curr_brought = 0;
		var curr_sold = 0;

        // calculating cryptocurrency wallet current balance
        curr_brought = await Deposit.findAll({
            where: {user_id: req.user.id, type: 1, currency_purchased: currencyType},
            attributes: [[ sequelize.fn('SUM', sequelize.col('converted_amount')), 'TOT_BUY_AMT']]
        });

        curr_sold = await Deposit.findAll({
            where: {user_id: req.user.id, type: 2, currency_purchased: currencyType},
            attributes: [[ sequelize.fn('SUM', sequelize.col('amount')), 'TOT_SOLD_AMT']]
        });

        curr_crypto_bal = parseFloat(curr_brought[0].get('TOT_BUY_AMT') - curr_sold[0].get('TOT_SOLD_AMT'));
        curr_crypto_bal = parseFloat(Math.round(curr_crypto_bal * 100) / 100).toFixed(4);
        
        res.json({message: 'Success', status: true, crypto_balance: curr_crypto_bal});

	});

    app.post('/confirm_coin_buy', function(req, res){
		
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
           
        Deposit.create({
            user_id: req.user.id,
            transaction_id: randomNum,
            checkout_id: randomNum,
            amount: req.body.amtVal,
            currency_purchased: req.body.currency_purchased,
            current_rate: req.body.coinRate,
            converted_amount: req.body.actualAmtExpect,
            type: 1,            
            base_currency: 'USD'

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
        
        Deposit.create({
            user_id: req.user.id,
            transaction_id: randomNum,
            checkout_id: randomNum,
            amount: req.body.amtVal,
            current_rate: req.body.coinRate,
            type: 2,            
            base_currency: req.body.currencySellType

        }).then(function (result) {
            res.json({success: true});
        }).catch(function (err) {
            console.log(err);
        });
    });
    
    app.get('/transaction-history', async (req, res) =>{
        buy_history = await Deposit.findAll({
            where: {user_id: req.user.id, type: 1},
            limit: 1000,
            order: [
                ['id', 'DESC']
            ]
        });

        sell_history = await Deposit.findAll({
            where: {user_id: req.user.id, type: 2},
            limit: 1000,
            order: [
                ['id', 'DESC']
            ]
        });

        deposit_history = await Deposit.findAll({
            where: {user_id: req.user.id, type: 0},
            limit: 1000,
            order: [
                ['id', 'DESC']
            ]
        });
        res.render('transaction-history', {layout: 'dashboard', buy_history:buy_history,sell_history:sell_history,deposit_history:deposit_history });
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

        res.render('managed-cryptocurrency-portfolio', {layout: 'dashboard', amountInvested: investedamount, firstYearEarning: firstyear,interestEarned: interest_earned, message: msg });
    });

    
};