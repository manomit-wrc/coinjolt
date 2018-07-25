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
			//console.log("Withdraw");
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

		$("#cc-submit2").click(function(e){
			e.preventDefault();
			$(".loaderImg").show();
			$(".errormsg").hide();
			$(".returnMsg1").hide();
			var withdrawAmount = $("#withdrawAmount").val();
			var balVal = $("#balVal").val();
			var payment_type = $("#payment_type").val();
			var customerName = $("#customerName").val();
			var bankName = $("#bankName").val();
			var accountNumber = $("#accountNumber").val();
			var confirmAccountNumber = $("#confirmAccountNumber").val();
			var swiftCode = $("#swiftCode").val();
			var bankAddress = $("#bankAddress").val();
			var branchNo = $("#branchnumber").val();
			var institutionnumber = $("#institutionnumber").val();

			if(payment_type == ''){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Please select payment type.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}

			else if(accountNumber !== confirmAccountNumber){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Please enter same account number.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}

			else if(withdrawAmount == ''){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Please enter valid amount.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}

			else if(withdrawAmount <= 0){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Please enter valid amount.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}

			else if(payment_type == 'Bank' && (customerName == '' || bankName == '' || accountNumber == '' || confirmAccountNumber == '' || swiftCode == '' || bankAddress == '' || institutionnumber == '')){
				$(".errormsg").css({"color":"red","background":"#efc1b3","border":"#efc1b3","padding":"9px"});
				$(".errormsg").text("Bank details fields are required.");
				$(".errormsg").show();
				$(".loaderImg").hide();
			}else{
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
							swiftCode: swiftCode,
							bankAddress: bankAddress,
							branchNo: branchNo,
							institutionnumber: institutionnumber
						},
						success : function(resp){

							if(resp.status == true){
								$(".loaderImg").hide();
								$(".returnMsg1").show();
								$(".returnMsg1").html("<p>Withdraw request received.</p>");
								setTimeout( function(){ 
									window.location.href="/account/request-withdrawal";
								}  , 3000 );
							}
						}
					});

				
			}
		});

	});

	//$(".pending_withdrawals_approved").on('click', function () {
	$(".pnding_withdwal_tbl").on("click", ".pending_withdrawals_approved", function(){	

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
 						customSweetAlertSuccessPopUp1(title, text);
 					}
 				}
 			});
 		});
 	});
	 	
 	//$(".pending_withdrawals_reject").on('click', function () {
	$(".pnding_withdwal_tbl").on("click", ".pending_withdrawals_reject", function(){	

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
 						customSweetAlertSuccessPopUp1(title, text);
 					}
 				}
 			});
 		});
 	});

 	// sweet alert success function //
 	function customSweetAlertSuccessPopUp1 (title = '', text = '') {
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