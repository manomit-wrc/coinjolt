module.exports = function(app,Deposit,WireTransfer,User,Referral_data) {
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');
	app.get('/deposit-funds', function (req,res) {
		WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

		WireTransfer.findAll({
			where: {
                user_id: req.user.id
            },
        	include: [{
		    	model: User
	  		}],
	  		order: [
            	['id', 'DESC']
        	]
		}).then(function(result){
			var user_details_only = result[0];
			res.render('deposit/view',{layout: 'dashboard', all_data:result, User:user_details_only.User});
		});
	});

	app.post('/wiretransfer-add', (req,res) => {
		WireTransfer.create({
			user_id: req.user.id,
			amount_usd: req.body.amount,
			status: req.body.status
		});
	});

	app.get('/admin/pending-wire-transfers', (req,res) => {
		WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

		WireTransfer.findAll({
			where: {
                status:0
            },
        	include: [{
		    	model: User
	  		}],
	  		order: [
            	['id', 'DESC']
        	]
		}).then(function(result){
			res.render('admin/pending_wire_transfers/index',{layout: 'dashboard',all_data:result});
		});
	});

	app.post('/pending-wire-transfer-approved', (req,res) => {
		var amount = req.body.amount;
		//for generate 8 digits random number//
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
		//end//

		WireTransfer.update({
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
	                    message: 'Approved and deposilt succesfully.'
	                });
				});
			}
		});
	});

	app.post("/pending-wire-transfer-reject", (req,res) => {
		WireTransfer.update({
			status:2
		},{
			where:{
				id:req.body.row_id
			}
		}).then(function (result){
			res.json({
	            status: true,
	            message: 'Reject succesfully.'
	        });
		});
	});

	app.post("/credit-card-add", (req,res) => {
		//for generate 8 digits random number//
		var digits = 9;	
		var numfactor = Math.pow(10, parseInt(digits-1));	
		var randomNum =  Math.floor(Math.random() * numfactor) + 1;	
		var refId = 0;
		var amount = 0;
		//end//
		Deposit.create({
			user_id: req.user.id,
			transaction_id: randomNum,
			checkout_id: randomNum,
			type: 0,
			amount: req.body.amount,
			payment_method: 1,
			credit_card_no: req.body.card_number,
			card_expmonth: req.body.cardexpmonth,
			card_expyear: req.body.cardexpyear,
			cvv: req.body.cvv
		}).then(function (result) {
			if(result){
				res.json({
					status: true,
					message: "Credit card details added succesfully."
				});
			}
		}); 

		User.findAll({
            where: {
                id: req.user.id
			},
			attributes: ['referral_id']
        }).then(function (result) {
			refId = result[0].referral_id;
			
			if(refId !== 0){
				Referral_data.findAll({
					where: {user_id: req.user.id, referral_id: refId},
					attributes: [[ sequelize.fn('SUM', sequelize.col('referral_amount')), 'SUM_REF_AMT']]
				}).then(function(result){
					amount = result[0].get('SUM_REF_AMT');
					if(amount !== undefined){
						if(amount < 200){
							var depositAmount = req.body.amount;
							var referralAmount = (1/100) * depositAmount;
							var remainingAmount = (200 - amount);
							if(referralAmount > remainingAmount){
								referralAmount = remainingAmount;	
							}			
							Referral_data.create({
								user_id: req.user.id,
								referral_id: refId,
								deposit_amount: depositAmount,
								referral_amount: referralAmount
							}).then(function (result) {
								
							}).catch(function (err) {
								console.log(err);
							});
						}
					}
				}).catch(function (err) {
					console.log(err);
				});
			}
			

        }).catch(function (err) {
            console.log(err);
        });

	});

	app.get('/admin/pending-wire-transfers-history', (req,res) => {
		WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

		WireTransfer.findAll({
			where: {
             	status: { $not: 0} 
            },
        	include: [{
		    	model: User
	  		}]
		}).then(function(result){
			res.render('admin/pending_wire_transfers/history',{layout: 'dashboard',all_data:result});
		});
	});
};