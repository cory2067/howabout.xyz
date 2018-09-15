$(function() {
    $('.date').change(function() {
        if(this.checked) {
            console.log("you checked " + this.id[1] + " " + this.id[2]);
        }
    });

    $.getJSON('/event_info/1', function(res) {
        console.log(res);
    });
});
