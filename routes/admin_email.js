module.exports = function (app, email_template){
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
		res.render('admin/email/email_marketing',{layout: 'dashboard'});
	});
};