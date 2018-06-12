$(document).ready(function (e) {

	CKEDITOR.replace( 'privacy_policy_body' );

	$('.save_privacy_policyBtn').on('click', function () {
        $('#privacy_policy_form').submit();
    });

    $('#privacy_policy_form').validate({
        rules: {
            privacy_policy_image_title: {
                required: true
            },
            privacy_policy_body: {
                required: true
            }
        },
        messages: {
            privacy_policy_image_title: {
                required: "Please enter privacy policy image title"
            },
            privacy_policy_body: {
                required: "Please enter privacy policy content"
            }
        },
        submitHandler:function(form) {

            var privacy_policy_description = CKEDITOR.instances['privacy_policy_body'].getData();

            var form_data = new FormData($('#privacy_policy_form')[0]);
            form_data.append('privacy_policy_description', privacy_policy_description);
        

            $.ajax({
                type: "POST",
                url: '/admin/submit-privacy-policy',
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