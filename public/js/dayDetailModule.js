function DayDetailModule(dataService, eventService) {

	var _dialogContent;
	var _container
	var _dayDate;
	var _patternId;

	function renderChart(dayDate){

		var dayDetail = dataService.getDayDetail(dayDate);
		var dataHelper = new DataHelper();

		var pattern = dataHelper.getPatternForDay(dayDate, dataService.getDayPatterns())

		var ctx = document.getElementById('dayChart');

		var actions = []

		if (pattern) {

			pattern.actions.forEach(function(action){

				if (action.exclude_weekend) {

					var dayOfWeek = new Date(dayDate).getDay()
					
					if (dayOfWeek == 0 || dayOfWeek == 6) { // 0 sunday, 6 saturday
						// do nothning
					} else {
						actions.push(action);
					}

				} else {

					actions.push(action);

				}
			})

		}

		if (dayDetail) {

			if (dayDetail.actions) {
				dayDetail.actions.forEach(function(action){
					actions.push(action);
				})	
			}

		}

		var total = 1440; // in minutes

		var dataset = actions.map(function(action){

			var durationInMin = action.hours * 60 + action.minutes

			total = total - durationInMin;

			return durationInMin
		})


		var colors = actions.map(function(action){
			return action.color
		})

		var labels = actions.map(function(action){
			return action.name
		})

		if (total) {
			colors.push("#dddddd")
			dataset.push(total)
			labels.push("Свободное время")
		}

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
            			left: 100,
            			top: 50,
            			right: 100,
            			bottom: 50
            		}
            	},
            	legend: {
            		display: false
            	},
            	tooltips: {
		            callbacks: {
		                label: function(tooltipItem, data) {

		                	console.log('tooltipItem', tooltipItem);
		                	console.log('data', data);

		                    var label = data.labels[tooltipItem.index] || '';

		                    if (label) {
		                        label += ': ';
		                    }

		                    var hours;
		                    var minutes;

		                    var hours = Math.floor(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] / 60)
		                    var minutes = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] - hours * 60

		                    if (hours) {
		                    	label += hours + ' ' + dataHelper.toHours(hours) + ' '
		                    }

		                    if (minutes) {
		                    	label += minutes + ' минут'
		                    }
		                    return label;
		                }
		            }
		        },
		    	plugins: {
		    		labels: [
					    {
					      render: 'label',
					      position: 'outside',
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
		var addDayActionInputText = document.querySelector('.addDayActionInputText');

		$('.addDayActionInputColor').spectrum({
	       allowEmpty: true
	    });

		addDayActionButton.addEventListener('click', function(event){

			var dayDetail = dataService.getDayDetail(dayDate)

			if (!dayDetail) {
				dayDetail = {
					date: new Date(dayDate),
					actions: [],
					notes: ''
				}
			}

			var action = {
				id: toMD5('action_' + dayDetail.actions.length + 1 + '_' + new Date().getTime()),
				name: addDayActionInputName.value,
				hours: 0,
				minutes: 0,
				color: addDayActionInputColor.value,
				text: addDayActionInputText.value
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
	  	var dayDetailNotes = document.querySelector('.dayDetailNotes')
	  	var dayDetailNotesLength = document.querySelector('.dayDetailNotesLength')
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

		})

		dayDetailNotes.addEventListener('keyup', function(){

			dayDetailNotesLength.innerHTML = dayDetailNotes.value.length + ' символов';

		})

		dayDetailNotes.addEventListener('blur', function(){

			var dayDetail = dataService.getDayDetail(dayDate);

			if (!dayDetail) {
				dayDetail = {
					date: new Date(dayDate),
					actions: [],
					notes: ''
				};
			}

			dayDetailNotesLength.innerHTML = dayDetailNotes.value.length + ' символов';

			dayDetail.notes = dayDetailNotes.value;
			dataService.setDayDetail(dayDate, dayDetail)

			eventService.dispatchEvent('SAVE');

		})

		// Deprecated
		// dayDetailActionDelete.forEach(function(elem){

		// 	elem.addEventListener('click', function(event){

		// 		console.log('click here?', event);

		// 		var id = event.target.dataset.id

		// 		var dayDetail = dataService.getDayDetail(dayDate)

		// 		dayDetail.actions = dayDetail.actions.filter(function(action){

		// 			return action.id != id

		// 		})

		// 		console.log('dayDetail.actions', dayDetail.actions);

		// 		dataService.setDayDetail(dayDate, dayDetail)

		// 		_redrawDialog();

		// 	})

		// })



		// Deprecated
		// renderChart(dayDate);

		// Deprectaed
		// addEventListenersToAddAction(dayDate);
		
	}

	// Deprecated
	// function renderDayEventsSection(dayDate){

	// 	var result = '';

	// 	var events = dataService.getEvents()
	// 	var categoriesAsObject = dataService.getCategoriesAsObject();

	// 	var pieces = dayDate.split('-');
	// 	var year = pieces[0];
	// 	var month = pieces[1];
	// 	var day = pieces[2];

	// 	events = events.filter(function(event){

	// 		var eventYear;
	// 		var eventMonth;
	// 		var eventDay;

	// 		if (event.type == 1) {

	// 			var eventDate = new Date(event.date)

	// 			eventYear = eventDate.getFullYear()
	// 			eventMonth = eventDate.getMonth() + 1
	// 			eventDay = eventDate.getDate();

	// 		}


	// 		if (eventYear == year && eventMonth == month && eventDay == day) {
	// 			return true;
	// 		}

	// 		return false

	// 	})

	// 	result = result + '<div class="day-detail-events-section">'
	// 	result = result + '<h3 class="text-center">События</h4>'

	// 	if (events.length) {

	// 		events.forEach(function(event) {

	// 			var eventHtml = '<div class="event-item" data-id="'+event.id+'">';

	// 			eventHtml = eventHtml + '<div class="event-item-name">' + event.name + '</div>'
	// 			eventHtml = eventHtml + '<div class="event-item-text">' + event.text + '</div>'
			
	// 			eventHtml = eventHtml + '</div>';

	// 			result = result + eventHtml

	// 		})

	// 	} else {

	// 		result = result + '<div class="text-center">Не было событий</div>'

	// 	}

	// 	result = result + '</div>'

	// 	return result

	// }

	// Deprecated
	// function renderActionsSection(dayDate){

	// 	var result = ''

	// 	var dayDetail = dataService.getDayDetail(dayDate);

	// 	var dataHelper = new DataHelper();

	// 	var pattern = dataHelper.getPatternForDay(dayDate, dataService.getDayPatterns())

	// 	console.log('renderActionsSection.dayDetail', dayDetail);

	// 	var actions = [];

	// 	if (pattern) {

	// 		pattern.actions.forEach(function(action){

	// 			var act = Object.assign({}, action)

	// 			act.from_pattern = true;

	// 			if (action.exclude_weekend) {

	// 				var dayOfWeek = new Date(dayDate).getDay()
					
	// 				if (dayOfWeek == 0 || dayOfWeek == 6) { // 0 sunday, 6 saturday
	// 					// do nothning
	// 				} else {



	// 					actions.push(act);
	// 				}

	// 			} else {

	// 				actions.push(act);

	// 			}
	// 		})

	// 	}

	// 	if (dayDetail) {

	// 		if (dayDetail.actions) {

	// 			dayDetail.actions.forEach(function(action){
	// 				actions.push(action)
	// 			})

	// 		}

	// 	}

	// 	var total = 1440; // in minutes

	// 	actions.forEach(function(action){

	// 		var durationInMin = action.hours * 60 + action.minutes

	// 		total = total - durationInMin;
	// 	})

	// 	if (total > 0) {

	// 		var h = Math.floor(total / 60);

	// 		actions.push({
	// 			from_pattern: true,
	// 			name: "Свободное время",
	// 			color: '#ddd',
	// 			hours: h,
	// 			minutes: total - h * 60
	// 		})

	// 	}

	// 	result = result + '<div class="day-detail-actions-section">'

	// 	result = result + '<h3 class="text-center">Распорядок</h3>'

	// 	if (actions) {

	// 		result = result + '<div class="day-detail-actions">'

	// 		actions.forEach(function(action){

	// 			var actionHTML = '<div class="day-detail-action">'


	// 			actionHTML = actionHTML + '<div style="background: '+action.color+'" class="day-detail-action-color"></div>'
	// 			actionHTML = actionHTML + '<span class="day-detail-action-name">' + action.name  + ' </span>'
	// 			if (action.hours) {
	// 				actionHTML = actionHTML + action.hours + ' ' + dataHelper.toHours(action.hours) + ' '
	// 			}

	// 			if (action.minutes) {
	// 				actionHTML = actionHTML + action.minutes + ' минут'
	// 			}


	// 			if (!action.from_pattern) {
	// 				actionHTML = actionHTML + '<button data-id="'+ action.id + '" class="day-detail-action-delete dayDetailActionDelete" title="Удалить"><i class="fa fa-close"></i></button>'
	// 			}
	// 			actionHTML = actionHTML + '</div>'


	// 			result = result + actionHTML

	// 		})

	// 		result = result + '</div>'

	// 	} else {
	// 		result = result + '<div class="text-center">Еще ничего не добавлено</div>'
	// 	}


	// 	result = result + '<div class="add-day-action-holder">'

	// 	// Name 
	// 	result = result + '<div class="add-day-action-input-container">'

	// 	result = result + '<label class="add-day-action-label">Название</label>'
	// 	result = result + '<input class="add-day-action-input add-day-action-input-name addDayActionInputName width-100">'

	// 	result = result + '</div>'

	// 	// Duration

	// 	result = result + '<div class="add-day-action-input-container">'

	// 	result = result + '<label class="add-day-action-label">Длительность</label>'
	// 	result = result + '<input class="add-day-action-input m-r-8 add-day-action-input-hours addDayActionInputHours" placeholder="Часов">'
	// 	result = result + '<input class="add-day-action-input add-day-action-input-minutes addDayActionInputMinutes" placeholder="Минут">'

	// 	result = result + '</div>'


	// 	// Color

	// 	result = result + '<div class="add-day-action-input-container">'

	// 	result = result + '<label class="add-day-action-label">Цвет</label>'
	// 	result = result + '<input class="add-day-action-input add-day-action-input-color addDayActionInputColor width-100">'

	// 	result = result + '</div>'

	// 	// Text 
	// 	result = result + '<div class="add-day-action-input-container">'

	// 	result = result + '<label class="add-day-action-label">Текст</label>'
	// 	result = result + '<input class="add-day-action-input add-day-action-input-text addDayActionInputText width-100">'

	// 	result = result + '</div>'

	// 	result = result + '<button class="add-day-action-button addDayActionButton">Добавить</button>'

	// 	result = result + '</div>'

	// 	result = result + '</div>'

	// 	return result;

	// }

	// Deprecated
	// function renderChartSection(){

	// 	var result = ''
	// 	result = result + '<div class="day-detail-chart-section">'
	// 	result = result + '<div class="chart-holder">'
	// 	result = result + '<canvas id="dayChart" width="400" height="400"></canvas>'
	// 	result = result + '</div>'
	// 	result = result + '</div>'

	// 	return result;

	// }

	function renderNotesSection(dayDate){

		console.log('renderNotesSection dayDate', dayDate)

		var dayDetail = dataService.getDayDetail(dayDate);

		if (!dayDetail) {
			dayDetail = {
				date: new Date(dayDate),
				actions: [],
				notes: ''
			};
		}

		console.log('dayDetail', dayDetail);

		var notes = '';

		if (dayDetail.notes) {
			notes = dayDetail.notes;
		}


		var notesMinHeight = 260;
		var charWidth = 11;
		var textAreaWidth = document.body.clientWidth / 100 * 80

		var charsPerRow = (textAreaWidth - 36) / charWidth
		var rowHeight = 18;

		if (notes.length) {

			var rows = notes.length / charsPerRow;

			rows = rows + notes.split('\n').length;
			notesMinHeight = rows * rowHeight;

			if (notesMinHeight < 260) {
				notesMinHeight = 260
			}

		}

		var result = '';

		result = result + '<h4 class="day-detail-notes-header">Заметки</h4>'

		result = result + '<div class="day-detail-notes-holder">';

		result = result + '<div class="day-detail-notes-length dayDetailNotesLength">'+notes.length+' символов</div>'

		result = result + '<textarea class="day-detail-notes dayDetailNotes" style="height: '+notesMinHeight+'px">'+notes+'</textarea>';

		result = result + '</div>';



		return result;

	}

	function renderHeader(dayDate) {

		var currentDate = new Date()
		var currentDateYear = currentDate.getFullYear();
		var currentDateMonth = currentDate.getMonth() + 1;
		var currentDateDay = currentDate.getDate();

		var date = new Date(dayDate);
		var previousDate =  new Date(moment(date).add(-1,'days'));
		var nextDate =  new Date(moment(date).add(1,'days'));

		var title = moment(date).locale('ru').format("DD MMMM YYYY");   
		var dayOfWeek = moment(date).locale('ru').format("dddd");   

		var previousDayYear = previousDate.getFullYear();
		var previousDayMonth = previousDate.getMonth() + 1;
		var previousDayDay = previousDate.getDate();

		if (previousDayMonth < 10) {
			previousDayMonth = '0' + previousDayMonth
		}

		if (previousDayDay < 10) {
			previousDayDay = '0' + previousDayDay
		}

		var nextDayYear = nextDate.getFullYear();
		var nextDayMonth = nextDate.getMonth() + 1;
		var nextDayDay = nextDate.getDate();

		if (nextDayMonth < 10) {
			nextDayMonth = '0' + nextDayMonth;
		}

		if (nextDayDay < 10) {
			nextDayDay = '0' + nextDayDay;
		}

		var showHelp = false;
		var helpTitle = ''

		if (currentDateYear == date.getFullYear() && 
			currentDateMonth == date.getMonth() + 1 &&
			currentDateDay == date.getDate()) {
			showHelp = true;
			helpTitle = 'Сегодня'
		}

		var diff = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 3600 * 24))

		if (diff == 1) {
			showHelp = true;
			helpTitle = 'Вчера'
		}
		if (diff == 2) {
			showHelp = true;
			helpTitle = 'Позавчера'
		}
		if (diff == 3) {
			showHelp = true;
			helpTitle = '2 дня назад'
		}
		if (diff == -1) {
			showHelp = true;
			helpTitle = 'Завтра'
		}
		if (diff == -2) {
			showHelp = true;
			helpTitle = 'Послезавтра'
		}
		if (diff == -3) {
			showHelp = true;
			helpTitle = 'Через 2 дня'
		}


		var result = '';

		result = result + '<button class="day-detail-save dayDetailSave">Сохранить</button>'
		result = result + '<a href="#/search/" class="day-detail-search dayDetailSearch">Поиск</a>'

		result = result + '<div class="day-detail-block-wrapper">'

		result = result + '<div class="day-detail-left-block">'
		result = result + '<a href="#/view/'+previousDayYear+'/'+previousDayMonth+'/'+previousDayDay+'" class="day-detail-change-day-link day-detail-previous-day">Назад</a>'
		result = result + '</div>'
		result = result + '<div class="day-detail-center-block">'
		result = result + '<div class="day-detail-current-date-title">' +title + '</div>'
		result = result + '<div class="day-detail-current-date-day-title">' +dayOfWeek + '</div>'
		if (helpTitle) {
			result = result + '<div class="day-detail-current-date-day-subtitle">' +helpTitle + '</div>'
		}
		result = result + '</div>'
		result = result + '<div class="day-detail-right-block">'
		result = result + '<a href="#/view/'+nextDayYear+'/'+nextDayMonth+'/'+nextDayDay+'" class="day-detail-change-day-link day-detail-next-day">Вперед</a>'
		result = result + '</div>'

		result = result + '</div>'



		result = result + '<button class="close-day-detail-button closeDayDetailButton">Закрыть</button>'
		// result = result + '<a href="#/settings/day-pattern" class="day-pattern-settings-button dayPatternSettingsButton">Настроить паттерн</a>'

		return result;

	}

	function renderEventsCards(dayDate){

		var dayDateIso = new Date(dayDate).toISOString()

		var events = dataService.getEvents().filter(function(event){

			if (event.date && new Date(event.date).toISOString() == dayDateIso) {
				return true;
			}

			if (event.date_from && new Date(event.date_from).toISOString() == dayDateIso) {
				return true;
			}

			return false;

		})

		var categoriesAsObject = dataService.getCategoriesAsObject();


		console.log('renderEventsCards.events', events);

		var result = '';

		if (events.length) {

			result = result + '<div class="day-detail-events-cards-holder">';

			result = result + '<h4 class="day-detail-events-header">События</h4>'


			events.forEach(function(event){

				var eventHtml = '';

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
			

				eventHtml = eventHtml + '<div class="day-detail-event-card" title="' + event.text+'">'

				eventHtml = eventHtml + '<div class="day-detail-event-item-color" style="background: '+eventColor+'"></div>'

				eventHtml = eventHtml + event.name;
				eventHtml = eventHtml + '</div>'


				result = result + eventHtml;

			})
			

			result = result + '</div>';

		}


		return result;

	}

	function renderPastYearSection(dayDate){

	
		var pastDayDate = moment(dayDate).subtract(1, 'year').format('yyyy-MM-DD');
		var pastDayDateIso = new Date(pastDayDate).toISOString()

		var dayDetail = dataService.getDayDetail(pastDayDate);
		var events = dataService.getEvents().filter(function(event){

			if (event.date && event.date == pastDayDateIso) {
				return true;
			}

			if (event.date_from && event.date_from == pastDayDateIso) {
				return true;
			}

			return false;

		})

		var result = '';

		if (dayDetail || events.length) {

			result = result + '<div class="day-detail-past-year-divider"></div>'

			result = result + '<h4 class="day-detail-notes-header">В прошлом году</h4>'

			if (dayDetail) {
				result = result + '<div class="day-detail-notes-year-before">'+dayDetail.notes+'</div>'
			} else {
				result = result + '<div class="day-detail-notes-year-before text-center">Записей нет</div>'
			}


			result = result + renderEventsCards(pastDayDate)

			
			result = result + '</div';

		}


		return result;

	}
	
	function render(dayDate){

		var result = '';

		result = result + '<div class="day-detail-header">'

		result = result + renderHeader(dayDate)
		
		result = result + '</div>'

		result = result + '<div>'

		result = result + renderNotesSection(dayDate);

		result = result + renderEventsCards(dayDate);

		result = result + '</div>'

		result = result + '<div>'

		result = result + renderPastYearSection(dayDate);

		result = result + '</div>'


		// Deprecated

		// result = result + '<div class="day-detail-content">'

		// result = result + '<div class="day-detail-content-section">'

		// result = result + renderActionsSection(dayDate);

		// result = result + renderChartSection(dayDate);

		// result = result + renderDayEventsSection(dayDate);

		// result = result + '</div>'

		
		// result = result + '</div>'
	
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

		result = result + '<span class="edit-day-pattern-label">Название</label>'
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


		result = result + '<h3 class="text-center">Действия</h3>'

		// Pattern action

		if (pattern.actions.length) {
		pattern.actions.forEach(function(action) {

			var actionHTML = '';

			actionHTML = actionHTML + '<div class="day-pattern-action-holder">'

			actionHTML = actionHTML + '<div style="background: ' + action.color + '"class="day-pattern-action-color-box"></div>'

			// Name 
			actionHTML = actionHTML + '<div class="display-inline-block">'
			actionHTML = actionHTML + '<div>'

			actionHTML = actionHTML + '<span>Название: </span>'
			actionHTML = actionHTML + '<b>' + action.name + '</b>'

			actionHTML = actionHTML + '</div>'

			// Duration

			actionHTML = actionHTML + '<div>'

			actionHTML = actionHTML + '<span>Длительность: </span>'
			actionHTML = actionHTML + action.hours + ' часов '
			actionHTML = actionHTML + action.minutes + ' минут '

			actionHTML = actionHTML + '</div>'

			actionHTML = actionHTML + '<div>'

			actionHTML = actionHTML + '<span>Работает в выходные: </span>'
			if (action.exclude_weekend) {
				actionHTML = actionHTML + ' нет'
			} else {
				actionHTML = actionHTML + ' да '
			}

			actionHTML = actionHTML + '</div>'


			actionHTML = actionHTML + '</div>'

			actionHTML = actionHTML + '<button data-id="'+ action.id + '" class="day-pattern-action-delete dayPatternActionDelete" title="Удалить"><i class="fa fa-close"></i></button>'


			actionHTML = actionHTML + '</div>'

			result = result + actionHTML

		})

		} else {
			result = result + '<div class="text-center">Действий нет</div>'
		}	

		result = result + '<h3 class="text-center">Новое действие</h3>'

		result = result + '<div class="add-day-pattern-action-holder m-t-8">'

			// Name 
		result = result + '<div class="day-pattern-action-input-container">'

		result = result + '<label class="day-pattern-action-label">Название</label>'
		result = result + '<input class="day-pattern-action-input day-pattern-action-input-name dayPatternActionInputName width-100">'

		result = result + '</div>'

		// Duration

		result = result + '<div class="day-pattern-action-input-container">'

		result = result + '<label class="day-pattern-action-label">Длительность</label>'
		result = result + '<input class="day-pattern-action-input m-r-8 day-pattern-action-input-hours dayPatternActionInputHours" placeholder="Часов">'
		result = result + '<input class="day-pattern-action-input day-pattern-action-input-minutes dayPatternActionInputMinutes" placeholder="Минут">'

		result = result + '</div>'


		// Color

		result = result + '<div class="day-pattern-action-input-container">'

		result = result + '<label class="day-pattern-action-label">Цвет</label>'
		result = result + '<input class="day-pattern-action-input day-pattern-action-input-color dayPatternActionInputColor width-100">'

		result = result + '</div>'

		// exclude_weekend 
		result = result + '<div class="day-pattern-action-input-container">'

		result = result + '<label class="day-pattern-action-label">Исключить в выходные</label>'
		result = result + '<input type="checkbox" type="date" class="day-pattern-action-input day-pattern-action-input-exclude-weekend dayPatternActionInputExcludeWeekend">'

		result = result + '</div>'

		result = result + '<button class="simple-button m-t-8 addDayPatternActionButton">Добавить действие</button>'


		result = result + '<div class="overflow-hidden width-100 m-t-8">'
		result = result + '<button class="simple-button float-right display-blockedit-day-pattern-save-pattern editDayPatternSavePattern">Сохранить</button>'
		result = result + '<a href="#/settings/day-pattern/" class="simple-button float-left display-block edit-day-pattern-close-pattern editDayPatternClosePattern">Закрыть</a>'
		result = result + '</div>'

		result = result + '</div>'

		return result;

	}

	function addEventListenersDayPatternDetailSettings(){

		var addDayPatternActionButton = document.querySelector('.addDayPatternActionButton')
		var editDayPatternSavePattern = document.querySelector('.editDayPatternSavePattern')
		var dayPatternActionDelete = document.querySelectorAll('.dayPatternActionDelete')


		$('.dayPatternActionInputColor').spectrum({
	       allowEmpty: true
	    });

		addDayPatternActionButton.addEventListener('click', function(event){

			console.log("Here?");

			var dayPatternActionInputName = document.querySelector('.dayPatternActionInputName')
			var dayPatternActionInputHours = document.querySelector('.dayPatternActionInputHours')
			var dayPatternActionInputMinutes = document.querySelector('.dayPatternActionInputMinutes')
			var dayPatternActionInputColor = document.querySelector('.dayPatternActionInputColor')
			var dayPatternActionInputExcludeWeekend = document.querySelector('.dayPatternActionInputExcludeWeekend')

			var patterns = dataService.getDayPatterns();

			var pattern;

			patterns.forEach(function(patternItem) {
				if(patternItem.id == _patternId) {
					pattern = patternItem;
				}
			})

			var action = {
				id: toMD5('action_' + pattern.actions.length + 1 + '_' + new Date().getTime()),
				name: dayPatternActionInputName.value,
				hours: 0,
				minutes: 0,
				color: dayPatternActionInputColor.value,
				exclude_weekend: dayPatternActionInputExcludeWeekend.value
			}

			if (parseInt(dayPatternActionInputHours.value, 10)) {
				action.hours =  parseInt(dayPatternActionInputHours.value, 10)
			}

			if (parseInt(dayPatternActionInputMinutes.value, 10)) {
				action.minutes =  parseInt(dayPatternActionInputMinutes.value, 10)
			}

			pattern.actions.push(action);

			dataService.setDayPattern(pattern)

			_redrawDayPatternDetailDialog();


		})

		editDayPatternSavePattern.addEventListener('click', function(event){

			location.hash = '#/settings/day-pattern';

			eventService.dispatchEvent('SAVE');

		})

		dayPatternActionDelete.forEach(function(item) {

			item.addEventListener('click', function(event){

				var id = event.target.dataset.id

				if (!id) {
					id = event.target.parentElement.dataset.id
				}

				console.log('id', id);

				var patterns = dataService.getDayPatterns();

				var pattern;

				patterns.forEach(function(patternItem) {
					if(patternItem.id == _patternId) {
						pattern = patternItem;
					}
				})

				pattern.actions = pattern.actions.filter(function(action){
					return action.id != id
				})

				dataService.setDayPattern(pattern)
				_redrawDayPatternDetailDialog();


			})

		})

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