var BitGo = require('bitgo');
var bitgo = new BitGo.BitGo({ env: 'test' });
module.exports = (app) => {
    app.get('/bitgo/login', (req, res) => {
        bitgo.authenticate({ username: "manomit@wrctpl.com", password: "Mmitra!@#4", otp: "0000000" }, function(err, result) {
            if (err) {
              return console.log(err);
            }
            res.send(result.access_token);
        });
    });

    app.get('/bitgo/logout', (req, res) => {
        bitgo.logout({}, function(err) {
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
        bitgo.wallets().createWalletWithKeychains(data, function(err, result) {
            if (err) { console.dir(err); throw new Error("Could not create wallet!"); }
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
        bitgo.wallets().get({ "id": id }, function callback(err, wallet) {
            if (err) {
                throw err;
            }
            wallet.createAddress({ "chain": 0 }, function callback(err, address) {
                console.log(address);
            });
        });
    });

    app.get('/bitgo/send-coins', (req, res) => {
        var destinationAddress = '2MwDGsK8XmELd41t8GVK7G39vemcEjEUvYU';
        var amountSatoshis = 0.1 * 1e8; 
        var walletPassphrase = 'Mmitra!@#4';
        var walletId = '2MziMaFRQTj5DfWD3f3pwhCihgah8Ed46se';

        bitgo.wallets().get({id: walletId}, function(err, wallet) {
        if (err) { console.log("Error getting wallet!"); console.dir(err); return process.exit(-1); }
        console.log("Balance is: " + (wallet.balance() / 1e8).toFixed(4));

        wallet.sendCoins({ address: destinationAddress, amount: amountSatoshis, walletPassphrase: walletPassphrase }, function(err, result) {
            if (err) { console.log("Error sending coins!"); console.dir(err); return process.exit(-1); }

            console.dir(result);
        });
        });
    });
};