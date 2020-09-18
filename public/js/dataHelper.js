function DataHelper() {

	var years = 90

	function isLeapYear(year)
	{
	  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
	}

	function getDateOfWeek(w, y) {
	    var d = (1 + (w - 1) * 7);

	    return new Date(y, 0, d);
	}

	function getWeekNumber(d) {
	    // Copy date so don't modify original
	    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	    // Set to nearest Thursday: current date + 4 - current day number
	    // Make Sunday's day number 7
	    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
	    // Get first day of year
	    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
	    // Calculate full weeks to nearest Thursday
	    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
	    // Return array of year and week number
	    return weekNo;
	}

	function generateSquaresFromDate(date){

		var result = []

		var square = {}

		date_from = new Date(date)
		date_from_year = date_from.getFullYear()

		date_to = new Date()
		date_to.setFullYear(date_from_year + years)
		date_to_year = date_to.getFullYear()

		console.log('date_from', date_from);
		console.log('date_to', date_to);

		var weeks;
		var currentYear;

		for (var y = date_from_year; y < date_to_year; y = y + 1) {

			currentYear = y;

			if (isLeapYear(currentYear)) {
				weeks = 53
			} else {
				weeks = 52
			}

			for (w = 0; w < weeks; w = w + 1) {

				square = {
					id: toMD5(currentYear + '_' + (w + 1)),
					week: w + 1,
					year: currentYear,
					startDay: getDateOfWeek(w+1, currentYear),
					events: []
				}

				result.push(square)

			}


		}

		return result;

	}

	function deleteSquaresBeforeBirthday(squares, birthday) {

		var dateBirthday = new Date(birthday)

		var pieces = birthday.split('-')
		var year = parseInt(pieces[0])

		var week = getWeekNumber(dateBirthday);

		squares = squares.filter(function(square){

			var result = true;

			if (square.year == year) {

				if (square.week < week) {
					result = false;
				}

			}

			return result

		})

		return squares

	}

	function markLivedSquares(squares, birthday) {

		var now = new Date()

		var year = now.getFullYear()
		var week = getWeekNumber(now);

		for (var i = 0; i < squares.length; i = i + 1) {

			if (squares[i].year < year) {

				squares[i].lived = true

			}

			if (squares[i].year == year) {

				if (squares[i].week < week) {
					squares[i].lived = true;
				}

			}

		}

		return squares

	}

	function getDates(startDate, stopDate) {
	    var dateArray = new Array();
	    var currentDate = startDate;
	    while (currentDate <= stopDate) {
	        dateArray.push(new Date (currentDate));
	        currentDate = currentDate.addDays(1);
	    }
	    return dateArray;
	}

	function generateRegularEvents(event) {

		var subEvents = []

		var eventDateFrom = new Date(event.date_from)
		var eventDateTo = new Date(event.date_to)

		var eventDateFromDate = eventDateFrom.getDate();
		var eventDateFromMonth = eventDateFrom.getMonth();
		var eventDateFromYear = eventDateFrom.getFullYear();
		var eventDateToYear = eventDateTo.getFullYear();
		var eventDateToMonth = eventDateTo.getMonth();

		var dates = dataHelper.getDates(new Date(event.date_from), new Date(event.date_to));

		if (event.date_type == 1) { // daily
			// TODO daily logic
		}

		if (event.date_type == 2) { // weekly
			// TODO weekly logic
		}

		if (event.date_type == 3) { // monthly
			// TODO monthly logic

			dates = dates.filter(function(date){

				var result = false;

				var dateDate = date.getDate();
				var dateMonth = date.getMonth();
				var dateYear = date.getFullYear();

				if (eventDateFromDate == dateDate) {

					if (dateYear <= eventDateToYear ) {

						if (dateYear == eventDateToYear) {

							if (dateMonth <= eventDateToMonth) {
								result = true;
							}

						} else {
							result = true;
						}

						
					}

				}

				return result;

			})

			dates.forEach(function(date){

				var subEvent = Object.assign({}, event);
				subEvent.parentEvent = event;
				subEvent.date = date;
				subEvent.type = 1

				subEvents.push(subEvent)

			})

		}

		if (event.date_type == 4) { // yearly

			dates = dates.filter(function(date){

				var result = false;

				var dateDate = date.getDate();
				var dateMonth = date.getMonth();
				var dateYear = date.getFullYear();

				if (eventDateFromDate == dateDate) {

					if (eventDateFromMonth == dateMonth) {

						if (dateYear <= eventDateToYear) {
							result = true;
						}
					}

				}

				return result;

			})

			dates.forEach(function(date){

				var subEvent = Object.assign({}, event);
				subEvent.parentEvent = event;
				subEvent.date = date;
				subEvent.type = 1

				subEvents.push(subEvent)

			})

		}

		return subEvents;

	}

	return {
		generateSquaresFromDate: generateSquaresFromDate,
		deleteSquaresBeforeBirthday: deleteSquaresBeforeBirthday,
		markLivedSquares: markLivedSquares,
		getWeekNumber: getWeekNumber,
		getDates: getDates,
		generateRegularEvents: generateRegularEvents
	}

}