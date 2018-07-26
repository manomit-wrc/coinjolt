$(document).ready(function() {
	$(".kyc_list").on("click", ".kyc_approved", function(){
		var row_id = $(this).data('value');

		swal({
 			title: "Know Your Customer Confirmation",
 			text: "Are you sure you want to accept these files?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Accept",
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
 						var title = "Know Your Customer Confirmation";
 						var text = "You have successfully approved these KYC documents.";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
 		});
	});

	$(".kyc_list").on("click", ".kyc_reject", function(){
		var row_id = $(this).data('value');

		swal({
 			title: "Know Your Customer Confirmation",
 			text: "Are you sure you want to reject these documents?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Accept",
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
 						var title = "Know Your Customer Confirmation";
 						var text = "You have rejected these KYC documents.";
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