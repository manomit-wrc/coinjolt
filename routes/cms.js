const sequelize = require('sequelize');
module.exports = function (app, models) {
    app.get('/admin/cms/terms-of-service', (req, res) =>{

        models.cms_terms_of_service.find({}).then(function(terms_of_service){
            // fetch prev. inserted rec id , then load data
            res.render('admin/cms/terms_of_service',{layout: 'dashboard', terms_of_service: terms_of_service});
        });
    });

    app.post('/admin/submit-terms-of-service', (req, res) =>{

        models.cms_terms_of_service.findAndCountAll({
            order: [
                sequelize.fn('max', sequelize.col('id'))
            ]
        }).then(function(results){
            console.log(results);
            var terms_id = results.rows[0].id;
            
            //console.log('Terms id: ', terms_id); 
            var count = results.count;
            if(count >0){
                models.cms_terms_of_service.update({
                    terms_of_service_header_desc: req.body.banner_image_title,
                    terms_of_service_content: req.body.terms_of_service_description

                }, {
                    where: {
                        id: terms_id
                    }
                }).then(function(result){
                    res.json({
                        status:true,
                        msg: "Terms of Service Modified Successfully"
                    });
                });
            }
            else{
                models.cms_terms_of_service.create({
                    terms_of_service_header_desc: req.body.banner_image_title,
                    terms_of_service_content: req.body.terms_of_service_description
                }).then(function(result){
                    res.json({
                        status:true,
                        msg: "Terms of Service Added Successfully"
                    });
                });
            }
        });


        
        
    });

};