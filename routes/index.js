module.exports = function(app, passport, models) {

  app.get('/test-asso', async (req, res) => {
    
    let result = await models.User.findAll();
    let countries = await models.Country.findAll({
      where: {
        id: result[0].country_id
      }
    });
    console.log(countries);
  });

	app.get('/', function(req, res) {

		var msg = req.flash('loginMessage')[0];
		
		res.render('login', {message: msg});
  });
  
  app.post('/', passport.authenticate('local-login', {
            
    successRedirect : '/dashboard',
    failureRedirect : '/',
    failureFlash : true 
}),
function(req, res) {
  
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
    res.render('signup',{message: msg, errorMsg: errorMsg });
  });     
  

  app.get('/user/:userid', function(req, res){
    var uid = req.params['userid'];
    res.cookie('referral_id', uid);
    req.session.cookie.maxAge = 30 * 24 * 3600 * 1000;
    res.redirect('/signup');
  });

  /*
  app.get('/activated/:activation_key', function(req, res){

    const key = req.params['activation_key'];
    const selectUser = "SELECT * FROM users WHERE activation_key='"+key+"' AND status=1";
    var message;
    connection.query(selectUser,function (err, result) {
      
      if (err) throw err; 
      if(result.length > 0){
        message = 'Account is already activated';
        res.render('email_activated', {message: message});
      }
      else{
        const updateUser = "UPDATE users SET status=1 WHERE activation_key='"+key+"'";

        connection.query(updateUser, function(err, result){
          if(err){
            throw err;
          }
          else{
            message = 'Your account activated successfully';
          }
          res.render('email_activated', {message: message});
        });  

      }
       
    });
  });
  */
	

};