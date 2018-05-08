module.exports = function(app, passport, models) {

    app.get('/test-asso', async (req, res) => {
        models.User.belongsTo(models.Country,{foreignKey: 'country_id'});
        let whereObj = {};
        if(true) {
            whereObj.id = '1';
        }
        else {
            whereObj.email = 'sdfsdf';
        }
        let result = await models.User.findAll({
            where: whereObj,
            include: [{model: models.Country}]
        });

        console.log(result[0]);
    });

    app.get('/', function(req, res) {

        var msg = req.flash('loginMessage')[0];

        res.render('login', {message: msg});
    });

    app.post('/', passport.authenticate('local-login', {
        //successRedirect : '/dashboard',
        failureRedirect : '/',
        failureFlash : true 
    }),
    function(req, res) {
        if (req.user.type === "1") {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/dashboard');
        }
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/signup',
        failureRedirect : '/signup',
        failureFlash : true 
    }),
    function(req, res) {

    });

    app.get('/signup', function(req, res) {

        var msg = req.flash('signupMessage')[0];
        var errorMsg = req.flash('signupErrorMessage')[0];
        models.Country.findAll().then(function (country) {
            res.render('signup', {
                message: msg,
                errorMsg: errorMsg,
                countries: country
            });
        });
    });     


    app.get('/user/:userid', function(req, res){
        var uid = req.params['userid'];
        res.cookie('referral_id', uid);
        req.session.cookie.maxAge = 30 * 24 * 3600 * 1000;
        res.redirect('/signup');
    });

    app.get('/activated/:activation_key', (req,res) => {
        const key = req.params['activation_key'];
		models.User.count({ where: {activation_key: key, status: 1} }).then(function(count){
            if (count > 0) {
                req.flash('loginMessage', 'Account is already activated. Please login to continue.');
                res.redirect('/');
              } else {
                models.User.update({
                    status: 1
                }, {
                    where: {
                        activation_key: key
                    }
                }).then(function (result) {
                    req.flash('loginMessage', 'Your account activated successfully. Please login to continue.');
                    res.redirect('/');
                }).catch(function (err) {
                });
              }
        });
	});

};