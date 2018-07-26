$(document).ready(function (e) {
    $('.update_company_settings').on('click', function () {
        $('#terms_of_service_form').submit();
    });

    $('#update_company_settings').validate({
        rules: {
            phone_number: {
                required: true
            },
            email_address: {
                required: true,
                email: true
            },
            fb_url: {
                required: true,
                url: true
            },
            twitter_url: {
                required: true,
                url: true
            },
            linkedIn_url: {
                required: true,
                url: true
            },
            instagram_url: {
                required: true,
                url: true
            }
        },
        messages: {
            phone_number: {
                required: "Please enter a valid phone number."
            },
            email_address: {
                required: "Please enter a valid email address.",
                email: "Please enter valid email address."
            },
            fb_url: {
                required: "Please enter a valid Facebook URL.",
                url: "Please enter valid Facebook URL."
            },
            twitter_url: {
                required: "Please enter a valid Twitter URL.",
                url: "Please enter valid Twitter URL."
            },
            linkedIn_url: {
                required: "Please enter a valid LinkedIn URL.",
                url: "Please enter a valid LinkedIn URL."
            },
            instagram_url: {
                required: "Please enter a valid Instagram URL.",
                url: "Please enter valid Instagram URL."
            }
        },
        submitHandler:function(form) {
            var phoneNumber = $('#phone_number').val();
            var email_address = $('#email_address').val();
            var fb_url = $('#fb_url').val();
            var twitter_url = $('#twitter_url').val();
            var linkedIn_url = $('#linkedIn_url').val();
            var instagram_url = $('#instagram_url').val();

            $.ajax({
                type: "POST",
                url: '/admin/update-company-settings',
                data: {phoneNumber: phoneNumber, email_address: email_address, fb_url: fb_url, twitter_url: twitter_url, linkedIn_url: linkedIn_url, instagram_url: instagram_url},
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