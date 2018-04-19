$(document).ready(function (e) {
	$("#deposit_funds_bwt").on('click', function () {
      var deposit_type = $("#deposit_type").val();
      if(deposit_type == 2){
        $('#exampleModalLong').modal('show');
      }else{
      	alert ("error");
      }
    });
    e.preventDefault();
});