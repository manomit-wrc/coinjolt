var keys = require('../config/key');
var serialize = require('node-serialize');
var bcrypt = require('bcrypt-nodejs');
const acl = require('../middlewares/acl');
const Op = require('sequelize').Op;
const async = require('async');
module.exports = function (app, email_template, User, AWS, send_email, email_draft, Deposit, email_template_type){
	app.get('/admin/email-template', acl, (req,res) => {
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
					template_type: req.body.template_type // for registration template
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
					   template_type: req.body.template_type,
					   status: 1
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
				template_type: req.body.template_type // for registration template
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
				   status: 1,	
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
                res.redirect('/admin/email-template');
			}
		});
	});

	app.get('/admin/email-users', acl, (req,res) => {
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
				allSendEmail:result[1], allDraftEmail:result[2], allDepositUsers:result[3], title:"Email Users"});
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

	app.post('/admin/delete-send-email-details', acl , (req,res) =>{
		
		var send_email_id = req.body.sent_email_id;
		send_email.destroy({
		    where: {
		    	id: send_email_id
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

app.get('/admin/send-password-email', acl, (req,res) => {
	var user_arr = [];
	var ses = new AWS.SES({apiVersion: '2010-12-01'});
	

	User.findAll({
		where: {type:2},
		limit: 5,
		offset: 0
	}).then(results => {
		async.eachSeries(results, ( item, cb ) => {
			//console.log(JSON.stringify(item, undefined, 2));
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
			
			cb();
		}, function(err) {
			console.log(JSON.stringify(user_arr, undefined, 2));
			async.eachSeries(user_arr, ( item, cb ) => {
				var to_addresses = item.email_id;
				// var to_addresses = "tamashree@wrctpl.com";
				//var raw_password = item.password;
				console.log(to_addresses);
				//console.log(raw_password);

				var complete_mail_content = `
				<!DOCTYPE html>
				<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
				<head>
					<meta charset="utf-8"> <!-- utf-8 works for most cases -->
					<meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
					<meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
					<meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
					<title>Attention</title> <!-- The title tag shows in email notifications, like Android 4.4. -->
				
					<!-- Web Font / @font-face : BEGIN -->
					<!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->
				
					<!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
					<!--[if mso]>
						<style>
							* {
								font-family: Arial, sans-serif !important;
							}
						</style>
					<![endif]-->
				
					<!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
					<!--[if !mso]><!-->
					<link href="https://fonts.googleapis.com/css?family=Montserrat:300,500" rel="stylesheet">
					<!--<![endif]-->
				
					<!-- Web Font / @font-face : END -->
				
					<!-- CSS Reset -->
					<style>
				
					/* What it does: Remove spaces around the email design added by some email clients. */
					/* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
					html,
					body {
						margin: 0 auto !important;
						padding: 0 !important;
						height: 100% !important;
						width: 100% !important;
					}
				
					/* What it does: Stops email clients resizing small text. */
					* {
						-ms-text-size-adjust: 100%;
						-webkit-text-size-adjust: 100%;
					}
				
					/* What it does: Centers email on Android 4.4 */
					div[style*="margin: 16px 0"] {
						margin:0 !important;
					}
				
					/* What it does: Stops Outlook from adding extra spacing to tables. */
					table,
					td {
						mso-table-lspace: 0pt !important;
						mso-table-rspace: 0pt !important;
					}
				
					/* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
					table {
						border-spacing: 0 !important;
						border-collapse: collapse !important;
						table-layout: fixed !important;
						margin: 0 auto !important;
					}
					table table table {
						table-layout: auto;
					}
				
					/* What it does: Uses a better rendering method when resizing images in IE. */
					img {
						-ms-interpolation-mode:bicubic;
					}
				
					/* What it does: A work-around for email clients meddling in triggered links. */
					*[x-apple-data-detectors],	/* iOS */
					.x-gmail-data-detectors, 	/* Gmail */
					.x-gmail-data-detectors *,
					.aBn {
						border-bottom: 0 !important;
						cursor: default !important;
						color: inherit !important;
						text-decoration: none !important;
						font-size: inherit !important;
						font-family: inherit !important;
						font-weight: inherit !important;
						line-height: inherit !important;
					}
				
					/* What it does: Prevents Gmail from displaying an download button on large, non-linked images. */
					.a6S {
						display: none !important;
						opacity: 0.01 !important;
					}
					/* If the above doesn't work, add a .g-img class to any image in question. */
					img.g-img + div {
						display:none !important;
					}
				
					/* What it does: Prevents underlining the button text in Windows 10 */
					.button-link {
						text-decoration: none !important;
					}
				
					/* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
					/* Create one of these media queries for each additional viewport size you'd like to fix */
					/* Thanks to Eric Lepetit @ericlepetitsf) for help troubleshooting */
					@media only screen and (min-device-width: 375px) and (max-device-width: 413px) { /* iPhone 6 and 6+ */
						.email-container {
							min-width: 375px !important;
						}
					}
				
				</style>
				
				<!-- Progressive Enhancements -->
				<style>
				
				/* What it does: Hover styles for buttons */
				.button-td,
				.button-a {
					transition: all 100ms ease-in;
				}
				.button-td:hover,
				.button-a:hover {
					background: #555555 !important;
					border-color: #555555 !important;
				}
				
				/* Media Queries */
				@media screen and (max-width: 480px) {
				
					/* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
					.fluid {
						width: 100% !important;
						max-width: 100% !important;
						height: auto !important;
						margin-left: auto !important;
						margin-right: auto !important;
					}
				
					/* What it does: Forces table cells into full-width rows. */
					.stack-column,
					.stack-column-center {
						display: block !important;
						width: 100% !important;
						max-width: 100% !important;
						direction: ltr !important;
					}
					/* And center justify these ones. */
					.stack-column-center {
						text-align: center !important;
					}
				
					/* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
					.center-on-narrow {
						text-align: center !important;
						display: block !important;
						margin-left: auto !important;
						margin-right: auto !important;
						float: none !important;
					}
					table.center-on-narrow {
						display: inline-block !important;
					}
				
					/* What it does: Adjust typography on small screens to improve readability */
					.email-container p {
						font-size: 17px !important;
						line-height: 22px !important;
					}
				}
				
				</style>
				
				<!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
					<!--[if gte mso 9]>
					<xml>
						<o:OfficeDocumentSettings>
							<o:AllowPNG/>
							<o:PixelsPerInch>96</o:PixelsPerInch>
						</o:OfficeDocumentSettings>
					</xml>
				<![endif]-->
				
				</head>
				<body width="100%" bgcolor="#F1F1F1" style="margin: 0; mso-line-height-rule: exactly;">
					<center style="width: 100%; background: #F1F1F1; text-align: left;">
				
						<!-- Visually Hidden Preheader Text : BEGIN -->
						<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family: sans-serif;">
							We have undergone a major platform upgrade.
					   </div>
					   <!-- Visually Hidden Preheader Text : END -->
				
						<!--
							Set the email width. Defined in two places:
							1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
							2. MSO tags for Desktop Windows Outlook enforce a 680px width.
							Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
						-->
						<div style="max-width: 680px; margin: auto;" class="email-container">
							<!--[if mso]>
							<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center">
							<tr>
							<td>
							<![endif]-->
				
							<!-- Email Body : BEGIN -->
							<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px;" class="email-container">
				
				
								<!-- HEADER : BEGIN -->
								<tr>
									<td bgcolor="#025fdf">
										<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
											<tr>
												<td style="padding: 10px 40px 10px 40px; text-align: center;">
													<img src="${keys.BASE_URL}dist/img/logo_email.png" width="200" height="45" alt="Logo" border="0" style="height: auto; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; filter: invert(100%);">
												</td>
											</tr>
										</table>
									</td>
								</tr>
								<!-- HEADER : END -->
				
								<!-- HERO : BEGIN -->
								<tr>
									<!-- Bulletproof Background Images c/o https://backgrounds.cm -->
									<td background="${keys.BASE_URL}dist/img/background.jpg" bgcolor="#222222" align="center" valign="top" style="text-align: center; background-position: center center !important; background-size: cover !important; padding: 50px;">
										<!--[if gte mso 9]>
										<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:380px; background-position: center center !important;">
										<v:fill type="tile" src="background.png" color="#222222" />
										<v:textbox inset="0,0,0,0">
									<![endif]-->
									<div>
											<!--[if mso]>
											<table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="500">
											<tr>
											<td align="center" valign="middle" width="500">
											<![endif]-->
											<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="max-width:500px; margin: auto;">
				
												<tr>
													<td height="20" style="font-size:20px; line-height:20px;">&nbsp;</td>
												</tr>
				
												<tr>
													<td height="20" style="font-size:20px; line-height:20px;">&nbsp;</td>
												</tr>
				
											</table>
											<!--[if mso]>
											</td>
											</tr>
											</table>
										<![endif]-->
									</div>
										<!--[if gte mso 9]>
										</v:textbox>
										</v:rect>
									<![endif]-->
								</td>
							</tr>
							<!-- HERO : END -->
				
							<!-- INTRO : BEGIN -->
							<tr>
								<td bgcolor="#ffffff">
									<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
										
										<tr>
											<td style="padding: 0 40px 20px 40px; font-family: sans-serif; font-size: 15px; line-height: 25px; color: #555555; text-align: left; font-weight:normal;">
											<p style="margin: 15px 0;">Dear users, clients and partners,<br><br>
				
													We have undergone a major platform upgrade.<br>
				
													First and foremost, all assets are secure and ZERO holdings are in jeopardy. We will be resuming business operations as usual very shortly.<br>
				
													In the meantime – you will need to update your password in order to access the new dashboard. This is for security purposes and to ensure your account remains safe.<br>
				
													You will find that the option for 2 factor authentication has been enabled in the back office. Users are able to switch this feature on and off as they please. <br>
				
													If you are unfamiliar with Google Authentication, refer to these pages for <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en_CA">Android</a> or <a href="https://itunes.apple.com/ca/app/google-authenticator/id388497605?mt=8">iPhone</a>.<br>
				
													We will also be enabling SMS verification in the upcoming days for additional measures of security.<br>
				
													There will be some finalizations made in the upcoming days as the system was designed to be incredibly robust with multiple layers of intelligence to prevent any breaches in security or DDoS attempts.<br>
				
													In the meantime, your patience and understanding is appreciated.<br>
				
												We hope you have a great rest of your day. There will be a follow up email very shortly.</p>
											</td>
										</tr>
										<tr>
											<td style="padding: 0px 40px 20px 40px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; text-align: left; font-weight:normal;">
												<p style="margin: 0;">Yours sincerely,</p>
											</td>
										</tr>
				
										<tr>
											<td align="left" style="padding: 0px 9px;">
				
												<table width="180" align="left">
													<tr>
														<td>
				
															<table width="" cellpadding="0" cellspacing="0" border="0">
															  <tr>
																<td align="left" style="font-family: sans-serif; font-size:14px; line-height:20px; color:#222222; font-weight:bold;" class="body-text">
																  <p style="font-family: 'Montserrat', sans-serif; font-size:14px; line-height:20px; color:#222222; font-weight:bold; padding:0; margin:0;" class="body-text">Coin Jolt Support</p>   
															  </td>               
														  </tr>                            
													  </table>
												  </td>                        
											  </tr>
										  </table>
									  </td>
								  </tr>
							  </table>
						  </td>
					  </tr>
					  <!-- INTRO : END -->
				
				  </table>
				  <!-- Email Body : END -->
				
							<!--[if mso]>
							</td>
							</tr>
							</table>
						<![endif]-->
					</div>
				
				</center>
				</body>
				</html>
                                `;

				ses.sendEmail({
					Source: keys.senderEmail, 
					Destination: { ToAddresses: [to_addresses] },
					Message: {
						Subject: {
						   Data: 'Attention'
						},
						Body: {
							Html: {
								Charset: "UTF-8",
								Data: complete_mail_content
							}
					 }
				}
			 }, function(err, data) {
				 if(err) throw err;
				 console.log('Email sent');
			 });
				cb();
			});
		});
	});			  
});


};