var keys = require('../config/key');

module.exports = function (app, email_template, User, AWS, send_email) {
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
			email_template.findAll({
				where:{
					status:1
				}
			}).then(function(result1){
				if(result1){
					res.render('admin/user/send_email',{layout:'dashboard', userDetails:result, allEmailTemplate:result1})
				}
			});
		});
	});

	app.post('/admin/send-email', (req,res) => {
		var admin_email = 'support@coinjolt.com';
		var user_email = req.body.user_email;
		var subject = req.body.subject;
		var description = req.body.description;
		var user_id = req.body.user_id;

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
		           	Html: {
		           		Charset: "UTF-8",
		               	Data: description
		           	}
		        }
		   }
		}, function(err, data) {
	    	if(err) throw err;

	    	send_email.create({
	    		user_id: user_id,
	    		email_sub: subject,
	    		email_desc: description,
	    		send_by_id: req.user.id,
	    		email_template_id: req.body.email_template_id
	    	}).then(function(result) {
	    		if(result){
	    			res.json({
						status: true,
						msg: "Email send to the user successfully."
					});
	    		}
	    	});
		});
	});

	app.post('/admin/get-email-template-description', (req,res) => {
		email_template.findById(req.body.template_id,{

		}).then(function (result) {
			res.json({
				status: true,
				msg:result.template_desc
			});
		});
	});

	app.get('/admin/send-email-history-list', (req,res) => {
		send_email.belongsTo(User, {foreignKey: 'user_id'});
		send_email.belongsTo(email_template, {foreignKey: 'email_template_id'});

		send_email.findAll({
			order: [
            	['id', 'DESC']
        	],
	  		include: [
		    {
		     model: User
		    },
		    {
		     model: email_template
		    }
		   ]
		}).then(function (result) {
			res.render('admin/user/send_email_history',{layout:'dashboard', allData:result});
		});
	});

	app.post('/admin/send-email-details', (req,res) => {
		send_email.belongsTo(User, {foreignKey: 'user_id'});
		send_email.belongsTo(email_template, {foreignKey: 'email_template_id'});

		send_email.findById(req.body.email_send_id,{
	  		include: [
		    {
		     model: User
		    },
		    {
		     model: email_template
		    }
		   ]
		}).then(function (result) {
			res.json({
				status: true,
				data: result
			});
		});
	});

	app.post('/admin/send-multiple-email', async (req,res) => {
		var all_user_ids = req.body.checked_ids;
		var tempArray = [];
		var tempArrayId = [];

		for(var i = 0; i < all_user_ids.length; i++){
			var id = all_user_ids[i];
			await User.findById(id,{
			}).then(function (result) {
				tempArray.push(result.email);
				tempArrayId.push(result.id);
			});
		}

		await email_template.findAll({
			where:{
				status:1
			}
		}).then(function(result1){
			res.json({
				status: true,
				all_email_id: tempArray.toString(),
				email_template: result1,
				allIds: tempArrayId.toString()
			});
		});
	});

	app.post('/admin/send-multiple-email-to-user', (req,res) => {
		var subject = req.body.subject;
		var description = req.body.description;

		var user_email = req.body.user_email;
		var array_email = user_email.split(",");
		

		var ses = new AWS.SES({apiVersion: '2010-12-01'});
		ses.sendEmail({
		   	Source: keys.senderEmail, 
		   	Destination: { ToAddresses: array_email },
		   	Message: {
		       	Subject: {
		          	Data: subject
		       	},
		       	Body: {
		           	Html: {
		           		Charset: "UTF-8",
		               	Data: description
		           	}
		        }
		   }
		}, function(err, data) {
	    	if(err) throw err;

	    	res.json({
	    		status: true
	    	});
		});
	});

	app.post('/admin/entery-to-db-after-send-multipleEmail', (req,res) => {
		var user_ids = req.body.all_user_ids;
		var subject = req.body.subject;
		var description = req.body.description;

		var total_send = 0;
		var user_email = req.body.user_email;
		arr = user_ids.split(',');

		for(var i = 0; i < arr.length; i++){
			send_email.create({
	    		user_id: arr[i],
	    		email_sub: subject,
	    		email_desc: description,
	    		send_by_id: req.user.id,
	    		email_template_id: req.body.email_template_id
	    	});
    			
			if(i == arr.length - 1) {
				res.json({
					status: true,
					msg: "Email send to the user successfully."
				});
			}
		}
		
	});
};