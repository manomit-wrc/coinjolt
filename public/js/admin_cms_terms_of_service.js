$(document).ready(function (e) {

	CKEDITOR.replace( 'terms_of_service_body' );

	$('.save_terms_of_service').on('click', function () {
        $('#terms_of_service_form').submit();
    });

    $('#terms_of_service_form').validate({
        rules: {
            banner_image_title: {
                required: true
            },
            terms_of_service_body: {
                required: true
            }
        },
        messages: {
            banner_image_title: {
                required: "Please enter banner image title"
            },
            terms_of_service_body: {
                required: "Please enter terms of service content"
            }
        },
        submitHandler:function(form) {

            var terms_of_service_description = CKEDITOR.instances['terms_of_service_body'].getData();
            
            var banner_image_title = $('#banner_image_title').val();
            
            //var form_data = $('#terms_of_service_form')[0];

            var form_data = new FormData($('#terms_of_service_form')[0]);

            //form_data.append('terms_of_service_description', terms_of_service_description);
            //form_data.append('banner_image_title', banner_image_title);

            $.ajax({
                type: "POST",
                url: '/admin/submit-terms-of-service',
                //data: {terms_of_service_description: terms_of_service_description, banner_image_title: banner_image_title},
                data: form_data,
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    if(response.status == true){
                        sweetAlertSuccessPopUp('Success',response.msg);
                    }
                }
            });
        }
    });

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