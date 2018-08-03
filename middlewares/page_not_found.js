module.exports = (req, res, next) => {
     let error = new Error(),
      locals = {
        title: 'Page Not Found',
        description: 'The Page you looking for not found',
        error: error
      };

      res.status = 404;
      res.render('error', locals);

};
