module.exports = function (app,withdraw){
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');

	app.get('/request-withdrawal', function (req,res) {
		res.render('request_withdrawal/index',{layout:'dashboard'});
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