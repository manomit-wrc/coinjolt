module.exports = function (app, Kyc_details, User) {
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');

	app.get('/admin/kyc', (req,res) => {
		Kyc_details.belongsTo(User, {foreignKey: 'user_id'});

		Kyc_details.findAll({
			where:{
				status:1
			},
			include: [{
		    	model: User
	  		}],
		}).then(function(result){
			res.render('admin/kyc/index',{layout:'dashboard', all_data:result});
		});
	});

	app.post('/admin/kyc-approved', (req,res) => {
		Kyc_details.update({
			status : 2
		},{
			where:{
				id: req.body.row_id
			}
		}).then (function (result) {
			res.json({
                status: true,
                message: 'KYC approved succesfully.'
            });
		});
	});

	app.post('/admin/kyc-reject', (req,res) => {
		Kyc_details.update({
			status : 3
		},{
			where:{
				id: req.body.row_id
			}
		}).then (function (result) {
			res.json({
                status: true,
                message: 'KYC rejected succesfully.'
            });
		});
	});

	app.get('/admin/kyc-history', (req,res) => {
		Kyc_details.belongsTo(User, {foreignKey: 'user_id'});

		Kyc_details.findAll({
			where:{
				status: { $not: 1} 
			},
			include: [{
		    	model: User
	  		}],
		}).then(function(result){
			res.render('admin/kyc/history',{layout:'dashboard', all_data:result});
		});
	});

};