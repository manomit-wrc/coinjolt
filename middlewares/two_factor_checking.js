module.exports = (req, res, next) => {
	if(req.isAuthenticated()) {

		if(req.user.two_factorAuth_status === 1 && req.user.two_factorAuth_verified == 'Active') {
			next();
		}
		else if(req.user.two_factorAuth_status === 2 && req.user.two_factorAuth_verified == 'Inactive'){
			next();
		}
		else if(req.user.two_factorAuth_status === 2 && req.user.two_factorAuth_verified == 'Active') {
			res.redirect('/scan/2FA-Verification');
		}
		else{
			res.redirect('/login/2FA-Verification');
		}
	}
};