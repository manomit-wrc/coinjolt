module.exports = (req, res, next) => {
	if(req.isAuthenticated()) {
		if(req.user.two_factorAuth_status === 1) {
			next();
		}
		else {
			res.redirect('/account/dashboard');
		}
	}
};