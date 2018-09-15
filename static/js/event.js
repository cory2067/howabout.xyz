function main() {

	// generate table of divs based on input from create.html
	// get existing calendar data from somewhere, populate

	const submitButton = document.getElementById('submit-button');
	submitButton.addEventListener('click', function() {
		console.log("Yay the submit button worked");
	});
}

function selectFromHere(date,time) { // do this upon mouse down
	// store this somewhere id
	return false;
}

function recolor(date,time) { // change fill color for an individual cell
	var id = "timeslot-"+date+"-"+time;
	
	if ($(id).className == 'unavailable') {
		$(id).attr('class', 'available');
	} else {
		$(id).attr('class', 'unavailable')
	}
}