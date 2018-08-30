// var BitGo = require('bitgo');
// var bitgo = new BitGo.BitGo({
//     env: 'test'
// });
var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({
    env: 'prod',
    accessToken: process.env.ACCESS_TOKEN
});
//////////////////////////////////////////////////////////////////
const user_acl = require('../middlewares/user_acl');
const keys = require('../config/key');
const Op = require('sequelize').Op;
const two_factor_checking = require('../middlewares/two_factor_checking');
var request = require('sync-request');
var Web3 = require("web3");
if (typeof web3 !== 'undefined') { 
    web3 = new Web3(web3.currentProvider); 
} else { // set the provider you want from Web3.providers 
    web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/bb9c013e06dd47db9a70293027d590b0")); 
}




module.exports = (app, models) => {



    app.get('/account/ercwallets', two_factor_checking, user_acl, async (req, res) => {

        console.log("Token");

        var abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimal","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newowner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
        var CoursetroContract = await web3.eth.contract(abi);
        var abiAddress = "0x270f3Fe56e4D5C05D656F2CC4a3963A155265Bb4";
        var Coursetro = await CoursetroContract.at(abiAddress);
        //console.log(Coursetro);
        var bal = await Coursetro.totalSupply.call();
        //console.log(bal);

        //var accounts =  await Coursetro.getAccounts();
        //console.log(accounts);

        //var owner = await web3.eth.personal.newAccount('mynewaccount', function(err, res){ console.log("error: "+err); console.log("res: "+res); });
        //console.log(owner);

        var str = await web3.toHex({test: 'test'});
        console.log("str");
        console.log(str);
        // var owner = await web3.eth.register(str);
        // console.log("owner");
        // console.log(owner);
        var bln = await Coursetro.balanceOf(str);
        console.log("bln");
        console.log(bln);

        var owner = await Coursetro.owner();
        console.log("owner");
        console.log(owner);


        var ownerBlnc = await Coursetro.balanceOf(owner);
        console.log("ownerBlnc");
        console.log(ownerBlnc);


        // var transfer = await Coursetro.transfer('0xa9B5B4502e55c169183d0e6842043ecF64dc29dc',1000,{from:owner});
        // console.log("transfer");
        // console.log(transfer);
        // console.log("bln");
        // console.log(bln);

        var personal = await web3.personal;
        console.log("personal");
        console.log(personal);


        
        
        
        var ethBalance = 0;
        var ethBlncNew = 0;
        var ethColdOnly;
        var ethColdOnlyUsd;
        var ethHotOnlyUsd;
        var ethBlncCold;


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

        //only cold wallet balance
        ethColdOnly = ethBlncNew + ethBlncCold;
        ethColdOnly = parseFloat(Math.round(ethColdOnly * 100) / 100).toFixed(4);
        
        ethColdOnlyUsd = parseFloat(coinRateEth) * parseFloat(ethColdOnly);

        ethHotOnlyUsd = parseFloat(coinRateEth) * parseFloat(ethBalance);


        // eth ends----------------------------------------------------------------


        totalUsdBlnc = totalEthUsd;
        totalUsdBlnc = parseFloat(Math.round(totalUsdBlnc * 100) / 100).toFixed(4);


        models.wallet_transaction.belongsTo(models.User, {foreignKey: 'receiver_id'});    
        let walletTransaction = await models.wallet_transaction.findAll({
            where: {
                sender_id: req.user.id
            },
        	include: [{
		    	model: models.User
	  		}]
        });
        
        res.render('ercwallets', {
            layout: 'dashboard',
            //count: count,
            ethBalance : ethBlncFinal,
            ethAddressDetails: ethAddressDetails,
            title: 'Wallets',
            ethWallet: ethWallet,
            walletTransaction: walletTransaction,
            totalEthUsd: totalEthUsd,
            totalUsdBlnc: totalUsdBlnc,
            ethColdOnly :ethColdOnly,
            ethColdOnlyUsd: ethColdOnlyUsd,
            ethHotOnly : ethBalance,
            ethHotOnlyUsd: ethHotOnlyUsd,

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