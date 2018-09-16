console.log(":<")

function main() {
	// create a calendar dom object out of diffs
	createDayLabels();
	createCalendar();

	// format form data upon a button click
	// var formData = JSON.stringify($("#create-form").serializeArray());
	// var eventInfo = formatTimes(formData);
}

function createDayLabels() {
	console.log("bullet hell");
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
	console.log(dayInd);

	for (let i=0; i<35; i++) {
		var dateCell = document.createElement('div');
		dateCell.className = "calendar-squares date-squares";

		var day = aDay.getDate();
		var month = aDay.getMonth()+1;
		var year = aDay.getFullYear();

		dateCell.innerHTML = month + '/' + day;
		aDay.setDate(aDay.getDate() + 1);
		dayInd += 1
		container.appendChild(dateCell);
	}	
}

function toJSON() {
	var o = $('#create-form').serializeArray()
		.reduce(function(a, x) {
			a[x.name] = x.value; return a; 
		}, {});
	o.eid = pad(Math.floor(Math.random() * 999999), 6); // generates random 6-digit id number
	o.dates = [];
	$.ajax({
		url: "api/event",
		type: "post",
		data: JSON.stringify(o),
		dataType: "json",
		contentType: "application/json",
		success: function(r) {
			console.log(r);
		}
	});
}

function pad(n, size) {
    var s = n+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function formatTimes(fromTime, toTime, dates, timeZones) {
	return [];
}

$(main);
