var keys = require('../config/key');

module.exports = function (app, email_template, User, AWS) {
	app.get('/admin/all-user-list', (req,res) => {
		User.findAll({
			where:{
				type:2
			}
		}).then(function(result){
			if(result){
				res.render('admin/user/user_listings',{layout:'dashboard', allUser:result});
			}
		});		
	});

	app.get('/admin/send-email/:id', (req,res) => {
		User.findById(req.params['id'],{

		}).then(function(result){
			if(result){
				res.render('admin/user/send_email',{layout:'dashboard', userDetails:result})
			}
		});
	});

	app.post('/admin/send-email', (req,res) => {
		var admin_email = 'support@coinjolt.com';
		var user_email = req.body.user_email;
		var subject = req.body.subject;
		var description = req.body.description;

		//email sending using ses
		var ses = new AWS.SES({apiVersion: '2010-12-01'});
		ses.sendEmail({
		   	Source: keys.senderEmail, 
		   	Destination: { ToAddresses: [user_email] },
		   	Message: {
		       	Subject: {
		          	Data: subject
		       	},
		       	Body: {
		           	Text: {
		               	Data: description
		           	}
		        }
		   }
		}, function(err, data) {
	    	if(err) throw err;
		 //    req.flash('emailMessage', 'Email send to the user successfully.');
			// res.redirect('/admin/support');
			res.json({
				status: true,
				msg: "Email send to the user successfully."
			});
		});
	});
};