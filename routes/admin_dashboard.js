const sequelize = require('sequelize');
const Op = require('sequelize').Op;
module.exports = function (app) {
	app.get('/admin/dashboard', function (req, res) {
        res.render('admin/dashboard', {
            layout: 'dashboard'
        });
    });
};