dragging = false;

function toggle() {
	if (dragging || event.type === "mousedown") {
		$(this).toggleClass("selected");
	}
}

function getDates() {
	const currentYear = new Date().getFullYear();
	console.log(currentYear);
	const dates = [];
	for (let i=0; i<35; i++) {
		const c = '#event-date-'+i;
		if ($(c).hasClass("selected")) {
			dates.push(currentYear + "-" + $(c).text().split('/').map(s => pad(s,2)).join('-'));
		}
	}
	return dates;
}

function main() {
	createDayLabels();
	createCalendar();

	$('.date-squares').mouseenter(toggle);
    $('.date-squares').mousedown(toggle);
}

$(function() {
	$('#dates-container').mousedown(function() {
		dragging = true;
		console.log("dragging!");
	});
	$('body').mouseup(function() {
		dragging = false;
		console.log("no dragging!");
	})
});

function createDayLabels() {
	const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

	for (let i = 0; i < 7; i++) {
		const it = document.createElement('div');
		it.className = "calendar-squares";

		const text = document.createElement('p');
		text.innerHTML = dayNames[i];
		it.appendChild(text);

		console.log("ff")
		console.log(it)
		$("#dates-container").append(it);
	}
}

function createCalendar() {
	var container = document.getElementById("dates-container");
	var contRect = container.getBoundingClientRect();
	var left = contRect.left;

	var aDay = new Date();
	var dayInd = aDay.getDay();

	for (let i=0; i<35; i++) {
		var dateCell = document.createElement('div');
		dateCell.className = "calendar-squares date-squares";
		dateCell.id = "event-date-"+i;

		var day = aDay.getDate();
		var month = aDay.getMonth()+1;
		var year = aDay.getFullYear();

		dateCell.innerHTML = month + '/' + day;
		aDay.setDate(aDay.getDate() + 1);
		container.appendChild(dateCell);
	}
}

function toJSON() {
	var o = $('#create-form').serializeArray()
		.reduce(function(a, x) {
			a[x.name] = x.value; return a; 
		}, {});
	o.eid = pad(Math.floor(Math.random() * 999999), 6); // generates random 6-digit id number
	o.dates = getDates();
	$.ajax({
		url: "/api/event",
		type: "post",
		data: JSON.stringify(o),
		dataType: "json",
		contentType: "application/json",
		complete: function(r) {
			console.log("eh?");
			window.location.replace("/event/"+o.eid) // redirect
		}
	});
}

function pad(n, size) {
    var s = n+"";
    while (s.length < size) s = "0" + s;
    return s;
}

$(main);
