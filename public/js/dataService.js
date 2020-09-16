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

	return {

		setData: setData,
		getData: getData,

		setBirthday: setBirthday,
		getBirthday: getBirthday,

		setSquares: setSquares,
		getSquares: getSquares

	}

}