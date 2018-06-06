"use_strict";

/* 
* Creating Nodejs PayPal Integration application
* @author Manomit Mitra
*/

const paypal = require('paypal-rest-sdk');

var config = {
    "port" : 8080,
    "api" : {
      "host" : "api.sandbox.paypal.com",
      "port" : "",            
      "client_id" : "",
      "client_secret" : ""
    }
}
paypal.configure(config.api);

const self = {

    payNow:function(paymentData,callback){
		var response ={};
		/* Creating Payment JSON for Paypal starts */
		const payment = {
			"intent": "sale",
			"payer": {
				"payment_method": "paypal"
			},
			"redirect_urls": {
				"return_url": "http://localhost:8080/execute",
				"cancel_url": "http://localhost:8080/cancel"
			},
			"transactions": [{
				"amount": {
					"total": 10.00,
					"currency": "USD"
				},
				"description": "Testing purpose only"
			}]
		};
		/* Creating Payment JSON for Paypal ends */

		/* Creating Paypal Payment for Paypal starts */
		paypal.payment.create(payment, function (error, payment) {
			if (error) {
				console.log(error);
			} else {
		    	if(payment.payer.payment_method === 'paypal') {
		    		response.paymentId = payment.id;
		    		var redirectUrl;
		    		response.payment = payment;
		    		for(var i=0; i < payment.links.length; i++) {
		    			var link = payment.links[i];
		    			if (link.method === 'REDIRECT') {
		    				redirectUrl = link.href;
		    			}
		    		}
		    		response.redirectUrl = redirectUrl;
		    	}
		    }
		    /* 
		    * Sending Back Paypal Payment response 
		    */
		    callback(error,response);
		});
		/* Creating Paypal Payment for Paypal ends */		
    },

    getResponse:function(data,PayerID,callback){

		var response = {};
		console.log(data.paymentId,"Payment id");
		const serverAmount = 10.00;
		const clientAmount = 10.00;
		const paymentId = data.paymentId;
		const details = {
			"payer_id": PayerID 
		};

		response.userData= {
			userID : PayerID,
			name : "Nilesh"
		};

		if (serverAmount !== clientAmount) {
			response.error = true;
			response.message = "Payment amount doesn't matched.";
			callback(response);
		} else{
			
			paypal.payment.execute(paymentId, details, function (error, payment) {
                console.log(payment);
				if (error) {
					console.log(error);
					response.error = false;
					response.message = "Payment Successful.";
					callback(response);
				} else {

					/*
					* inserting paypal Payment in DB
					*/

					/************* End  *******/
				};
			});
		};
    }
   
}
module.exports = self;