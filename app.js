var express = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs");
var exphbs  = require('express-handlebars');
var port = 8080;
var app = express();
var path = require('path');
var flash    = require('connect-flash');

var models = require("./models");


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);



var passport = require('passport');


require('./config/passport')(passport, models.User);

// view engine setup
app.set('views', path.join(__dirname, 'views'));

var hbs = exphbs.create({
extname: '.hbs', //we will be creating this layout shortly
helpers: {
    if_eq: function (a, b, opts) {
        
        if (a == b) // Or === depending on your needs
            return opts.fn(this);
        else
            return opts.inverse(this);

    },
    inArray: function(array, value, block) {
      if (array.indexOf(value) !== -1) {
        return block.fn(this);

	    }
	    else {
	      return block.inverse(this);
	    }
    },

    for: function(from, to, incr, block) {
    	var accum = 0;
	    for(var i = from; i < to; i += incr)
	        accum += block.fn(i);
	    return accum;
	},
    total_price: function(v1, v2) {
      return v1 * v2;
    },
    ternary: (exp, ...a) => {
      return eval(exp);
    } ,
    eq: function (v1, v2) {
        return v1 == v2;
    },
    ne: function (v1, v2) {
        return v1 !== v2;
    },
    lt: function (v1, v2) {
        return v1 < v2;
    },
    gt: function (v1, v2) {
        return v1 > v2;
    },
    lte: function (v1, v2) {
        return v1 <= v2;
    },
    gte: function (v1, v2) {
        return v1 >= v2;
    },
    and: function (v1, v2) {
        return v1 && v2;
    },
    or: function (v1, v2) {

        return v1 || v2;

    },
    dateFormat: require('handlebars-dateformat'),
    inc: function(value, options) {
      return parseInt(value) + 1;
    },
    perc: function(value, total, options) {

        return Math.round((parseInt(value)/parseInt(total)*100)*100)/100;
    },
    img_src: function(value, options) {
      if (fs.existsSync("public/events/"+value) && value != "") {
        return "/events/"+value;
      }
      else {
        
        return "/admin/assets/img/pattern-cover.png";
      }
    },

    events: function() {
      return Event.find({}, { event_name: 1 }).map(function (event) {
        return event
      });
    },
    profile_src: function(value, options) {
      if (fs.existsSync("public/profile/"+value) && value != "") {
        return "/profile/"+value;
      }
      else {
        
        return "/admin/assets/img/pattern-cover.png";
      }

    },
    product_img: function(value, options) {
      if (fs.existsSync("public/product/"+value) && value != "") {
        return "/product/"+value;
      }
      else {
        
        return "/admin/assets/img/pattern-cover.png";
      }

    },
    formatCurrency: function(value) {
      return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
}

});
app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(cookieParser());


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(session({
	secret: 'W$q4=25*8%v-}UV',
	resave: true,
	saveUninitialized: true
 })); // session secret
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/index')(app, passport, models);

app.use(function(req, res, next){
  if (req.isAuthenticated())
  {

    //delete req.user.password;
    
    if (fs.existsSync("public/profile/"+req.user.image) && req.user.image != "") {
      res.locals.image = "/profile/"+req.user.image;
    }
    else {
     
      res.locals.image = "/profile/nobody.jpg";
    }
    if (fs.existsSync("public/id-proof/"+req.user.identity_proof) && req.user.identity_proof != "") {
      res.locals.identity_proof = "/id-proof/"+req.user.identity_proof;
    }
    else {
     
      res.locals.identity_proof = "javascript:void(0)";
    }
    if(req.user.user_name === null) {
      res.locals.reffer_link_id = req.user.id;
    }
    else {
      res.locals.reffer_link_id = req.user.user_name;
    }

    res.locals.user = req.user;

    if (fs.existsSync("public/currency_list/currency.txt")) {
      var currencyData = '';
      var currencyArray = [];
      fs.readFileSync("public/currency_list/currency.txt").toString().split("\n").forEach(function(line, index, arr) {
        if (index === arr.length - 1 && line === "") { return; }
          currencyData = line.split('-');
          currencyArray.push(currencyData);
      });
      res.locals.currencyList =  currencyArray;
    }	

    
    return next();
  }
  res.redirect('/');
});

require('./routes/dashboard')(app, models.Country, models.User, models.Currency);
require('./routes/deposit')(app, models.Deposit, models.WireTransfer, models.User);


app.listen(port);
console.log('The magic happens on port ' + port);


module.exports = app;