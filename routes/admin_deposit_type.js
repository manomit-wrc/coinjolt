module.exports = function (app, deposit_method) {
	const Op = require('sequelize').Op;
	const sequelize = require('sequelize');

	app.post('/admin/deposit-enable', (req, res) =>{
        var depositId = req.body.deposit_id;
        deposit_method.update({
			status : 1
		},{
			where:{
				id: depositId
			}
		}).then (function (result) {
			res.json({
                status: true
            });
		});
    });

    app.post('/admin/deposit-disable', (req, res) =>{
        var depositId = req.body.deposit_id;
        deposit_method.update({
			status : 0
		},{
			where:{
				id: depositId
			}
		}).then (function (result) {
			res.json({
                status: true
            });
		});
    });

};