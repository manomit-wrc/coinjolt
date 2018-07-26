$(document).ready(function() {
	$('#depositMethodErrMsg').delay(6000).fadeOut();

	$('#depositMethodSuccessMsg').delay(6000).fadeOut();

	$('.deposit_enable').on('click', function () {
        var deposit_id = $(this).val();

		swal({
 			title: "Deposit Type Enabling Confirmation",
 			text: "Are you sure you want to enable?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax ({
                type: "POST",
                url: '/admin/deposit-enable',
                data : {deposit_id: deposit_id},
 				success : function (response) {
 					if(response.status == true){
 						var title = "Depsoit Type enabled Successfully";
 						var text = "You have successfully enabled the deposit type";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
 		});
	});

	$('.deposit_disable').on('click', function () {
		var deposit_id = $(this).val();

		swal({
 			title: "Deposit Type Disabling Confirmation",
 			text: "Are you sure you want to disable?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax ({
                type: "POST",
                url: '/admin/deposit-disable',
                data : {deposit_id: deposit_id},
 				success : function (response) {
					if(response.status == false){
						var title = "Unable To Disable Depsoit Type";
						var text = "All deposit methods can not be disabled";
						sweetAlertFailurePopUp(title,text);
					}
 					if(response.status == true){
 						var title = "Depsoit Type disabled Successfully";
 						var text = "You have successfully disabled the deposit type";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
 		});
	});

	$('#ecorepayForm').css('display','block');
	$('#wireTransferForm').css('display','none');
	$('#paypalForm').css('display','none');

	$('#payment_type').change(function(){
		if($(this).val() == 1){
			$('#ecorepayForm').css('display','block');
			$('#wireTransferForm').css('display','none');
			$('#paypalForm').css('display','none');
		}else if($(this).val() == 2){
			$('#ecorepayForm').css('display','none');
			$('#wireTransferForm').css('display','block');
			$('#paypalForm').css('display','none');
		}
		else{
			$('#ecorepayForm').css('display','none');
			$('#wireTransferForm').css('display','none');
			$('#paypalForm').css('display','block');
		}
	});

	$("#add_payment_method_form").validate({
		rules: {
			paypal_client_secret: {
				required: true
			},
			paypal_client_id: {
				required: true
			},
			ecorepay_account_id: {
				required: true
			},
			ecorepay_auth_id: {
				required: true
			},
			bank_name: {
				required: true
			},
			account_name: {
				required: true
			},
			bank_address: {
				required: true
			},
			branch_number: {
				required: true
			},
			institution_number: {
				required: true
			},
			account_number: {
				required: true
			},
			routing_number: {
				required: true
			},
			swift_code: {
				required: true
			},
			reference_email: {
				required: true,
				email: true
			}
		},
		messages: {
			paypal_client_secret: {
				required: "Please Enter Paypal Client Secret Code"
			},
			paypal_client_id: {
				required: "Please Enter Paypal Client Id"
			},
			ecorepay_account_id: {
				required: "Please Enter Ecorepay Account Id"
			},
			ecorepay_auth_id: {
				required: "Please Enter Ecorepay Authentication Id"
			},
			bank_name: {
				required: "Please Enter Bank Name"
			},
			account_name: {
				required: "Please Enter Account Name"
			},
			bank_address: {
				required: "Please Enter Bank Address"
			},
			branch_number: {
				required: "Please Enter Branch Number"
			},
			institution_number: {
				required: "Please Enter Institution Number"
			},
			account_number: {
				required: "Please Enter Account Number"
			},
			routing_number: {
				required: "Please Enter Routing Number"
			},
			swift_code: {
				required: "Please Enter Swift Code"
			},
			reference_email: {
				required: "Please enter a valid email",
				email: "Invalid email address"
			}
		}
	});

	$("#edit_payment_method_form").validate({
		rules: {
			edit_paypal_client_secret: {
				required: true
			},
			edit_paypal_client_id: {
				required: true
			},
			edit_ecorepay_account_id: {
				required: true
			},
			edit_ecorepay_auth_id: {
				required: true
			},
			edit_bank_name: {
				required: true
			},
			edit_account_name: {
				required: true
			},
			edit_bank_address: {
				required: true
			},
			edit_branch_number: {
				required: true
			},
			edit_institution_number: {
				required: true
			},
			edit_account_number: {
				required: true
			},
			edit_routing_number: {
				required: true
			},
			edit_swift_code: {
				required: true
			},
			edit_reference_email: {
				required: true,
				email: true
			}
		},
		messages: {
			edit_paypal_client_secret: {
				required: "Please Enter Paypal Client Secret Code"
			},
			edit_paypal_client_id: {
				required: "Please Enter Paypal Client Id"
			},
			edit_ecorepay_account_id: {
				required: "Please Enter Ecorepay Account Id"
			},
			edit_ecorepay_auth_id: {
				required: "Please Enter Ecorepay Authentication Id"
			},
			edit_bank_name: {
				required: "Please Enter Bank Name"
			},
			edit_account_name: {
				required: "Please Enter Account Name"
			},
			edit_bank_address: {
				required: "Please Enter Bank Address"
			},
			edit_branch_number: {
				required: "Please Enter Branch Number"
			},
			edit_institution_number: {
				required: "Please Enter Institution Number"
			},
			edit_account_number: {
				required: "Please Enter Account Number"
			},
			edit_routing_number: {
				required: "Please Enter Routing Number"
			},
			edit_swift_code: {
				required: "Please Enter Swift Code"
			},
			edit_reference_email: {
				required: "Please enter a valid email",
				email: "Invalid email address"
			}
		}
	});

	$('#dmethods_table').on('click', '.deletePaymentMethod', function(){
		var paymentMethodId = $(this).data('id');
		swal({
			title: "Confirmation of Removal",
			text: "Are you sure to delete this record?",
			type: "warning",
			showCancelButton: true,
			confirmButtonClass: "btn-danger",
			confirmButtonText: "Confirm",
			cancelButtonText: "Cancel",
			closeOnConfirm: false,
			closeOnCancel: false,
			customClass: 'swal-wide'
		},
		function(isConfirm) {
			if (isConfirm) {
				swal({
					title: "Success",
					text: "You successfully deleted deposit method.",
					type: "success"
				},
				function(isConfirm) {
					if (isConfirm) {
						$.ajax({
							type: "POST",
							url: '/admin/remove_deposit_method',
							data: {paymentMethodId: paymentMethodId},
							success: function (response) {
								if(response.status == true){
									location.href = '/admin/deposit-options';
								}
							}
						});
					}
				});

			} else {
				swal("Cancelled", "You cancelled the deletion.", "error");
			}
		});
	});

	// sweet alert success function //
 	function sweetAlertSuccessPopUp (title='',text='') {
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
	
	function sweetAlertFailurePopUp (title='',text='') {
        swal({
            title: title,
            text: text,
            type: "error",
            //confirmButtonColor: "#DD6B55",
			//confirmButtonText: "OK",
			icon: "warning",
			buttons: true,
			dangerMode: true
        });
	}

});