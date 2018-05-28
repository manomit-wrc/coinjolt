	$(document).ready(function(){
		$("#request-withdrawal-table").DataTable({
			'aaSorting': []
		});
		$("#pending_transactions_table").DataTable({
			'aaSorting': []
		});
		$("#pending_withdrawals_table").DataTable({
			'aaSorting': []
		});
		$("#pending_investments_table").DataTable({
			'aaSorting': []
		});
		$("#all_question_table").DataTable({
			'aaSorting': []
		});

		$("#cc-submit1").prop("disabled", "disabled");

		$("#customerName,#bankName,#accountNumber,#ifsc,#swiftCode,#bankAddress").keyup(function(){
			$(".errormsg").empty();
			$(".errormsg").hide();
		});

		$("#withdrawAmount").keyup(function(){
			console.log("Withdraw");
			var balVal = $("#balVal").val();
			var amtVal = $("#withdrawAmount").val();
			amtVal = parseFloat(amtVal);
			$(".errormsg").empty();
			$(".errormsg").hide();
			if($("#withdrawAmount").val() != ''){
				if(amtVal>balVal){
					$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
					$(".errormsg").text("Amount exceeds currency balance.");
					$(".errormsg").show();
					$("#cc-submit1").prop("disabled", "disabled");
				}else if(!$.isNumeric($("#withdrawAmount").val())){
					$(".errormsg").show();
					$("#cc-submit1").prop("disabled", "disabled");
					$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
					$(".errormsg").append("Please enter a valid number.");
				}else{
					$("#cc-submit1").removeAttr("disabled");
					$(".errormsg").hide();
				}
			}
		});
		$("#payment_type").change(function(){
			$(".errormsg").hide();
			$(".errormsg").empty();
			var payvalue = $(this).val();
			if(payvalue == "Bank"){
				$(".bank_details").slideDown("slow");
			}else{
				$(".bank_details").slideUp("slow");
			}
		});
		$("#payment_type").change(function(){
			$(".errormsg").hide();
			$(".errormsg").empty();
			var payvalue = $(this).val();
			if(payvalue == "Check"){
				$(".check").slideDown("slow");
			}else{
				$(".check").slideUp("slow");
			}
		});
	});

	$(document).ready(function(){	

		$("#cc-submit1").click(function(e){
			e.preventDefault();
			var dataString;
			$(".loaderImg").show();
			$(".errormsg").hide();
			$(".returnMsg1").hide();
			var withdrawAmount = $("#withdrawAmount").val();
			var balVal = $("#balVal").val();
			var payment_type = $("#payment_type").val();
			var customerName = $("#customerName").val();
			var bankName = $("#bankName").val();
			var accountNumber = $("#accountNumber").val();
			var ifsc = $("#ifsc").val();
			var swiftCode = $("#swiftCode").val();
			var bankAddress = $("#bankAddress").val();

			if(payment_type == ''){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Please select payment type.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}else if(payment_type == 'Bank' && (customerName == '' || bankName == '' || accountNumber == '' || ifsc == '' || swiftCode == '' || bankAddress == '')){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Bank details fields are required.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}else{
				dataString = "action=withdrawCoin&withdrawAmount="+withdrawAmount+"&balVal="+balVal+"&payment_type="+payment_type+"&customerName="+customerName+"&bankName="+bankName+"&accountNumber="+accountNumber+"&ifsc="+ifsc+"&swiftCode="+swiftCode+"&bankAddress="+bankAddress;

				$(".errormsg").hide();
				$.ajax({
					type : "POST",
					url  :  "/withdraw-amount",
					data : {
						withdrawAmount: withdrawAmount,
						type: payment_type,
						customerName: customerName,
						bankName: bankName,
						accountNumber: accountNumber,
						ifsc: ifsc,
						swiftCode: swiftCode,
						bankAddress: bankAddress
					},
					success : function(resp){
						// console.log(resp);
						// return false;

						if(resp == 1){
							$(".loaderImg").hide();
							$(".returnMsg1").show();
							$(".returnMsg1").html("<h3 class='msg'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>Withdraw request received.</h3>");
							setTimeout( function(){ 
								window.location.href="https://coinjolt.com/dashboard/request-withdrawal";
							}  , 3000 );
						}else if(resp == 0){
							$(".loaderImg").hide();
							$(".returnMsg1").show();
							$(".returnMsg1").html("<h3 class='errorMsg'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>Please try again.</h3>");
							return;
							setTimeout( function(){ 
								window.location.href="https://coinjolt.com/dashboard/request-withdrawal";
							}  , 3000 );
						}else if(resp == 2){
							$(".loaderImg").hide();
							$(".returnMsg1").show();
							$(".returnMsg1").html("<h3 class='errorMsg'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>Please enter valid amount.</h3>");
							setTimeout( function(){ 
								window.location.href="https://coinjolt.com/dashboard/request-withdrawal";
							}  , 3000 );
						}
					}
				});
			}
		});

	});

	$(".pending_withdrawals_approved").on('click', function () {
 		var row_id = $(this).data('value');
 		var amount = $(this).data('amount');
 		var user_id = $(this).data('user_id');
 		var wtype = $(this).data('wtype');
 		swal({
 			title: "Transaction Confirmation",
 			text: "Are you sure you want to accept this withdrawal request?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax ({
 				type: "POST",
 				url : "/pending-withdrawals-approved",
 				data :{
 					row_id: row_id,
 					amount: amount,
 					user_id: user_id,
 					wtype: wtype
 				},
 				success : function (response) {
 					if (response.status == true) {
 						var title = "Approval Successful";
 						var text = "You have successfully approved the withdrawal request.";
 						sweetAlertSuccessPopUp(title, text);
 					}
 				}
 			});
 		});
 	});

 	$(".pending_withdrawals_reject").on('click', function () {
 		var row_id = $(this).data('value');
 		var amount = $(this).data('amount');
 		swal({
 			title: "Transaction Confirmation",
 			text: "Are you sure you want to reject this withdrawal request?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax({
 				type: "POST",
 				url: "/pending-withdrawals-reject",
 				data:{
 					row_id: row_id
 				},
 				success : function (response) {
 					if (response.status == true) {
 						var title = "Rejection Successful";
 						var text = "You have successfully reject the withdrawal request.";
 						sweetAlertSuccessPopUp(title, text);
 					}
 				}
 			});
 		});
 	});

 	// sweet alert success function //
 	function sweetAlertSuccessPopUp (title = '', text = '') {
        swal({
            title: title,
            text: text,
            type: "success",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "OK"
        },  function() {
            window.location.reload();
        });
    }