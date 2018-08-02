 $(".authorBioContent").each(function(i){
    var len=$(this).text().trim().length;
    if(len>50)
    {
        $(this).text($(this).text().substr(0,50)+'...');
    }
});

$('#admin_blog_authors').DataTable({
    'aaSorting': [ 2, "desc" ]
});

var baseURL = "http://ec2-34-230-81-205.compute-1.amazonaws.com/"; 

$(document).ready(function(){

    /* $('#admin_blog_posts').DataTable({
        "bSort" : false
    }); */

    //var baseURL = "http://ec2-54-224-110-112.compute-1.amazonaws.com/";
    //var baseURL = "http://localhost:8080/admin/";
    //$("#errPostDescription").html("");
    //$("#errPostDescription").css("display", "none");

    //CKEDITOR.replace( 'edit_post_description' );

   
    $('.save_author').on('click', function(){

        $('#create_author_form').submit();
    });


    $('#create_author_form').validate({
        ignore: [],
        debug: false,
        rules: {
            author_name: {
                required: true
            },
            author_bio: {
                required: true
            },
            author_image: {
                extension: 'jpg|JPG|jpeg|JPEG|png|PNG'
            }
        },
        messages: {
            author_name: {
                required: "Please enter author name."
            },
            author_bio: {
                required: "Please enter author bio."
            },
            author_image: {
                extension: "Must be a valid image type."
            }
        },
        submitHandler:function(form) {
            
            //var post_description = CKEDITOR.instances['post_description'].getData();

            var form_data = new FormData($('#create_author_form')[0]);
            //form_data.append('post_description', post_description);
           

            $.ajax({
                type: "POST",
                url: '/admin/post_blog_author',
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
            confirmButtonText: "CONFIRM"
        },  function() {
            window.location.href=baseURL+"admin/blog-authors";
        });
    }

   

});

