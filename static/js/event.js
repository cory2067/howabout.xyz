var eid = window.location.pathname.split('/').pop();
var dragging = false;
var width, height;

function toggle() {
    const sp = event.target.id.split('-')
    console.log(sp[1] + "   " + sp[2]);
    if (dragging || event.type === "mousedown") {
        $(this).toggleClass("selected");
    }
}

function getAvail() {
    let avail = []

    for (let date = 0; date < width; date++) {
        avail.push([])

        for (let slot = 0; slot < height; slot++) {
            avail[date].push($("#slot-" + date + "-" + slot).hasClass("selected"));
        }
    }

    console.log(avail);
    return avail;
}

function submit() {
    const payload = {
        eid: eid,
        times: getAvail()
    };

    $.ajax({
        url : '/api/availability',
        type: 'put',
        data: JSON.stringify(payload),
        dataType: "json",
        contentType: "application/json",
        success: function(res) {
            console.log(res);   
        }
    });
}

$(function() {
	$.getJSON('/api/availability', {eid: eid}, function(res) {
        width = res.length;
        height = res[0].length;

		for (let date = 0; date < width; date++) {
            $("#cal").append($("<div/>", { 
                id: "date-" + date ,
                class: "date"
            }));

			for (let slot = 0; slot < height; slot++) {
                let elt = $('<div>', {
                    id: "slot-" + date + "-" + slot,
                    class: "slot"
                });

                if (res[date][slot]) {
                    elt.addClass("selected");
                }

                $('#date-' + date).append(elt);
				console.log(res[date][slot]);
			}
		}

        $('.slot').mouseenter(toggle);
        $('.slot').mousedown(toggle);
        submit();
	});
	
    $('#cal').mousedown(function() {
        dragging = true;
        console.log("drag!");
    });
    
    $('body').mouseup(function() {
        dragging = false;
        console.log(" nodrag!");
        submit();
    });

    $('.date').change(function() {
        if(this.checked) {
            console.log("you checked " + this.id[1] + " " + this.id[2]);
        }
    });

    $('#import-button').click(function() {
        $.getJSON('/api/calendars', function(res) {
            const clist = [];
            for (let cal in res) {
                if (res[cal].selected) {
                    clist.push(res[cal]['id']);
                }
            }

            $.getJSON('/api/calendar', {"calendars": clist, "eid": eid}, function(res) {
                for (let day = 0; day < width; day++) {
                    for (let slot = 0; slot < height; slot++) {
                        let obj = $("#slot-" + day + "-" + slot);
                        if (res[day][slot]) {
                            obj.addClass("selected");
                        } else {
                            obj.removeClass("selected");
                        }
                    }
                }

                submit();
            });
        });
    });
});
