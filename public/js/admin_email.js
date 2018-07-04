$(document).ready(function (e) {
	$('#all_user_list_table').DataTable({
        "bSort" : false
    });
    setTimeout(function() { 
        $(".loader").fadeOut("slow");
    }, 2000);

	CKEDITOR.replace( 'editor1' );
	CKEDITOR.replace( 'editor100' );
	CKEDITOR.replace( 'editor1000' );
	CKEDITOR.replace( 'email_marketing_subject_body' );
	
	//CKEDITOR.replace( 'editor1', {allowedContent : "html head title meta link style body"} );

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

	$('#send_multiple_email_form').validate({
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

	$('#send_multiple_email_to_user').on('click', function () {
		var valid = $('#send_multiple_email_form').valid();
		var all_user_ids = $('#all_user_ids').val();
		var user_email = $('#to').val();
		var subject = $('#subject').val();
		var description = CKEDITOR.instances['editor1'].getData();
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
					url: "/admin/send-multiple-email-to-user",
					data:{
						user_email: user_email,
						subject: subject,
						description: description,
						email_template_id: email_template_id
					},
					success: function (response) {
						if(response.status == true){
					  		$.ajax({
					  			type: "POST",
					  			url: "/admin/entery-to-db-after-send-multipleEmail",
					  			data:{
					  				user_email: user_email,
					  				subject: subject,
									description: description,
									email_template_id: email_template_id,
									all_user_ids: all_user_ids
					  			},
					  			success: function (resp){	
					  				if(resp.status == true){
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

	//start email marketing related work
	$('#select_individuals_user_related_div').hide();
	$('#select_deposit_user_related_div').hide();
	$('#individuals').on('click', function (){
		$('.js-example-basic-multiple').select2();
		$('#select_individuals_user_related_div').show();
		$('#select_deposit_user_related_div').hide();
	});
	$('#al_user').on('click', function () {
		$('#select_individuals_user_related_div').hide();
		$('#select_deposit_user_related_div').hide();
	});
	$('#all_deposit_user').on('click', function () {
		$('.js-example-basic-multiple').select2();
		$('#select_individuals_user_related_div').hide();
		$('#select_deposit_user_related_div').show();
	});

	$('#email_marketing_preview').on('click', function (e) {
		var valid = $('#email_marketing_preview_form').valid();
		var body = CKEDITOR.instances['email_marketing_subject_body'].getData();
		var preview_subject = $('#subject_line').val();
		var user_group = $("input[name='user-group']:checked").val();

		if(user_group == 'individuals_users'){
			var individuals_users = $('#select_individuals_user').val();
		}else if(user_group == 'deposit_users') {
			var individuals_users = $('#select_deposit_user').val();
		}else{
			var individuals_users = '';
		}
		
		if(user_group == 'all_registered_user'){
			$('#all_user_ids').val('all_registered_user');
		}

		if(valid){
			if(body == ''){
				alert ("Body can't be left blank.");
			}else{
				$('#subject').val(preview_subject);
				CKEDITOR.instances['editor1'].setData(body);
				$('#all_individuals_users').val(individuals_users);
				$('#myEmailMarketingPreviewModal').modal('show');
			}
		}
	});

	$('#email_marketing_preview_form').validate({
		rules:{
			subject_line:{
				required: true
			}
		},
		messages:{
			subject_line:{
				required: "Please enter subject."
			}			
		}
	});

	$('#email_send').on('click', function () {
		$(':input[type="button"]').prop('disabled', true);
		var subject = $('#subject').val();
		var body = CKEDITOR.instances['editor1'].getData();
		
		if($('#all_user_ids').val() == 'all_registered_user'){
			var for_individuals_users = 'all_registered_user';
		}else{
			var for_individuals_users = $('#all_individuals_users').val();
		}

		$.ajax({
			type: "POST",
			url: "/admin/send-email-markeitng",
			data: {
				subject: subject,
				body: body,
				users: for_individuals_users
			},
			success: function (resp) {
				$(':input[type="button"]').prop('disabled', false);
				if(resp.status == true){
					swal({
			            title: 'Thank You.',
			            text: resp.msg,
			            type: "success",
			            confirmButtonColor: "#DD6B55",
			            confirmButtonText: "OK"
			        },  function() {
			            window.location.href = '/admin/email-marketing';
			        });
				}
			}
		});
	});

	$('#save_as_draft').on('click', function () {
		$(':input[type="button"]').prop('disabled', true);
		var subject = $('#subject').val();
		var body = CKEDITOR.instances['editor1'].getData();
		
		if($('#all_user_ids').val() == 'all_registered_user'){
			var for_individuals_users = 'all_registered_user';
		}else{
			var for_individuals_users = $('#all_individuals_users').val();
		}

		$.ajax({
			type: "POST",
			url: "/admin/save-email-as-draft",
			data: {
				subject: subject,
				body: body,
				users: for_individuals_users
			},
			success: function (resp) {
				$(':input[type="button"]').prop('disabled', false);
				if(resp.status == true){
					swal({
			            title: 'Thank You.',
			            text: resp.msg,
			            type: "success",
			            confirmButtonColor: "#DD6B55",
			            confirmButtonText: "OK"
			        },  function() {
			            window.location.href = '/admin/email-marketing';
			        });
				}
			}
		});
	});

	$('.recent_send_email_list').on('click', function () {
		var user_row_email_id = $(this).attr('user_row_id');
		$.ajax({
			type: "POST",
			url: "/admin/recent_send_email_details",
			data:{
				user_row_email_id: user_row_email_id
			}, 
			success: function (resp) {
				if(resp.status == true){
					$('#last_email_sent_subject').val(resp.details.email_sub);
					CKEDITOR.instances['editor100'].setData(resp.details.email_desc);
					$('#recentActivityLastEmailSent').modal('show');
				}
			}
		});
	});

	$('.delete_recent_send_email_list').on('click', function () {
		var user_row_email_id = $(this).attr('user_row_id');

		swal({
		  title: "Are you sure?",
		  text: "Your will not be able to recover this data!",
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonClass: "btn-danger",
		  confirmButtonText: "Yes, delete it!",
		  closeOnConfirm: false
		},
		function(){
			$.ajax({
				type: "POST",
				url: "/admin/delete_recent_send_email_details",
				data:{
					user_row_email_id: user_row_email_id
				}, 
				success: function (resp) {
					if(resp.status == true){
						swal({
				            title: "Thank You",
				            text: resp.msg,
				            type: "success",
				            confirmButtonColor: "#DD6B55",
				            confirmButtonText: "OK"
				        },  function() {
				            window.location.href = '/admin/email-marketing';
				        });
					}
				}
			});
		});
	});

	$('.use_draft').on('click', function () {
		var user_row_email_id = $(this).attr('user_row_id');
		$.ajax({
			type: "POST",
			url: "/admin/save-email-draft-details",
			data:{
				user_row_email_id: user_row_email_id
			}, 
			success: function (resp) {
				console.log(resp);
				// return false;
				if(resp.status == true){
					$('#draft_row_id').val(resp.details.id);
					$('#to_users').val(resp.user_list);
					$('#draft_email_subject').val(resp.details.subject);
					CKEDITOR.instances['editor1000'].setData(resp.details.body);
					$('#myDraftPreviewModal').modal('show');
				}
			}
		});
	});

	$('#draft_send').on('click', function () {
		$(':input[type="button"]').prop('disabled', true);
		var user_email = $('#to_users').val();
		var draft_row_id = $('#draft_row_id').val();
		var subject = $('#draft_email_subject').val();
		var body = CKEDITOR.instances['editor1000'].getData();
		$.ajax({
			type: "POST",
			url: "/admin/send-draft-email",
			data:{
				user_email: user_email,
				draft_row_id: draft_row_id,
				subject: subject,
				body: body
			},
			success: function (resp) {
				$(':input[type="button"]').prop('disabled', false);
				if(resp.status == true){
					swal({
			            title: 'Thank You.',
			            text: resp.msg,
			            type: "success",
			            confirmButtonColor: "#DD6B55",
			            confirmButtonText: "OK"
			        },  function() {
			            window.location.href = '/admin/email-marketing';
			        });
				}
			}
		});
	});

	$('.delete_draft').on('click', function () {
		var user_row_draft_id = $(this).attr('user_row_id');

		swal({
		  title: "Are you sure?",
		  text: "Your will not be able to recover this data!",
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonClass: "btn-danger",
		  confirmButtonText: "Yes, delete it!",
		  closeOnConfirm: false
		},
		function(){
			$.ajax({
				type: "POST",
				url: "/admin/delete-draft",
				data:{
					user_row_draft_id: user_row_draft_id
				}, 
				success: function (resp) {
					if(resp.status == true){
						swal({
				            title: "Thank You",
				            text: resp.msg,
				            type: "success",
				            confirmButtonColor: "#DD6B55",
				            confirmButtonText: "OK"
				        },  function() {
				            window.location.href = '/admin/email-marketing';
				        });
					}
				}
			});
		});
	});

	//end

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

$('#send_multiple_email').on('click', function () {
	var checked_ids = [];
    $("input[name='checked_ids[]']:checked").each(function (i) {               
        checked_ids[i] = $(this).val();            
    });            
    checked_ids = JSON.stringify(checked_ids);            
    checked_ids = JSON.parse(checked_ids);
    if(checked_ids.length == 0){
    	alert ("Please select at least One record.");
    	return false;
    }else{
    	$.ajax({
    		type: "POST",
    		url: "/admin/send-multiple-email",
    		data:{
    			checked_ids: checked_ids
    		},
    		success: function (resp) {
    			$('#all_user_ids').val(resp.allIds);
    			$('#to').val(resp.all_email_id);
    			var options = '';
    			options += '<option value="0">Select Template</option>';
    			$.each(resp.email_template, function(key,val){
    				options += '<option value="'+val.id+'">'+val.template_name+'</option>'

    			});
    			$('#select_email_template').html(options);
    			
    			$('#myModal').modal('show');
    		}
    	});
    }
});

$('#examplecBox0').on('click', function () {
    if ($("#examplecBox0").prop('checked') == true) {
        $('.myCheckbox').prop('checked', true);
    } else {
        $('.myCheckbox').prop('checked', false);
    }

});

$(".email_send_details").on('click', function () {
	var email_send_id = $(this).data('send_email_id');
	$.ajax({
		type: "POST",
		url: "/admin/send-email-details",
		data:{
			email_send_id: email_send_id
		},
		success: function (resp) {
			$('#to').val(resp.data.User.email);
			$('#subject').val(resp.data.email_sub);
			// $('#select_email_template').val(resp.data.email_template.template_name);
			CKEDITOR.instances['editor1'].setData(resp.data.email_desc);
			$('#myModal').modal('show')
		}
	});
});