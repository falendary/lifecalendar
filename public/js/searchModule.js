function SearchModule(dataService, eventService) {

	var _dialogContent;
	var _container
	var _query;
	var _patternId;
	var _dayDetails;
	var _categoriesAsObject;


	function addEventListeners(dayDate){

	  	var closeButton = document.querySelector('.closeSearchButton')
	  	var searchInput = document.querySelector('.searchInput')
	  	var searchResultsContainer = document.querySelector('.searchResultsContainer')

	  	console.log('searchInput', searchInput);


		var container = document.querySelector('.searchDialogContainer');
	  	var dialogContent = document.querySelector('.searchDialog')

		closeButton.addEventListener('click', function(){

			location.hash = '#/';
			container.classList.remove('active');
			dialogContent.innerHTML = '';

		})

		searchInput.addEventListener('keyup', function(){

			_query = searchInput.value;

			document.location.hash = "#/search/?query=" + _query; 

			searchResultsContainer.innerHTML = renderResults(_query);

			

		})

		
	}

	function renderSeachResultItemCards(item) {

		var result = '';


		if (item.events.length) {

			result = result + '<div class="search-result-item-events-cards-holder">';


			item.events.forEach(function(event){

				var eventHtml = '';

				var eventColor = 'transparent';

				if (event.categories) {
					var categoryId = event.categories[0]

					if (_categoriesAsObject.hasOwnProperty(categoryId)) {

						var category = _categoriesAsObject[categoryId]

						if(category.color) {
							eventColor = category.color;
						}

					}

				}

				if(event.color) {
					eventColor = event.color;
				}
			

				eventHtml = eventHtml + '<div class="search-result-item-event-card" title="' + event.text+'">'

				eventHtml = eventHtml + '<div class="search-result-item-event-item-color" style="background: '+eventColor+'"></div>'

				eventHtml = eventHtml + event.name;
				eventHtml = eventHtml + '</div>'


				result = result + eventHtml;

			})
			

			result = result + '</div>';

		}

		return result;

	}

	function renderResults(query){

		var result = '';


		var matches = []

		if (query) {

			matches = _dayDetails.filter(function(item){

				if (item.notes) {
					return item.notes.toLocaleLowerCase().search(query.toLocaleLowerCase()) != -1
				}
				return false

			})

			result = result + '<div class="search-result-count">Найдено совпадений: <span>' + matches.length + '</span></div>'


			matches.forEach(function(item){

				var rowHtml = '';

				var index = item.notes.toLocaleLowerCase().search(query.toLocaleLowerCase())
				var startIndex =  index - 200;
				var endIndex = index + 200

				var isStart = false;
				var isEnd = false;
				

				if (startIndex < 0) {
					startIndex = 0;
					isStart = true;
				}



				if (endIndex > item.notes.length) {
					endIndex = item.notes.length;
					isEnd = true;

				}


				item.previewText = item.notes.substring(startIndex, endIndex)

				 var prettyDate = new Date(item.date).toISOString().split('T')[0];
			    var datePieces = prettyDate.split('-')
			    var year = datePieces[0]
			    var month = datePieces[1]
			    var day = datePieces[2]

			    var itemUrl = '#/view/' + year + '/' + month + '/' + day


				rowHtml = rowHtml + '<div class="search-result-item">'

				rowHtml = rowHtml + '<div class="search-result-title">'
				rowHtml = rowHtml + '<a class="search-result-title-link" href="'+itemUrl+'" target="_blank">' + moment(item.date).locale('ru').format("DD MMMM YYYY") + '</a>';   
				rowHtml = rowHtml + renderSeachResultItemCards(item)

				rowHtml = rowHtml + '</div>'

				rowHtml = rowHtml + '<div class="search-result-body">'

				if (!isStart) {
					rowHtml = rowHtml + '...';
				}

				rowHtml = rowHtml + item.previewText;

				if (!isEnd) {
					rowHtml = rowHtml + '...';
				}

				rowHtml = rowHtml + '</div>'

				rowHtml = rowHtml + '</div>'

				result = result + rowHtml


			})

		}


		return result;

	}

	
	function render(query){

		var result = '';

		result = result + '<div class="search-body">'

		result = result + '<div class="search-input-holder">'

		result = result + '<input class="search-input searchInput" autofocus="true" type="text" value="'+query+'" placeholder="Поиск">'

		result = result + '</div>'

		result = result + '<div class="search-results-container searchResultsContainer">'

		result = result + renderResults(query)

		result = result + '</div>'

		result = result + '</div>'

		result = result + '<button class="close-search-button closeSearchButton">Закрыть</button>'


		return result;

	}

	function _redrawDialog(){

		_dialogContent.innerHTML = render(_query);
      	addEventListeners(_query);

	}

	function init(query, dialogContent, container){

		_query = query;
		_dialogContent = dialogContent;
		_container = container;

		_dayDetails = dataService.getDayDetailList();


		_categoriesAsObject = dataService.getCategoriesAsObject();

		_dayDetails = _dayDetails.map(function(item){


			var dayDateIso = new Date(item.date).toISOString()

			item.events = dataService.getEvents().filter(function(event){

				if (event.date && new Date(event.date).toISOString() == dayDateIso) {
					return true;
				}

				if (event.date_from && new Date(event.date_from).toISOString() == dayDateIso) {
					return true;
				}

				return false;

			})

			return item;


		})

	   _redrawDialog();

	}



	return {

		init: init,
	
		render: render,
		addEventListeners: addEventListeners
	}

}