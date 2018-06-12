$(document).ready(function (e) {

	CKEDITOR.replace( 'risk_disclosures_body' );

	$('.save_risk_disclosures').on('click', function () {
        $('#risk_disclosures_form').submit();
    });

    $('#risk_disclosures_form').validate({
        rules: {
            banner_image_title: {
                required: true
            },
            risk_disclosures_body: {
                required: true
            }
        },
        messages: {
            risk_disclosures_image_title: {
                required: "Please enter risk disclosure image title"
            },
            risk_disclosures_body: {
                required: "Please enter risk disclosure content"
            }
        },
        submitHandler:function(form) {

            var risk_disclosures_description = CKEDITOR.instances['risk_disclosures_body'].getData();
            
            var risk_disclosures_image_title = $('#risk_disclosures_image_title').val();
            
            //form_data.append('terms_of_service_description', terms_of_service_description);
            //form_data.append('banner_image_title', banner_image_title);

            
            var form_data = new FormData($('#risk_disclosures_form')[0]);
            form_data.append('risk_disclosures_description', risk_disclosures_description);
            //form_data.append('risk_disclosures_image_title', risk_disclosures_image_title);
        

            $.ajax({
                type: "POST",
                url: '/admin/submit-risk-disclosures',
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