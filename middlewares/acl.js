module.exports = (req, res, next) => {
	if(req.isAuthenticated()) {
		if(req.user.type === '1') {
			next();
		}
		else {
			res.redirect('/dashboard');
		}
	}
};