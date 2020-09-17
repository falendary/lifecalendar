function EventsModule(dataService) {
	
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
		render: render
	}

}