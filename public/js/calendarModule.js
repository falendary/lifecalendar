function CalendarModule(dataService) {
	
	function render(){

		var result = '';

		var squares = dataService.getSquares()

		result = result + '<div class="calendar-holder">'

		squares.forEach(function(square){

			var squareHTML = '';

			var classList = []

			if(square.lived) {
				classList.push('square-lived');
			}

			if(square.has_birthday_day) {
				classList.push('square-birthday');
			}

			var title = new Date(square.startDay).toISOString().split('T')[0];

			squareHTML = squareHTML + '<div class="square '+ classList.join(' ') +'" data-id="'+square.id+'" title="'+title+'">'

			squareHTML = squareHTML + '</div>'

			result = result + squareHTML

		})

		result = result + '</div>'

		return result;

	}

	return {
		render: render
	}

}