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
		return data.birthday;
	}

	function setSquares(squares) {
		data.squares = squares
	}

	function getSquares(){
		return data.squares
	}

	function setYearSquares(yearSquares) {
		data.yearSquares = yearSquares
	}

	function getYearSquares(){
		return data.yearSquares
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

	function setCategories(categories) {
		data.categories = categories;

		data.categoriesObject = {}

		data.categories.forEach(function(category){

			data.categoriesObject[category.id] = category

		})

	}

	function getCategories(){
		return data.categories
	}

	function getCategoriesAsObject(){
		return data.categoriesObject
	}

	function setCategory(id, category) {

		data.categories = data.categories.map(function(categoryItem){

			if (categoryItem == id) {
				return category
			}

			return categoryItem

		})

	}

	function setRenderType(renderType) {
		data.renderType = renderType
	}

	function getRenderType(){
		return data.renderType;
	}

	function setDayPatterns(dayPatterns) {
		data.dayPatterns = dayPatterns
	}

	function setDayPattern(pattern) {

		data.dayPatterns = data.dayPatterns.map(function(item){

			if (item.id == pattern.id) {
				return pattern;
			}

			return item
		})
	}

	function getDayPatterns(){
		return data.dayPatterns
	}

	function setDayDetail(day, dayData) {

		if (!data.days) {
			data.days = {}
		}

		data.days[day] = dayData;

	}

	function getDayDetail(day) {

		if (data.days && data.days[day]) {
			return data.days[day]
		}

		return null;
	}

	return {

		setData: setData,
		getData: getData,

		setBirthday: setBirthday,
		getBirthday: getBirthday,

		setSquares: setSquares,
		getSquares: getSquares,

		setYearSquares: setYearSquares,
		getYearSquares: getYearSquares,

		setEvents: setEvents,
		getEvents: getEvents,

		setFilters: setFilters,
		getFilters: getFilters,

		setCategories: setCategories,
		getCategories: getCategories,
		getCategoriesAsObject: getCategoriesAsObject,
		setCategory:setCategory,

		setRenderType: setRenderType,
		getRenderType: getRenderType,

		// Day Module
		setDayPatterns: setDayPatterns,
		getDayPatterns: getDayPatterns,
		setDayPattern: setDayPattern,

		setDayDetail: setDayDetail,
		getDayDetail: getDayDetail


	}

}