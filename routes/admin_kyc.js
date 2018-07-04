module.exports = function (app, Kyc_details, User) {
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');
	const acl = require('../middlewares/acl');

	app.get('/admin/kyc', acl, (req,res) => {
		Kyc_details.belongsTo(User, {foreignKey: 'user_id'});

		Kyc_details.findAll({
			where:{
				status:1
			},
			include: [{
		    	model: User
	  		}],
		}).then(function(result){
			res.render('admin/kyc/index',{layout:'dashboard', all_data:result, title:"KYC"});
		});
	});

	app.post('/admin/kyc-approved', acl, (req,res) => {
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

	app.post('/admin/kyc-reject', acl, (req,res) => {
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

	app.get('/admin/kyc-history', acl, (req,res) => {
		Kyc_details.belongsTo(User, {foreignKey: 'user_id'});

		Kyc_details.findAll({
			where:{
				status: { $not: 1} 
			},
			include: [{
		    	model: User
	  		}],
		}).then(function(result){
			res.render('admin/kyc/history',{layout:'dashboard', all_data:result, title:"KYC History"});
		});
	});

};