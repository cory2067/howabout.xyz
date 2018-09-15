$(function() {
    $('.date').change(function() {
        if(this.checked) {
            console.log("you checked " + this.id[1] + " " + this.id[2]);
        }
    });

    $('#submit').click(function() {
        let avail = []

        for (let date = 0; date < 2; date++) {
            avail.push([])

            for (let slot = 0; slot < 4; slot++) {
                avail[date].push($("#d" + date + slot).is(":checked"));
            }
        }

        console.log(avail);
        const payload = {
            eid: '1',
            uid: 'cjl2625@gmail.com',
            times: avail
        };


		$.ajax({
			url : '/availability',
			type: "post",
			data: JSON.stringify(payload),
			dataType: "json",
			contentType: "application/json",
			success: function(res) {
				console.log(res);   
			}
		})  
    });

    $.getJSON('/event_info/1', function(res) {
        console.log(res);
    });
});
