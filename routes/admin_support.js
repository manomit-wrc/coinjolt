var keys = require('../config/key');
const acl = require('../middlewares/acl');
module.exports = function(app, Support, User, AWS){

	app.get('/admin/support', acl, (req,res) => {
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

	app.get('/admin/support_details/:id', acl, (req,res) => {
		Support.belongsTo(User, {foreignKey: 'user_id'});

		Support.findById(req.params['id'],{
			include: [{
		    	model: User
	  		}]
		}).then(function (result) {
			res.render('admin/support/details',{ layout: 'dashboard', all_data: result });
		});
	});

	app.post('/admin/support-details-reply-send', acl, (req,res) => {
		var row_id = req.body.user_row_id;
		var subject = req.body.subject;
		var description = req.body.description;
		var user_email = req.body.user_email;
		var admin_email = 'support@coinjolt.com';
		var admin_reply = req.body.reply;

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
		               	Data: admin_reply
		           	}
		        }
		   }
		}, function(err, data) {
	    	if(err) throw err;
		    req.flash('emailMessage', 'Email send to the user successfully.');
			res.redirect('/admin/support');
		});
	});

	app.get('/admin/supports-history', acl, (req,res) => {
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