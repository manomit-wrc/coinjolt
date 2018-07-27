$(document).ready(function () {
 	$('#pending_wire_transfer_table').DataTable({
        "aaSorting": []
    });
    $('#all_support_table').DataTable({
        "aaSorting": []
    });

 	//$(".pending_wire_transfer_approved").on('click', function () {
	$("#pending_wire_transfer_table").on("click", ".pending_wire_transfer_approved", function(){
 		var row_id = $(this).data('value');
        var amount = $(this).data('amount');
 		var user_id = $(this).data('user_id');
 		swal({
 			title: "Transaction Confirmation",
 			text: "Are you sure you want to accept this wire transfer?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax ({
 				type: "POST",
 				url : "/pending-wire-transfer-approved",
 				data :{
 					row_id: row_id,
 					amount:amount,
                    user_id: user_id
 				},
 				success : function (response) {
 					if(response.status == true){
 						var title = "Transaction Confirmation";
 						var text = "You have successfully approved this wire transfer.";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
 		});
 	});

 	//$(".pending_wire_transfer_reject").on('click', function () {
	$("#pending_wire_transfer_table").on("click", ".pending_wire_transfer_reject", function(){
 		var row_id = $(this).data('value');
 		var amount = $(this).data('amount');

 		swal({
 			title: "Transaction Confirmation",
 			text: "Are you sure you want to reject this wire transfer?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            closeOnConfirm: false
 		}, function () {
 			$.ajax({
 				type: "POST",
 				url: "/pending-wire-transfer-reject",
 				data:{
 					row_id : row_id
 				},
 				success : function (response) {
 					if(response.status == true){
 						var title = "Transaction Confirmation";
 						var text = "You have successfully rejected this wire transfer.";
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