module.exports = (req, res, next) => {
	if(req.isAuthenticated()) {
		if(req.user.type === '2') {
			next();
		}
		else {
			res.redirect('/admin/dashboard');
		}
	}
};