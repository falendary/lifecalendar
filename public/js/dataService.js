function DataService() {

	var data = {}

	function setData(source) {
		console.log('data is set')
		data = source;
	}

	function getData() {
		return data;
	}

	function setBirthday(birthday) {
		data.birthday = birthday
	}

	function getBirthday(){

		console.log('data', data);

		return data.birthday;

	}

	function setSquares(squares) {
		data.squares = squares
	}

	function getSquares(){
		return data.squares
	}

	function setEvents(events) {
		data.events = events
	}

	function getEvents(){
		return data.events
	}

	function setFilters(filters) {
		data.filters = filters
	}

	function getFilters(){
		return data.filters
	}

	return {

		setData: setData,
		getData: getData,

		setBirthday: setBirthday,
		getBirthday: getBirthday,

		setSquares: setSquares,
		getSquares: getSquares,

		setEvents: setEvents,
		getEvents: getEvents,

		setFilters: setFilters,
		getFilters: getFilters

	}

}