$(document).ready(function(){
    //var baseURL = "http://ec2-54-224-110-112.compute-1.amazonaws.com/";
    var baseURL = "http://localhost:8080/admin/";
    $("#errPostDescription").html("");
    $("#errPostDescription").css("display", "none");
    CKEDITOR.replace( 'post_description' ); 
    alert('hi');
    var post_description = '';
    $(".blogContent").each(function(i){
        var len=$(this).text().trim().length;
        if(len>100)
        {
            $(this).text($(this).text().substr(0,100)+'...');
        }
    });


    $('.save_blog').on('click', function(){
        var post_description = $.trim($("#post_description").val());
        post_description = CKEDITOR.instances['post_description'].getData();
        if(post_description === ""){
            $("#errPostDescription").html("Please enter post description");
            $("#errPostDescription").css("display", "block");
        }

        else{
            $("#errPostDescription").html("");
            $("#errPostDescription").css("display", "none");
        }
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
                extension: 'jpg|JPG|jpeg|JPEG|png|PNG'
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

            post_description = CKEDITOR.instances['post_description'].getData();
            console.log("post_description");
            console.log(post_description);
            

            var form_data = new FormData($('#create_blog_post_form')[0]);
            form_data.append('post_description', post_description);
            console.log(form_data);
            console.log(form_data);

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
    
    $('#editBlogBtn').on('click', function(){
         var blogId =  $(this).data("id");
         alert(blogId);
        /* $.ajax({
            type: "POST",
            url: '/admin/edit_blog_content',
            data: {blogId: blogId},
            success: function (response) {
                if(response.status == true){
                    sweetAlertSuccessPopUp('Success',response.msg);
                }
            }
        });  */

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