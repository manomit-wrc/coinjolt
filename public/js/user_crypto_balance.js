
$(document).ready(function(){

    $('#currency_id').on('change', function () {
        var currency_id = $(this).val();
        if (currency_id === '0') { // usa states
          $('#usd_amt_box').css('display', 'block');
          $('#currency_balance_box').css('display', 'none');
        } else {
          $('#currency_balance_box').css('display', 'block');
          $('#usd_amt_box').css('display', 'none');
        }
      });
      
    // Support form validation starts
    $("#update_cryptobalance_form").validate({
        rules: {
            user_id: {
                required: true
            },
            currency_id: {
                required: true
            },
            currency_balance: {
                required: true,
                number: true
            },
            usd_amt: {
                required: true,
                number: true
            }           
        },
        messages: {
            user_id: {
                required: "Please select an email"
            },
            currency_id: {
                required: "Please select a currency"
            },
            currency_balance: {
                required: "Please enter a balance",
                number: "Please enter numeric value"
            },
            usd_amt: {
                required: "Please enter USD amount",
                number: "Please enter numeric value"
            }
        }
    });        


   

});

