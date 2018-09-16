var dragging = false;

function toggle() {
    const sp = event.target.id.split('-')
    console.log(sp[1] + "   " + sp[2]);
    if (dragging || event.type === "mousedown")
        $(this).toggleClass("selected");
}

$(function() {
	const eid = window.location.pathname.split('/').pop();

	$.getJSON('/api/availabilities', {eid: eid}, function(res) {
		for (let date = 0; date < res.length; date++) {
            $("#cal").append($("<div/>", { 
                id: "date-" + date ,
                class: "date"
            }));

			for (let slot = 0; slot < res[0].length; slot++) {
                let elt = $('<div>', {
                    id: "slot-" + date + "-" + slot,
                    class: "slot"
                });

                $('#date-' + date).append(elt);
				console.log(res[date][slot]);
			}
		}

        $('.slot').mouseenter(toggle);
        $('.slot').mousedown(toggle);
	});
    
    $('#cal').mousedown(function() {
        dragging = true;
        console.log("drag!");
    });
    
    $('#cal').mouseup(function() {
        dragging = false;
        console.log(" nodrag!");
    });

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
                avail[date].push($("#slot-" + date + "-" + slot).hasClass("selected"));
            }
        }

        console.log(avail);
        const payload = {
            eid: '1',
            uid: 'kyaaa@gmail.com',
            times: avail
        };


		$.ajax({
			url : '/api/availability',
			type: "post",
			data: JSON.stringify(payload),
			dataType: "json",
			contentType: "application/json",
			success: function(res) {
				console.log(res);   
			}
		})  
    });

    $.getJSON('/api/event/1', function(res) {
        console.log(res);
    });
});

/*
function main() {

    // generate table of divs based on input from create.html
    // get existing calendar data from somewhere, populate

    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', function() {
        console.log("Yay the submit button worked");
    });
}

function selectFromHere(row,col) { // do this upon mouse down
    // store this somewhere id
    return false;
}

function recolor(row,col) { // change fill color for an individual cell
    var id = "#" + "timeslot-"+row+"-"+col;

    if ($('#'+id).className == 'unavailable') {
        $('#'+id).attr('class', 'available');
    } else {
        $('#'+id).attr('class', 'unavailable')
    }
}
*/
