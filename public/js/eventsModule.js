function EventsModule(dataService) {

	function addEventListeners() {

		var items = document.querySelectorAll('.event-item')

		console.log("EventsModule.addEventListeners items", items);

		for(var i = 0; i < items.length; i =i + 1) {

			items[i].addEventListener('click', function(event){

				console.log('dbclick event', event);
				console.log('dbclick event', event.detail);
				if (event.detail == 2) {

					var eventElem = event.target.parentElement;

					var eventId = eventElem.dataset.id

					console.log('eventId', eventId);
					console.log('eventElem', eventElem);

					var eventDialogContainer = document.querySelector('.eventDialogContainer')

					eventDialogContainer.classList.add('edit-dialog')
    				eventDialogContainer.classList.add('active')
    				eventDialogContainer.dataset.id = eventId;

    				var events = dataService.getEvents()

    				var sourceEvent;

    				events.forEach(function(item) {

    					if (item.id == eventId) {
    						sourceEvent = item
    					}

    				})

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

    				var eventNameInput = document.querySelector('.eventNameInput')
				    var eventDateInput = document.querySelector('.eventDateInput')
				    var eventDateFromInput = document.querySelector('.eventDateFromInput')
				    var eventDateToInput = document.querySelector('.eventDateToInput')
				    var eventTypeInput = document.querySelector('.eventTypeInput')
				    var eventTextInput = document.querySelector('.eventTextInput')

				    eventNameInput.value = sourceEvent.name;
				    eventTypeInput.value = sourceEvent.type;
				    eventTextInput.value = sourceEvent.text;

				    if (sourceEvent.type == 1) {
				    	eventDateInput.value = new Date(sourceEvent.date).toISOString().split('T')[0];
				    }

				    if (sourceEvent.type == 3) {
				    	eventDateFromInput.value = new Date(sourceEvent.date_from).toISOString().split('T')[0];
				    	eventDateToInput.value = new Date(sourceEvent.date_to).toISOString().split('T')[0];
				    }

    				console.log('sourceEvent', sourceEvent);

				}

			})

		}

	}
	
	function render(){

		var result = '';

		var events = dataService.getEvents()

		events = events.sort(function(a,b){
		  return new Date(a.date) - new Date(b.date);
		});

		result = result + '<div class="events-holder">'

		events.forEach(function(event) {

			var eventHtml = '<div class="event-item" data-id="'+event.id+'">';

			if (event.type == 1) {
				var eventDate = new Date(event.date).toISOString().split('T')[0];
			}

			if (event.type == 3 && event.date_from) {

				var eventDate = '';

				eventDate = eventDate + new Date(event.date_from).toISOString().split('T')[0]
				eventDate = eventDate + ' - '
				eventDate = eventDate + new Date(event.date_to).toISOString().split('T')[0]
			}

			eventHtml = eventHtml + '<div class="event-item-date">' + eventDate + '</div>'
			eventHtml = eventHtml + '<div class="event-item-name">' + event.name + '</div>'
			eventHtml = eventHtml + '<div class="event-item-text">' + event.text + '</div>'

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