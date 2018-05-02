const Op = require('sequelize').Op;
const sequelize = require('sequelize');
module.exports = function (app, Deposit, Withdraw, User) {
	app.get('/admin/dashboard', function (req, res) {
        res.render('admin/dashboard', {
            layout: 'dashboard'
        });
    });

    app.get('/admin/pending-withdrawals', (req, res) => {
		Withdraw.belongsTo(User, {foreignKey: 'user_id'});
		Withdraw.findAll({
			where: {
                status:0,
                withdraw_type:1
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
		//for generate 8 digits random number//
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
		//end//

		Withdraw.update({
			status : 1
		},{
			where :{
				id : req.body.row_id
			}
		}).then (function (result) {
			if(result > 0){
				Deposit.create({
					user_id: req.user.id,
					transaction_id: randomNum,
					checkout_id: randomNum,
					type: 0,
					amount: amount,
					payment_method: 2
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
			status:2
		},{
			where:{
				id:req.body.row_id
			}
		}).then(function (result) {
			res.json({
	            status: true,
	            message: 'Rejected succesfully.'
	        });
		});
	});
};