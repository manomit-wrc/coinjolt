$(document).ready(function(){
    $('#blog_categories').DataTable({
        "bSort" : false
    });

    //var baseURL = "http://ec2-54-224-110-112.compute-1.amazonaws.com/";
    var baseURL = "http://localhost:8080/admin/";

    $('.save_blog_category').on('click', function(){

        $('#create_blog_category_form').submit();
    });

    $('#create_blog_category_form').validate({
        rules: {
            blog_category_title: {
                required: true
            }
        },
        messages: {
            blog_category_title: {
                required: "Please enter blog category title"
            }
        },
        submitHandler:function(form) {
           
            var category_title = $('#blog_category_title').val();
            var cat_status = $('#status').val();
            $.ajax({
                type: "POST",
                url: '/admin/post_blog_category',
                data: {category_title: category_title,cat_status: cat_status},
                success: function (response) {
                    if(response.status == true){
                        sweetAlertSuccessPopUp('Success',response.msg);
                    }
                }
            });

        }

    });

    // edit form validation
    $('.edit_blog_category').on('click', function(){

        $('#edit_blog_category_form').submit();
    });

    $('#edit_blog_category_form').validate({
        rules: {
            edit_blog_category_title: {
                required: true
            }
        },
        messages: {
            edit_blog_category_title: {
                required: "Please enter blog category title"
            }
        },
        submitHandler:function(form) {
            var catIdArr = window.location.pathname.split( '/' );
            var catId = catIdArr[3];

            var edit_category_title = $('#edit_blog_category_title').val();
            var edit_cat_status = $('#edit_status').val();
            $.ajax({
                type: "POST",
                url: '/admin/edit_blog_category',
                data: {edit_category_title: edit_category_title,edit_cat_status: edit_cat_status,catId: catId},
                success: function (response) {
                    if(response.status == true){
                        sweetAlertSuccessPopUp('Success',response.msg);
                    }
                }
            });

        }

    });
    // end validation

    function sweetAlertSuccessPopUp (title='',text='') {
        swal({
            title: title,
            text: text,
            type: "success",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "OK"
        },  function() {
            window.location.href=baseURL+"blog-categories";
        });
    }
});


