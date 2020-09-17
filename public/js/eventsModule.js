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

    				var eventNameInput = document.querySelector('.eventNameInput')
				    var eventDateInput = document.querySelector('.eventDateInput')
				    var eventTypeInput = document.querySelector('.eventTypeInput')
				    var eventTextInput = document.querySelector('.eventTextInput')

				    eventNameInput.value = sourceEvent.name;
				    eventTypeInput.value = sourceEvent.type;
				    eventTextInput.value = sourceEvent.text;

				    if (sourceEvent.type == 1) {
				    	eventDateInput.value = new Date(sourceEvent.date).toISOString().split('T')[0];
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