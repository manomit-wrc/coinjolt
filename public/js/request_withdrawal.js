$(document).ready(function(){
		$("#request-withdrawal-table").DataTable();

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

				console.log("action=withdrawCoin&withdrawAmount="+withdrawAmount+"&balVal="+balVal);

				$(".errormsg").hide();
				$.ajax({
					type : "POST",
					url  :  "/withdraw-amount",
					data : {
						withdrawAmount: withdrawAmount,
						type: payment_type
					},
					success : function(resp){
						console.log(resp);
						return false;

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