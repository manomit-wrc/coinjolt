$(document).ready(function () {
	CKEDITOR.replace( 'about_us_description' );

	$('#cms_about_us_submit').on('click', function () {
		var valid = $('#cms-about-us').valid();
		var description = CKEDITOR.instances['about_us_description'].getData();
		if(valid){
			if(description == ''){
				alert ('Please enter description.');
				return false;
			}else{
				var form_data = new FormData();
				form_data.append('description', CKEDITOR.instances['about_us_description'].getData());
				form_data.append('about_us_header_description', $('#about_us_header_description').val());

				$.ajax({
					type: "POST",
					url: "/admin/cms/about-us-submit",
					data: form_data,
					processData: false,
                    contentType: false,
					success: function (resp) {
						if(resp.status == true) {
							sweetAlertSuccessPopUp("Thank You.", resp.msg, "/admin/cms/quick-links/about-us");
						}
					}
				});
			}
		}
	});

	$('#cms-about-us').validate({
		rules:{
			about_us_header_description:{
				required: true
			}
		},
		messages:{
			about_us_header_description:{
				required: "Header description can't be left blank."
			}
		}
	});
});

function sweetAlertSuccessPopUp (title='',text='', redirect_link='') {
    swal({
        title: title,
        text: text,
        type: "success",
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "OK"
    },  function() {
        window.location.href = redirect_link;
    });
}