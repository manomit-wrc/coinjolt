$(".blogContent").each(function(i){
    var len=$(this).text().trim().length;
    if(len>100)
    {
        $(this).text($(this).text().substr(0,100)+'...');
    }
});
//var baseURL = "http://ec2-54-224-110-112.compute-1.amazonaws.com/admin/";
var baseURL = "http://localhost:8080/admin/";
// CKEDITOR.replace( 'edit_post_description' );
CKEDITOR.replace( 'post_description' ); 

$(document).ready(function(){

    $('#admin_blog').DataTable({
        "bSort" : false
    });


    $('.deleteBlogBtn').on('click', function(){
        var blogDelId = $(this).data('id');
        alert('delete clicked'+blogDelId);
    });

    //var baseURL = "http://ec2-54-224-110-112.compute-1.amazonaws.com/";
    //var baseURL = "http://localhost:8080/admin/";
    $("#errPostDescription").html("");
    $("#errPostDescription").css("display", "none");

    //CKEDITOR.replace( 'edit_post_description' );

   
    $('.save_blog').on('click', function(){

        $('#create_blog_post_form').submit();
    });


    $('#create_blog_post_form').validate({
        ignore: [],
        debug: false,
        rules: {
            blog_post_title: {
                required: true
            },
            post_slug: {
                required: true
            },
            blog_desc: {
                required: function(textarea) {
                    CKEDITOR.instances['post_description'].updateElement(); 
                    var editorcontent = textarea.value.replace(/<[^>]*>/gi, ''); 
                    return editorcontent.length === 0;
                  }
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
            blog_desc:{
                required:"Please enter post description"
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
        post_description: {
            required: function(textarea) {
                CKEDITOR.instances['post_description'].updateElement(); 
                var editorcontent = textarea.value.replace(/<[^>]*>/gi, ''); 
                return editorcontent.length === 0;
              }
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
        post_description:{
            required:"Please enter post description"
        },
        edit_meta_title: {
            required: "Please enter meta title"
        },
        edit_meta_description: {
            required: "Please enter meta description"
        }
    },
    submitHandler:function(form) {

        var edit_post_description = CKEDITOR.instances['post_description'].getData();

        var form_data = new FormData($('#edit_blog_post_form')[0]);
        form_data.append('edit_post_description', edit_post_description);

        var blogIdArr = window.location.pathname.split( '/' );
        var blogId = blogIdArr[3];
        form_data.append('blog_id',blogId);
       
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