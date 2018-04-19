module.exports = function(app,Deposit) {
	const Op = require('sequelize').Op;

	app.get('/deposit-funds', function (req,res) {
		res.render('deposit/view',{layout:'dashboard'});
	});

	app.post('/wiretransfer', (req,res) => {
		console.log(req.body);
		console.log(req.user.id);
	});
};