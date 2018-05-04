const Op = require('sequelize').Op;
const sequelize = require('sequelize');
var excel = require('node-excel-export');

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
		if (wtype == 1 || wtype == 2) {
			type = 3;
		} else if (wtype == 3) {
			type = 5;
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
					payment_method: 0
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
};