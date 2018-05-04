module.exports = function(app, Support, User){

	app.get('/admin/support', (req,res) => {
		const msg = req.flash('emailMessage')[0];
		Support.belongsTo(User, {foreignKey: 'user_id'});

		Support.findAll({
			where:{
				status: 0
			},
			include: [{
		    	model: User
	  		}],
	  		order:[
	  			['id','DESC']
	  		]
		}).then(function (result) {
			res.render('admin/support/index',{layout: 'dashboard', all_data:result, message: msg});
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
		var row_id = req.body.user_row_id;
		var subject = req.body.subject;
		var description = req.body.description;
		var user_email = req.body.user_email;
		var admin_email = 'support@coinjolt.com';
		var admin_reply = req.body.reply;

		//email sending using sendmail
		const sendmail = require('sendmail')();
 
		sendmail({
		    from: '"Coinjolt Support Team" <support@coinjolt.com>',
		    to: user_email,
		    subject: subject,
		    html: admin_reply,
		  }, function(err, reply) {
		    if (err) {
		    	console.log(err);
		  	} else {
		  		//UPDATE SUPPORT TABLE

		  			Support.update({
						status : 1
					},{
						where :{
							id : row_id
						}
					}).then (function (result) {
						if(result > 0){
							req.flash('emailMessage', 'Email send to the user successfully.');
		    				res.redirect('/admin/support');
						}
					});
		  		//END
		  	}
		});
		//end
	});

	app.get('/admin/supports-history', (req,res) => {
		Support.belongsTo(User, {foreignKey: 'user_id'});

		Support.findAll({
			where:{
				status: 1
			},
			include: [{
		    	model: User
	  		}],
	  		order:[
	  			['id','DESC']
	  		]
		}).then(function (result) {
			res.render('admin/support/history',{layout: 'dashboard', all_data:result});
		});
	});
};