// var BitGo = require('bitgo');
// var bitgo = new BitGo.BitGo({
//     env: 'test'
// });
var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'prod',
    accessToken: process.env.ACCESS_TOKEN
});
const user_acl = require('../middlewares/user_acl');
const keys = require('../config/key');
const Op = require('sequelize').Op;

const two_factor_checking = require('../middlewares/two_factor_checking');

var request = require('sync-request');

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


    app.get('/account/wallets', two_factor_checking, user_acl, async (req, res) => {
        // var walletId = '2MwDGsK8XmELd41t8GVK7G39vemcEjEUvYU';
        var btcBalance = 0;
        var ethBalance = 0;
        var ltcBalance = 0;
        var bchBalance = 0;
        var rmgBalance = 0;
        var xrpBalance = 0;
        var btcBlncNew = 0;
        var ethBlncNew = 0;
        var ltcBlncNew = 0;
        var bchBlncNew = 0;
        var rmgBlncNew = 0;
        var xrpBlncNew = 0;
        var btcBlncCold = 0;
        var ethBlncCold = 0;
        var ltcBlncCold = 0;
        var bchBlncCold = 0;
        var rmgBlncCold = 0;
        var xrpBlncCold = 0;
        var totalBtcUsd;
        var totalEthUsd;
        var totalLtcUsd;
        var totalBchUsd;
        var totalRmgUsd;
        var totalXrpUsd;        
        var totalUsdBlnc;
        console.log("accessToken verified");

        // get btc wallet------------------------------
        let btcWallet = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '1'
            }
        });
        if(btcWallet.count > 0){
            let btcCoin = await bitgo.coin('btc').wallets().get({ id: btcWallet.rows[0].bitgo_wallet_id });
            btcBalance = btcCoin._wallet.balance;
        }

        let btcBlncDb = await models.currency_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '1'
            }
        });
        if(btcBlncDb.count > 0){
            btcBlncNew = btcBlncDb.rows[0].balance;
        }
        let btcBlncFinal = btcBalance + btcBlncNew;
        btcBlncFinal = parseFloat(Math.round(btcBlncFinal * 100) / 100).toFixed(4);

        let btcCold = await models.cold_wallet_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '1'
            }
        });
        if (btcCold.count > 0) {
            btcBlncCold = btcCold.rows[0].balance;
        }
        btcBlncFinal = btcBlncFinal + btcBlncCold;
        btcBlncFinal = parseFloat(Math.round(btcBlncFinal * 100) / 100).toFixed(4);

        var responseBtc = request(
            'GET',
            'https://coincap.io/page/BTC'
        );
        let coin_rate_btc = JSON.parse(responseBtc.body);
        coinRateBtc = coin_rate_btc.price_usd;
        totalBtcUsd = parseFloat(coinRateBtc) * parseFloat(btcBlncFinal);
        // btc ends----------------------------------------------------------------


        // get eth wallet------------------------------
        let ethWallet = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '2'
            }
        });
        if(ethWallet.count > 0){
            let ethCoin = await bitgo.coin('eth').wallets().get({ id: ethWallet.rows[0].bitgo_wallet_id });
            ethBalance = ethCoin._wallet.balance;
        }

        let ethBlncDb = await models.currency_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '2'
            }
        });
        if(ethBlncDb.count > 0){
            ethBlncNew = ethBlncDb.rows[0].balance;
        }
        let ethBlncFinal = ethBalance + ethBlncNew;
        ethBlncFinal = parseFloat(Math.round(ethBlncFinal * 100) / 100).toFixed(4);

        let ethCold = await models.cold_wallet_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '2'
            }
        });
        if (ethCold.count > 0) {
            ethBlncCold = ethCold.rows[0].balance;
        }
        ethBlncFinal = ethBlncFinal + ethBlncCold;
        ethBlncFinal = parseFloat(Math.round(ethBlncFinal * 100) / 100).toFixed(4);

        var responseEth = request(
            'GET',
            'https://coincap.io/page/ETH'
        );
        let coin_rate_eth = JSON.parse(responseEth.body);
        coinRateEth = coin_rate_eth.price_usd;
        totalEthUsd = parseFloat(coinRateEth) * parseFloat(ethBlncFinal);
        // eth ends----------------------------------------------------------------

        
        // get ltc wallet------------------------------
        let ltcWallet = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '3'
            }
        });
        if(ltcWallet.count > 0){
            let ltcCoin = await bitgo.coin('ltc').wallets().get({ id: ltcWallet.rows[0].bitgo_wallet_id });
            ltcBalance = ltcCoin._wallet.balance;
        }

        let ltcBlncDb = await models.currency_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '3'
            }
        });
        if(ltcBlncDb.count > 0){
            ltcBlncNew = ltcBlncDb.rows[0].balance;
        }
        let ltcBlncFinal = ltcBalance + ltcBlncNew;
        ltcBlncFinal = parseFloat(Math.round(ltcBlncFinal * 100) / 100).toFixed(4);

        let ltcCold = await models.cold_wallet_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '3'
            }
        });
        if (ltcCold.count > 0) {
            ltcBlncCold = ltcCold.rows[0].balance;
        }
        ltcBlncFinal = ltcBlncFinal + ltcBlncCold;
        ltcBlncFinal = parseFloat(Math.round(ltcBlncFinal * 100) / 100).toFixed(4);

        var responseLtc = request(
            'GET',
            'https://coincap.io/page/LTC'
        );
        let coin_rate_ltc = JSON.parse(responseLtc.body);
        coinRateLtc = coin_rate_ltc.price_usd;
        totalLtcUsd = parseFloat(coinRateLtc) * parseFloat(ltcBlncFinal);
        // ltc ends----------------------------------------------------------------

        
        // get bch wallet------------------------------
        let bchWallet = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '5'
            }
        });
        if(bchWallet.count > 0){
            let bchCoin = await bitgo.coin('bch').wallets().get({ id: bchWallet.rows[0].bitgo_wallet_id });
            bchBalance = bchCoin._wallet.balance;
        }

        let bchBlncDb = await models.currency_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '5'
            }
        });
        if(bchBlncDb.count > 0){
            bchBlncNew = bchBlncDb.rows[0].balance;
        }
        let bchBlncFinal = bchBalance + bchBlncNew;
        bchBlncFinal = parseFloat(Math.round(bchBlncFinal * 100) / 100).toFixed(4);

        let bchCold = await models.cold_wallet_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '5'
            }
        });
        if (bchCold.count > 0) {
            bchBlncCold = bchCold.rows[0].balance;
        }
        bchBlncFinal = bchBlncFinal + bchBlncCold;
        bchBlncFinal = parseFloat(Math.round(bchBlncFinal * 100) / 100).toFixed(4);

        var responseBch = request(
            'GET',
            'https://coincap.io/page/BCH'
        );
        let coin_rate_bch = JSON.parse(responseBch.body);
        coinRateBch = coin_rate_bch.price_usd;
        totalBchUsd = parseFloat(coinRateBch) * parseFloat(bchBlncFinal);
        // bch ends----------------------------------------------------------------

        
        // get rmg wallet------------------------------
        let rmgWallet = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '46'
            }
        });
        if(rmgWallet.count > 0){
            let rmgCoin = await bitgo.coin('rmg').wallets().get({ id: rmgWallet.rows[0].bitgo_wallet_id });
            rmgBalance = rmgCoin._wallet.balance;
        }

        let rmgBlncDb = await models.currency_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '46'
            }
        });
        if(rmgBlncDb.count > 0){
            rmgBlncNew = rmgBlncDb.rows[0].balance;
        }
        let rmgBlncFinal = rmgBalance + rmgBlncNew;
        rmgBlncFinal = parseFloat(Math.round(rmgBlncFinal * 100) / 100).toFixed(4);

        let rmgCold = await models.cold_wallet_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '46'
            }
        });
        if (rmgCold.count > 0) {
            rmgBlncCold = rmgCold.rows[0].balance;
        }
        rmgBlncFinal = rmgBlncFinal + rmgBlncCold;
        rmgBlncFinal = parseFloat(Math.round(rmgBlncFinal * 100) / 100).toFixed(4);

        var responseRmg = request(
            'GET',
            'https://coincap.io/page/RMG'
        );
        let coin_rate_rmg = JSON.parse(responseRmg.body);
        // coinRateRmg = coin_rate_rmg.price_usd;
        coinRateRmg = "0";
        totalRmgUsd = parseFloat(coinRateRmg) * parseFloat(rmgBlncFinal);
        // rmg ends----------------------------------------------------------------

        
        // get xrp wallet------------------------------
        let xrpWallet = await models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '4'
            }
        });
        if(xrpWallet.count > 0){
            let xrpCoin = await bitgo.coin('xrp').wallets().get({ id: xrpWallet.rows[0].bitgo_wallet_id });
            xrpBalance = xrpCoin._wallet.spendableBalanceString;
        }
        
        let xrpBlncDb = await models.currency_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '4'
            }
        });
        if(xrpBlncDb.count > 0){
            xrpBlncNew = xrpBlncDb.rows[0].balance;
        }
        let xrpBlncFinal = xrpBalance + xrpBlncNew;
        xrpBlncFinal = parseFloat(Math.round(xrpBlncFinal * 100) / 100).toFixed(4);

        let xrpCold = await models.cold_wallet_balance.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: '4'
            }
        });
        if (xrpCold.count > 0) {
            xrpBlncCold = xrpCold.rows[0].balance;
        }
        xrpBlncFinal = xrpBlncFinal + xrpBlncCold;
        xrpBlncFinal = parseFloat(Math.round(xrpBlncFinal * 100) / 100).toFixed(4);

        var responseXrp = request(
            'GET',
            'https://coincap.io/page/XRP'
        );
        let coin_rate_xrp = JSON.parse(responseXrp.body);
        coinRateXrp = coin_rate_xrp.price_usd;
        totalXrpUsd = parseFloat(coinRateXrp) * parseFloat(xrpBlncFinal);
        // xrp ends----------------------------------------------------------------

        totalUsdBlnc = totalBtcUsd + totalEthUsd + totalLtcUsd + totalBchUsd + totalRmgUsd + totalXrpUsd;
        totalUsdBlnc = parseFloat(Math.round(totalUsdBlnc * 100) / 100).toFixed(4);


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
            //count: count,
            btcBalance : btcBlncFinal,
            ethBalance : ethBlncFinal,
            ltcBalance: ltcBlncFinal,
            bchBalance: bchBlncFinal,
            rmgBalance: rmgBlncFinal,
            xrpBalance: xrpBlncFinal,
            btcAddressDetails: btcAddressDetails,
            ethAddressDetails: ethAddressDetails,
            ltccAddressDetails: ltccAddressDetails,
            bchAddressDetails: bchAddressDetails,
            rmgAddressDetails: rmgAddressDetails,
            xrpAddressDetails: xrpAddressDetails,
            title: 'Wallets',
            btcWallet: btcWallet,
            ethWallet: ethWallet,
            ltcWallet: ltcWallet,
            bchWallet: bchWallet,
            rmgWallet: rmgWallet,
            xrpWallet: xrpWallet,
            walletTransaction: walletTransaction,
            totalBtcUsd: totalBtcUsd,
            totalEthUsd: totalEthUsd,
            totalLtcUsd: totalLtcUsd,
            totalBchUsd: totalBchUsd,
            totalRmgUsd: totalRmgUsd,
            totalXrpUsd: totalXrpUsd,
            totalUsdBlnc: totalUsdBlnc
        });

    });


    app.post('/wallet-create', function (req,res) {
        var user_id = req.user.id;
        var currency_id = req.body.currency_id;
        var currency_code = req.body.currency_code;
        var email = req.user.email;
        
        if(currency_id == '2') { // if ethereum
            bitgo.coin(currency_code).wallets()
            .generateWallet({ label: email + "-" + currency_code, passphrase: 'COinjolt123!!', enterprise: '5a2b266b441c857b0786b282c7310749' })
            .then(function (walletResult) {
                console.dir(walletResult);
                walletId = walletResult.wallet._wallet.id;
                label = walletResult.wallet._wallet.label;
                userkeychain_public = walletResult.userKeychain.pub;
                userkeychain_private = walletResult.userKeychain.prv;
                backupkeychain_private = walletResult.backupKeychain.prv;
                backupkeychain_public = walletResult.backupKeychain.pub;
                bitgokeychain_public = walletResult.bitgoKeychain.pub;
                models.wallet.create({
                    user_id: user_id,
                    currency_id: currency_id,
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
            }).catch(function (err) {
                console.log(err);
            });
        } else { // for other coins except ethereum
            bitgo.coin(currency_code).wallets()
            .generateWallet({ label: email + "-" + currency_code, passphrase: 'COinjolt123!!' })
            .then(function (walletResult) {
                console.dir(walletResult);
                walletId = walletResult.wallet._wallet.id;
                label = walletResult.wallet._wallet.label;
                userkeychain_public = walletResult.userKeychain.pub;
                userkeychain_private = walletResult.userKeychain.prv;
                backupkeychain_private = walletResult.backupKeychain.prv;
                backupkeychain_public = walletResult.backupKeychain.pub;
                bitgokeychain_public = walletResult.bitgoKeychain.pub;
                models.wallet.create({
                    user_id: user_id,
                    currency_id: currency_id,
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
                })
            }).catch(function (err) {
                console.log(err);
            });
        }
        


    });
    

    app.post('/generate-address', async (req,res) => {
        //var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
        var user_id = req.user.id;
        var currency_id = req.body.currency_id;
        var currency_code = req.body.currency_code;
        console.log(user_id);
        console.log(currency_id);
        console.log(currency_code);
        let walletDetails = await models.wallet.findAll({
            where: {
                user_id: req.user.id,
                currency_id: currency_id
            }
        });
        var walletId = walletDetails[0].id;
        var bitgoWalletId = walletDetails[0].bitgo_wallet_id;

        await bitgo.coin(currency_code).wallets().getWallet({ id: bitgoWalletId })
        .then(function(wallet) {
          return wallet.createAddress();
        })
        .then(function(address) {
          // print new address details
          console.dir(address);
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

    /*
    app.post('/send-currency', function(req, res){
        var destinationAddress = req.body.coin_address;
        var coin_amount = req.body.coin_amount;
        var amountSatoshis = coin_amount * 1e8;
        var walletPassphrase = 'COinjolt123!!';
        var userid = req.user.id;
        var currency_id = "1";
        var walletDbId;
        var walletId;
        var destinationAddressId;
        var receiver_id;
        var walletBalance;
        var type = "1";

        models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: currency_id
            }
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
                        //var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
                        bitgo.wallets().get({
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
    */

    app.post('/send-currency', function(req, res){
        var destinationAddress = req.body.coin_address;
        var coin_amount = req.body.coin_amount;
        var amountSatoshis = coin_amount * 1e8;
        var walletPassphrase = 'COinjolt123!!';
        var userid = req.user.id;
        // var currency_id = "1";
        var walletDbId;
        var walletId;
        var destinationAddressId;
        var receiver_id;
        var walletBalance;
        var type = "1";
        var currency_id = req.body.currency_id;
        var currency_code;
        if(currency_id == '1'){
            currency_code = "btc";
        } else if(currency_id == '2'){
            currency_code = "eth";
        } else if(currency_id == '3'){
            currency_code = "ltc";
        } else if(currency_id == '5'){
            currency_code = "bch";
        } else if(currency_id == '46'){
            currency_code = "rmg";
        } else if(currency_id == '4'){
            currency_code = "xrp";
        }

        models.wallet.findAndCountAll({
            where: {
                user_id: req.user.id,
                currency_id: currency_id
            }
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
                        //var bitgoVerify = new BitGo.BitGo({env: 'test', accessToken: req.cookies.BITGO_ACCESS_TOKEN});
                        bitgo.coin(currency_code).wallets().get({ id: walletId })
                        .then(function(wallet) {
                            // walletBalance = (wallet.balance() / 1e8).toFixed(4);
                            if(currency_id == '4') { // ripple (xrp)
                                walletBalance = wallet._wallet.spendableBalanceString;
                            } else {
                                walletBalance = wallet._wallet.balance;
                            }
                            
                            console.log("walletBalance");
                            console.log(walletBalance);
                            if((walletBalance == 0) || (walletBalance < amountSatoshis)){
                                res.json({success: "3", message: "You have not enough wallet balance to send coin."});
                            } else {
                                let params = {
                                    amount: amountSatoshis,
                                    address: destinationAddress,
                                    walletPassphrase: walletPassphrase
                                  };

                                  wallet.send(params)
                                  .then(function (walletTransaction) {
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