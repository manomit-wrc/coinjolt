module.exports = function(app,Deposit) {
	app.get('/deposit-funds', function (req,res) {
		res.render('deposit/view',{layout:'dashboard'});
	});
};