$(document).ready(function(){

    $(".emailContent").each(function(i){
        var len=$(this).text().trim().length;
        if(len>25)
        {
            $(this).text($(this).text().substr(0,25)+'...');
        }
    });
    
    CKEDITOR.replace( 'email_users_subject_body' ); 

    // send random user email
	$('#emailAnyusersBtn').on('click', function () {

		$('#email_anyusers_form').submit();
	
	});
	
	$('#email_anyusers_form').validate({
		ignore: [],
		debug: false,
		rules: {
			email_users_subject_line: {
				required: true
			},
			email_addresses_users: {
				required: true
			},
			email_users_subject_body: {
				required: function(textarea) {
					CKEDITOR.instances['email_users_subject_body'].updateElement(); 
					var editorcontent = textarea.value.replace(/<[^>]*>/gi, ''); 
					return editorcontent.length === 0;
				  }
			}
		},
		messages: {
			email_users_subject_line: {
				required: "Please Enter Email Subject Line."
			},
			email_addresses_users: {
				required: "Please Enter Email Addresses"
			},
			email_users_subject_body: {
				required: "Please Enter Email Body."
			}
		},
		submitHandler:function(form) {
		
			$(':input[type="button"]').prop('disabled', true);
			var subject = $('#email_users_subject_line').val();
			var body = CKEDITOR.instances['email_users_subject_body'].getData();
			var emailsOfUsers = $('#email_addresses_users').val();
	
			$.ajax({
				type: "POST",
				url: "/admin/email-any-users",
				data: {
					subject: subject,
					body: body,
					emailsOfUsers: emailsOfUsers
				},
				success: function (resp) {


					if(resp.status == true){
						$.ajax({
							type: "POST",
							url: "/admin/save-to-db-email-any-users",
							data: {
								subject: subject,
								body: body,
								emailsOfUsers: emailsOfUsers
							},	
							success: function (response) {
								if(response.status == true){
									$(':input[type="button"]').prop('disabled', false);
				  					swal({
							            title: 'Send Email Confirmation',
							            text: response.msg,
							            type: "success",
							            confirmButtonColor: "#DD6B55",
							            confirmButtonText: "CONFIRM"
							        },  function() {
							            window.location.href = '/admin/email-any-users';
							        });
								}
							}

						});
					}

					/* $(':input[type="button"]').prop('disabled', false);
					if(resp.status == true){
						swal({
							title: 'Email Users Confirmation',
							text: resp.msg,
							type: "success",
							confirmButtonColor: "#DD6B55",
							confirmButtonText: "CONFIRM"
						},  function() {
							$('#subject').val('');
							$('#email_addresses_users').val('');
							CKEDITOR.instances['email_users_subject_body'].setData('');
							window.location.href = '/admin/email-any-users';
						});
					} */
				
				}
			});
	
		}
	
	});
	// end script

});