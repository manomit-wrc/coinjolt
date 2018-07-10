var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'test'
});
const keys = require('../config/key');
const Op = require('sequelize').Op;

module.exports = (app, models) => {
    app.get('/bitgo/login', (req, res) => {
        bitgo.authenticate({
            username: keys.BITGO_USERNAME,
            password: keys.BITGO_PASSWORD,
            otp: keys.BITGO_OTP
        }, function (err, result) {
            if (err) {
                return console.log(err);
            }
            res.send(result.access_token);
        });
    });

    app.get('/bitgo/logout', (req, res) => {
        bitgo.logout({}, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });

    app.get('/bitgo/profile', (req, res) => {
        bitgo.me({}, function callback(err, user) {
            if (err) {
                console.log(err);
            }
            console.log(user);
        });
    });

    app.get('/bitgo/create-wallet', (req, res) => {
        var data = {
            "passphrase": "Mmitra!@#4",
            "label": "My Second Wallet"
        }
        bitgo.wallets().createWalletWithKeychains(data, function (err, result) {
            if (err) {
                console.dir(err);
                throw new Error("Could not create wallet!");
            }
            console.log(result);
            //console.log("User keychain encrypted xPrv: " + result.userKeychain.encryptedXprv);
            //console.log("Backup keychain xPub: " + result.backupKeychain.xPub);
        });
    });

    app.get('/bitgo/list-wallet', (req, res) => {
        var wallets = bitgo.wallets();
        wallets.list({}, function callback(err, data) {
            console.log(data);
            for (var id in data.wallets) {
                var wallet = data.wallets[id].wallet;
                console.log(JSON.stringify(wallet, null, 4));
            }
        });
    });
 
    app.get('/bitgo/create-address', (req, res) => {
        var id = '2MziMaFRQTj5DfWD3f3pwhCihgah8Ed46se';
        bitgo.wallets().get({
            "id": id
        }, function callback(err, wallet) {
            if (err) {
                throw err;
            }
            wallet.createAddress({
                "chain": 0
            }, function callback(err, address) {
                console.log(address);
            });
        });
    });

    app.get('/bitgo/send-coins', (req, res) => {
        var destinationAddress = '2MwDGsK8XmELd41t8GVK7G39vemcEjEUvYU';
        var amountSatoshis = 0.1 * 1e8;
        var walletPassphrase = 'Mmitra!@#4';
        var walletId = '2MziMaFRQTj5DfWD3f3pwhCihgah8Ed46se';

        bitgo.wallets().get({
            id: walletId
        }, function (err, wallet) {
            if (err) {
                console.log("Error getting wallet!");
                console.dir(err);
                return process.exit(-1);
            }
            console.log("Balance is: " + (wallet.balance() / 1e8).toFixed(4));

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
            });
        });
    });

    app.get('/bitgo/get-balance', (req, res) => {
        var walletId = '2MwDGsK8XmELd41t8GVK7G39vemcEjEUvYU';

        bitgo.wallets().get({
            id: walletId
        }, function (err, wallet) {
            if (err) {
                console.log("Error getting wallet!");
                console.dir(err);
                return process.exit(-1);
            }
            console.log("Balance is: " + (wallet.balance() / 1e8).toFixed(4));
        });
    });

    app.get('/wallets', async (req, res) => {
        // var walletId = '2MwDGsK8XmELd41t8GVK7G39vemcEjEUvYU';
        var btcBalance = 0;
        var ethBalance = 0;
        var ltcBalance = 0;
        var bchBalance = 0;
        var rmgBalance = 0;
        var xrpBalance = 0;
        //var accessToken;

        // await bitgo.authenticate({
        //     username: keys.BITGO_USERNAME,
        //     password: keys.BITGO_PASSWORD,
        //     otp: keys.BITGO_OTP
        // }, function (err, result) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     accessToken = result.access_token;
        //     console.log("accessToken");
        // });
        // console.log(accessToken);
        console.log(req.cookies.BITGO_ACCESS_TOKEN);
        var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
        console.log("accessToken verified");
        
        // var bigtoSession = await bitgo.session();
        // console.log(bigtoSession);

        let walletDetails = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id
            }
        });
        var count = walletDetails.count;
        if (count > 0) {
            var walletId = walletDetails.rows[0].bitgo_wallet_id;

            var typeBtc = "bitcoin";
            let btcWallet = await bitgoVerify.wallets().get({
                id: walletId,
                type: typeBtc,
            }, function (err, walletBtc) {
                if (err) {
                    console.log("Error getting wallet!");
                    console.dir(err);
                    return process.exit(-1);
                }
                btcBalance = (walletBtc.balance() / 1e8).toFixed(2);
            });

            var typeEth = "ethereum";
            let ethWallet = await bitgoVerify.wallets().get({
                id: walletId,
                type: typeEth,
            }, function (err, walletEth) {
                if (err) {
                    console.log("Error getting wallet!");
                    console.dir(err);
                    return process.exit(-1);
                }
                ethBalance = (walletEth.balance() / 1e8).toFixed(2);
            });

            var typeLtc = "litecoin";
            let ltcWallet = await bitgoVerify.wallets().get({
                id: walletId,
                type: typeLtc,
            }, function (err, walletLtc) {
                if (err) {
                    console.log("Error getting wallet!");
                    console.dir(err);
                    return process.exit(-1);
                }
                ltcBalance = (walletLtc.balance() / 1e8).toFixed(2);
            });


        }
        //bitcoin
        let btcAddressDetails = await models.wallet_address.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '1'
            }
        });
        //ethereum
        let ethAddressDetails = await models.wallet_address.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '2'
            }
        });
        // console.log(JSON.stringify(ethAddressDetails));
        //litecoin
        let ltccAddressDetails = await models.wallet_address.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '3'
            }
        });
        //bitcoin cash
        let bchAddressDetails = await models.wallet_address.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '5'
            }
        });
        //royal mint gold
        let rmgAddressDetails = await models.wallet_address.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '46'
            }
        });
        //ripple
        let xrpAddressDetails = await models.wallet_address.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '4'
            }
        });

        models.wallet_transaction.belongsTo(models.User, {foreignKey: 'receiver_id'});    
        let walletTransaction = await models.wallet_transaction.findAll({
            where: {
                sender_id: req.user.id
            },
        	include: [{
		    	model: models.User
	  		}]
        });
        
        res.render('wallets', {
            layout: 'dashboard',
            count: count,
            btcBalance : btcBalance,
            ethBalance : ethBalance,
            ltcBalance: ltcBalance,
            btcAddressDetails: btcAddressDetails,
            ethAddressDetails: ethAddressDetails,
            ltccAddressDetails: ltccAddressDetails,
            bchAddressDetails: bchAddressDetails,
            rmgAddressDetails: rmgAddressDetails,
            xrpAddressDetails: xrpAddressDetails,
            title: 'Wallets'
        });

    });

    app.post('/wallet-create', function (req,res) {
        var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
        var user_id = req.user.id;
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
            }).then(function (result) {
                res.json({
                    success: true
                });
            });
        });
    });
    

    app.post('/generate-address', async (req,res) => {
        var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
        var user_id = req.user.id;
        var currency_id = req.body.currency_id;
        console.log('generate-address');
        console.log(user_id);
        console.log(currency_id);
        let walletDetails = await models.wallet.findAll({
            where: {
                user_id: req.user.id
            }
        });
        var walletId = walletDetails[0].id;
        var bitgoWalletId = walletDetails[0].bitgo_wallet_id;

        await bitgoVerify.wallets().get({
            "id": bitgoWalletId
        }, function callback(err, wallet) {
            if (err) {
                throw err;
            }
            wallet.createAddress({
                "chain": 0
            }, function callback(err, address) {
                console.log(address);
                var walletAddress = address.address;
                models.wallet_address.create({
                    user_id: user_id,
                    wallet_id: walletId,
                    address: walletAddress,
                    currency_id: currency_id

                });
                res.json({
                    success: true
                });
            });
        });
    });
    
    app.post('/send-currency', function(req, res){
        var destinationAddress = req.body.coin_address;
        var coin_amount = req.body.coin_amount;
        var amountSatoshis = coin_amount * 1e8;
        var walletPassphrase = keys.BITGO_PASSWORD;
        var userid = req.user.id;
        var currency_id = "1";
        var walletDbId;
        var walletId;
        var destinationAddressId;
        var receiver_id;
        var walletBalance;
        var type = "1";

        models.wallet.findAndCountAll({
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
                models.wallet_address.findAndCountAll({
                    where: {
                        address: destinationAddress, 
                        currency_id: currency_id,
                        user_id: {
                            [Op.ne]: req.user.id
                        }
                    }
                }).then(addressResults => {
                    var destinationAddressCount = addressResults.count;
                    if(destinationAddressCount > 0){
                        console.log("address found");
                        destinationAddressId = addressResults.rows[0].id;
                        receiver_id = addressResults.rows[0].user_id;
                        console.log("destinationAddressId");
                        console.log(destinationAddressId);
                        console.log("walletId2");
                        console.log(walletDbId);
                        console.log(walletId);
                        console.log("sender_id");
                        console.log(userid);
                        console.log("receiver_id");
                        console.log(receiver_id);
                        var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
                        bitgoVerify.wallets().get({
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
                                res.json({success: "3", message: "You have not enough wallet balance to send coin."});
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
                                    models.wallet_transaction.create({
                                        sender_id: userid,
                                        receiver_id: receiver_id,
                                        currency_id: currency_id,
                                        wallet_id: walletDbId,
                                        address_id: destinationAddressId,
                                        amount: amountSatoshis,
                                        type: type
                                    }).then(function (result) {
                                        res.json({success: "1", message: "You have sent coin successfully."});
                                    });
                                });
                            }
                        });
                    } else {
                        res.json({success: "2", message: "Wallet address not found."});
                    }
                });
            }
            else{
                res.json({success: "0", message: "Wallet not found. Please create wallet."});
            }
        });
    });
};