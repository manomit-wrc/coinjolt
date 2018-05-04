module.exports = function (app,withdraw,Deposit){
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');

	app.get('/request-withdrawal', function (req,res) {
		Deposit.findAll({
            where: {user_id: req.user.id, type: 3},
            limit: 5,
            order: [
                ['id', 'DESC']
            ]
        }).then(function(withdrawal_history){
			res.render('request_withdrawal/index',{layout: 'dashboard', withdrawal_history: withdrawal_history});
		});
	});

	app.post('/withdraw-amount', (req,res) => {
		withdraw.create({
			user_id: req.user.id,
			amount_usd: req.body.withdrawAmount,
			status: 0,
			withdraw_type: (req.body.type=='Bank' ? 1 : 2)
		}).then(function(result){
			res.json({
				status: true,
				msg:'submit successfully'
			});
		});
	});
};