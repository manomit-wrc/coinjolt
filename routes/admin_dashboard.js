const Op = require('sequelize').Op;
const sequelize = require('sequelize');
var excel = require('node-excel-export');
const lodash = require('lodash');
const unix = require('to-unix-timestamp');
const dateFormat = require('dateformat');
var request = require('sync-request');
const acl = require('../middlewares/acl');

module.exports = function (app, Deposit, Withdraw, User, Currency, Question, Option, Answer, currency_balance, send_email, deposit_method, company_setting) {
	const styles = {
		headerDark: {
			font: {
				color: {
					rgb: '000000'
				},
				sz: 12,
				bold: true
			}
		},
		cellPink: {
			fill: {
				fgColor: {
					rgb: 'FFFFCCFF'
				}
			}
		},
		cellGreen: {
			fill: {
				fgColor: {
					rgb: 'FF00FF00'
				}
			}
		}
	};

	const specification = {
		id: { 
			displayName: 'ID',
			headerStyle: styles.headerDark, 
			cellFormat: function(value, row) { 
				return value;
			},
			width: 60 
		},
		name: { 
			displayName: 'Name',
			headerStyle: styles.headerDark, 
			cellFormat: function(value, row) { 
				return value;
			},
			width: 150 
		},
		amount: {
			displayName: 'Amount',
			headerStyle: styles.headerDark,
			cellFormat: function(value, row) { 
				return value;
			},
			width: 70
		},
		type: {
		    displayName: 'Type',
		    headerStyle: styles.headerDark,
		    cellFormat: function(value, row) { 
		    	if (value === 0) {
		    		return 'Deposit';
		    	}
		    	else if (value === 1) {
		    		return 'Buy';
		    	}
		    	else if (value === 2) {
		    		return 'Sell';	
		    	}
		    	else if (value === 3) {
		    		return 'Withdraw';	
		    	}
		    	else if (value === 4) {
		    		return 'MCP Invest';	
		    	}
		    	else if (value === 5) {
		    		return 'MCP Withdraw';	
		    	}
		    },
		    width: 150 
  		},
  		createdAt: {
			displayName: 'Date',
			headerStyle: styles.headerDark,
			cellFormat: function(value, row) { 
				return value;
			},
			width: 100
		},
	}

	app.get('/admin/dashboard', acl, (req, res) => {

		Promise.all([
			User.findAndCountAll({
				where:{
					type: 2
				}
			}),
			
			send_email.findAndCountAll(),

			Deposit.findAll({
				attributes: [ [sequelize.fn('SUM',sequelize.col('amount')),'deposit_amount'] ],
				where: {
					type: {
						$in: [0, 1, 4]
					}
				}
			})
		]).then(function (values) {
			var result = JSON.parse(JSON.stringify(values));

			res.render('admin/dashboard', {
				layout: 'dashboard',
				totalUser: result[0].count,
				totalEmailSent: result[1].count,
				depositeAmount: result[2][0].deposit_amount
			});
		});
	});

	app.get('/admin/crypto_investments', acl, (req, res) => {
		currency_balance.belongsTo(Currency, {foreignKey: 'currency_id'});
		currency_balance.findAll({
			attributes: [ 'Currency.display_name', [sequelize.fn('SUM',sequelize.col('balance')),'total_balance'] ],
			include: [{
				model: Currency
			}],
			group: ['currency_balance.currency_id'],
			order: [
				['id', 'ASC']
			]
		}).then(values => {
			var result = JSON.parse(JSON.stringify(values));
			var coin_list_arr = [];
			var coin_rate = 0;
			var balance = 0;
			var total_amt = 0;
			for (var i = 0; i < result.length; i++) {
				var coin_name = result[i].Currency.alt_name.toUpperCase();
				var response = request(
				    'GET',
				    'https://coincap.io/page/'+coin_name
			    );
			    let coin_rate_res = JSON.parse(response.body);
			    coin_rate = coin_rate_res.price_usd;
				balance = result[i].total_balance;
				total_amt = parseFloat(coin_rate) * parseFloat(balance);
				coin_list_arr.push({
					coin_name: result[i].Currency.display_name,
					total_balance: result[i].total_balance,
					coin_rate: coin_rate,
					total_amt: total_amt
				});
			}
			res.render('admin/crypto_investments/index', { layout: 'dashboard', 'all_data': coin_list_arr });
		});
	});

	app.get('/admin/transactions', acl, (req, res) => {
		Deposit.belongsTo(User, {foreignKey: 'user_id'});
		Deposit.findAll({
			include: [{
				model: User
			}],
			order: [
				['id', 'DESC']
			]
		}).then(result => {
			res.render('admin/transactions/index', { layout: 'dashboard', all_data: result });
		});
	});

	app.get('/admin/question', acl, (req, res) => {
		Question.findAll().then(result => {
			res.render('admin/questionnaire/index', { layout: 'dashboard', all_data: result });
		});
	});

	app.get('/question/options/:id', acl, (req, res) => {
		Option.findAll({
			attributes: ['option'],
			where: {
				question_id: req.params['id']
			}
		}).then(results => {
			sendJSON(res, 200, results);
			/*res.json({
                code: "200",
                response: results
            });*/
		});
	});

	app.get('/admin/question/:id', acl, async (req, res) => {
		var ques_data = await Question.findById(req.params['id']);
		Answer.belongsTo(User, {foreignKey: 'user_id'});
		Answer.belongsTo(Option, {foreignKey: 'option_id'});
		Answer.findAll({
			where: {
				question_id: req.params['id']
			},
			include: [
				{
					model: User
				},
				{
					model: Option
				}
			],
		}).then(result => {
			res.render('admin/questionnaire/answer', { layout: 'dashboard', all_data: result, question: ques_data.question });
		});
	});

	app.get('/admin/pending-withdrawals', acl, (req, res) => {
		Withdraw.belongsTo(User, {foreignKey: 'user_id'});
		Withdraw.findAll({
			where: {
				status: 0
			},
			include: [{
				model: User
			}],
			order: [
				['id', 'DESC']
			]
		}).then(result => {
			res.render('admin/pending_withdrawals/index',{layout: 'dashboard', all_data: result});
		});
	});

	app.post('/pending-withdrawals-approved', acl, (req, res) => {
		var amount = req.body.amount;
		var user_id = req.body.user_id;
		var wtype = req.body.wtype;
		var type, payment_method;
		if (wtype == 1) {
			type = 3;
			payment_method = 3;
		} else if (wtype == 2) {
			type = 3;
			payment_method = 4;
		} else if (wtype == 3) {
			type = 5;
			payment_method = 5;
		}
		//for generate 8 digits random number//
		var digits = 9;
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
		//end//

		Withdraw.update({
			status: 1
		}, {
			where: {
				id: req.body.row_id
			}
		}).then (result => {
			if (result > 0) {
				Deposit.create({
					user_id: user_id,
					transaction_id: randomNum,
					checkout_id: randomNum,
					type: type,
					amount: amount,
					payment_method: payment_method
				}).then (function (result) {
					res.json({
						status: true,
						message: 'Approved succesfully.'
					});
				});
			}
		});
	});

	app.post("/pending-withdrawals-reject", acl, (req, res) => {
		Withdraw.update({
			status: 2
		}, {
			where: {
				id:req.body.row_id
			}
		}).then(result => {
			res.json({
				status: true,
				message: 'Rejected succesfully.'
			});
		});
	});

	app.get('/admin/pending-withdrawals-history', acl, (req, res) => {
		Withdraw.belongsTo(User, {foreignKey: 'user_id'});
		Withdraw.findAll({
			where: {
				status: { $not: 0 }
			},
			include: [{
				model: User
			}]
		}).then(result => {
			res.render('admin/pending_withdrawals/history', { layout: 'dashboard', all_data: result });
		});
	});

	app.get('/admin/transactions/generate', acl, (req, res) => {
		Deposit.belongsTo(User, {foreignKey: 'user_id'});
		Deposit.findAll({
			attributes: ['id', 'amount', 'createdAt', 'type', 'User.first_name', 'User.last_name'],
			include: [{
				model: User
			}],
			order: [
				['id', 'DESC']
			]
		}).then(result => {
			var resultArr = [];
			for (var i = 0; i < result.length; i++) {
				resultArr.push({
					id: result[i].id,
					name: result[i].User.first_name + " " + result[i].User.last_name,
					amount: result[i].amount,
					type: result[i].type,
					createdAt: result[i].createdAt
				});
			}
			const report = excel.buildExport(
				[
					{
						name: 'Report', 
						specification: specification, 
						data: resultArr
					}
				]
			);
			res.attachment('report.xlsx');
			return res.send(report);
		});
	});

	app.get('/admin/investments', acl, async (req, res) => {
		var user_list = await User.findAll({
			where: {
				type: 2
			}
		});
		var user_list_arr = [];
		lodash.each(user_list, (x, index) => {
			Promise.all([
				//deposit
				Deposit.findAll({
					attributes: [ [sequelize.fn('SUM',sequelize.col('amount')),'deposit_amount'] ],
					group: ['user_id'],
					where: {
						user_id: x.id,
						type: {
							$in: [0, 1, 4]
						}
					}
				}),
				//for withdraw
				Deposit.findAll({
					attributes: [ [sequelize.fn('SUM',sequelize.col('amount')),'withdraw_amount'] ],
					group: ['user_id'],
					where: {
						user_id: x.id,
						type: {
							$in: [2, 3, 5]
						}
					}
				})
			]).then(values => {
				var result = JSON.parse(JSON.stringify(values));
				d_amount = result[0].length > 0 ? result[0][0].deposit_amount : 0;
				w_amount = result[1].length > 0 ? result[1][0].withdraw_amount : 0;
				user_list_arr.push({
					name: x.first_name + " " + x.last_name,
					deposit_amount: d_amount,
					withdraw_amount: w_amount,
					balance: parseFloat(d_amount) - parseFloat(w_amount)
				});
				if (index === user_list.length - 1) {
					res.render('admin/investments/index', { layout: 'dashboard', 'all_data': user_list_arr });
				}
			});
		});
	});

	app.get('/create-chart-data/:id', (req, res) => {
		var cond;
		if(req.params['id'] === 'Investments') {
			cond = [0, 1, 4];
		}
		else {
			cond = [2, 3, 5];
		}
		Deposit.findAll({
			attributes: [ 'amount', 'createdAt' ],
			where: {
				type: {
					$in: cond
				}
			}
		}).then(depsoit_data => {
			var chart_data = [];
			for (var i = 0; i < depsoit_data.length; i++) {
				var temp_Date = new Date(dateFormat(depsoit_data[i].createdAt, "yyyy-mm-dd"));
				var amount = depsoit_data[i].amount;
				chart_data.push([temp_Date.getTime(),parseFloat(amount)]);
			}
			res.send(chart_data);
		});
	});

	app.get('/admin/deposit-methods', acl, (req, res) =>{

		deposit_method.findAll({}).then(result => {
			res.render('admin/deposit_methods/index', { layout: 'dashboard', deposit_methodsData: result});
		});
	});

	app.get('/admin/company-settings', (req, res) =>{

		company_setting.findAll({

        }).then(function(companySettingsData){  
            res.render('admin/company_settings', {layout: 'dashboard', companySettingsData: companySettingsData});
        });
	});

	app.post('/admin/update-company-settings', async (req, res) =>{

		const data = await company_setting.findAll({});

		if(data.length === 0) {
			const insert = await company_setting.create({
				phone_number: req.body.phoneNumber,
				email: req.body.email_address,
				facebook_url: req.body.fb_url,
				twitter_url: req.body.twitter_url,
				linkedin_url: req.body.linkedIn_url,
				instagram_url: req.body.instagram_url
			});

			res.json({
				status:true,
				msg: "Company Settings Added Successfully"
			});
		}
		else {
			const update = await company_setting.update({
				phone_number: req.body.phoneNumber,
				email: req.body.email_address,
				facebook_url: req.body.fb_url,
				twitter_url: req.body.twitter_url,
				linkedin_url: req.body.linkedIn_url,
				instagram_url: req.body.instagram_url
			}, {
				where: {
					id: data[0].id
				}
			});
			res.json({
				status:true,
				msg: "Company Settings Modified Successfully"
			});
		}

		
	});

	function sendJSON(res, httpCode, body) {
		var response = JSON.stringify(body);
		res.send(httpCode, response);
	}
};