const Op = require('sequelize').Op;
const sequelize = require('sequelize');
var excel = require('node-excel-export');
const lodash = require('lodash');
const unix = require('to-unix-timestamp');
const dateFormat = require('dateformat');


module.exports = function (app, Deposit, Withdraw, User) {
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

	app.get('/admin/dashboard', function (req, res) {
		res.render('admin/dashboard', {
			layout: 'dashboard'
		});
	});

	app.get('/admin/transactions', (req, res) => {
		Deposit.belongsTo(User, {foreignKey: 'user_id'});
		Deposit.findAll({
			include: [{
				model: User
			}],
			order: [
				['id', 'DESC']
			]
		}).then(function(result) {
			res.render('admin/transactions/index', { layout: 'dashboard', all_data: result });
		});
	});

	app.get('/admin/pending-withdrawals', (req, res) => {
		Withdraw.belongsTo(User, {foreignKey: 'user_id'});
		Withdraw.findAll({
			where: {
				status:0
			},
			include: [{
				model: User
			}],
			order: [
			['id', 'DESC']
			]
		}).then(function(result) {
			res.render('admin/pending_withdrawals/index',{layout: 'dashboard', all_data: result});
		});
	});

	app.post('/pending-withdrawals-approved', (req, res) => {
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
		}).then (function (result) {
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

	app.post("/pending-withdrawals-reject", (req, res) => {
		Withdraw.update({
			status: 2
		}, {
			where: {
				id:req.body.row_id
			}
		}).then(function (result) {
			res.json({
				status: true,
				message: 'Rejected succesfully.'
			});
		});
	});

	app.get('/admin/pending-withdrawals-history', (req, res) => {
		Withdraw.belongsTo(User, {foreignKey: 'user_id'});
		Withdraw.findAll({
			where: {
				status: { $not: 0 }
			},
			include: [{
				model: User
			}]
		}).then(function(result) {
			res.render('admin/pending_withdrawals/history', { layout: 'dashboard', all_data: result });
		});
	});

	app.get('/admin/transactions/generate', (req, res) => {
		Deposit.belongsTo(User, {foreignKey: 'user_id'});
		Deposit.findAll({
			attributes: ['id', 'amount', 'createdAt', 'type', 'User.first_name', 'User.last_name'],
			include: [{
				model: User
			}],
			order: [
				['id', 'DESC']
			]
		}).then(function(result) {
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

	app.get('/admin/investments', async (req, res) => {
		var user_list = await User.findAll({
			where: {
				type: 2
			}
		});
		var user_list_arr = [];
		lodash.each(user_list, (x, index) => {
			Promise.all([
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
		if(req.params['id'] === 'Investment') {
			cond = [0, 1, 4];
		}
		else {
			cond = [2, 3, 5]
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
			for(var i=0;i < depsoit_data.length; i++) {
				var temp_Date = new Date(dateFormat(depsoit_data[i].createdAt, "yyyy-mm-dd hh:MM:ss").split(' ').join('T'));
				var amount = depsoit_data[i].amount;
				chart_data.push([temp_Date.getTime(),parseFloat(amount)]);
			}
			res.send(chart_data);
		});
	});
};