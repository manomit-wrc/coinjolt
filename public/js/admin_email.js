$(document).ready(function (e) {
	    setTimeout(function() { 
	        $(".loader").fadeOut("slow");
	    }, 2000);

	CKEDITOR.replace( 'editor1' );

	$('#submit_email_template').on('click', function () {
		var valid = $('#submit-a-email-template').valid();
		var template_description = CKEDITOR.instances['editor1'].getData();
		var template_subject = $('#subject').val();
		if(valid){
			if(template_description == ''){
				alert ("Template description can not be left blank.");
				return false;
			}else{
				$.ajax({
					type: "POST",
					url: '/admin/submit-email-template',
					data:{
						template_subject: template_subject,
						template_description: template_description
					},
					success: function (response) {
						if(response.status == true){
							sweetAlertSuccessPopUp('Thank You',response.msg);
						}
					}
				});
			}
		}
	});

	$('#submit-a-email-template').validate({
		rules:{
			subject:{
				required: true
			},
			editor1:{
				required: true
			}
		},
		messages:{
			subject:{
				required: "Please enter template name."
			},
			editor1:{
				required: "Template description can not be left blank."
			}			
		}
	});

	$('#submit_edit_email_template').on('click', function (e) {
		var valid = $('#submit-edit-email-template').valid();
		var template_description = CKEDITOR.instances['editor1'].getData();
		var template_subject = $('#subject').val();
		var id = $('#row_id').val();
		if(valid){
			if(template_description == ''){
				alert ("Template description can not be left blank.");
				return false;
			}else{
				$.ajax({
					type: "POST",
					url: '/admin/submit-edit-email-template',
					data:{
						id: id,
						template_subject: template_subject,
						template_description: template_description
					},
					success: function (response) {
						if(response.status == true){
							sweetAlertSuccessPopUp('Thank You',response.msg);
						}
					}
				});
			}
		}
	});

	$('#submit-edit-email-template').validate({
		rules:{
			subject:{
				required: true
			},
			editor1:{
				required: true
			}
		},
		messages:{
			subject:{
				required: "Please enter template name."
			},
			editor1:{
				required: "Template description can not be left blank."
			}			
		}
	});

	//email send
	$('#send_email').on('click', function (e) {
		var valid = $('#send-email-form').valid();
		var user_email = $('#to').val();
		var subject = $('#subject').val();
		var description = CKEDITOR.instances['editor1'].getData();
		var user_id = $('#user_id').val();
		var email_template_id = $('#select_email_template').val();
		if(email_template_id != ''){
			email_template_id = email_template_id;
		}else{
			email_template_id = 'NULL';
		}

		if(valid){
			if(description == ''){
				alert ("Description can't be left blank");
				return false;
			}else{
				$(':input[type="button"]').prop('disabled', true);
				$.ajax({
					type: "POST",
					url: "/admin/send-email",
					data:{
						user_id: user_id,
						user_email: user_email,
						subject: subject,
						description: description,
						email_template_id: email_template_id
					},
					success: function (response) {
						if(response.status == true){
							$(':input[type="button"]').prop('disabled', false);
							swal({
					            title: 'Thank You',
					            text: response.msg,
					            type: "success",
					            confirmButtonColor: "#DD6B55",
					            confirmButtonText: "OK"
					        },  function() {
					            window.location.href = '/admin/all-user-list';
					        });
						}
					}
				});
			}
		}
	});

	$('#send-email-form').validate({
		rules:{
			subject:{
				required: true
			}
		},
		messages:{
			subject:{
				required: "Please enter subject."
			}			
		}
	});

	$('#select_email_template').on('change', function (e) {
		var template_id = $('#select_email_template').val();
		$.ajax({
			type: "POST",
			url: "/admin/get-email-template-description",
			data:{
				template_id: template_id
			},
			success: function (response) {
				if(response.status == true){
	              	CKEDITOR.instances['editor1'].setData(response.msg);
				}
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
            window.location.href = '/admin/email-template-listings';
        });
    }
});