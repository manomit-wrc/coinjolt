module.exports = (req, res, next) => {
	if(req.user != undefined) {
		res.locals.front_user = req.user;
	}
	next();
};