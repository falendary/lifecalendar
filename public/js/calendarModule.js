function CalendarModule(dataService) {

	function addEventListeners(){

		var items = document.querySelectorAll('.square')
		var categoriesAsObject = dataService.getCategoriesAsObject();

		for(var i = 0; i < items.length; i =i + 1) {

			items[i].addEventListener('click', function(event){

				event.preventDefault();
				event.stopPropagation();

				var squareElem;

				if (event.target.classList.contains('square')) {
					squareElem = event.target	
				}

				if (event.target.parentElement.classList.contains('square')) {
					squareElem = event.target.parentElement;
				}

				if (event.target.parentElement.parentElement.classList.contains('square')) {
					squareElem = event.target.parentElement.parentElement;
				}

				var squareId = squareElem.dataset.id

				console.log("here click squareElem", squareElem)
				console.log("here click squareId", squareId)

				document.querySelectorAll('.square-context-menu').forEach(function(element){ element.remove()});

				var node = document.createElement("DIV");   
				node.classList.add('square-context-menu')    
				node.classList.add('squareContextMenu')    

				document.body.appendChild(node)

				var top = squareElem.getBoundingClientRect().y
				var left = squareElem.getBoundingClientRect().x
				var height = squareElem.getBoundingClientRect().height;
				var width = squareElem.getBoundingClientRect().width;

				node.style.top = squareElem.offsetTop + height - 24 + 'px';
				node.style.left = squareElem.offsetLeft + width - 24 +  'px';

				var square;

				var squares = dataService.getSquares();

				squares.forEach(function(squareItem){

					if(squareItem.id == squareId) {
						square = squareItem;
					}

				})

				var contextMenuHtml = '';

				contextMenuHtml = contextMenuHtml + '<div>';

				var squareDateStart = new Date(square.startDay).toISOString().split('T')[0];
				var squareDateEnd = new Date(square.endDay).toISOString().split('T')[0];

				contextMenuHtml = contextMenuHtml + '<div class="context-menu-header">'
				contextMenuHtml = contextMenuHtml + squareDateStart + ' - ' + squareDateEnd + ' ' + '<span class="context-menu-week-holder">' + square.week +' неделя</span>'
				contextMenuHtml = contextMenuHtml + '</div>'

				console.log('squareItem', square);
			
				if (square.events.length) {

					square.events.forEach(function(eventItem){

						var eventHtml = '<div class="context-menu-event" data-id="'+eventItem.id+'">';

						console.log('eventItem', eventItem);

						var prefix = '';

						if (eventItem.date) {
							prefix = new Date(eventItem.date).toISOString().split('T')[0];
						}

						if (eventItem.type == 3) {

							var dateFrom = new Date(eventItem.date_from).toISOString().split('T')[0];
							var dateTo = new Date(eventItem.date_to).toISOString().split('T')[0];

							prefix = '<span class="context-menu-period-label" title="'+ dateFrom +' - ' + dateTo + '">Период</span>'
						}

						var color = 'transparent';

						if (eventItem.categories) {

							console.log('eventItem', eventItem);

							var categoryId = eventItem.categories[0]
							if (categoriesAsObject.hasOwnProperty(categoryId)) {

							var category = categoriesAsObject[categoryId]

							if(category.color) {
								color = category.color;
							}
						}

						}

						if(eventItem.color) {
							color = eventItem.color;
						}

						eventHtml = eventHtml + "<div class='context-menu-event-color' style='background: "+color+"'></div>"

						eventHtml = eventHtml + prefix + ' / ' + eventItem.name

						eventHtml = eventHtml + '</div>'

						contextMenuHtml = contextMenuHtml + eventHtml



					})


				} else {
					contextMenuHtml = contextMenuHtml + 'Не было никаких событий';
				}


				contextMenuHtml = contextMenuHtml + '</div>';


				node.innerHTML = contextMenuHtml

			})

		}

	}

	function _renderSquareOverlayColors(square, categoriesAsObject){

		var result =  '<div class="event-overlay-holder">';
				
		square.events.forEach(function(event) {

			var color = '#363636';

			if (event.categories) {

				var categoryId = event.categories[0]

				if (categoriesAsObject.hasOwnProperty(categoryId)) {

					var category = categoriesAsObject[categoryId]

					if(category.color) {
						color = category.color;
					}

				}

			}

			if (event.color) {
				color = event.color;
			}

			var size = square.events.length

			result = result + '<div class="event-overlay event-overlay-1-out-'+size+'" style="background: '+ color + '; border-color: '+color+'"></div>'

		})

		result = result + '</div>';

		return result

	}

	function _renderSquare(square, options){

		var squareHTML = '';

		var title = new Date(square.startDay).toISOString().split('T')[0];

		var classList = []

		if(square.lived) {
			classList.push('square-lived');
		}

		if (square.events.length){
			classList.push('square-has-events');
		}

		if (square.year == options.currentYear && square.week == options.currentWeek) {
			classList.push('square-current-week')
		}

		squareHTML = squareHTML + '<div ' +
				'class="square ' + classList.join(' ') +'"'+
				'data-year="' + square.year + '"' +
				'data-month="' + square.month + '"' +
				'data-week="' + square.week + '"' +
				'data-id="' + square.id + '"' + 
				'title="' + title + '">'

		if (square.events.length) {
			squareHTML = squareHTML + '<div class="square-events-count"> ' + square.events.length + '</div>';
		}

		if (square.events.length) {
			squareHTML = squareHTML + _renderSquareOverlayColors(square, options.categoriesAsObject)
		}

		squareHTML = squareHTML + '</div>'

		

		return squareHTML

	}

	function renderDefault(){

		var result = '';

		var squares = JSON.parse(JSON.stringify(dataService.getSquares()))
		var categoriesAsObject = dataService.getCategoriesAsObject();

		var dataHelper = new DataHelper();

		result = result + '<div class="calendar-holder">'

		var filters = dataService.getFilters();

		if(filters) {

			squares = squares.filter(function(square){

				var result = false;

				if (filters.year_from && filters.year_to) {

					if (square.year > filters.year_from && square.year < filters.year_to) {
						result = true;
					}

				}

				return result

			})

		}

		var currentYear = new Date().getFullYear() // actual current year
		var currentWeek = dataHelper.getWeekNumber(new Date()) // actual current week

		squares.forEach(function(square){

			var options = {
				categoriesAsObject: categoriesAsObject,
				currentYear: currentYear,
				currentWeek: currentWeek
			}

			var squareHTML = _renderSquare(square, options);

			result = result + squareHTML

		})

		result = result + '</div>'

		return result;

	}

	function renderGroupByYears(){

		var result = '';

		var squares = JSON.parse(JSON.stringify(dataService.getSquares()))
		var categoriesAsObject = dataService.getCategoriesAsObject();

		var dataHelper = new DataHelper();

		result = result + '<div class="calendar-holder">'

		var filters = dataService.getFilters();

		if(filters) {

			squares = squares.filter(function(square){

				var result = false;

				if (filters.year_from && filters.year_to) {

					if (square.year > filters.year_from && square.year < filters.year_to) {
						result = true;
					}

				}

				return result

			})

		}

		var firstSquareEndDayYear = new Date(squares[0].endDay).getFullYear()

		var current_year = firstSquareEndDayYear; // need for year representing

		result = result + '<div class="year-hr">' + current_year + '</div>'

		var eventsCount = 0;

		var currentYear = new Date().getFullYear() // actual current year
		var currentWeek = dataHelper.getWeekNumber(new Date()) // actual current week

		squares.forEach(function(square){

			var options = {
				categoriesAsObject: categoriesAsObject,
				currentYear: currentYear,
				currentWeek: currentWeek
			}

			var squareHTML = _renderSquare(square, options);

			var lastDayYear = new Date(square.endDay).getFullYear()

			if (lastDayYear > current_year) {
				
				result = result + '<div class="year-hr"><span title="' + eventsCount + ' событий">' + lastDayYear + '</span></div>'
				current_year = lastDayYear
				eventsCount = 0;
			} 

			eventsCount = eventsCount + square.events.length;

			result = result + squareHTML

		})

		result = result + '</div>'

		return result;

	}

	function renderGroupBySeasons(){

		var result = '';

		var squares = JSON.parse(JSON.stringify(dataService.getSquares()))
		var categoriesAsObject = dataService.getCategoriesAsObject();

		var dataHelper = new DataHelper();

		result = result + '<div class="calendar-holder">'

		var filters = dataService.getFilters();

		if(filters) {

			squares = squares.filter(function(square){

				var result = false;

				if (filters.year_from && filters.year_to) {

					if (square.year > filters.year_from && square.year < filters.year_to) {
						result = true;
					}

				}

				return result

			})

		}

		var current_season = dataHelper.getSeasonNumberByMonthNumber(squares[0].month)
		var current_year = squares[0].year
		var prevSquare = squares[0];
		var eventsCount = 0;

		var currentYear = new Date().getFullYear() // actual current year
		var currentWeek = dataHelper.getWeekNumber(new Date()) // actual current week

		var monthsTitles = ['Зима', 'Весна', 'Лето', 'Осень']

		result = result + '<div class="season-square-container">'

		squares.forEach(function(square){

			var squareSeason = dataHelper.getSeasonNumberByMonthNumber(square.month)

			if (current_season != squareSeason || (current_season == squareSeason && current_year != square.year)) {

				result = result + 
						'<div class="square-season-info">' +
							'<span title="' + eventsCount + ' событий">' + monthsTitles[current_season - 1] + ' ' + prevSquare.year + '</span>' +
						'</div>'
		
				result = result + '</div><div class="season-square-container">'

				prevSquare = square
				current_season = squareSeason
				current_year = square.year
				eventsCount = 0;
		
			}

			eventsCount = eventsCount + square.events.length;

			var options = {
				categoriesAsObject: categoriesAsObject,
				currentYear: currentYear,
				currentWeek: currentWeek
			}

			var squareHTML = _renderSquare(square, options);

			result = result + squareHTML

		})

		result = result + '</div>'

		return result;

	}

	function renderGroupByMonths() {

		var result = '';

		var squares = JSON.parse(JSON.stringify(dataService.getSquares()))
		var categoriesAsObject = dataService.getCategoriesAsObject();

		var dataHelper = new DataHelper();

		result = result + '<div class="calendar-holder">'

		var filters = dataService.getFilters();

		if(filters) {

			squares = squares.filter(function(square){

				var result = false;

				if (filters.year_from && filters.year_to) {

					if (square.year > filters.year_from && square.year < filters.year_to) {
						result = true;
					}

				}

				return result

			})

		}

		var current_month = squares[0].month;
		var prevSquare = squares[0];
		var eventsCount = 0;

		var currentYear = new Date().getFullYear() // actual current year
		var currentWeek = dataHelper.getWeekNumber(new Date()) // actual current week

		var monthsTitles = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

		result = result + '<div class="month-square-container">'

		squares.forEach(function(square){

			if (current_month != square.month) {

				var monthIndex = prevSquare.month - 1

				result = result + 
						'<div class="square-month-info">' +
							'<span title="' + eventsCount + ' событий">' + monthsTitles[monthIndex] + ' ' + prevSquare.year + '</span>' +
						'</div>'
		
				result = result + '</div><div class="month-square-container">'

				prevSquare = square
				current_month = square.month
				eventsCount = 0;
		
			}

			eventsCount = eventsCount + square.events.length;

			var options = {
				categoriesAsObject: categoriesAsObject,
				currentYear: currentYear,
				currentWeek: currentWeek
			}

			var squareHTML = _renderSquare(square, options);

			result = result + squareHTML

		})

		result = result + '</div>'

		return result;

	}

	// deprecated below
	
	function render(){

		var result = '';

		var squares = JSON.parse(JSON.stringify(dataService.getSquares()))
		var categoriesAsObject = dataService.getCategoriesAsObject();

		var dataHelper = new DataHelper();

		result = result + '<div class="calendar-holder">'

		var filters = dataService.getFilters();

		if(filters) {

			squares = squares.filter(function(square){

				var result = false;

				if (filters.year_from && filters.year_to) {

					if (square.year > filters.year_from && square.year < filters.year_to) {
						result = true;
					}

				}

				return result

			})

		}

		var firstSquareEndDayYear = new Date(squares[0].endDay).getFullYear()

		var current_year = firstSquareEndDayYear; // need for year representing
		var current_month = squares[0].month;



		result = result + '<div class="year-hr">' + current_year + '</div>'

		result = result + '<div class="month-square-container">'

		var currentYear = new Date().getFullYear() // actual current year
		var currentWeek = dataHelper.getWeekNumber(new Date()) // actual current week


		console.log('squares', squares);

		squares.forEach(function(square){

			var squareHTML = '';

			var title = new Date(square.startDay).toISOString().split('T')[0];

			var classList = []

			if(square.lived) {
				classList.push('square-lived');
			}

			if (square.events.length){
				classList.push('square-has-events');
			}

			if (square.year == currentYear && square.week == currentWeek) {
				classList.push('square-current-week')
			}

			// if(square.events.length) {
			// 	classList.push('square-events-' + square.events.length);
			// }

			squareHTML = squareHTML + '<div class="square ' + classList.join(' ') +'" data-year="' + square.year + '" data-week="' + square.week + '" data-id="'+square.id+'" title="'+title+'">'

			if (square.events.length) {
				squareHTML = squareHTML + '<div class="square-events-count"> ' + square.events.length + '</div>';
			}

			if (square.events.length) {

				squareHTML = squareHTML + '<div class="event-overlay-holder">'
				
				square.events.forEach(function(event) {

					var color = '#363636';

					if (event.categories) {

						var categoryId = event.categories[0]

						if (categoriesAsObject.hasOwnProperty(categoryId)) {

							var category = categoriesAsObject[categoryId]

							if(category.color) {
								color = category.color;
							}

						}

					}

					if (event.color) {
						color = event.color;
					}

					var size = square.events.length

					squareHTML = squareHTML + '<div class="event-overlay event-overlay-1-out-'+size+'" style="background: '+ color + '; border-color: '+color+'"></div>'

				})

				squareHTML = squareHTML + '</div>';

			}

			squareHTML = squareHTML + '</div>'

			var lastDayYear = new Date(square.endDay).getFullYear()


			if (current_month != square.month) {
				current_month = square.month

				if (lastDayYear > current_year) {
				
					result = result + '</div><div class="year-hr">' + lastDayYear + '</div><div class="month-square-container">'
					current_year = lastDayYear
				} else {


				result = result + '</div><div class="month-square-container">'

				}
			}

			result = result + squareHTML

			


		})

		result = result + '</div>'

		return result;

	}

	function renderMonths(){

		var result = '';

		// TODO mae generation of month once at app start
		var dataHelper = new DataHelper();

		var filters = dataService.getFilters();
		var birthday = dataService.getBirthday();

		var startYear
		var endYear;

		if(filters) {

			startYear = filters.year_from + 1
			endYear = filters.year_to - 1

		} else {

			startYear = birthday;
			endYear = birthday + 100

		}

		var monthsTitles = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

		var months = []

		console.log('startYear', startYear)
		console.log('endYear', endYear)

		for (var y = startYear; y < endYear; y = y + 1) {

			for(var m = 0; m < monthsTitles.length; m = m + 1) {

				var firstDayOfMonth = new Date(y, m, 4); // start from 4 day of month, maybe suspicious
				var lastDayOfMonth = new Date(y, m + 1, 0);

				months.push({
					startWeek: dataHelper.getWeekNumber(firstDayOfMonth),
					endWeek: dataHelper.getWeekNumber(lastDayOfMonth),
					name: monthsTitles[m],
					year: y
				})

			}

		}

		months.forEach(function(month){

			var squareStart = document.querySelector('.square[data-year="'+ month.year+'"][data-week="'+ (month.startWeek + 1)+'"]');
			var squareEnd = document.querySelector('.square[data-year="'+ month.year+'"][data-week="'+ month.endWeek+'"]');

			console.log('month', month);

			var offsetTop = squareStart.offsetTop + 48 + 6;
			var offsetLeft = squareStart.offsetLeft + 2

			var monthHTML = '<div class="month-title" style="top: ' + offsetTop + 'px; left: ' + offsetLeft + 'px">'

			monthHTML = monthHTML + month.name + ' ' + month.year

			monthHTML = monthHTML + "</div>"

			result = result + monthHTML;

		})


		return result;

	}

	return {

		renderGroupByYears: renderGroupByYears,
		renderGroupBySeasons: renderGroupBySeasons,
		renderGroupByMonths: renderGroupByMonths,
		renderDefault: renderDefault,

		// deprecated
		render: render,
		renderMonths: renderMonths,
		addEventListeners: addEventListeners
	}

}