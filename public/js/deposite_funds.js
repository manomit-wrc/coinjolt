// const paypal = require('paypal-rest-sdk');

// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': 'AUATycL0pSdb7ivwQB2fBA8w-rTO68U_GwxTfVhg4U7DisEnADJ1KBisL1DJkwlbaH59BVBx8SDhHUNN',
//     'client_secret': 'EPLeyHfz7ZBN304lgZT3NDHiLCjnKJpOnWpFyrTIXi9WF8bcbyU2Bky39FRzaDVDiUm64GAo7O1ZRVQo'
// });

$(document).ready(function (e) {
	$("#showing_warning").hide();

	$( ".labelsetfield" ).focus(function() {
		$(".labelset").show();
		var classname = $(this).attr('name');
		var showclassname = "."+classname;
		$(showclassname).show();
		$(this).css("padding-top", "22px");
	});

	$('#usd_amount').on('keypress', function (event) {
		var charCode = (event.which) ? event.which : event.keyCode
		if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
			return false;
		return true;
	});

	$('#cardnumber').on('keypress', function (event) {
		var charCode = (event.which) ? event.which : event.keyCode
		if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
			return false;
		return true;
	});

	$('#cvv').on('keypress', function (event) {
		var charCode = (event.which) ? event.which : event.keyCode
		if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
			return false;
		return true;
	});

	$("#deposit_funds_bwt").prop("disabled", "disabled");
	$("#usd_amount").keyup(function(){
		$(".expected").css({"background":"#ffffff","border":"#ffffff"});
		var enterval = $(this).val();

		var current_cad_to_usd_rate = $("#cadtousdcoinRate").val();
		var new_amount = parseFloat(enterval*current_cad_to_usd_rate);
		
		$("#amount").val(enterval);

		if(enterval == 0){
			$(".expected").hide();
			$(".expecteder").show();
			$(".expecteder").empty();
			$(".expecteder").append("Enter a valid number.");
		}
		else if(enterval < 1){
			$(".expected").hide();
			$(".expecteder").show();
			$(".expecteder").empty();
			$(".expecteder").append("Deposit amount must be at least $1.");
		}
		else{
			$(".expecteder").hide();
			$("#sq_amount").val(new_amount);

			$("#deposit_funds_bwt").removeAttr("disabled");
			$("#paypalsubmitbtn").removeAttr("disabled");
			$("#sq-creditcard").removeAttr("disabled");
		}
	});

	$( "#deposit_type" ).change(function() {
		$("#selecterror").hide();
		$("#select#deposit_type").css('border','1px solid #999');
		var selectedpayment = $("#deposit_type").val();
		if( selectedpayment =='1'){
			$("#1").show();
			$(".personal-info").show();
			$("#wr-transfer").hide();
		}else if( selectedpayment =='2'){
			$("#wr-transfer").show();
			$("#1").hide();
			$(".personal-info").hide();
		}
		else{
			$("#1").hide();
			$("#deposit_funds_bwt").show();
			$(".personal-info").hide();
			$("#wr-transfer").hide();
		}
	});

	$("#deposit_funds_bwt").on('click', function (e) {
      	var deposit_type = $("#deposit_type").val();

      	if(deposit_type == 1){
			$(".paymentErrorMsg").hide();
      		var amount = $('#usd_amount').val(); 
      		var card_number = $.trim($('#cardnumber').val());
      		var cardexpmonth = $('#cardexpmonth').val();
      		var cardexpyear = $('#cardexpyear').val();
      		var cvv = $('#cvv').val();

      		//user details
      		var firstname = $("#firstname").val();
      		var lastname = $("#lastname").val();
      		var email = $("#email").val();
      		var phone = $("#phone").val();
      		var dob = $("#dob").val();
      		var address = $("#address").val();
      		var city = $("#city").val();
      		var state = $("#state").val();
      		var postcode = $("#postcode").val();
			var country = $("#country").val();
			var userID = $("#userId").val();
			//end
			console.log('dob');
			console.log(dob);
			
			if(amount == ''){
				$(".creditCardFormErrorMsg").show();
				$('#usd_amount').focus();
      			return false;
			}

      		if(card_number == ''){
				$(".creditCardFormErrorMsg").show();
				$('#cardnumber').focus();
      			return false;
      		}
      		if(cvv == ''){
				$(".creditCardFormErrorMsg").show();
				$('#cvv').focus();
      			return false;
      		}

      		 if(amount !='' && card_number != '' && cvv!='' && firstname != '' && lastname != '' && email!='' && phone!='' && dob!='' && address!='' && city!='' && state!='' && postcode!='' && country!=''){
				$(".creditCardFormErrorMsg").hide();
				$.ajax({
					type : "POST",
					url : "/ecorepay-payment",
					data: {
						firstname: firstname,
						lastname: lastname,
						email: email,
						phone: phone,
						dob: dob,
						address: address,
						city: city,
						state: state,
						postcode: postcode,
						country: country,
						card_number: card_number,
						cardexpmonth: cardexpmonth,
						cardexpyear: cardexpyear,
						cvv: cvv,
						amount: amount,
						userID: userID
					},
					beforeSend:function(){
						$(".loader_gif").show();
					},
					success : function(response){
						$(".loader_gif").hide();
						//console.log(response);
						if(response.success === 'true'){
							
							$.ajax({
									type : "POST",
									url : "/credit-card-add",
									data: {
										amount: amount,
										card_number: card_number,
										cardexpmonth: cardexpmonth,
										cardexpyear: cardexpyear,
										cvv: cvv
									},
									success : function(resp){
										if(resp.status == true){
											swal({
												title: "Thank You",
												text: resp.message,
												type: "success",
												confirmButtonColor: "#DD6B55",
												confirmButtonText: "OK"
											},  function() {
												window.location.reload();
											});
										}
									}
							});
						}
					}
			
				});  	


      		
      		}else{
      			$("#showing_warning").show();
			  } 
			  
      	}else if(deposit_type == 2){  
			$(".paymentErrorMsg").hide();  
			var amount = $.trim($('#usd_amount').val());
			if(amount == ''){
				$('#exampleModalLong').modal('hide');
			}
			else if(amount <= 0){
				$('#exampleModalLong').modal('hide');
				$(".expecteder").show();
			}
			else{
				$("#totalamount").val("$" + amount);
				$("#pdf").hide();
				$('#success-animate').hide();
				$('#warning-animate').show();
				$('#close').hide();
				$(".expecteder").hide();
				$('#pdf').hide();
				$('#exampleModalLong').modal('show');
			}
      		
		  }else if(deposit_type == 3){

			var amount = $.trim($('#usd_amount').val());

			$.ajax({
				type : "POST",
				url : "/paypal",
				data: {
					amount: amount
				},
				beforeSend:function(){
					$(".loader_gif").show();
					$("#deposit_funds_bwt").prop('disabled', true);

				},
				success : function(response){
					$(".loader_gif").hide();
					$("#deposit_funds_bwt").prop('disabled', false);

					if(response.success === "1"){
						
						console.log(response.content);
						
						for(let i = 0;i < response.content.links.length;i++){
							if(response.content.links[i].rel === 'approval_url'){
								window.location.href = response.content.links[i].href;
							}
						}
					}
				}
		
			});

			// window.location.href = "/paypal";

		  }
		  else{
			$(".paymentErrorMsg").show();
			  $("#deposit_type").focus();
		  }
    });
    e.preventDefault();

    $("#deposite_funds_transfer_table").DataTable();
});

$('#ok').click(function(event){
	event.preventDefault();
	var usd_amount = $('#usd_amount').val();
	$('#success-animate').show();
	$('#warning-animate').hide();
	var amount = usd_amount;
	$("#totalamount").val("$" + amount);
	$('#close').show();
	$('#pdf').show();
	$('#ok').hide();
	var usd_amount = $('#usd_amount').val();
	$("#totalamount").val("$" + amount);

	//save value to the wire transfer table
	$.ajax({
		type : "POST",
		url : "/wiretransfer-add",
		data: {
			amount: amount,
			status: 0
		},
		beforeSend:function(){$(".loaderImg").show();},
		success : function(resp){
			$(".loaderImg").hide();
		}

	}); 
	//end

	$('#close').click(function(event){
		event.preventDefault();
		$("#totalamount").val("$" + amount);
		window.location.href="/account/deposit-funds";
	});
});

$("#usd_amount").blur(function(){
	var selectedeposit_type = $("#deposit_type").val();
	if( selectedeposit_type =='1'){
		var amt = $('#usd_amount').val();
		var interest = ((amt * 0) / 100);
		var newamt = (amt - interest);
		$(".expected").hide();
		$(".expecteder").show();
		$(".expecteder").empty();
		$(".expecteder").append("You will be charged the total amount of $" + newamt);
		$("#newamt").val(newamt);
	}
});


// $( "#deposit_funds_bwt" ).click(function(event) {
// 	$("#selecterror").hide();
// 	$("#select#deposit_type").css('border','1px solid #999');

// 	var selectpayment = $("#deposit_type").val();
// 	var temp ='';
// 	if( selectpayment =='Paypal' )
// 	{
// 		event.preventDefault();
// 		$( "#paypalform" ).submit();
// 	}
// 	else if( selectpayment =='1' )
// 	{
// 		event.preventDefault();

// 		var amount = $('#newamt').val();
// 		var fname = $('#firstname').val();
// 		var lname = $('#lastname').val();
// 		var email = $('#email').val();
// 		var phn = $('#phone').val();
// 		var dobs = $('#dob').val();
// 		var address = $('#address').val();
// 		var city = $('#city').val();
// 		var state = $('#state').val();
// 		var postcode = $('#postcode').val();
// 		var country = $('#country').val();
// 		var cardnumber = $('#cardnumber').val();
// 		var cardexpmonth = $('#cardexpmonth').val();
// 		var cardexpyear = $('#cardexpyear').val();
// 		var cvv = $('#cvv').val();

// 		var dob =  dobs.replace(/-/g, "");


// 		if (fname == '' || lname == '' || email == '' || phn == '' || dob == '' || address == '' || city == '' || state == '' || postcode == '' || country == '') {
// 			$('.ecore_error').html('Your personal details has not yet been completed in your account settings. <a style="color: #4165b4; font-weight: bold;" href="account-settings.php">Click here to update your information.</a>');
// 		} else if (cardnumber == '' || cardexpmonth == '' || cardexpyear == '' ||cvv == '') {
// 			$('.ecore_error').text('Please fill out all of the fields.');
// 		}
// 		else {
// 			$.ajax({
// 				type : "POST",
// 				url : "1/1.php",
// 				data: {amount:amount,fname: fname, lname: lname,email:email,phn:phn,dob:dob,add:address,city:city,state:state,postcode:postcode,country:country,cardno:cardnumber,cardexpmonth:cardexpmonth,cardexpyear:cardexpyear,cvv:cvv,userid:'1'},
// 				beforeSend:function(){$(".loaderImg").show();$(".ecore_error").text('');},
// 				success : function(resp){
// 					$(".loaderImg").hide();

// 					$('.ecore_res').text(resp);

// 				}
// 			});
// 		}

// 		var $inputs = $('#frm_deposit :input');
// 		$inputs.each(function() {
// 			var is_name = $(this).val();
// 			if(is_name){
// 				$(this).removeClass("invalid").addClass("valid");

// 			}
// 			else{
// 				$(this).removeClass("valid").addClass("invalid");
// 			}
// 		});

// 	}

// 	else if( selectpayment =='2' )
// 	{

// 		event.preventDefault();

// 		$(document).on("click","#deposit_funds_bwt",function() {
// 			var amount = $('#usd_amount').val();
// 			$("#totalamount").val("$" + amount);
// 			$('#success-animate').hide();
// 			$('#warning-animate').show();
// 			$('#close').hide();
// 			$('#pdf').hide();
// 			$('#exampleModalLong').modal('show');
// 		});

// 	}

// 	else
// 	{
// 		event.preventDefault();
// 		$(".loaderImg").hide();
// 		$("#selecterror").show();
// 		$("#select#deposit_type").css('border','1px solid red');
// 	}
// });