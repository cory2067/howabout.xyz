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

		for (let date = 0; date < width+1; date++) {
            if (date != 0) { // actual cal
                $("#cal").append($("<div/>", { 
                    id: "date-" + (date-1) ,
                    class: "date"
                }));

    			for (let slot = 0; slot < height; slot++) {
                    let elt = $('<div>', {
                        id: "slot-" + (date-1) + "-" + slot,
                        class: "slot"
                    });

                    if (res[date-1][slot]) {
                        elt.addClass("selected");
                    }

                    console.log("wat");
                    $('#date-' + (date-1)).append(elt);
    				console.log(res[date-1][slot]);
    			}
            } else { // set up times
                $("#cal").append($("<div/>", {
                    id: "time-labels",
                    class: "date"
                }));

                $.getJSON('/api/event/'+eid, function (res2) {
                    res2 = $.parseJSON(res2);
                    start = res2['start_time']
                    end = res2['end_time']
                    console.log(start);

                    // create Moment obj of start time
                    var m = moment(start.substring(0,5), 'HH:mm');
                    for (let slot = 0; slot < height; slot++) {
                        var s = m.toString()
                        $('<div>', {
                            id: "time-" + slot,
                            class: "time-slot"
                        }).appendTo('#time-labels');
                        $('<p>', {
                            id: "time-" + slot + "-content",
                            text: s.substring(s.indexOf(':')-2,s.indexOf(':')+3).trim()
                        }).appendTo('#time-' + slot)
                        m.add(15, 'm')
                    }
                });
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
