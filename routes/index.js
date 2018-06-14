var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'test'
});
const keys = require('../config/key');

module.exports = function (app, passport, models) {
    
    app.get('/', function(req, res) {

        models.company_setting.findAll({

        }).then(function(companySettingsData){  
            res.render('cms_body', {layout: 'cms/dashboard', companySettingsData: companySettingsData});
        });
    });

    app.get('/terms-of-service', function(req, res) {

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

    app.get('/privacy-policy', function(req, res) {


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

    app.get('/risk-disclosures', function(req, res){

        Promise.all([
            models.company_setting.findAll({

            }),
            
            models.cms_risk_disclosures.findAll({
                
            })
        ]).then(function (result) {
            var result = JSON.parse(JSON.stringify(result, undefined, 2));
	        res.render('cms_risk_disclosures',{layout: 'cms/dashboard',companySettingsData:result[0],riskDisclosuresData:result[1]});
        });

    });

    app.get('/login', function (req, res) {

        var msg = req.flash('loginMessage')[0];

        res.render('login', {
            message: msg
        });
    });

    app.get('/forgot-password', (req, res) =>{
        
        //var msg = req.flash('loginMessage')[0];

        res.render('forgot_password');
    });

    app.post('/login', passport.authenticate('local-login', {
            //successRedirect : '/dashboard',
            failureRedirect: '/',
            failureFlash: true
        }),
        function (req, res) {
            
            if (req.user.type === '1') {
                res.redirect('/admin/dashboard');
            } else {
                bitgo.authenticate({ username: keys.BITGO_USERNAME, password: keys.BITGO_PASSWORD, otp: keys.BITGO_OTP })
                .then(function(response) {
                    console.log(response.access_token);
                    res.cookie('BITGO_ACCESS_TOKEN',response.access_token);
                    res.redirect('/dashboard');
                }).catch(function (err) {
                    res.redirect('/dashboard');
                });
            }
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
                res.redirect('/');
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
                        res.redirect('/');
                    })

                }).catch(function (err) {});
            }
        });
    });

    app.get('/about-us', (req,res) => {
        models.cms_about_us.findAll().then(function(result) {
            var data = JSON.parse(JSON.stringify(result));
            res.render("cms/about_us", {layout: "cms/dashboard", details:data})
        });
    });

};
