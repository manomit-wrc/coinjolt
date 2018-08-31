const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const acl = require('../middlewares/acl');

module.exports = function (app, models) {

	app.get('/admin/user-currency-balances', acl, async (req, res) => {
		const msg = req.flash('currencyBalanceMessage')[0];
		models.currency_balance.belongsTo(models.Currency, {foreignKey: 'currency_id'});
		models.currency_balance.belongsTo(models.User, {foreignKey: 'user_id'});
		var currency_balances = await models.currency_balance.findAll({
			include: [
				{
					model: models.Currency
				},
				{
					model: models.User
				}
			],
		});
		//console.log(JSON.stringify(result, undefined, 2));
		var all_users = await models.User.findAll();
		var all_currencies = await models.Currency.findAll();
		res.render('admin/crypto_investments/balances', { layout: 'dashboard', 'currency_balances': currency_balances, 'all_users': all_users, 'all_currencies': all_currencies, title:"Cryptocurrency Balances", message: msg });
		
	});


	app.post('/admin/cryptobalance-update', acl, async (req, res) => {
		var user_id = req.body.user_id;
		var currency_id = req.body.currency_id;
		var currency_balance = req.body.currency_balance;

		/// ------------------- currency_balances table ------------------------------- ///
		var balance_count = await models.currency_balance.count({
            where: {
                user_id: user_id,
                currency_id: currency_id
            }
		});
		
        if(balance_count > 0) { // if user balance exists for that currency update the record in the currency_balances table
			var update_currency_balance = await models.currency_balance.update({
				balance: currency_balance	
			}, {
				where: {
					user_id: user_id, currency_id: currency_id
				}
			});
		} else { // if user balance doesn't exist for that currency create a record  in the currency_balances table
			var create_currency_balance = await models.currency_balance.create({
				user_id: user_id,
				currency_id: currency_id,
				balance: currency_balance
			});
		}

		/// --------------------------- deposits table ----------------------------------------- ///	
		var deposit_count = await models.Deposit.count({
            where: {
                user_id: user_id,
                currency_id: currency_id
            }
		});

		if(deposit_count > 0) { // if user balance exists for that currency update the record in the Deposits table
			var currencyBalance = await models.Deposit.findAll(
				{ 
					attributes: ['id'],
					where: { 
						user_id: user_id, currency_id: currency_id
					},
					order: [ ['id', 'DESC'], ], 
					limit: 1
				}); 
			var deposit_id = currencyBalance[0].id;
			var update_deposit_currency_balance = await models.Deposit.update({
				balance: currency_balance
			}, {
				where: {
					id: deposit_id
				}
			});
			
		} else { // if user balance doesn't exist for that currency create a record in the Deposits table
			var digits = 9;	
			var numfactor = Math.pow(10, parseInt(digits-1));	
			var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
			var create_deposit_balance = await models.Deposit.create({
				user_id: user_id,
				transaction_id: randomNum,
				checkout_id: randomNum,
				amount: '',
				current_rate: '',
				converted_amount: currency_balance,
				type: 1,
				balance: currency_balance,
				currency_id: currency_id,
				payment_method: 0
			});
		}

		req.flash('currencyBalanceMessage', 'Balance updated successfully');
		res.redirect('/admin/user-currency-balances');
		
	});

	

};