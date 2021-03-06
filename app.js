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
const lodash = require('lodash');
var models = require("./models");
const keys = require('./config/key');
var AWS = require('aws-sdk');
const helmet = require('helmet');
require('dotenv').config({path: 'variables.env'});
AWS.config.update({region: 'us-east-1'});
// var BitGo = require('bitgo');
// var bitgo = new BitGo.BitGo({
//     env: 'test'
// });
// var accessToken;
app.use(helmet());
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
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

require('./config/passport')(passport, models.User, models.Deposit, models.Currency, models, AWS);

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
    if_neq: function (a, b, opts) {
      if (a != b) // Or === depending on your needs
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
    },
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
        return Math.round((parseInt(value) / parseInt(total) * 100) * 100) / 100;
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
    },
    twoDecimalPoint: function(value){
        return parseFloat(Math.round(value * 100) / 100).toFixed(2);  
    },
    fiveDecimalPoint: function(value){
      return parseFloat(Math.round(value * 100) / 100).toFixed(5);
    },
    nFormatter: function (num, digits) {
      var si = [{
          value: 1,
          symbol: ""
        },
        {
          value: 1E3,
          symbol: "k"
        },
        {
          value: 1E6,
          symbol: "M"
        },
        {
          value: 1E9,
          symbol: "B"
        },
        {
          value: 1E12,
          symbol: "T"
        },
        {
          value: 1E15,
          symbol: "P"
        },
        {
          value: 1E18,
          symbol: "E"
        }
      ];
      var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var i;
      for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
          break;
        }
      }
      return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    },
    toLowerCase: function(value){
      return value.toLowerCase();
    },
    toUpperCase: function(value){
      return value.toUpperCase();
    },
    checkCurrencies: function(value, arr) {
      var tempArr = lodash.filter(arr, x => x.Currency.alt_name === value);
      //return tempArr.length > 0 ? tempArr[0].balance : '';
      return tempArr.length > 0 ? tempArr[0].balance : '0.00';
    },
    checkAnswer: function(value, arr) {
      var tempArr = lodash.filter(arr, x => x.option_id === value);
      return tempArr.length > 0 ? true : false;
    },
    getUploadedFileExtension: function(value){

      if(value != null){
        return value.substr(value.lastIndexOf('.') + 1);
      }
      
    },

    multiple_if: function(){
      const args = Array.prototype.slice.call(arguments, 0, -1);
      return args.every(function (expression) {
          return args[0] === expression;
      });
    },
    empty_array: function(arr, opts) {
      if (arr.length <= 0)
        return opts.fn(this);
      else
        return opts.inverse(this);
      
    },
    not_empty_array: function(arr, opts) {
      if (arr.length > 0)
        return opts.fn(this);
      else
        return opts.inverse(this);
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
	resave: false,
    saveUninitialized: true,
    cookie: {
        path: "/",
        maxAge: 1800000
    },
    name: "id",
    ttl: (1* 60* 60)
})); // session secret
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/index')(app, passport, models, models.User);

app.use(function(req, res, next){

  if (req.isAuthenticated())
  {
    //delete req.user.password;
    
    if(req.user.user_name === null) {
      res.locals.reffer_link_id = req.user.id;
    }
    else {
      res.locals.reffer_link_id = req.user.user_name;
    }
    if(req.user.image === null) {
      res.locals.image = "https://s3.amazonaws.com/coinjoltdev2018/profile/nobody.jpg";
    } else {
      res.locals.image = req.user.image;
    }
    
    res.locals.identity_proof = req.user.identity_proof;
    res.locals.investor_type = req.user.investor_type;
    res.locals.user = req.user;
    res.locals.base_url = keys.BASE_URL;

    return next();
  }
  res.redirect('/');
});

require('./routes/dashboard')(app, models.Country, models.User, models.Currency, models.Support,models.Deposit, models.Referral_data, models.withdraw, models.Question, models.Option, models.Answer, AWS, models.Kyc_details, models.portfolio_composition, models.currency_balance, models.shareholder, models.wallet, models.wallet_address, models.wallet_transaction, models.portfolio_calculation, models.blog_post, models.email_template, models.email_template_type, models.author, models.cold_wallet_balance, models.deposit_method_type, models.WireTransfer); 
require('./routes/deposit')(app, models.Deposit, models.WireTransfer, models.User, models.Referral_data,models.Currency,models.Country,models.deposit_method,models.deposit_method_type);
require('./routes/admin_dashboard')(app, models.Deposit, models.withdraw, models.User, models.Currency, models.Question, models.Option, models.Answer, models.currency_balance, models.send_email,models.deposit_method, models.company_setting, models.blog_post, models.blog_category, models.portfolio_composition, models.deposit_method_type, models.author);
require('./routes/request_withdrawal')(app, models.withdraw, models.bank_details, models.Deposit, models);
require('./routes/admin_kyc')(app, models.Kyc_details, models.User);
require('./routes/admin_support')(app, models.Support, models.User, AWS);
require('./routes/bitgo')(app,models);
require('./routes/admin_email')(app, models.email_template, models.User, AWS, models.send_email, models.email_draft, models.Deposit, models.email_template_type);
require('./routes/admin_all_user_list')(app, models.email_template, models.User, AWS, models.send_email);
require('./routes/admin_deposit_type')(app, models.deposit_method);
require('./routes/cms')(app, models);
require('./routes/admin_blog_posts')(app, models);
require('./routes/admin_blog_categories')(app, models);
require('./routes/admin_blog_author')(app, models);
require('./routes/erctoken')(app, models);
require('./routes/admin_currency_balances')(app, models);


app.listen(port);
console.log('The magic happens on port ' + port);

module.exports = app;
