module.exports = function(app, Support, User){

	app.get('/admin/support', (req,res) => {
		Support.belongsTo(User, {foreignKey: 'user_id'});

		Support.findAll({
			include: [{
		    	model: User
	  		}],
	  		order:[
	  			['id','DESC']
	  		]
		}).then(function (result) {
			res.render('admin/support/index',{layout: 'dashboard', all_data:result});
		});
	});

	app.get('/admin/support_details/:id', (req,res) => {
		Support.belongsTo(User, {foreignKey: 'user_id'});

		Support.findById(req.params['id'],{
			include: [{
		    	model: User
	  		}]
		}).then(function (result) {
			res.render('admin/support/details',{layout: 'dashboard', all_data:result});
		});
	});

	app.post('/admin/support-details-reply-send', (req,res) => {
		var subject = req.body.subject;
		var description = req.body.description;
		var user_email = req.body.user_email;
		var admin_email = 'support@coinjolt.com';
		var admin_reply = req.body.reply;

		//email sending using sendmail
		const sendmail = require('sendmail')();
 
		sendmail({
		    from: 'sobhan@wrctpl.com',
		    to: user_email,
		    subject: subject,
		    html: admin_reply,
		  }, function(err, reply) {
		    if (err) {
		    	console.log(error);
		  	} else {
		  		
		    	res.redirect('/admin/support');
		  	}
		});
		//end
	});
};