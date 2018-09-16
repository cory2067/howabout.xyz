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
		$("#dates-picker").append(it);
	}
	$("#dates-picker").append("<br>");
}

function createCalendar() {
	var container = document.getElementById("dates-picker");
	var contRect = container.getBoundingClientRect();
	var left = contRect.left;

	const cal = document.createElement('div');
	var aDay = new Date();
	var dayInd = aDay.getDay();
	console.log(dayInd);

	for (let i=0; i<35; i++) {
		var dateCell = document.createElement('div');
		if (dayInd%7 == 0) {
			dateCell.className = "calendar-squares-row-start date-squares";
		}
		else {
			dateCell.className = "calendar-squares date-squares";
		}

		var day = aDay.getDate();
		var month = aDay.getMonth()+1;
		var year = aDay.getFullYear();

		dateCell.innerHTML = month + '/' + day + '/' + year%100;
		aDay.setDate(aDay.getDate() + 1);
		dayInd += 1

		cal.appendChild(dateCell);
	}

	$("#dates-picker").append(cal);
}

function toJSON() {
	var o = $('#create-form').serializeArray()
		.reduce(function(a, x) {
			a[x.name] = x.value; return a; 
		}, {});
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


$(main);