const sequelize = require('sequelize');
const acl = require('../middlewares/acl');
module.exports = function (app, models) {
    app.get('/admin/blog-categories', (req, res) =>{
        models.blog_category.findAll({}).then(categoryDetails => {
            res.render('admin/blog/category_list', { layout: 'dashboard', categoryDetails: categoryDetails});
		});
    });

    app.get('/admin/add-blog-category', (req, res) =>{
        res.render('admin/blog/category_create', { layout: 'dashboard'});
    });

    app.get('/admin/edit_blog_category/:categoryId', (req, res) =>{
        var categoryId = req.params.categoryId;

        models.blog_category.findAll({ where: { id : categoryId}}).then(categoryDetail => {
            res.render('admin/blog/category_edit', { layout: 'dashboard', categoryDetail: categoryDetail});
            
		});

    });

    app.post('/admin/post_blog_category', (req, res) =>{

        models.blog_category.create({
            category_name: req.body.category_title,
            status: req.body.cat_status

        }).then(function(result){
            res.json({status: true, msg: "Post category created successfully"});
        });
    });

};