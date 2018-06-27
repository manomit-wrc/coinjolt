$(".blogContent").each(function(i){
    var len=$(this).text().trim().length;
    if(len>100)
    {
        $(this).text($(this).text().substr(0,100)+'...');
    }
});
CKEDITOR.replace( 'edit_post_description' );
$(document).ready(function(){

    $('#admin_blog').DataTable({
        "bSort" : false
    });


    //var baseURL = "http://ec2-54-224-110-112.compute-1.amazonaws.com/";
    var baseURL = "http://localhost:8080/admin/";
    $("#errPostDescription").html("");
    $("#errPostDescription").css("display", "none");
    CKEDITOR.replace( 'post_description' ); 
    //CKEDITOR.replace( 'edit_post_description' );
    var post_description = '';
    var edit_post_description = '';
    
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
                //required: true,
                extension: 'jpg|JPG|jpeg|JPEG|png|PNG'
            },
            meta_title: {
                required: true
            },
            meta_description: {
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
                //required: "Please select featured image to upload",
                extension: "Must be image type"
            },
            meta_title: {
                required: "Please enter meta title"
            },
            meta_description: {
                required: "Please enter meta description"
            }
        },
        submitHandler:function(form) {
            var post_description = CKEDITOR.instances['post_description'].getData();

            var form_data = new FormData($('#create_blog_post_form')[0]);
            form_data.append('post_description', post_description);
           

            $.ajax({
                type: "POST",
                url: '/admin/post_blog_content',
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
            window.location.href=baseURL+"blog-posts";
        });
    }

    


});

$('.edit_blog').on('click', function(){

    $('#edit_blog_post_form').submit();
});

$('#edit_blog_post_form').validate({
    rules: {
        edit_blog_post_title: {
            required: true
        },
        edit_post_slug: {
            required: true
        },
        edit_post_featured_image: {
            //required: true,
            extension: 'jpg|JPG|jpeg|JPEG|png|PNG'
        },
        edit_meta_title: {
            required: true
        },
        edit_meta_description: {
            required: true
        }
    },
    messages: {
        edit_blog_post_title: {
            required: "Please enter blog post title"
        },
        edit_post_slug: {
            required: "Please enter post slug"
        },
        edit_post_featured_image: {
            //required: "Please select featured image to upload",
            extension: "Must be image type"
        },
        edit_meta_title: {
            required: "Please enter meta title"
        },
        edit_meta_description: {
            required: "Please enter meta description"
        }
    },
    submitHandler:function(form) {

        var edit_post_description = CKEDITOR.instances['edit_post_description'].getData();

        //console.log(edit_post_description);

        //var edit_blog_post_title = $('#edit_blog_post_title').val();
        //var edit_post_slug = $('#edit_post_slug').val();
        //var edit_meta_title = $('#edit_meta_title').val();
        //var edit_meta_description = $('#edit_meta_description').val();

        var form_data = new FormData($('#edit_blog_post_form')[0]);
        form_data.append('edit_post_description', edit_post_description);
        
        //var form_data = new FormData(); 
        //form_data.append('edit_blog_post_title',edit_blog_post_title);
        
        //form_data.append('edit_post_slug', edit_post_slug);
        //form_data.append('edit_meta_title', edit_meta_title);
        //form_data.append('edit_meta_description', edit_meta_description);
       
        $.ajax({
            type: "POST",
            url: '/admin/update_blog_content',
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