
$(document).ready(function(){
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
            }           
        },
        messages: {
            user_id: {
                required: "Please select an email"
            },
            currency_id: {
                required: "Please enter a currency"
            },
            currency_balance: {
                required: "Please enter a balance",
                number: "Please enter numeric value"
            }
        }
    });        


   

});

