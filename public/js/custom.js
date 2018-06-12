$(document).ready(function () {
	$('.ques-table tr').each(function(index, val) {
	    $(this).find('td:nth-child(3)').addClass('details-control');
	});
});

var total_opt_result;

function format(total_opt_result, ques_id) {
    var arr = JSON.parse(total_opt_result);
    var output_arr = [];
    output_arr += '<div class="details-container table-responsive">'+
                '<table class="table" id="option-table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>Options</th>'+
                    '</tr>'+
                '</thead>'+
                '<tbody>';
    $.each(arr, function (key, val) {
        output_arr += '<tr>'+
            '<td>'+
                val.option +
            '</td>'+
        '</tr>';
    });
    output_arr += '</tbody>'+
        '</table>'+
        '</div>';
    $('.output-data').html(output_arr);
    $('.details-row').html(output_arr);
}

$(document).on("click", ".remove-control", function(e) {
    $('.details-row').remove();
    $(this).removeClass("remove-control");
    $(this).addClass("details-control");
});

$(document).on("click", ".details-control", function(e) {
    var ques_id = $(this).data('id');
    var flagBool = false;
    $.ajax({
        type: "GET",
        url: "/question/options/" + ques_id,
        async: false,
        success: function (response) {
            total_opt_result = response;
            flagBool = true;
        },
        error: function (xhr) {
            alert('error');
        },
        complete: function () {
            format(total_opt_result, ques_id);
            flagBool = true;
        }
    });
    if (flagBool) {
       	$(".remove-control").removeClass('remove-control').addClass("details-control");
        $('.details-row').remove();
        $(this).parent().addClass("shown");
        $(this).removeClass("details-control").addClass('remove-control');
        $(this).closest("tr").after("<tr class='details-row'><td colspan='4'>" + $('.output-data').html() + "</td></tr>");
    }
});