
module.exports = function (app, withdraw, bank_details, Deposit, models){
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');

	app.get('/account/request-withdrawal', function (req,res) {
		Deposit.findAll({
            where: {user_id: req.user.id, type: 3},
            limit: 5,
            order: [
                ['id', 'DESC']
            ]
        }).then(function(withdrawal_history){
			res.render('request_withdrawal/index',{layout: 'dashboard', withdrawal_history: withdrawal_history, title: 'Request Withdrawal'});
		});
	});

	app.post('/withdraw-amount', (req,res) => {
		withdraw.create({
			user_id: req.user.id,
			amount_usd: req.body.withdrawAmount,
			status: 0,
			withdraw_type: (req.body.type=='Bank' ? 1 : 2)
			
		}).then(function(result){
			if(req.body.type=='Bank'){
				models.bank_details.create({
					user_id: req.user.id,
					acc_holder_name: req.body.customerName,
					bank_name: req.body.bankName,
					bank_address: req.body.bankAddress,
					acc_no: req.body.accountNumber,
					swift_code: req.body.swiftCode,
					institution_no: req.body.institutionnumber,
					branch_no: req.body.branchNo
				}).then(function (result) {
					res.json({
						status: true,
						msg:'submit successfully'
					});
				});
			}else{
				res.json({
					status: true,
					msg:'submit successfully'
				});
			}		
		});
	});
};