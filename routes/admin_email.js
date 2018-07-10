var keys = require('../config/key');
var serialize = require('node-serialize');
var bcrypt = require('bcrypt-nodejs');
const acl = require('../middlewares/acl');
const Op = require('sequelize').Op;
module.exports = function (app, email_template, User, AWS, send_email, email_draft, Deposit, email_template_type){
	app.get('/admin/email-template-listings', acl, (req,res) => {
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
				res.render('admin/email/email_template_listings.hbs',{layout:'dashboard', all_data:result, msg:msg, title:"Email Template"});
			}
		});
	});

	app.get('/admin/email-template', acl, (req,res) => {

		email_template_type.findAll({}).then(function(result){
			res.render('admin/email/email_template.hbs',{layout:'dashboard', template_type: result, title:"Email Template"});
		});

		
	});

	app.post('/admin/submit-email-template', acl, (req,res) => {

		email_template.belongsTo(email_template_type, {foreignKey: 'template_type'});
			email_template.findAll({
				where: {
					template_type: 1 // for registration template
				},
				include: [{
					model: email_template_type
				}],
					order: [
					['id', 'DESC']
				]
			}).then(function(response){
				email_template.count({
					where: {
					   template_type: req.body.template_type
					}
				}).then(function (count) {
					if (count > 0) {
						res.json({
							status: false,
							msg: `Template already exists for ${response[0].email_template_type.type} page`
						});
					}
		
					else{
		
							email_template.create({
								template_name: req.body.template_subject,
								template_desc: req.body.template_description,
								status: 1,
								template_type: req.body.template_type
							}).then(function(result){
								res.json({
									status: true,
									msg: "Email template added successfully."
								});
							});
		
					}
				});
			});

		
		

	});

	app.get('/admin/email-template-edit/:id', acl, (req,res) => {

		Promise.all([

			email_template.findById(req.params['id'],{
				where:{
					status:1
				}
			}),
			email_template_type.findAll({

			})

		]).then(function(result){
			res.render('admin/email/email_template_edit',{layout:'dashboard',all_data:result[0],template_type: result[1], title:"Email Template"})
		});

	});

	app.post('/admin/submit-edit-email-template', acl, (req,res) => {
		
		email_template.belongsTo(email_template_type, {foreignKey: 'template_type'});

		email_template.findAll({
			where: {
				template_type: 1 // for registration template
			},
			include: [{
				model: email_template_type
			}],
				order: [
				['id', 'DESC'],
            
			]
			
		}).then(function(response){
			email_template.count({
				where: {
				   template_type: req.body.template_type,

				   id: {
					[Op.notIn]: [req.body.id]
				   }
				   
				}
			}).then(function (count) {
				if (count > 0) {
					res.json({
						status: false,
						msg: `Template already exists for ${response[0].email_template_type.type} page`
					});
				}

				else{
					email_template.update({	
						template_name:req.body.template_subject,
						template_desc: req.body.template_description,
						template_type: req.body.template_type
					},{
						where:{
							id:req.body.id
						}
					}).then(function(result){
						if(result){
							res.json({
								status:true,
								msg: `${response[0].email_template_type.type} template edited susscessfully.`
							});
						}
					});
				}
			});
		});
		
		
	});

	app.get('/admin/email-template-delete/:id', acl, (req,res) => {
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

	app.get('/admin/email-marketing', acl, (req,res) => {
		Deposit.belongsTo(User, {foreignKey: 'user_id'})
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
			}),
			email_draft.findAll({
				where:{
					status:2
				},
				order: [
	            	['id', 'DESC']
	        	]
			}),
			Deposit.findAll({
				where: {
					type: {
						$in: [0, 1, 4]
					}
				},
				group: ['user_id'],
				include: [{
			    	model: User
		  		}],
			})
		]).then(function (result) {
			var result = JSON.parse(JSON.stringify(result));
			// console.log(result[3]);
			// return false;
			res.render('admin/email/email_marketing',{layout: 'dashboard', allUser:result[0],
				allSendEmail:result[1], allDraftEmail:result[2], allDepositUsers:result[3], title:"Email Marketing"});
		});
	});

	app.post('/admin/send-email-markeitng', acl, async (req,res) => {
		var all_user_email = [];
		
		if(req.body.users == 'all_registered_user'){
			await User.findAll({
				where:{
					type:2
				},
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

		// console.log(users_array);
		// return false;

		for(var i = 0; i< users_array.length; i++) {
			var newEmailArray = new Array();
			
			newEmailArray.push(users_array[i]);

	    	const user_details = await User.findAll({ where:{ email: users_array[i]} })
	    	if(user_details) {
	    		
	    		
		    	var ses = new AWS.SES({apiVersion: '2010-12-01'});
				ses.sendEmail({
				   	Source: keys.senderEmail, 
				   	Destination: { ToAddresses: newEmailArray },
				   	// Destination: { ToAddresses: ['sobhan@wrctpl.com'] },
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

					send_email.create({
			    		user_id: user_details[0].id,
			    		email_sub: req.body.subject,
			    		email_desc: req.body.body,
			    		send_by_id: req.user.id
		    		});
				});
	    	}
	    	
	    	if(i === users_array.length - 1) {
				res.json({
					status: true,
					msg: "Email send to the user successfully."
				});
				// return res.send(true);
			}
		}
	
		
	});

	app.post('/admin/save-email-as-draft', acl, async (req,res) => {
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
		var user = serialize.serialize(users_array);

		// console.log(user);
		// return false;

		email_draft.create({
			subject: req.body.subject,
			body: req.body.body,
			user_type: user,
			status: 2
		}).then(function(result) {
			if(result){
				res.json({
					status: true,
					msg: "Draft save successfully."
				});
			}
		});
	});

	app.post('/admin/recent_send_email_details', acl, (req,res) => {
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

	app.post('/admin/delete_recent_send_email_details', acl, (req,res) => {
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

	app.post('/admin/save-email-draft-details', acl, (req,res) => {
		var user_email_draft_ids = req.body.user_row_email_id;
		
		email_draft.findById(user_email_draft_ids).then(function (result) {
			if(result){
				var values = JSON.parse(JSON.stringify(result));
				var user = serialize.unserialize(values.user_type);
				var emails = '';
				for(var i = 0; i < Object.keys(user).length; i++){
					emails += Object.values(user)[i] + ","; 
				}
				all_user_emails = emails.replace(/,\s*$/, "");

				res.json({
					status: true,
					details: result,
					user_list: all_user_emails
				});
			}
		});
	});

	app.post('/admin/send-draft-email', acl, (req,res) => {
		var draft_row_id = req.body.draft_row_id;
		var user_emails = req.body.user_email;
		var users_array = user_emails.split(",");

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

	    	email_draft.update({
	    		status:1,
	    		subject: req.body.subject,
	    		body: req.body.body
	    	}, {
	    		where:{
	    			id: draft_row_id
	    		}
	    	}).then(function (results) {
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
	});

	app.post('/admin/delete-draft', acl, (req,res) => {
		var user_row_draft_id = req.body.user_row_draft_id;

		email_draft.destroy({
		    where: {
		    	id: user_row_draft_id
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

	//Send Bulk Password Email Starts
	/*
	app.get('/admin/send-password-email', acl, (req,res) => {
		var user_arr = [];
		var ses = new AWS.SES({apiVersion: '2010-12-01'});
		// async.series([
		// 	function(cb) {
		// 	  console.log('1');
		// 	  cb();
		// 	},
		// 	function(cb) {
		// 	  console.log('2');
		// 	  cb();
		// 	},
		// 	function(cb) {
		// 	  console.log('3');
		// 	  cb();
		// 	}], 
		// 	function(error, results) {
		// 	  console.log('4');
		// 	}
		//   );

		User.findAll({
        	where: {type:2}
        }).then(results => {
			async.eachSeries(results, ( item, cb ) => {
				console.log(JSON.stringify(item, undefined, 2));
				var digits = 9;	
				var numfactor = Math.pow(10, parseInt(digits-1));	
				var randomNum =  Math.floor(Math.random() * numfactor) + 1;
				var id = item.id;
				var email_id = item.email;
				var password = randomNum;
				var passwordSync = bcrypt.hashSync(password);
				console.log("Password Change");
				console.log(id);
				console.log(email_id);
				console.log(password);
				user_arr.push({
					email_id: email_id,
					password: password
				});
				User.update({
					password: passwordSync,
					raw_password: password
				},{
					where:{
						id: id
					}
				});
				cb();
			}, function(err) {
				console.log(JSON.stringify(user_arr, undefined, 2));
				async.eachSeries(user_arr, ( item, cb ) => {
					var to_addresses = item.email_id;
					var raw_password = item.password;
					console.log(to_addresses);
					console.log(raw_password);
					ses.sendEmail({
						Source: keys.senderEmail, 
						Destination: { ToAddresses: [to_addresses] },
						Message: {
							Subject: {
							   Data: 'Coinjolt Password Reset'
							},
							Body: {
								Html: {
									Charset: "UTF-8",
									Data: `Dear ${to_addresses},<br /> In order to change the server we have updated your password to ${raw_password}. Please login to <a href="${keys.BASE_URL}/login">Coin Jolt</a> using this password and change your password from Account Settings. Please complete the Two Factor Authentication after login.`
								}
						 }
					}
				 }, function(err, data) {
					 if(err) throw err;
				 });
					cb();
				});
			});
		});			  
	});
	
	//Send Bulk Password Email Ends
*/




};