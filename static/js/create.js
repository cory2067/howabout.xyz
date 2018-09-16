function main() {
	// create a calendar dom object out of diffs
	createDayLabels();
	createCalendar();

	// format form data upon a button click
	// var formData = JSON.stringify($("#create-form").serializeArray());
	// var eventInfo = formatTimes(formData);
}

function createDayLabels() {
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	for (let i = 0; i < 7; i++) {
		const it = document.createElement('div');
		it.className = "calendar-squares";

		const text = document.createElement('p');
		text.innerHTML = dayNames[i];
		it.appendChild(text);

		$("#dates-picker").appendChild(it);
	}
}

function createCalendar() {
	const dayPick = $("#dates-picker");
	const cal = document.createElement('div');
	var aDay = new Date();

	for (let i=-2; i<3; i++) {
		var newRow = document.createElement('div');
		for (let j=-3; j<4; j++) {
			var dateCell = document.createElement('div');
			dateCell.className = "calendar-squares";

			var numberOfDays = i*7+j;
			aDay.setDate(aDay.getDate() + numberOfDays);
			var day = aDay.getDate();
			var month = aDay.getMonth()+1;
			var year = aDay.getFullYear();

			dateCell.innerHTML = month + '/' + day + '/' + year;
			newRow.appendChild(dateCell);
		}
		cal.appendChild(newRow);
	}

	$("#dates-picker").appendChild(cal);
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

main();