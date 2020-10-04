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

		result = result + '<div class="year-hr">' + current_year + '</div>'

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

			squareHTML = squareHTML + '<div class="square ' + classList.join(' ') +'" data-id="'+square.id+'" title="'+title+'">'

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


			if (lastDayYear > current_year) {
				
				result = result + '<div class="year-hr">' + lastDayYear + '</div>'
				current_year = lastDayYear
			}

			result = result + squareHTML

			


		})

		result = result + '</div>'

		return result;

	}

	return {
		render: render,
		addEventListeners: addEventListeners
	}

}