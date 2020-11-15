function DataHelper() {

	var years = 90

	function isLeapYear(year)
	{
	  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
	}

	function getStartDayOfWeek(w, y) {

		return new Date(moment()
		.isoWeekYear(y)
		.isoWeek(w)
		.startOf('isoWeek'))

	}

	function getEndDayOfWeek(w, y) {

		return new Date(moment()
		.isoWeekYear(y)
		.isoWeek(w)
		.endOf('isoWeek'))

	}


	function getWeekNumber(d) {

	    return moment(d).isoWeek();
	}

	function generateSquaresFromDate(date){

		console.time('generateSquaresFromDate')

		var result = []

		var square = {}

		date_from = new Date(date)
		date_from_year = date_from.getFullYear()

		date_to = new Date()
		date_to.setFullYear(date_from_year + years)
		date_to_year = date_to.getFullYear()

		// console.log('date_from', date_from);
		// console.log('date_to', date_to);

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

				var startDay = getStartDayOfWeek(w+1, currentYear);
				var endDay = getEndDayOfWeek(w+1, currentYear);
				var month;

				if (startDay.getFullYear() == currentYear) {
					month = moment(startDay).month() + 1;
				} else {
					month = moment(endDay).month() + 1;
				}

				square = {
					id: toMD5(currentYear + '_' + (w + 1)),
					week: w + 1,
					month: month,
					year: currentYear,
					startDay: startDay,
					endDay: endDay,
					events: []
				}

				result.push(square)

			}


		}

		console.timeEnd('generateSquaresFromDate')

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
		var eventDateToWeek = getWeekNumber(eventDateTo)
		var eventDateToWeekPad;

		if (eventDateToWeek < 10) {
			eventDateToWeekPad = '0' + eventDateToWeek
		} else {
			eventDateToWeekPad = eventDateToWeek
		}

		var eventTosimpleWeekPattern = parseInt(eventDateToYear.toString() + eventDateToWeekPad.toString(), 10)

		var dates = dataHelper.getDates(new Date(event.date_from), new Date(event.date_to));

		if (event.date_type == 1) { // daily
			// TODO daily logic
		}

		if (event.date_type == 2) { // weekly

			var weekCounter;
		
			dates = dates.filter(function(date){

				var result = false;

				var dateDate = date.getDate();
				var dateMonth = date.getMonth();
				var dateYear = date.getFullYear();
				var dateWeek = getWeekNumber(date)

				if (dateWeek == 53 && dateMonth == 0) {
					dateWeek = 1
				}

				if (dateWeek < 10) {
					dateWeek = '0' + dateWeek 
				}

				 // "2010"+"05" = "201005" = int("201005")
				var dateSimpleWeekPattern = parseInt(dateYear.toString() + dateWeek.toString(), 10)

				if (!weekCounter) {
					weekCounter = dateSimpleWeekPattern
					result = true;
				}

				if (weekCounter < eventTosimpleWeekPattern) {
				
					if (dateSimpleWeekPattern > weekCounter) {

						weekCounter = dateSimpleWeekPattern;
						result = true
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

		if (event.date_type == 3) { // monthly

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

	function getSeasonNumberByMonthNumber(month) {

		// var monthsTitles = ['Зима', 'Весна', 'Лето', 'Осень']

		if ([12,1,2].indexOf(month) !== -1) {
			return 1
		}

		if ([3,4,5].indexOf(month) !== -1) {
			return 2
		}

		if ([6,7,8].indexOf(month) !== -1) {
			return 3
		}

		if ([9,10,11].indexOf(month) !== -1) {
			return 4
		}

	}

	return {
		generateSquaresFromDate: generateSquaresFromDate,
		deleteSquaresBeforeBirthday: deleteSquaresBeforeBirthday,
		markLivedSquares: markLivedSquares,
		getWeekNumber: getWeekNumber,
		getDates: getDates,
		generateRegularEvents: generateRegularEvents,
		getSeasonNumberByMonthNumber
	}

}