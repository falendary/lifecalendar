function CalendarModule(dataService) {

	function addEventListeners(){

		var items = document.querySelectorAll('.square')

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
				
				if (square.events.length) {

					square.events.forEach(function(eventItem){

						var eventHtml = '<div>';

						console.log('eventItem', eventItem);

						var prefix = '';

						if (eventItem.date) {
							prefix = new Date(eventItem.date).toISOString().split('T')[0];
						}

						if (eventItem.type == 3) {
							prefix = 'Период'
						}

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

			if (square.events.length){
				classList.push('square-has-events');
			}

			// if(square.events.length) {
			// 	classList.push('square-events-' + square.events.length);
			// }

			squareHTML = squareHTML + '<div class="square '+ classList.join(' ') +'" data-id="'+square.id+'" title="'+title+'">'

			if (square.events.length) {
				squareHTML = squareHTML + '<div class="square-events-count"> ' + square.events.length + '</div>';
			}

			if (square.events.length) {

				squareHTML = squareHTML + '<div class="event-overlay-holder">'
				
				square.events.forEach(function(event) {

					var color = '#363636';
					if (event.color) {
						color = event.color;
					}

					var size = square.events.length

					squareHTML = squareHTML + '<div class="event-overlay event-overlay-1-out-'+size+'" style="background: '+ color + '; border-color: '+color+'"></div>'

				})

				squareHTML = squareHTML + '</div>';

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
		render: render,
		addEventListeners: addEventListeners
	}

}