var bCrypt = require('bcrypt-nodejs');
const Op = require('sequelize').Op;
module.exports = function (app, Country, User, Currency, Support) {
    var multer = require('multer');
    var fileExt = '';
    var fileName = '';
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/id-proof');
        },

        filename: function (req, file, cb) {
            fileExt = file.mimetype.split('/')[1];
            if (fileExt == 'jpeg') fileExt = 'jpg';
            fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
            cb(null, fileName);
        }
    })

    var upload = multer({
        storage: storage,
        limits: {
            fileSize: 3000000
        }
    });

    var profile = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/profile');
        },

        filename: function (req, file, cb) {
            fileExt = file.mimetype.split('/')[1];
            if (fileExt == 'jpeg') fileExt = 'jpg';
            fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
            cb(null, fileName);
        }
    })

    var profile_upload = multer({
        storage: profile,
        limits: {
            fileSize: 3000000
        }
    });

    app.get('/dashboard', function (req, res) {
        res.render('dashboard', {
            layout: 'dashboard'
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile-details', function (req, res) {
        res.render('profile-details', {
            layout: 'dashboard'
        });
    });

    app.get('/account-settings', function (req, res) {
        const msg = req.flash('profileMessage')[0];
        Country.findAll().then(function (country) {
            res.render('account-settings', {
                layout: 'dashboard',
                message: msg,
                countries: country

            });
        });
    });

    app.post('/update-password', function (req, res) {
        if (bCrypt.compareSync(req.body.oldpassword, req.user.password)) {
            const password = bCrypt.hashSync(req.body.newpassword);
            User.update({
                password: password
            }, {
                where: {
                    id: req.user.id
                }
            }).then(function (result) {
                res.json({
                    success: true,
                    message: 'Password updated successfully'
                });
            }).catch(function (err) {

                console.log(err);
            });
        } else {
            res.json({
                success: false,
                message: 'Old password doesn\'t matched'
            });
        }
    });

    app.post('/update-id-proof', upload.single('async_uploads'), function (req, res) {
        User.update({

            identity_proof: fileName
        }, {
            where: {
                id: req.user.id
            }
        }).then(function (result) {

            res.json({
                success: true,
                message: 'ID Proof uploaded successfully',
                file_name: fileName
            });
        }).catch(function (err) {

            console.log(err);
        });
    });

    app.post('/account-settings', profile_upload.single('async_upload'), function (req, res) {

        User.update({

            first_name: req.body.first_name,
            last_name: req.body.last_name,
            user_name: req.body.user_name,
            address: req.body.address,
            contact_no: req.body.contact_no,
            about_me: req.body.about_me,
            image: fileName,
            dob: req.body.dob,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            postal_code: req.body.postcode

        }, {
            where: {
                id: req.user.id

            }
        }).then(function (result) {
            if (result > 0) {
                req.flash('profileMessage', 'Profile updated successfully');
                res.redirect('/account-settings');
            } else {
                req.flash('profileMessage', 'Already up to date');
                res.redirect('/account-settings');
            }
        }).catch(function (err) {

            console.log(err);
        });
    });

    app.post('/save-referral-name', function (req, res) {
        var refName = req.body.referral_name;
        User.findAndCountAll({

            where: {
                user_name: {
                    $like: '%'+refName+'%'
                },
                id: {
                    [Op.ne]: req.user.id
                }
            }
        })
        .then(function(result) {
            var count = result.count;
            if(count > 0) {
                res.json({
                    status: 'false',
                    message: 'User already exists, please enter another username'
                });


                } else {
                    User.update({
                        user_name: refName

                    }, {
                        where: {
                            id: req.user.id
                        }
                    }).then(function (result) {
                        res.json({
                            status: 'true',
                            message: 'Referral Name saved successfully'
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
            });

    });

    app.get('/invite-friends', function (req, res) {
        res.render('invite-friends', {
            layout: 'dashboard'
        });
    });

    app.get('/submit-a-request', function (req, res) {
        const msg = req.flash('supportMessage')[0];
        res.render('submit-a-request', {
            layout: 'dashboard',
            message: msg
        });
    });

    app.post('/submit-a-request', function (req, res) {
        Support.create({
            user_id: req.user.id,
            title: req.body.subject.trim(),
            enquiry: req.body.description.trim()
        }).then(function (result) {
            req.flash('supportMessage', 'Request sent successfully');
            res.redirect('/submit-a-request');
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.get('/requests-support', function (req, res) {
        Support.findAll({
            where: {
                user_id: req.user.id
            }
        }).then(function (supports) {
            res.render('requests-support', {
				layout: 'dashboard',
				supports: supports
			});
        }).catch(function (err) {
            console.log(err);
        });
    });

    
    app.get('/buy-and-sell-coins', function(req, res){
        Currency.findAll({
			attributes: ['alt_name','currency_id']
		}).then(function(values){
            res.render('buy-and-sell-coins', {layout: 'dashboard', contents: values });
		});
    });
};