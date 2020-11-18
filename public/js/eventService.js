function EventService() {

	var data = {}

	function addEventListener(event, callback) {

		if (!data.hasOwnProperty(event)) {
			data[event] = []
		}

		data[event].push(callback)

	}

	function dispatchEvent(event) {

		if (data.hasOwnProperty(event)) {

			console.log("Event " + event + ' dispatched to ' + data[event].length + ' listeneers');

			data[event].forEach(function(callback){

				callback();

			})

		} else {
			console.log("Event " + event + 'dispatched. No listeners found')
		}

	}

	return {

		addEventListener: addEventListener,
		dispatchEvent: dispatchEvent


	}

}