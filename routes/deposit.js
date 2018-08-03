module.exports = function(app,Deposit,WireTransfer,User,Referral_data,Currency,Country,deposit_method,deposit_method_type) {
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');
	const acl = require('../middlewares/acl');
	const user_acl = require('../middlewares/user_acl');
	app.get('/account/deposit-funds', user_acl, async (req,res) => {
		const msg = req.flash('payPalSuccessMsg')[0];
		const cancelMsg = req.flash('payPalCancelMsg')[0];
		/* WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

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
		}); */

		/* Deposit.belongsTo(Currency,{foreignKey: 'currency_id'});
        let depositHistory = await Deposit.findAll(
        { 
            where: {
                user_id: req.user.id,
                type: 0
            },
            limit: 5,
            order: [
                ['createdAt', 'DESC']
            ],
            //logging: notOnlyALogger,
            include: [{ 
                model: Currency, required: true
                
            }] 
		}); */
		
		let depositHistory = await Deposit.findAll({
			where: {
				user_id: req.user.id,
                type: 0
			},
			limit: 5,
            order: [
                ['id', 'DESC']
            ]
		});

		let countries = await Country.findAll();

		// let depositMethods = await deposit_method.findAll({
		// 	where: {
        //         status: 1
		// 	}
		// });

		deposit_method_type.belongsTo(deposit_method, {foreignKey: 'deposit_method_id'});
		let depositMethods = await deposit_method_type.findAll({
			include: [{
				model: deposit_method
			}]
		});

		let bankWireTransferDetails = await deposit_method_type.findOne({
			where: {
				deposit_method_id: '2' // deposit method is bank wire transfer
			}
		});
		
		res.render('deposit/view',{layout: 'dashboard', depositHistory: depositHistory, countries: countries, depositMethods: depositMethods, bankWireTransferDetails: bankWireTransferDetails, msg:msg, cancelMsg:cancelMsg, title: 'Deposit Funds'});

	});

	app.post('/wiretransfer-add', (req,res) => {
		WireTransfer.create({
			user_id: req.user.id,
			amount_usd: req.body.amount,
			status: req.body.status
		});
	});

	app.get('/admin/bank-wire-transfers', acl, (req,res) => {
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
			res.render('admin/pending_wire_transfers/index',{layout: 'dashboard',all_data:result, title:"Bank Wire Transfers"});
		});
	});

	app.post('/pending-wire-transfer-approved', (req,res) => {
		var amount = req.body.amount;
		console.log('ENTERED AMOUNT:: ',amount);
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
					user_id: req.body.user_id,
					transaction_id: randomNum,
					checkout_id: randomNum,
					type: 0,
					amount: amount,
					payment_method: 2
				}).then (function (result) {
					res.json({
	                    status: true,
	                    message: 'Approved and deposit succesfully.'
	                });
				});
			}
		});

		
		User.findAll({
            where: {
                id: req.body.user_id
			},
			attributes: ['referral_id']
        }).then(function (result) {
			refId = result[0].referral_id;
			
			if(refId !== 0){
				Referral_data.findAll({
					where: {user_id: req.user.id, referral_id: refId},
					attributes: [[ sequelize.fn('SUM', sequelize.col('referral_amount')), 'SUM_REF_AMT']]
				}).then(function(result2){
					
					amount2 = result2[0].get('SUM_REF_AMT');
					if(amount2 !== undefined){
						if(amount2 < 200){
							var depositAmount = req.body.amount;
							var referralAmount = (1/100) * depositAmount;
							var remainingAmount = (200 - amount2);
							if(referralAmount > remainingAmount){
								referralAmount = remainingAmount;	
							}			
							Referral_data.create({
								user_id: req.user.id,
								referral_id: refId,
								deposit_amount: depositAmount,
								referral_amount: referralAmount
							}).then(function (result3) {
								
							}).catch(function (err) {
								console.log(err);
							});
						}
					}
				}).catch(function (err2) {
					console.log(err2);
				});
			}
			

        }).catch(function (err) {
            console.log(err);
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

	app.get('/admin/pending-wire-transfers-history', acl, (req,res) => {
		WireTransfer.belongsTo(User, {foreignKey: 'user_id'});

		WireTransfer.findAll({
			where: {
             	status: { $not: 0} 
            },
        	include: [{
		    	model: User
	  		}],
	  		order: [
            	['id', 'DESC']
        	]
		}).then(function(result){
			res.render('admin/pending_wire_transfers/history',{layout: 'dashboard',all_data:result, title:"Pending Wire Transfers History"});
		});
	});
};