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