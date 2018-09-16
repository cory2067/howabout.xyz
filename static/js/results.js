var eid = window.location.pathname.split('/').pop();

$(function() {
	$.getJSON('/api/availabilities', {eid: eid}, function(res) {
        const width = res.length;
        const height = res[0].length;
		
        let max = 1;
        for (let date = 0; date < width; date++) {
			for (let slot = 0; slot < height; slot++) {
                max = Math.max(max, res[date][slot].length);
            }
        }

		for (let date = 0; date < width; date++) {
            $("#cal").append($("<div/>", { 
                id: "date-" + date ,
                class: "date"
            }));
            console.log(res);
			for (let slot = 0; slot < height; slot++) {
                let amt = res[date][slot].length / max;
                let green = 255 - amt * 127;
                let other = 255 - amt * 255;

                let elt = $('<div>', {
                    id: "slot-" + date + "-" + slot,
                    class: "slot",
                    style: "background-color: RGB(" + other + ", " + green + ", " + other + ")"
                });

                $('#date-' + date).append(elt);
                $('.slot').hover(function() {
                    const sp = event.target.id.split('-');

                    $("#userlist").html(res[sp[1]][sp[2]].join(", "));
                });
			}
		}
	});
	
});
