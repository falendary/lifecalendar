function DayDetailModule(dataService, eventService) {

	var _dialogContent;
	var _container
	var _dayDate;
	var _patternId;

	function renderChart(dayDate){

		var dayDetail = dataService.getDayDetail(dayDate);

		var ctx = document.getElementById('dayChart');

		var actions = []

		if (dayDetail) {

			if (dayDetail.actions) {
				dayDetail.actions.forEach(function(action){
					actions.push(action);
				})	
			}

		}


		var dataset = actions.map(function(action){

			var durationInMin = action.hours * 60 + action.minutes

			return durationInMin
		})

		var colors = actions.map(function(action){
			return action.color
		})

		var labels = actions.map(function(action){
			return action.name
		})

		console.log('actions', actions);
		console.log('dataset', dataset);

		var myPieChart = new Chart(ctx, {
		    type: 'doughnut',
		    data: {
		    	datasets: [{
			        data: dataset,
			        backgroundColor: colors
			    }],
			    labels: labels
		    },
		    options: {
		    	layout: {
            		padding: {
            			left: 50,
            			top: 50,
            			right: 50,
            			bottom: 50
            		}
            	},
		    	plugins: {
		    		labels: [
					    {
					      render: 'label',
					      position: 'outside'
					    },
					    {
					      render: 'percentage'
					    }
					  ]
		    	}
		    }
		});

	}

	function addEventListenersToAddAction(dayDate){

		var addDayActionButton = document.querySelector('.addDayActionButton');
		var addDayActionInputName = document.querySelector('.addDayActionInputName');
		var addDayActionInputHours = document.querySelector('.addDayActionInputHours');
		var addDayActionInputMinutes = document.querySelector('.addDayActionInputMinutes');
		var addDayActionInputColor = document.querySelector('.addDayActionInputColor');

		$('.addDayActionInputColor').spectrum({
	       allowEmpty: true
	    });

		addDayActionButton.addEventListener('click', function(event){

			var dayDetail = dataService.getDayDetail(dayDate)

			if (!dayDetail) {
				dayDetail = {
					date: new Date(dayDate),
					actions: []
				}
			}

			var action = {
				id: toMD5('action_' + dayDetail.actions.length + 1 + '_' + new Date().getTime()),
				name: addDayActionInputName.value,
				hours: 0,
				minutes: 0,
				color: addDayActionInputColor.value
			}

			if (parseInt(addDayActionInputHours.value, 10)) {
				action.hours =  parseInt(addDayActionInputHours.value, 10)
			}

			if (parseInt(addDayActionInputMinutes.value, 10)) {
				action.minutes =  parseInt(addDayActionInputMinutes.value, 10)
			}

			dayDetail.actions.push(action)


			dataService.setDayDetail(dayDate, dayDetail)

			console.log('dayDetail', dayDetail);

			addDayActionInputName.value = null;
			addDayActionInputHours.value = null;
			addDayActionInputMinutes.value = null;
			addDayActionInputColor.value = null;

			_redrawDialog();

		})


	}

	function addEventListeners(dayDate){

	  	var closeButton = document.querySelector('.closeDayDetailButton')
	  	var dayDetailSave = document.querySelector('.dayDetailSave')
	  	var dayDetailActionDelete = document.querySelectorAll('.dayDetailActionDelete')
	 
		var container = document.querySelector('.dayDetailDialogContainer');
	  	var dialogContent = document.querySelector('.dayDetailDialog')

		closeButton.addEventListener('click', function(){

			location.hash = '#/';
			container.classList.remove('active');
			dialogContent.innerHTML = '';

		})

		dayDetailSave.addEventListener('click', function(){

			eventService.dispatchEvent('SAVE');

			toastr.success('Сохранено')

		})

		dayDetailActionDelete.forEach(function(elem){

			elem.addEventListener('click', function(event){

				console.log('click here?', event);

				var id = event.target.dataset.id

				var dayDetail = dataService.getDayDetail(dayDate)

				dayDetail.actions = dayDetail.actions.filter(function(action){

					return action.id != id

				})

				console.log('dayDetail.actions', dayDetail.actions);

				dataService.setDayDetail(dayDate, dayDetail)

				_redrawDialog();

			})

		})



		renderChart(dayDate);

		addEventListenersToAddAction(dayDate);
		
	}

	function renderDayEventsSection(dayDate){

		var result = '';

		var events = dataService.getEvents()
		var categoriesAsObject = dataService.getCategoriesAsObject();

		var pieces = dayDate.split('-');
		var year = pieces[0];
		var month = pieces[1];
		var day = pieces[2];

		events = events.filter(function(event){

			var eventYear;
			var eventMonth;
			var eventDay;

			if (event.type == 1) {

				var eventDate = new Date(event.date)

				eventYear = eventDate.getFullYear()
				eventMonth = eventDate.getMonth() + 1
				eventDay = eventDate.getDate();

			}


			if (eventYear == year && eventMonth == month && eventDay == day) {
				return true;
			}

			return false

		})

		result = result + '<div class="day-detail-events-section">'
		result = result + '<h3 class="text-center">События</h4>'

		if (events.length) {

			events.forEach(function(event) {

				var eventHtml = '<div class="event-item" data-id="'+event.id+'">';

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

				eventHtml = eventHtml + '<div class="event-item-name">' + event.name + '</div>'
				eventHtml = eventHtml + '<div class="event-item-text">' + event.text + '</div>'
				eventHtml = eventHtml + '<div class="event-item-search"><i class="fa fa-search"></i></div>'

				eventHtml = eventHtml + '</div>';

				result = result + eventHtml

			})

		} else {

			result = result + '<div class="text-center">Не было событий</div>'

		}

		result = result + '</div>'

		return result

	}

	function renderActionsSection(dayDate){

		var result = ''

		var dayDetail = dataService.getDayDetail(dayDate);

		console.log('renderActionsSection.dayDetail', dayDetail);

		var actions = [];

		if (dayDetail) {

			if (dayDetail.actions) {

				dayDetail.actions.forEach(function(action){
					actions.push(action)
				})

			}

		}

		result = result + '<div class="day-detail-actions-section">'

		result = result + '<h3 class="text-center">Распорядок</h3>'

		if (actions) {

			result = result + '<div class="day-detail-actions">'

			actions.forEach(function(action){

				var actionHTML = '<div class="day-detail-action">'


				actionHTML = actionHTML + '<div style="background: '+action.color+'" class="day-detail-action-color"></div>'
				actionHTML = actionHTML + '<span class="day-detail-action-name">' + action.name  + ' </span>'
				if (action.hours) {
					actionHTML = actionHTML + action.hours + ' часов'
				}

				if (action.minutes) {
					actionHTML = actionHTML + action.minutes + ' минут'
				}

				actionHTML = actionHTML + '<button data-id="'+ action.id + '" class="day-detail-action-delete dayDetailActionDelete" title="Удалить"><i class="fa fa-close"></i></button>'

				actionHTML = actionHTML + '</div>'


				result = result + actionHTML

			})

			result = result + '</div>'

		} else {
			result = result + '<div class="text-center">Еще ничего не добавлено</div>'
		}


		result = result + '<div class="add-day-action-holder">'

		// Name 
		result = result + '<div class="add-day-action-input-container">'

		result = result + '<label class="add-day-action-label">Название</label>'
		result = result + '<input class="add-day-action-input add-day-action-input-name addDayActionInputName width-100">'

		result = result + '</div>'

		// Duration

		result = result + '<div class="add-day-action-input-container">'

		result = result + '<label class="add-day-action-label">Длительность</label>'
		result = result + '<input class="add-day-action-input m-r-8 add-day-action-input-hours addDayActionInputHours" placeholder="Часов">'
		result = result + '<input class="add-day-action-input add-day-action-input-minutes addDayActionInputMinutes" placeholder="Минут">'

		result = result + '</div>'


		// Color

		result = result + '<div class="add-day-action-input-container">'

		result = result + '<label class="add-day-action-label">Цвет</label>'
		result = result + '<input class="add-day-action-input add-day-action-input-color addDayActionInputColor width-100">'

		result = result + '</div>'

		result = result + '<button class="add-day-action-button addDayActionButton">Добавить</button>'

		result = result + '</div>'

		result = result + '</div>'

		return result;

	}

	function renderChartSection(){

		var result = ''
		result = result + '<div class="day-detail-chart-section">'
		result = result + '<div class="chart-holder">'
		result = result + '<canvas id="dayChart" width="400" height="400"></canvas>'
		result = result + '</div>'
		result = result + '</div>'

		return result;

	}

	function renderHeader(dayDate) {

		var date = new Date(dayDate);
		var previousDate =  new Date(moment(date).add(-1,'days'));
		var nextDate =  new Date(moment(date).add(1,'days'));

		var title = moment(date).locale('ru').format("DD MMMM YYYY");   
		var dayOfWeek = moment(date).locale('ru').format("dddd");   

		var previousDayYear = previousDate.getFullYear();
		var previousDayMonth = previousDate.getMonth() + 1;
		var previousDayDay = previousDate.getDate();

		var nextDayYear = nextDate.getFullYear();
		var nextDayMonth = nextDate.getMonth() + 1;
		var nextDayDay = nextDate.getDate();

		var result = '';

		result = result + '<button class="day-detail-save dayDetailSave">Сохранить</button>'

		result = result + '<div class="day-detail-block-wrapper">'

		result = result + '<div class="day-detail-left-block">'
		result = result + '<a href="#/view/'+previousDayYear+'/'+previousDayMonth+'/'+previousDayDay+'" class="day-detail-change-day-link day-detail-previous-day">Назад</a>'
		result = result + '</div>'
		result = result + '<div class="day-detail-center-block">'
		result = result + '<div class="day-detail-current-date-title">' +title + '</div>'
		result = result + '<div class="day-detail-current-date-day-title">' +dayOfWeek + '</div>'
		result = result + '</div>'
		result = result + '<div class="day-detail-right-block">'
		result = result + '<a href="#/view/'+nextDayYear+'/'+nextDayMonth+'/'+nextDayDay+'" class="day-detail-change-day-link day-detail-next-day">Вперед</a>'
		result = result + '</div>'

		result = result + '</div>'



		result = result + '<button class="close-day-detail-button closeDayDetailButton">Закрыть</button>'
		result = result + '<a href="#/settings/day-pattern" class="day-pattern-settings-button dayPatternSettingsButton">Настроить паттерн</a>'

		return result;

	}
	
	function render(dayDate){

		var result = '';

		result = result + '<div class="day-detail-header">'

		result = result + renderHeader(dayDate)
		
		result = result + '</div>'

		result = result + '<div class="day-detail-content">'

		result = result + renderActionsSection(dayDate);

		result = result + renderChartSection(dayDate);

		result = result + renderDayEventsSection(dayDate);

		result = result + '</div>'
	
		return result;

	}

	function _redrawDialog(){

		_dialogContent.innerHTML = render(_dayDate);
      	addEventListeners(_dayDate);

	}

	function init(dayDate, dialogContent, container){

		_dayDate = dayDate;
		_dialogContent = dialogContent;
		_container = container;

	   _redrawDialog();

	}

	// Day pattern below

	function _redrawDayPatternDialog(){

		_dialogContent.innerHTML = renderDayPatternSettings();
      	addEventListenersDayPatternSettings();

	}

	function renderDayPatternSettings(){

		var patterns = dataService.getDayPatterns();

		var result = '';

		result = result + '<button class="close-day-pattern-settings-button closeDayPatternSettingsButton">Закрыть</button>'

		result = result + '<div class="day-pattern-body">'

		result = result + '<div class="day-pattern-settings-items-holder">'
		result = result + '<h4 class="text-center">Паттерны</h4>'

		if (patterns && patterns.length) {

			patterns.forEach(function(pattern){

				var patternHTML = '<div class="day-pattern-item">'

				patternHTML = patternHTML + '<a class="day-pattern-item-title" href="#/settings/day-pattern/' + pattern.id + '">' + pattern.name + '</a>' + ' <span class="day-pattern-item-date">(' + pattern.date_from + ' - ' + pattern.date_to + ')</span>'

				patternHTML = patternHTML + '<button data-id="'+ pattern.id + '" class="day-pattern-item-delete dayPatternItemDelete" title="Удалить"><i class="fa fa-close"></i></button>'

				patternHTML = patternHTML + '</div>'

				result = result + patternHTML;

			})

		} else {
			result = result + '<div class="text-center">Паттерны не настроены</div>'
		}

		result = result + '</div>'

		result = result + '</div>'

		result = result + '<div class="add-day-pattern-holder">'

		// Name 
		result = result + '<div class="add-day-pattern-input-container">'

		result = result + '<label class="add-day-pattern-label">Название</label>'
		result = result + '<input class="add-day-pattern-input add-day-pattern-input-name addDayPatternInputName width-100">'

		result = result + '</div>'

		// From 
		result = result + '<div class="add-day-pattern-input-container">'

		result = result + '<label class="add-day-pattern-label">От</label>'
		result = result + '<input type="date" class="add-day-pattern-input add-day-pattern-date-from-name addDayPatternDateFromName width-100">'

		result = result + '</div>'

		// To 
		result = result + '<div class="add-day-pattern-input-container">'

		result = result + '<label class="add-day-pattern-label">До</label>'
		result = result + '<input type="date" class="add-day-pattern-input add-day-pattern-date-to-name addDayPatternDateToName width-100">'

		result = result + '</div>'


		result = result + '<button class="day-pattern-add-new dayPatternAddNew">Добавить</button>'

		result = result + '</div>'


		return result;
	}

	function addEventListenersDayPatternSettings(){

		var closeButton = document.querySelector('.closeDayPatternSettingsButton')
		var dayPatternAddNew = document.querySelector('.dayPatternAddNew')

		var container = document.querySelector('.dayPatternSettingsDialogContainer');
	  	var dialogContent = document.querySelector('.dayPatternSettingsDetailDialog')

	  	var dayPatternItemDelete = document.querySelectorAll('.dayPatternItemDelete')

		closeButton.addEventListener('click', function(){

			location.hash = '#/';
			container.classList.remove('active');
			dialogContent.innerHTML = '';

		})

		dayPatternAddNew.addEventListener('click', function(){

			var addDayPatternInputName = document.querySelector('.addDayPatternInputName')
			var addDayPatternDateFromName = document.querySelector('.addDayPatternDateFromName')
			var addDayPatternDateToName = document.querySelector('.addDayPatternDateToName')


			var patterns = dataService.getDayPatterns();

			if (!patterns) {
				patterns = []
			}

			var pattern = {
				id: toMD5('pattern_' + patterns.length + 1 + '_' + new Date().getTime()),
				name: addDayPatternInputName.value,
				date_from: addDayPatternDateFromName.value,
				date_to: addDayPatternDateToName.value,
				actions: []
			}

			console.log('patterns', patterns);

			patterns.push(pattern)

			dataService.setDayPatterns(patterns);

			_redrawDayPatternDialog();

			addDayPatternInputName.value = null;
			addDayPatternDateFromName.value = null;
			addDayPatternDateToName.value = null;

		})

		dayPatternItemDelete.forEach(function(item){


			item.addEventListener('click', function(event) {

				var id = event.target.dataset.id

				var patterns = dataService.getDayPatterns();

				patterns = patterns.filter(function(pattern) {

					return pattern.id != id;

				})

				dataService.setDayPatterns(patterns);

				 _redrawDayPatternDialog();

			})

		})

	}

	function initDayPattern(dialogContent, container){

		_dialogContent = dialogContent;
		_container = container;


		var pieces = location.hash.split('day-pattern/') 

		if (pieces.length == 2 && pieces[1]) {

			_patternId = pieces[1];

			_redrawDayPatternDetailDialog()

		} else {
	   		_redrawDayPatternDialog();
	    }

	}

	function _redrawDayPatternDetailDialog(){


		_dialogContent.innerHTML = renderDayPatternDetailSettings();
      	addEventListenersDayPatternDetailSettings();

	}

	function renderDayPatternDetailSettings(){

		var result = '';

		var patterns = dataService.getDayPatterns();

		var pattern;

		patterns.forEach(function(patternItem) {
			if(patternItem.id == _patternId) {
				pattern = patternItem;
			}
		})

		result = result + '<div class="day-pattern-detail-holder">'

		result = result + '<div>Паттерн: ' + _patternId + '</div>'

		// Name 
		result = result + '<div class="edit-day-pattern-input-container">'

		result = result + '<label class="edit-day-pattern-label">Название</label>'
		result = result + '<input value="'+pattern.name+'" class="edit-day-pattern-input edit-day-pattern-input-name addDayPatternInputName width-100">'

		result = result + '</div>'

		// From 
		result = result + '<div class="edit-day-pattern-input-container">'

		result = result + '<label class="edit-day-pattern-label">От</label>'
		result = result + '<input value="'+pattern.date_from +'" type="date" class="edit-day-pattern-input edit-day-pattern-date-from-name addDayPatternDateFromName width-100">'

		result = result + '</div>'

		// To 
		result = result + '<div class="edit-day-pattern-input-container">'

		result = result + '<label class="edit-day-pattern-label">До</label>'
		result = result + '<input value="'+pattern.date_to+'" type="date" class="edit-day-pattern-input edit-day-pattern-date-to-name addDayPatternDateToName width-100">'

		result = result + '</div>'


		result = result + '<div class="overflow-hidden width-100 m-t-8">'
		result = result + '<button class="simple-button float-right display-blockedit-day-pattern-save-pattern editDayPatternSavePattern">Сохранить</button>'
		result = result + '<a href="#/settings/day-pattern/" class="simple-button float-left display-block edit-day-pattern-close-pattern editDayPatternClosePattern">Закрыть</a>'
		result = result + '</div>'

		result = result + '</div>'

		return result;

	}

	function addEventListenersDayPatternDetailSettings(){

	}

	return {

		init: init,
		initDayPattern: initDayPattern,

		render: render,
		addEventListeners: addEventListeners,

		renderDayPatternSettings: renderDayPatternSettings,
		addEventListenersDayPatternSettings: addEventListenersDayPatternSettings
	}

}