$(document).ready(function(){
    
    CKEDITOR.replace( 'post_description' );

    $('.save_blog').on('click', function(){
        $('#create_blog_post_form').submit();
    });

    $('#create_blog_post_form').validate({
        rules: {
            blog_post_title: {
                required: true
            },
            post_slug: {
                required: true
            },
            post_featured_image: {
                required: true,
                extension: 'jpg|JPG|jpeg|JPEG|png|PNG|tiff|TIFF'
            },
            meta_title: {
                required: true
            },
            meta_description: {
                required: true
            },
            author_name: {
                required: true
            }
        },
        messages: {
            blog_post_title: {
                required: "Please enter blog post title"
            },
            post_slug: {
                required: "Please enter post slug"
            },
            post_featured_image: {
                required: "Please select featured image to upload",
                extension: "Must be image type"
            },
            meta_title: {
                required: "Please enter meta title"
            },
            meta_description: {
                required: "Please enter meta description"
            },
            author_name: {
                required: "Please enter author name"
            }
        },
        submitHandler:function(form) {

            var post_description = CKEDITOR.instances['post_description'].getData();
            
            //form_data.append('banner_image_title', banner_image_title);

            var form_data = new FormData($('#create_blog_post_form')[0]);
            form_data.append('post_description', post_description);
            //form_data.append('terms_of_service_description', terms_of_service_description);
            //form_data.append('banner_image_title', banner_image_title);
            
            alert('form submitted');

            /* $.ajax({
                type: "POST",
                url: '/admin/submit-terms-of-service',
                data: form_data,
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    if(response.status == true){
                        sweetAlertSuccessPopUp('Success',response.msg);
                    }
                }
            }); */
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