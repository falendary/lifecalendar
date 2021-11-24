function WeekDetailModule(dataService) {

	function addEventListeners(){

		var closeButton = document.querySelector('.closeWeekDetailButton')

		var container = document.querySelector('.weekDetailDialogContainer');
      	var dialogContent = document.querySelector('.weekDetailDialog')

		closeButton.addEventListener('click', function(){

			location.hash = '#/';
			container.classList.remove('active');
			dialogContent.innerHTML = '';

		})
	  
		
	}

	function _generateDaySquare(square) {

		var dataHelper = new DataHelper();

		var dates = dataHelper.getDates(square.startDay, square.endDay)

		var result = [];

		dates.forEach(function(date) {

			var daySquare = {
						id: toMD5('day_square_' + square.id + '_' + (date)),
						date: date,
						events: []
					}

			square.events.forEach(function(event) {

				var evDate;

				if (event.hasOwnProperty('date')) {
					evDate = new Date(event.date).toISOString().split('T')[0]
				} else if (event.hasOwnProperty('date_from'))  {
					evDate = new Date(event.date_from).toISOString().split('T')[0]
				}

				var squareDate = date.toISOString().split('T')[0]

				if (evDate == squareDate) {
					daySquare.events.push(event);
				}

			})

			result.push(daySquare)

		})

		return result;

	}

	function getDayName(date) {

		var days = {
			"Monday": "Понедельник",
			"Tuesday": "Вторник",
			"Wednesday": "Среда",
			"Thursday": "Четверг",
			"Friday": "Пятница",
			"Saturday": "Суббота",
			"Sunday": "Воскресенье"
		}

		var weekDayName =  moment(new Date(date)).format('dddd');

		return days[weekDayName]

	}
	
	function render(squareId){

		var result = '';

		result = result + "<button class='close-week-detail-button closeWeekDetailButton'>Закрыть</button>"

		var square;

		var squares = dataService.getSquares();

		squares.forEach(function(squareItem){

			if(squareItem.id == squareId) {
				square = squareItem;
			}

		})

		console.log('square', square);

		var daySquares = _generateDaySquare(square)

		console.log('daySquares', daySquares);

		result = result + '<div class="day-squares-container">'

		daySquares.forEach(function(daySquare){

			var daySquareHTML = '<div class="day-square">';

			var prettyDate = new Date(daySquare.date).toISOString().split('T')[0];
			var datePieces = prettyDate.split('-')
			var year = datePieces[0]
			var month = datePieces[1]
			var day = datePieces[2]

			daySquareHTML = daySquareHTML + '<div class="day-square-date"><a class="show-day-detail" href="#/view/'+year+'/'+month+'/'+day+'">Просмотр дня</a>' + prettyDate + ' <span class="day-square-date-right">' + getDayName(daySquare.date) + '</span></div>'

			if (daySquare.events.length) {

				daySquareHTML = daySquareHTML  + '<div class="day-square-events">'

				daySquare.events.forEach(function(daySquareEvent) {

					daySquareHTML = daySquareHTML + '<div class="day-square-event">'
					daySquareHTML = daySquareHTML + '<div class="day-square-event-title">' + daySquareEvent.name + '</div>'
					daySquareHTML = daySquareHTML + '<div class="day-square-event-text">' + daySquareEvent.text + '</div>'
					daySquareHTML = daySquareHTML + '</div>'

				})

				daySquareHTML = daySquareHTML + '</div>'

			} else {

				daySquareHTML = daySquareHTML + '<div class="day-square-event-not-found">Ничего не произошло</div>'

			}

			daySquareHTML = daySquareHTML + '</div>'

			result = result + daySquareHTML;

		})

		result = result + '</div>'


		return result;

	}

	return {
		render: render,
		addEventListeners: addEventListeners
	}

}