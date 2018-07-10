module.exports = (req, res, next) => {
	if(req.isAuthenticated()) {
		if (req.path == '/dashboard') {
			
			next();
		}

		else if(req.path == '/logout'){
			
			next();
		}
	}
};