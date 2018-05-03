$(document).ready(function() {
	$('.kyc_approved').on('click', function () {
		var row_id = $(this).data('value');

		swal({
 			title: "KYC Confirmation",
 			text: "Are you sure you want to accept?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax ({
 				type: "POST",
 				url : "/admin/kyc-approved",
 				data :{
 					row_id: row_id
 				},
 				success : function (response) {
 					if(response.status == true){
 						var title = "Approval Successful";
 						var text = "You have successfully approved the KYC.";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
 		});
	});

	$('.kyc_reject').on('click', function () {
		var row_id = $(this).data('value');

		swal({
 			title: "KYC Confirmation",
 			text: "Are you sure you want to reject?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax({
 				type: "POST",
 				url: "/admin/kyc-reject",
 				data:{
 					row_id : row_id
 				},
 				success : function (response) {
 					if(response.status == true){
 						var title = "Rejection Successful";
 						var text = "You have successfully reject the KYC.";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
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
});