function SearchModule(dataService, eventService) {

	var _dialogContent;
	var _container
	var _query;
	var _patternId;


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

			searchResultsContainer.innerHTML = renderResults(_query);

			

		})

		
	}

	function renderResults(query){

		var result = '';


		var dayDetails = dataService.getDayDetailList();

		console.log('dayDetails', dayDetails);
		console.log('query', query);


		var matches = []

		if (query) {

			matches = dayDetails.filter(function(item){

				if (item.notes) {
					return item.notes.toLocaleLowerCase().search(query.toLocaleLowerCase()) != -1
				}
				return false

			})

			console.log('matches', matches);

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
				rowHtml = rowHtml + '<a href="'+itemUrl+'" target="_blank">' + moment(item.date).locale('ru').format("DD MMMM YYYY") + '</a>';   
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

		result = result + '<input class="search-input searchInput" type="text" value="'+query+'" placeholder="Поиск">'

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

	   _redrawDialog();

	}



	return {

		init: init,
	
		render: render,
		addEventListeners: addEventListeners
	}

}