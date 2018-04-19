module.exports = function(app,Deposit,WireTransfer,User) {
	const Op = require('sequelize').Op;

	app.get('/deposit-funds', function (req,res) {
		WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

		WireTransfer.findAll({
			where: {
                user_id: req.user.id
            },
        	include: [{
		    	model: User
	  		}]
		}).then(function(result){
			res.render('deposit/view',{layout: 'dashboard',all_data:result});
		});
	});

	app.post('/wiretransfer-add', (req,res) => {
		WireTransfer.create({
			user_id: req.user.id,
			amount_usd: req.body.amount,
			status: req.body.status
		});
	});

	app.get('/pending-wire-transfers', (req,res) => {
		WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

		WireTransfer.findAll({
			where: {
                status:0
            },
        	include: [{
		    	model: User
	  		}]
		}).then(function(result){
			res.render('pending_wire_transfers/index',{layout: 'dashboard',all_data:result});
		});
	});
};