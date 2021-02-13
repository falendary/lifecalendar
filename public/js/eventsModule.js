function EventsModule(dataService) {

	var EVENT_TYPES = {
	  SINGLE: 1,
	  REGULAR: 2,
	  RANGE: 3
	}

	function addEventListeners() {

		var items = document.querySelectorAll('.event-item')

		var dataHelper = new DataHelper();

		for(var i = 0; i < items.length; i =i + 1) {

			items[i].addEventListener('click', function(event){

				event.preventDefault();
				event.stopPropagation();

				document.querySelectorAll('.square').forEach(function(element){ element.classList.remove('highlighted')});
    

				console.log('dbclick event', event);
				console.log('dbclick event', event.detail);

				var eventElem = event.target.parentElement;

				var eventId = eventElem.dataset.id

				var events = dataService.getEvents()

				var sourceEvent;

				events.forEach(function(item) {

					if (item.id == eventId) {
						sourceEvent = item
					}

				})

				console.log('eventId', eventId);
				console.log('eventElem', eventElem);

				if (event.detail > 1) {

					var eventDialogContainer = document.querySelector('.eventDialogContainer')

					eventDialogContainer.classList.remove('add-dialog')
					eventDialogContainer.classList.add('edit-dialog')
    				eventDialogContainer.classList.add('active')
    				eventDialogContainer.dataset.id = eventId;

    			
    				document.querySelector('.eventDateSingleHolder').classList.remove('active');
    				document.querySelector('.eventDateRegularHolder').classList.remove('active');
    				document.querySelector('.eventDateRangeHolder').classList.remove('active');

    				if (sourceEvent.type == 1) {
    					document.querySelector('.eventDateSingleHolder').classList.add('active')	
    				}

    				if (sourceEvent.type == 2) {
    					document.querySelector('.eventDateRegularHolder').classList.add('active')
    				}

    				if (sourceEvent.type == 3) {
    					document.querySelector('.eventDateRangeHolder').classList.add('active')
    				}

    				var eventIdHolder = document.querySelector('.eventIdHolder')

    				var eventNameInput = document.querySelector('.eventNameInput')
				    var eventTypeInput = document.querySelector('.eventTypeInput')
				    var eventTextInput = document.querySelector('.eventTextInput')
				    var eventColorInput = document.querySelector('.eventColorInput')
				    

				    var eventDateInput = document.querySelector('.eventDateInput')

				    var eventDateFromInput = document.querySelector('.eventDateFromInput')
				    var eventDateToInput = document.querySelector('.eventDateToInput')

				    var eventDateRegularStartInput = document.querySelector('.eventDateRegularStartInput')
				    var eventDateRegularType = document.querySelector('.eventDateRegularType')
				    var eventDateRegularEndInput = document.querySelector('.eventDateRegularEndInput')

				    eventIdHolder.innerHTML = eventId;

				    eventNameInput.value = sourceEvent.name;
				    eventTypeInput.value = sourceEvent.type;
				    eventTextInput.value = sourceEvent.text;
				    eventColorInput.value = sourceEvent.color;

				    if (sourceEvent.type == 1) {
				    	eventDateInput.value = new Date(sourceEvent.date).toISOString().split('T')[0];
				    }

				    if (sourceEvent.type == 2) {
				    	eventDateRegularStartInput.value = new Date(sourceEvent.date_from).toISOString().split('T')[0];
				    	eventDateRegularEndInput.value = new Date(sourceEvent.date_to).toISOString().split('T')[0];
				    	eventDateRegularType.value = sourceEvent.date_type;
				    }

				    if (sourceEvent.type == 3) {
				    	eventDateFromInput.value = new Date(sourceEvent.date_from).toISOString().split('T')[0];
				    	eventDateToInput.value = new Date(sourceEvent.date_to).toISOString().split('T')[0];
				    }

				    var categorySelect = document.querySelector('.categorySelect')

				    var categorySelectOptions = categorySelect.querySelectorAll('option')

				    categorySelectOptions.forEach(function(option) {

				    	option.selected = false;

				    	console.log('option', {option: option.value})

				    	if (sourceEvent.categories) {
				    		if (sourceEvent.categories.indexOf(option.value) !== -1) {
				    			option.selected = true;
				    		}
				    	}

				    	
				    })

				    $('.eventColorInput').spectrum({
					     allowEmpty: true
					  });


				}

			})

			items[i].querySelector('.event-item-search').addEventListener('click', function(event){

				event.preventDefault();
				event.stopPropagation();

				document.querySelectorAll('.square').forEach(function(element){ element.classList.remove('highlighted')});
    

				console.log('dbclick event', event);
				console.log('dbclick event', event.detail);

				var eventElem = event.target.parentElement;

				if (!eventElem.classList.contains('event-item')) {
					eventElem = eventElem.parentElement;
				}

				var eventId = eventElem.dataset.id

				var events = dataService.getEvents()

				var sourceEvent;

				events.forEach(function(item) {

					if (item.id == eventId) {
						sourceEvent = item
					}

				})

				console.log('eventId', eventId);
				console.log('eventElem', eventElem);

				var eventDate;
				var year;
				var week;

				if (sourceEvent.type == 1) {
					eventDate = new Date(sourceEvent.date)
					year = eventDate.getFullYear()
					week = dataHelper.getWeekNumber(eventDate)
				}

				if (sourceEvent.type == 2) {
					eventDate = new Date(sourceEvent.date_from)
					year = eventDate.getFullYear()
					week = dataHelper.getWeekNumber(eventDate)
				}

				if (sourceEvent.type == 3) {
					eventDate = new Date(sourceEvent.date_from)
					year = eventDate.getFullYear()
					week = dataHelper.getWeekNumber(eventDate)
				}

				console.log('year', year);
				console.log('week', week);

				var square = document.querySelector('.square[data-year="'+ year+'"][data-week="'+ week+'"]');

				console.log("sourceEvent", sourceEvent);
				console.log("square", square);


				var squareContainer = document.querySelector('.app-left-section')

				if (square) {

					square.classList.add('highlighted')
					squareContainer.scrollTo({top: square.offsetTop - 240, behavior: 'smooth'});
					$(square).click();

				} else {
					toastr.error('Не найден квадратик')
				}


				

			})

		}

	}

	function _renderHistorical(){

		var result = '';

		var events = dataService.getEvents()

		var filters = dataService.getFilters();

		if (filters.eventSearchString && filters.eventSearchString.length > 3) {

			var searchString = filters.eventSearchString.toLocaleLowerCase()

			events = events.filter(function(event){

				var result = false

				var nameLowerCase = event.name.toLocaleLowerCase()
				var textLowerCase = event.text.toLocaleLowerCase();

				if (nameLowerCase.indexOf(searchString) !== -1) {
					result = true
				} 

				if (textLowerCase.indexOf(searchString) !== -1) {
					result = true
				} 
				
				return result;

			})

		}

		var categoriesAsObject = dataService.getCategoriesAsObject();

		events = events.sort(function(a,b){

			var date_a;
			var date_b;

			if (a.type == 1) {
				date_a = a.date;
			}

			if (b.type == 1) {
				date_b = b.date
			}

			if (a.type == 2 && a.hasOwnProperty('date_from')) {

		  	  date_a = a.date_from;

		    } 

		    if (b.type === 2 && b.hasOwnProperty('date_from')) {

		  	  date_b = b.date_from;

		    } 

		    if (a.type == 3 && a.hasOwnProperty('date_from')) {

		  	  date_a = a.date_from;

		    } 

		    if (b.type === 3 && b.hasOwnProperty('date_from')) {

		  	  date_b = b.date_from;

		    } 

		  return new Date(date_a) - new Date(date_b);
		});

		result = result + '<div class="events-holder">'

		events.forEach(function(event) {

			var eventHtml = '<div class="event-item" data-id="'+event.id+'">';

			if (event.type == 1) {
				var eventDate = new Date(event.date).toISOString().split('T')[0];
			}

			if (event.type == 2 && event.date_from) {

				var eventDate = '';

				if (event.date_type == 1) {
					eventDate = 'Каждый день'
				}

				if (event.date_type == 2) {
					eventDate = 'Каждую неделю'
				}

				if (event.date_type == 3) {
					eventDate = 'Каждый месяц'
				}

				if (event.date_type == 4) {
					eventDate = 'Каждый год'
				}

				eventDate = eventDate + ' c '
				eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
			}

			if (event.type == 3 && event.date_from) {

				var eventDate = '';

				eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
				eventDate = eventDate + ' - '
				eventDate = eventDate + new Date(event.date_to).toISOString().split('T')[0]
			}

			var eventColor = 'transparent';

			if (event.categories) {
				var categoryId = event.categories[0]

				if (categoriesAsObject.hasOwnProperty(categoryId)) {

					var category = categoriesAsObject[categoryId]

					if(category.color) {
						eventColor = category.color;
					}

				}

			}

			if(event.color) {
				eventColor = event.color;
			}

			eventHtml = eventHtml + '<div class="event-item-color" style="background: '+eventColor+'"></div>'

			eventHtml = eventHtml + '<div class="event-item-date">' + eventDate + '</div>'
			eventHtml = eventHtml + '<div class="event-item-name">' + event.name + '</div>'
			eventHtml = eventHtml + '<div class="event-item-text">' + event.text + '</div>'
			eventHtml = eventHtml + '<div class="event-item-search"><i class="fa fa-search"></i></div>'

			eventHtml = eventHtml + '</div>';

			result = result + eventHtml

		})

		
		result = result + '</div>'

		return result;

	}

	function _renderPastEvents(){

		var result = '';

		var currentDate = new Date();

		var events = JSON.parse(JSON.stringify(dataService.getEvents()))

		var filters = dataService.getFilters();

		if (filters.eventSearchString && filters.eventSearchString.length > 3) {

			var searchString = filters.eventSearchString.toLocaleLowerCase()

			events = events.filter(function(event){

				var result = false

				var nameLowerCase = event.name.toLocaleLowerCase()
				var textLowerCase = event.text.toLocaleLowerCase();

				if (nameLowerCase.indexOf(searchString) !== -1) {
					result = true
				} 

				if (textLowerCase.indexOf(searchString) !== -1) {
					result = true
				} 
				
				return result;

			})

		}

		events = events.filter(function(event){

			var match = true;

			if (event.type == 1) {

				var diff = currentDate.getTime() - new Date(event.date).getTime()
				var diffDays = Math.floor(diff / (1000 * 3600 * 24))

				if (diffDays == 0) {
					match = true
				}
				else if (diffDays >= 30) {
					match = false;
				}
				else if (currentDate.getTime() <= new Date(event.date).getTime()) {
					match = false;
				}

			} else if (event.type == 2) {

				var eventDateTo = new Date(event.date_to)

				if (currentDate.getFullYear() <= eventDateTo.getFullYear()) {

					// console.log('event', event);

					if (event.date_type == 4) {

						var currentYearEventDate = new Date(currentDate.getFullYear(), eventDateTo.getMonth(), eventDateTo.getDate())

						event.date = new Date(currentYearEventDate).toISOString();

						var diff = currentDate.getTime() - new Date(currentYearEventDate).getTime()
						var diffDays = Math.floor(diff / (1000 * 3600 * 24))

						if (diffDays == 0) {
							match = true
						}
						else if (diffDays >= 30) {
							match = false;
						}
						else if (currentDate.getTime() <= new Date(currentYearEventDate).getTime()) {
							match = false;
						}

						if (event.id == "29e966a609e51bd7420dae8a2bd68eba") {
							console.log('match', match)
							console.log('diffDays', diffDays)
							console.log('event', event);
						}

					} else {

						// TODO handle other data type
						match = false;
					}

				} else {
					match = false;
				}
				
			} else if(event.type == 3) { 

				var diff = currentDate.getTime() - new Date(event.date_from).getTime()
				var diffDays = Math.floor(diff / (1000 * 3600 * 24))

				if (diffDays == 0) {
					match = true
				}
				else if (diffDays >= 30) {
					match = false;
				}
				else if (currentDate.getTime() <= new Date(event.date_from).getTime()) {
					match = false;
				}

			} else {
				
				match = false; 
			}

			return match
		})

		var categoriesAsObject = dataService.getCategoriesAsObject();

		events = events.sort(function(a,b){

			var date_a;
			var date_b;

			if (a.type == 1 || a.type == 2) {
				date_a = a.date;
			}

			if (b.type == 1 || b.type == 2) {
				date_b = b.date
			}

		    if (a.type == 3 && a.hasOwnProperty('date_from')) {

		  	  date_a = a.date_from;

		    } 

		    if (b.type === 3 && b.hasOwnProperty('date_from')) {

		  	  date_b = b.date_from;

		    } 

		  return new Date(date_a) - new Date(date_b);

		});

		events = events.reverse()

		result = result + '<div class="events-holder">'

		if (events.length) {

			events.forEach(function(event) {

				var eventHtml = '<div class="event-item" data-id="'+event.id+'">';

				if (event.type == 1) {
					var eventDate = new Date(event.date).toISOString().split('T')[0];
				}

				if (event.type == 2 && event.date_from) {

					var eventDate = '';

					if (event.date_type == 1) {
						eventDate = 'Каждый день'
					}

					if (event.date_type == 2) {
						eventDate = 'Каждую неделю'
					}

					if (event.date_type == 3) {
						eventDate = 'Каждый месяц'
					}

					if (event.date_type == 4) {
						eventDate = 'Каждый год'
					}

					eventDate = eventDate + ' c '
					eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
				}

				if (event.type == 3 && event.date_from) {

					var eventDate = '';

					eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
					eventDate = eventDate + ' - '
					eventDate = eventDate + new Date(event.date_to).toISOString().split('T')[0]
				}

				var eventColor = 'transparent';

				if (event.categories) {
					var categoryId = event.categories[0]

					if (categoriesAsObject.hasOwnProperty(categoryId)) {

						var category = categoriesAsObject[categoryId]

						if(category.color) {
							eventColor = category.color;
						}

					}

				}

				if(event.color) {
					eventColor = event.color;
				}

				eventHtml = eventHtml + '<div class="event-item-color" style="background: '+eventColor+'"></div>'

				eventHtml = eventHtml + '<div class="event-item-date">' + eventDate + '</div>'
				eventHtml = eventHtml + '<div class="event-item-name">' + event.name + '</div>'
				eventHtml = eventHtml + '<div class="event-item-text">' + event.text + '</div>'
				eventHtml = eventHtml + '<div class="event-item-search"><i class="fa fa-search"></i></div>'

				eventHtml = eventHtml + '</div>';

				result = result + eventHtml

			})

		} else {
			result = result + '<div class="text-center">Нет событий</div>'
		}

		result = result + '</div>'

		return result;

	}

	function _renderFutureEvents(){

		var result = '';

		var currentDate = new Date();

		var events = dataService.getEvents()

		var filters = dataService.getFilters();

		if (filters.eventSearchString && filters.eventSearchString.length > 3) {

			var searchString = filters.eventSearchString.toLocaleLowerCase()

			events = events.filter(function(event){

				var result = false

				var nameLowerCase = event.name.toLocaleLowerCase()
				var textLowerCase = event.text.toLocaleLowerCase();

				if (nameLowerCase.indexOf(searchString) !== -1) {
					result = true
				} 

				if (textLowerCase.indexOf(searchString) !== -1) {
					result = true
				} 
				
				return result;

			})

		}

		events = events.filter(function(event){

			var match = true;

			if (event.type == 1) {

				var diff = new Date(event.date).getTime() - currentDate.getTime()
				var diffDays = Math.floor(diff / (1000 * 3600 * 24))

				if (diffDays > 30) {
					match = false;
				}
				else if (new Date(event.date).getTime() < currentDate.getTime()) {
					match = false;
				}

			} else if (event.type == 2) {

				var eventDateTo = new Date(event.date_to)

				if (currentDate.getFullYear() <= eventDateTo.getFullYear()) {

					if (event.date_type == 4) {

						var currentYearEventDate = new Date(currentDate.getFullYear(), eventDateTo.getMonth(), eventDateTo.getDate())

						var diff = new Date(currentYearEventDate).getTime() - currentDate.getTime()
						var diffDays = Math.floor(diff / (1000 * 3600 * 24))

						if (diffDays > 30) {
							match = false;
						}
						else if (new Date(currentYearEventDate).getTime() < currentDate.getTime()) {
							match = false;
						}

					} else {

						// TODO handle other data type
						match = false;
					}

				} else {
					match = false;
				}
				
			} else {
				// TODO handle other event types
				match = false; 
			}

			return match
		})

		var categoriesAsObject = dataService.getCategoriesAsObject();

		events = events.sort(function(a,b){

			var date_a;
			var date_b;

			if (a.type == 1) {
				date_a = a.date;
			}

			if (b.type == 1) {
				date_b = b.date
			}

			if (a.type == 2 && a.hasOwnProperty('date_from')) {

		  	  date_a = a.date_from;

		    } 

		    if (b.type === 2 && b.hasOwnProperty('date_from')) {

		  	  date_b = b.date_from;

		    } 

		    if (a.type == 3 && a.hasOwnProperty('date_from')) {

		  	  date_a = a.date_from;

		    } 

		    if (b.type === 3 && b.hasOwnProperty('date_from')) {

		  	  date_b = b.date_from;

		    } 

		  return new Date(date_a) - new Date(date_b);
		});

		events = events.reverse()

		result = result + '<div class="events-holder">'

		if (events.length) {

			events.forEach(function(event) {

				var eventHtml = '<div class="event-item" data-id="'+event.id+'">';

				if (event.type == 1) {
					var eventDate = new Date(event.date).toISOString().split('T')[0];
				}

				if (event.type == 2 && event.date_from) {

					var eventDate = '';

					if (event.date_type == 1) {
						eventDate = 'Каждый день'
					}

					if (event.date_type == 2) {
						eventDate = 'Каждую неделю'
					}

					if (event.date_type == 3) {
						eventDate = 'Каждый месяц'
					}

					if (event.date_type == 4) {
						eventDate = 'Каждый год'
					}

					eventDate = eventDate + ' c '
					eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
				}

				if (event.type == 3 && event.date_from) {

					var eventDate = '';

					eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
					eventDate = eventDate + ' - '
					eventDate = eventDate + new Date(event.date_to).toISOString().split('T')[0]
				}

				var eventColor = 'transparent';

				if (event.categories) {
					var categoryId = event.categories[0]

					if (categoriesAsObject.hasOwnProperty(categoryId)) {

						var category = categoriesAsObject[categoryId]

						if(category.color) {
							eventColor = category.color;
						}

					}

				}

				if(event.color) {
					eventColor = event.color;
				}

				eventHtml = eventHtml + '<div class="event-item-color" style="background: '+eventColor+'"></div>'

				eventHtml = eventHtml + '<div class="event-item-date">' + eventDate + '</div>'
				eventHtml = eventHtml + '<div class="event-item-name">' + event.name + '</div>'
				eventHtml = eventHtml + '<div class="event-item-text">' + event.text + '</div>'
				eventHtml = eventHtml + '<div class="event-item-search"><i class="fa fa-search"></i></div>'

				eventHtml = eventHtml + '</div>';

				result = result + eventHtml

			})

		} else {
			result = result + '<div class="text-center">Нет событий</div>'
		}

		result = result + '</div>'

		return result;

	}

	function _renderFeed(){

		var result = '';

		result = result + '<h3 class="events-feed-title">Ближайшие события</h3>'

		result = result + _renderFutureEvents()

		result = result + '<h3 class="events-feed-title">Недавние события</h3>'

		result = result + _renderPastEvents()

		return result;

	}
	
	function render(){

		var feedType = dataService.getEventsFeedType();

		if (feedType == 'feed') {
			return _renderFeed();
		}

		return _renderHistorical()

	}

	return {
		render: render,
		addEventListeners: addEventListeners
	}

}