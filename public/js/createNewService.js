$( document ).ready(function() {
    $(".selectedServiceType").on('change', function (){
        var text =$(".selectedServiceType").find(":selected").text();
        $(".nodeJS-sel").hide();
        $(".database-sel").hide();

        if (text == 'NodeJS'){
            $(".nodeJS-sel").show();
        }
        else if (text == 'Database'){
            $(".database-sel").show();
        }
    });
});