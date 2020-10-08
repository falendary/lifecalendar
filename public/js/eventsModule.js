function EventsModule(dataService) {

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

				var eventElem = event.target.parentElement.parentElement;

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

				if (square) {

					square.classList.add('highlighted')
					window.scrollTo({top: square.offsetTop - 240, behavior: 'smooth'});
					$(square).click();

				} else {
					toastr.error('Не найден квадратик')
				}


				

			})

		}

	}
	
	function render(){

		var result = '';

		var events = dataService.getEvents()

		var filters = dataService.getFilters();

		if (filters.eventSearchString && filters.eventSearchString.length > 3) {

			events = events.filter(function(event){
				return event.name.toLocaleLowerCase().indexOf(filters.eventSearchString.toLocaleLowerCase()) !== -1;
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

	return {
		render: render,
		addEventListeners: addEventListeners
	}

}