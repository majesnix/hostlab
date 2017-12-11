$(document).ready(function() {
    $('.deleteproject').on('click', function(e) {
        e.preventDefault();

        if(confirm("Projekt löschen?")) {
            console.log($(this).data('id'));
            $.ajax({
                type: 'POST',
                url: '/api/deleteproject',
                data: {
                    id: $(this).data('id')
                },
                success: function() {
                    window.location = "/dashboard";
                }
            });
        }
    });
});