$(document).ready(function () {
	setTimeout(function() { 
        $(".loader").fadeOut("slow");
    }, 2000);

	CKEDITOR.replace( 'about_us_description' );
	
});

function sweetAlertAboutUsSuccessPopUp (title='',text='', redirect_link='') {
    swal({
        title: title,
        text: text,
        type: "success",
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "OK"
    },  function() {
        window.location.href = redirect_link;
    });
}

$('#cms_about_us_submit').on('click', function () {
	var valid = $('#cms-about-us').valid();
	var description = CKEDITOR.instances['about_us_description'].getData();
	if(valid){
		if(description == ''){
			alert ('Please enter description.');
			return false;
		}else{
			var header_desc_character_count =  $('#about_us_header_description').val();
			if(header_desc_character_count.length > 90){
				alert ("Header description maximum 50 characters");
				return false;
			}else{
				var form_data = new FormData($('#cms-about-us')[0]);
				form_data.append('description', CKEDITOR.instances['about_us_description'].getData());

				$.ajax({
					type: "POST",
					url: "/admin/cms/about-us-submit",
					data:form_data,
					processData: false,
	                contentType: false,
					success: function (resp) {
						if(resp.status == true) {
							console.log('/admin/configuration/quick-links/about-us');
							//sweetAlertAboutUsSuccessPopUp("Thank You.", resp.msg, "/admin/configuration/quick-links/about-us");
						}
					}
				});
			}
		}
	}
});

$('#cms-about-us').validate({
	rules:{
		about_us_header_description:{
			required: true
		}
	},
	messages:{
		about_us_header_description:{
			required: "Header description can't be left blank."
		}
	}
});

$('#cms_about_us_edit').on('click', function (result) {
	
	var header_desc_character_count =  $('#about_us_header_description').val();
	if(header_desc_character_count.length > 90){
		alert ("Header description maximum 50 characters");
		return false;
	}else{
		var form_data = new FormData($('#cms-about-us')[0]);
		form_data.append('description', CKEDITOR.instances['about_us_description'].getData());

		$.ajax({
			type: "POST",
			url: "/admin/cms/about-us-edit",
			data:form_data,
			processData: false,
	        contentType: false,
			success: function (resp) {
				if(resp.status == true) {
					sweetAlertAboutUsSuccessPopUp("Thank You.", resp.msg, "/admin/configuration/quick-links/about-us");
				}
			}
		});
	}
});

CKEDITOR.replace( 'cold_wallet_desc' );
CKEDITOR.replace( 'hot_wallet_desc' );
CKEDITOR.replace( 'how_is_works_reg_description' );
CKEDITOR.replace( 'how_is_works_deposit_funds_description' );
CKEDITOR.replace( 'how_is_works_safe_and_secure_description' );
CKEDITOR.replace( 'div1_desc' );
CKEDITOR.replace( 'div2_desc' );
CKEDITOR.replace( 'div3_desc' );
CKEDITOR.replace( 'div4_desc' );
CKEDITOR.replace( 'div5_desc' );
CKEDITOR.replace( 'div6_desc' );
CKEDITOR.replace( 'buy_sell_div1_desc' );
CKEDITOR.replace( 'buy_sell_div2_desc' );
CKEDITOR.replace( 'buy_sell_div3_desc' );
CKEDITOR.replace( 'buy_sell_div4_desc' );
CKEDITOR.replace( 'risk_disclousure_div1_desc' );
CKEDITOR.replace( 'risk_disclousure_div2_desc' );
CKEDITOR.replace( 'risk_disclousure_div3_desc' );

$("#cms_home_page_submit").on('click', function () {
	$(':input[type="button"]').prop('disabled', true);
	var form_data = new FormData($('#cms-home-page')[0]);
	form_data.append('cold_wallet_desc', CKEDITOR.instances['cold_wallet_desc'].getData());
	form_data.append('hot_wallet_desc', CKEDITOR.instances['hot_wallet_desc'].getData());
	form_data.append('how_is_works_reg_description', CKEDITOR.instances['how_is_works_reg_description'].getData());
	form_data.append('how_is_works_deposit_funds_description', CKEDITOR.instances['how_is_works_deposit_funds_description'].getData());
	form_data.append('how_is_works_safe_and_secure_description', CKEDITOR.instances['how_is_works_safe_and_secure_description'].getData());
	form_data.append('div1_desc', CKEDITOR.instances['div1_desc'].getData());
	form_data.append('div2_desc', CKEDITOR.instances['div2_desc'].getData());
	form_data.append('div3_desc', CKEDITOR.instances['div3_desc'].getData());
	form_data.append('div4_desc', CKEDITOR.instances['div4_desc'].getData());
	form_data.append('div5_desc', CKEDITOR.instances['div5_desc'].getData());
	form_data.append('div6_desc', CKEDITOR.instances['div6_desc'].getData());
	form_data.append('buy_sell_div1_desc', CKEDITOR.instances['buy_sell_div1_desc'].getData());
	form_data.append('buy_sell_div2_desc', CKEDITOR.instances['buy_sell_div2_desc'].getData());
	form_data.append('buy_sell_div3_desc', CKEDITOR.instances['buy_sell_div3_desc'].getData());
	form_data.append('buy_sell_div4_desc', CKEDITOR.instances['buy_sell_div4_desc'].getData());
	form_data.append('risk_disclousure_div1_desc', CKEDITOR.instances['risk_disclousure_div1_desc'].getData());
	form_data.append('risk_disclousure_div2_desc', CKEDITOR.instances['risk_disclousure_div2_desc'].getData());
	form_data.append('risk_disclousure_div3_desc', CKEDITOR.instances['risk_disclousure_div3_desc'].getData());


	$.ajax({
		type: "POST",
		url: "/admin/cms/home-page-submit",
		data:form_data,
		processData: false,
        contentType: false,
		success: function (resp) {
			$(':input[type="button"]').prop('disabled', false);
			if(resp.status == true) {
				alert(resp.msg);
				window.location.reload();
			}
		}
	});
});

$("#cms_home_page_edit").on('click', function () {
	$(':input[type="button"]').prop('disabled', true);
	var form_data = new FormData($('#cms-home-page')[0]);
	form_data.append('cold_wallet_desc', CKEDITOR.instances['cold_wallet_desc'].getData());
	form_data.append('hot_wallet_desc', CKEDITOR.instances['hot_wallet_desc'].getData());
	form_data.append('how_is_works_reg_description', CKEDITOR.instances['how_is_works_reg_description'].getData());
	form_data.append('how_is_works_deposit_funds_description', CKEDITOR.instances['how_is_works_deposit_funds_description'].getData());
	form_data.append('how_is_works_safe_and_secure_description', CKEDITOR.instances['how_is_works_safe_and_secure_description'].getData());
	form_data.append('div1_desc', CKEDITOR.instances['div1_desc'].getData());
	form_data.append('div2_desc', CKEDITOR.instances['div2_desc'].getData());
	form_data.append('div3_desc', CKEDITOR.instances['div3_desc'].getData());
	form_data.append('div4_desc', CKEDITOR.instances['div4_desc'].getData());
	form_data.append('div5_desc', CKEDITOR.instances['div5_desc'].getData());
	form_data.append('div6_desc', CKEDITOR.instances['div6_desc'].getData());
	form_data.append('buy_sell_div1_desc', CKEDITOR.instances['buy_sell_div1_desc'].getData());
	form_data.append('buy_sell_div2_desc', CKEDITOR.instances['buy_sell_div2_desc'].getData());
	form_data.append('buy_sell_div3_desc', CKEDITOR.instances['buy_sell_div3_desc'].getData());
	form_data.append('buy_sell_div4_desc', CKEDITOR.instances['buy_sell_div4_desc'].getData());
	form_data.append('risk_disclousure_div1_desc', CKEDITOR.instances['risk_disclousure_div1_desc'].getData());
	form_data.append('risk_disclousure_div2_desc', CKEDITOR.instances['risk_disclousure_div2_desc'].getData());
	form_data.append('risk_disclousure_div3_desc', CKEDITOR.instances['risk_disclousure_div3_desc'].getData());


	$.ajax({
		type: "POST",
		url: "/admin/cms/home-page-edit",
		data:form_data,
		processData: false,
        contentType: false,
		success: function (resp) {
			$(':input[type="button"]').prop('disabled', false);
			if(resp.status == true) {
				alert(resp.msg);
				window.location.reload();
			}
		}
	});
});