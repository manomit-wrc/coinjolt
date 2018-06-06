$(document).ready(function() {
	$('.deposit_enable').on('click', function () {
        var deposit_id = $(this).val();

		swal({
 			title: "Depsit Type Enabling Confirmation",
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
 			title: "Depsit Type Disabling Confirmation",
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