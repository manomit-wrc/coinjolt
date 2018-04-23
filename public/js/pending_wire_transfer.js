$(document).ready(function () {
 	$('#pending_wire_transfer_table').DataTable();

 	$(".pending_wire_transfer_approved").on('click', function () {
 		var row_id = $(this).data('value');
 		var amount = $(this).data('amount');
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
 					amount:amount
 				},
 				success : function (response) {
 					if(response.status == true){
 						var title = "Approval Successful";
 						var text = "You have successfully approved the wire transfer.";
 						sweetAlertSuccessPopUp(title,text);
 					}
 				}
 			});
 		});
 	});

 	$(".pending_wire_transfer_reject").on('click', function () {
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
 						var title = "Rejection Successful";
 						var text = "You have successfully reject the wire transfer.";
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