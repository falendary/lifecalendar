function CalendarModule(dataService) {
	
	function render(){

		var result = '';

		var squares = dataService.getSquares()

		result = result + '<div class="calendar-holder">'

		var current_year = squares[0].year

	
		result = result + '<div class="year-hr">' + current_year + '</div>'

		squares.forEach(function(square){

			var squareHTML = '';

			var title = new Date(square.startDay).toISOString().split('T')[0];

			var classList = []

			if(square.lived) {
				classList.push('square-lived');
			}

			if(square.events.length) {
				classList.push('square-events-' + square.events.length);
			}

			squareHTML = squareHTML + '<div class="square '+ classList.join(' ') +'" data-id="'+square.id+'" title="'+title+'">'

			if (square.events.length) {
				squareHTML = squareHTML + square.events.length;
			}

			squareHTML = squareHTML + '</div>'

			result = result + squareHTML

			if (square.year > current_year) {

				result = result + '<div class="year-hr">' + square.year + '</div>'
				current_year = square.year
			}



		})

		result = result + '</div>'

		return result;

	}

	return {
		render: render
	}

}