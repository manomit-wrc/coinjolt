var keys = require('../config/key');
module.exports = function (app, email_template, User, AWS, send_email){
	app.get('/admin/email-template-listings', (req,res) => {
		email_template.findAll({
			where:{
				status:1
			},
			order: [
            	['id', 'DESC']
        	]
		}).then(function(result){
			if(result){
				const msg = req.flash('templateDeleteMSG')[0];
				res.render('admin/email/email_template_listings.hbs',{layout:'dashboard', all_data:result, msg:msg});
			}
		});
	});

	app.get('/admin/email-template', (req,res) => {
		res.render('admin/email/email_template.hbs',{layout:'dashboard'});
	});

	app.post('/admin/submit-email-template', (req,res) => {
		email_template.create({
			template_name: req.body.template_subject,
			template_desc: req.body.template_description,
			status: 1
		}).then(function(result){
			res.json({
				status: true,
				msg: "Email template added successfully."
			});
		});
	});

	app.get('/admin/email-template-edit/:id', (req,res) => {
		email_template.findById(req.params['id'],{
			where:{
				status:1
			}
		}).then(function(result){
			if(result){
				res.render('admin/email/email_template_edit',{layout:'dashboard',all_data:result})
			}
		});
	});

	app.post('/admin/submit-edit-email-template', (req,res) => {
		email_template.update({	
			template_name:req.body.template_subject,
			template_desc: req.body.template_description
		},{
			where:{
				id:req.body.id
			}
		}).then(function(result){
			if(result){
				res.json({
					status:true,
					msg: "Template edit susscessfully."
				});
			}
		});
	});

	app.get('/admin/email-template-delete/:id', (req,res) => {
		email_template.update({	
			status:2
		},{
			where:{
				id:req.params['id']
			}
		}).then(function(result){
			if(result){
				req.flash('templateDeleteMSG', 'Template deleted successfully.');
                res.redirect('/admin/email-template-listings');
			}
		});
	});

	app.get('/admin/email-marketing', (req,res) => {
		Promise.all([
			User.findAll({
				where:{
					type:2
				}
			}),
			send_email.findAll({
				order: [
	            	['id', 'DESC']
	        	]
			})
		]).then(function (result) {
			res.render('admin/email/email_marketing',{layout: 'dashboard', allUser:result[0],
				allSendEmail:result[1]});
		});
	});

	app.post('/admin/send-email-markeitng', async (req,res) => {
		var all_user_email = [];
		if(req.body.users == 'all_registered_user'){
			await User.findAll({
				where:{
					type:2
				}
			}).then(function(result){
				var all_values = JSON.parse(JSON.stringify(result));
				for(var j = 0; j < all_values.length; j++){
					var email_id = all_values[j].email;
					all_user_email.push(email_id);
				}
			});
			var users_array = all_user_email;

		}else{
			var users = req.body.users;
			var users_array = users.split(",");
		}
	
		var ses = new AWS.SES({apiVersion: '2010-12-01'});
		ses.sendEmail({
		   	Source: keys.senderEmail, 
		   	Destination: { ToAddresses: users_array },
		   	Message: {
		       	Subject: {
		          	Data: req.body.subject
		       	},
		       	Body: {
		           	Html: {
		           		Charset: "UTF-8",
		               	Data: req.body.body
		           	}
		        }
		   }
		}, function(err, data) {
	    	if(err) throw err;

	    	for(var i = 0 ; i < users_array.length; i++) {
	    		User.findAll({
	    			where:{
	    				email: users_array[i]
	    			}
	    		}).then(function (result) {
	    			if(result){
	    				var values = JSON.parse(JSON.stringify(result));
	    				send_email.create({
				    		user_id: values[0].id,
				    		email_sub: req.body.subject,
				    		email_desc: req.body.body,
				    		send_by_id: req.user.id
				    	});
	    			}
	    			if(i === users_array.length) {
						res.json({
							status: true,
							msg: "Email send to the user successfully."
						});
						// return res.send(true);
					}
	    		});
	    	}
		});
	});

	app.post('/admin/recent_send_email_details', (req,res) => {
		var user_email_ids = req.body.user_row_email_id;
		
		send_email.findById(user_email_ids).then(function (result) {
			if(result){
				res.json({
					status: true,
					details: result
				});
			}
		});
	});

	app.post('/admin/delete_recent_send_email_details', (req,res) => {
		var user_email_ids = req.body.user_row_email_id;

		send_email.destroy({
		    where: {
		    	id: user_email_ids
		    }
		}).then(function (result) {
			if(result){
				res.json({
					status: true,
					msg: "Record deleted successfully."
				});
			}
		});
	});
};