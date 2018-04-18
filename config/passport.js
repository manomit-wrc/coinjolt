const bCrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';
module.exports = (passport, User) => {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {

            if (user) {

                done(null, user.get());

            } else {

                done(user.errors, null);

            }

        });
    });

    passport.use(
        'local-login',
        new LocalStrategy({

            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, email, password, done) {
                if (req.body.remember_me) {
                    req.session.cookie.maxAge = 1000 * 60 * 3;
                } else {
                    req.session.cookie.expires = false;
                }

                var isValidPassword = function (userpass, password) {
                    return bCrypt.compareSync(password, userpass);

                }
                User.findOne({
                    where: {
                        email: email
                    }
                }).then(function (user) {
                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));

                    }

                    if (!isValidPassword(user.password, password)) {
                        return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));

                    }


                    var userinfo = user.get();
                    return done(null, userinfo);


                }).catch(function (err) {

                    console.log("Error:", err);

                    return done(null, false, req.flash('loginMessage', 'Something wrong.Please try again.'));

                });
            }

        ));


    // count for existing email
    /*
        Author.count({ where: {name: item.trim()} }).then(function(count){
        if (count != 0) {
          console.log('Author already exists')
          callback(); //assuming you want it to keep looping, if not use callback(new Error("Author already exists"))
        } else {
          console.log('Creating author...')
          Author.create({
            name: item.trim()
          }).then(function(author){
            callback();
          })
        }
      })
    */    
    // end count

    passport.use('local-signup', new LocalStrategy({

        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {

                User.count({ where: {email: email} }).then(function(count){
                    if (count > 0) {
                      return done(null, false, req.flash('signupErrorMessage', 'That email is already taken.'));
                    } else {
                      if (req.cookies.referral_id === undefined) {
                        const activation_key = encrypt(email);
    
                        User.create({
                            email: req.body.email,
                            password: bCrypt.hashSync(req.body.password),
                            activation_key: activation_key
    
                        }).then(function(result){
                            /* sendgrid mail sending code for activation link */
    
                            return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));
                        }).catch(function(err){
                            /* var validation_error = err.errors;
                            res.render('admin/codecategory/add', {
                            layout: 'dashboard',
                            error_message: validation_error[0].message,
                            body: req.body
                            }); */
                            console.log('error');
                        });
    
                    }
                      else {
                        var condition = '';
                        if(isNaN(parseInt(req.cookies.referral_id))) {
                            condition = ' user_name="'+ req.cookies.referral_id + '"';
                        }
                        else {
                            condition = ' id="'+ req.cookies.referral_id + '"';
                        }
                        //const getuserData = 'SELECT id FROM users WHERE '+condition;
                        /* connection.query(getuserData, function(err, rows, fields) {
                            const activation_key = encrypt(email);
                            var today = new Date();
                            var users = {
                                "email": email,
                                "password": bCrypt.hashSync(password),
                                "status": 1,
                                "created_at": today,
                                "updated_at": today,
                                "activation_key": activation_key,
                                "referral_id": rows[0].id
                            }
                            var newUserMysql = new Object();
                            newUserMysql.email = email;
                            newUserMysql.password = password;
                            connection.query('INSERT INTO users SET ?', users, function (error, rows, fields) {
                                var fromEmail = new helper.Email('nilesh@wrctpl.com');
                                var toEmail = new helper.Email(email);
                                var subject = 'Registration Complete';
                                const emailUrl = `
                                                <html>
                                                <body>
                                                <div style="text-align: center;">
                                                Thank you for registered with us. Please copy the below link and paste into your browser
                                                <br />
                                                <a href="http://localhost:8080/activated/"${activation_key}>
                                                http://localhost:8080/activated/${activation_key}
                                                </a>
                                                </div>
                                                </body>
                                                </html>
                                            `;
                                var content = new helper.Content('text/html', emailUrl);
                                var mail = new helper.Mail(fromEmail, subject, toEmail, content);
                                var request = sg.emptyRequest({
                                    method: 'POST',
                                    path: '/v3/mail/send',
                                    body: mail.toJSON()
                                });
                                sg.API(request, function (error, response) {
                                    if (error) {
                                        console.log("In Error");
                                        return done(null, false, req.flash('signupErrorMessage', 'Something not right. Please try again'));
                                    }
                                    return done(null, false, req.flash('signupMessage', 'Registration completed successfully. Please check your email to activate your account'));
                                });
                            });  
                            
                        }); */
                        }
                    }
                  })
                // end check
        }
    ));
   
    function encrypt(text) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

       

};