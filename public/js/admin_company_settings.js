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
                required: "Please enter phone number"
            },
            email_address: {
                required: "Please enter email address",
                email: "Please enter valid email address"
            },
            fb_url: {
                required: "Please enter facebook url",
                url: "Please enter valid facebook url"
            },
            twitter_url: {
                required: "Please enter twitter url",
                url: "Please enter valid twitter url"
            },
            linkedIn_url: {
                required: "Please enter linked in url",
                url: "Please enter valid linked in url"
            },
            instagram_url: {
                required: "Please enter instagram url",
                url: "Please enter valid instagram url"
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