var appContainer = document.querySelector('.appContainer')
var interfaceContainer = appContainer.querySelector('.interfaceContainer');
var calendarContainer = appContainer.querySelector('.calendarContainer');
var eventsContainer = appContainer.querySelector('.eventsContainer');
var eventDialogContainer = document.querySelector('.eventDialogContainer')

var birthdayHolder = document.querySelector('.birthdayHolder')

var initContainer = document.querySelector('.initContainer')

var dataService = new DataService();
var dataHelper = new DataHelper();
var calendarModule = CalendarModule(dataService)
var eventsModule = EventsModule(dataService)

EVENT_TYPES = {
  SINGLE: 1,
  REGULAR: 2,
  RANGE: 3
}

function save(){
  var data = dataService.getData();

  localStorage.setItem('data', JSON.stringify(data));
}

function resetForm() {

    var eventNameInput = document.querySelector('.eventNameInput')
    var eventTypeInput = document.querySelector('.eventTypeInput')
    var eventTextInput = document.querySelector('.eventTextInput')

    var eventDateInput = document.querySelector('.eventDateInput')

    var eventDateFromInput = document.querySelector('.eventDateFromInput')
    var eventDateToInput = document.querySelector('.eventDateToInput')

    var eventDateRegularStartInput = document.querySelector('.eventDateRegularStartInput')
    var eventDateRegularType = document.querySelector('.eventDateRegularType')
    var eventDateRegularEndInput = document.querySelector('.eventDateRegularEndInput')

    var eventDateSingleHolder = document.querySelector('.eventDateSingleHolder');
    var eventDateRangeHolder = document.querySelector('.eventDateRangeHolder');
    var eventDateRegularHolder = document.querySelector('.eventDateRegularHolder');


    eventNameInput.value = '';
    eventTextInput.value = '';
    eventTypeInput.value = null;

    eventDateFromInput.value = null;

    eventDateToInput.value = null;
    eventDateInput.value = null;

    eventDateRegularStartInput.value = null;
    eventDateRegularEndInput.value = null;
    eventDateRegularType.value = null;

    eventDateSingleHolder.classList.remove('active');
    eventDateRangeHolder.classList.remove('active');
    eventDateRegularHolder.classList.remove('active');

    eventDateSingleHolder.classList.add('active')

}

function syncEventsWithSquares() {

  var squares = dataService.getSquares();
  var events = dataService.getEvents();

  squares.forEach(function(square) {
    square.events = []
  })

  events.forEach(function(event){

    

     if (event.type == 1 || !event.type) {

        var eventDate = new Date(event.date)
        var yearNumber = eventDate.getFullYear()
        var weekNumber = dataHelper.getWeekNumber(eventDate)

        squares.forEach(function(square) {

          if(square.year == yearNumber && square.week == weekNumber) {
              var eventItem = Object.assign({}, event)

              square.events.push(eventItem)
          }

        })

     }

     if (event.type == 2) {

        var subEvents = dataHelper.generateRegularEvents(event)
        
        subEvents.forEach(function(subEvent) {

          var subEventDate = new Date(subEvent.date)
          var subEventYearNumber = subEventDate.getFullYear()
          var subEventWeekNumber = dataHelper.getWeekNumber(subEventDate)

          squares.forEach(function(square) {

            if(square.year == subEventYearNumber && square.week == subEventWeekNumber) {
              square.events.push(subEvent)
            }

          })

        })

     }

     if (event.type == 3) {

        var dates = dataHelper.getDates(new Date(event.date_from), new Date(event.date_to));

        var years = [];
        var weeks = {};

        dates.forEach(function(date){

            var eventDate = new Date(date)

            var year = new Date(eventDate).getFullYear();
            var week = dataHelper.getWeekNumber(eventDate);

            if (years.indexOf(year) === -1) {
              years.push(year)
            }

            if (!weeks.hasOwnProperty(year)) {
                weeks[year] = []
            }
            if (weeks[year].indexOf(week) === -1) {
              weeks[year].push(week);
            }

        })

        squares.forEach(function(square) {

          if(years.indexOf(square.year) !== -1) {

            if (weeks[square.year].indexOf(square.week) !== -1) {

              var eventItem = Object.assign({}, event)

              square.events.push(eventItem)



            }

          }

        })


     }

     
  })

 

}

function addInterfaceEventListeners(){

  var saveButton = document.querySelector('.saveButton')
  var exportButton = document.querySelector('.exportButton')
  var addEventButtonDialog = document.querySelector('.addEventButtonDialog')
  var addEventButton = document.querySelector('.addEventButton')
  var saveEventButton = document.querySelector('.saveEventButton')
  var closeEventButton = document.querySelector('.closeEventButton')
  var eventTypeInput = document.querySelector('.eventTypeInput')
  var deleteEventButton = document.querySelector('.deleteEventButton')
  var toggleYearsButtonDialog = document.querySelector('.toggleYearsButtonDialog')

  var showYears = true;

  toggleYearsButtonDialog.addEventListener('click', function(event){

    showYears = !showYears;


    if (showYears) {
      toggleYearsButtonDialog.innerHTML = 'Скрыть года'
      calendarContainer.classList.remove('hide-years')
    } else {
      toggleYearsButtonDialog.innerHTML = 'Показать года'
      calendarContainer.classList.add('hide-years')
    }

  })
  
  saveButton.addEventListener('click', function(event){

    console.log("Save")

    event.preventDefault();

    save();

    toastr.success('Сохранено')

  })

  exportButton.addEventListener('click', function(event){

    console.log("Export")

    event.preventDefault();

    var data = dataService.getData();

    var date = new Date().toISOString().split('T')[0]

    downloadFile(JSON.stringify(data), 'application/json',  'lifecalendar ' + date + '.json')

    toastr.success('Успешно экспортировано')

  })

  addEventButtonDialog.addEventListener('click', function(event) {

    console.log("Show add Event dialog")

    event.preventDefault();

    eventDialogContainer.classList.remove('edit-dialog')
    eventDialogContainer.classList.add('add-dialog')
    eventDialogContainer.classList.add('active')

  })

  closeEventButton.addEventListener('click', function(event) {

    console.log("Close add Event dialog")

    event.preventDefault();

    var eventNameInput = document.querySelector('.eventNameInput')
    var eventDateInput = document.querySelector('.eventDateInput')
    var eventTypeInput = document.querySelector('.eventTypeInput')
    var eventTextInput = document.querySelector('.eventTextInput')

    eventNameInput.value = '';
    eventDateInput.value = null;
    eventTypeInput.value = null;
    eventTextInput.value = '';

    eventDialogContainer.classList.remove('add-dialog')
    eventDialogContainer.classList.remove('edit-dialog')
    eventDialogContainer.classList.remove('active')

  })

  addEventButton.addEventListener('click', function(event) {

    console.log("add Event dialog")

    event.preventDefault();

    var eventNameInput = document.querySelector('.eventNameInput')
    var eventTypeInput = document.querySelector('.eventTypeInput')
    var eventTextInput = document.querySelector('.eventTextInput')
    

    var eventDateInput = document.querySelector('.eventDateInput')

    var eventDateFromInput = document.querySelector('.eventDateFromInput')
    var eventDateToInput = document.querySelector('.eventDateToInput')

    var eventDateRegularStartInput = document.querySelector('.eventDateRegularStartInput')
    var eventDateRegularType = document.querySelector('.eventDateRegularType')
    var eventDateRegularEndInput = document.querySelector('.eventDateRegularEndInput')

    var eventColorInput = document.querySelector('.eventColorInput')

    var events = dataService.getEvents()

    if(!events) {
      events = [];
    }

    var targetEvent = {
      id: toMD5(events.length + 1 + '_' + new Date().getTime()),
      type: parseInt(eventTypeInput.value, 10),
      name: eventNameInput.value,
      text: eventTextInput.value,
      color: eventColorInput.value
    }

    if (targetEvent.type == 1) {
      targetEvent.date = new Date(eventDateInput.value)
    }

    if (targetEvent.type == 2) {
      targetEvent.date_from = new Date(eventDateRegularStartInput.value);
      targetEvent.date_to = new Date(eventDateRegularEndInput.value);
      targetEvent.date_type = eventDateRegularType.value;
    }

    if (targetEvent.type == 3) {
      targetEvent.date_from = new Date(eventDateFromInput.value)
      targetEvent.date_to = new Date(eventDateToInput.value)
    }

    events.push(targetEvent)

    toastr.success('Событие добавлено')

    dataService.setEvents(events)

    resetForm();

    eventDialogContainer.classList.remove('active')
    save();
    syncEventsWithSquares();
    render();

  })

  saveEventButton.addEventListener('click', function(event) {

    console.log("save Event dialog")

    event.preventDefault();

    var eventNameInput = document.querySelector('.eventNameInput')
    var eventTypeInput = document.querySelector('.eventTypeInput')
    var eventTextInput = document.querySelector('.eventTextInput')


    var eventDateInput = document.querySelector('.eventDateInput')

    var eventDateFromInput = document.querySelector('.eventDateFromInput')
    var eventDateToInput = document.querySelector('.eventDateToInput')

    var eventDateRegularStartInput = document.querySelector('.eventDateRegularStartInput')
    var eventDateRegularType = document.querySelector('.eventDateRegularType')
    var eventDateRegularEndInput = document.querySelector('.eventDateRegularEndInput')

    var eventColorInput = document.querySelector('.eventColorInput')

    var events = dataService.getEvents()

    var targetEvent;

    var eventId = eventDialogContainer.dataset.id

    events.forEach(function(item){

      if (item.id == eventId) {
        targetEvent = item;
      }

    })

    targetEvent.type = parseInt(eventTypeInput.value, 10),
    targetEvent.name = eventNameInput.value
    targetEvent.text = eventTextInput.value
    targetEvent.color = eventColorInput.value

    if (targetEvent.type == 1) {
      targetEvent.date = new Date(eventDateInput.value)
    }

    if (targetEvent.type == 2) {
      targetEvent.date_from = new Date(eventDateRegularStartInput.value);
      targetEvent.date_to = new Date(eventDateRegularEndInput.value);
      targetEvent.date_type = eventDateRegularType.value;

      console.log('eventDateRegularStartInput', eventDateRegularStartInput.value);
      console.log('eventDateRegularEndInput', eventDateRegularEndInput.value);
      console.log('eventDateRegularType', eventDateRegularType.value);
    }

    if (targetEvent.type == 3) {
      targetEvent.date_from = new Date(eventDateFromInput.value)
      targetEvent.date_to = new Date(eventDateToInput.value)

      console.log('eventDateFromInput', eventDateFromInput.value);
      console.log('eventDateToInput', eventDateToInput.value);
    }

    

    console.log('targetEvent', targetEvent);

    dataService.setEvents(events)

    toastr.success('Событие обновлено')

    resetForm();

    eventDialogContainer.classList.remove('active')
    save();
    syncEventsWithSquares();
    render();

  })

  deleteEventButton.addEventListener('click', function(event) {

    console.log("Close add Event dialog")

    event.preventDefault();

    var targetEvent;

    var eventId = eventDialogContainer.dataset.id

    var events = dataService.getEvents()

    events = events.filter(function(item) {

      if (item.id == eventId) {
        return false
      }

      return true

    })

    dataService.setEvents(events);

    toastr.success('Событие удалено')

    resetForm();

    eventDialogContainer.classList.remove('active')
    syncEventsWithSquares();
    render();


  })


  eventTypeInput.addEventListener('change', function(event) {

    var value = eventTypeInput.value;

    var eventDateSingleHolder = document.querySelector('.eventDateSingleHolder');
    var eventDateRangeHolder = document.querySelector('.eventDateRangeHolder');
    var eventDateRegularHolder = document.querySelector('.eventDateRegularHolder');

    eventDateSingleHolder.value = null;
    eventDateRangeHolder.value = null;
    eventDateRegularHolder.value = null;

    eventDateSingleHolder.classList.remove('active');
    eventDateRangeHolder.classList.remove('active');
    eventDateRegularHolder.classList.remove('active');

    if (value == 1) {
      eventDateSingleHolder.classList.add('active')
    }

    if (value == 2) {
      eventDateRegularHolder.classList.add('active')
    }

    if (value == 3) {
      eventDateRangeHolder.classList.add('active')
    }

    if (!value) {
      eventDateSingleHolder.classList.add('active')
    }

  })

}

function render(){

  console.time("render")

  calendarContainer.innerHTML =  calendarModule.render();
  eventsContainer.innerHTML =  eventsModule.render();

  calendarModule.addEventListeners();
  eventsModule.addEventListeners();

  console.timeEnd("render")

}

function init(){

  var data = localStorage.getItem('data');

  document.body.addEventListener('click', function(event) {

    console.log('here');

    document.querySelectorAll('.square-context-menu').forEach(function(element){ element.remove()});
  })

  if (data) {
    dataService.setData(JSON.parse(data));
  }

  if (dataService.getBirthday()) {
    
    appContainer.classList.add('active');

    var squares = dataService.getSquares();
    squares = dataHelper.markLivedSquares(squares)
    dataService.setSquares(squares);

    addInterfaceEventListeners();

    syncEventsWithSquares();

    render();

  } else {
    
    initContainer.classList.add('active')
    appContainer.classList.remove('active')

    document.querySelector('.fileInput').addEventListener('change', function(){

      document.querySelector('.birthdayInput').value = null;
      document.querySelector('.birthdayInput').classList.add('disabled')

    })

    document.querySelector('.initFinishButton').addEventListener('click', function(event){

        event.preventDefault();

        var dateInput = document.querySelector('.birthdayInput')
        var fileInput = document.querySelector('.fileInput')


        if (dateInput.value) {

          var birthday = dateInput.value

          dataService.setBirthday(birthday);

          var squares = dataHelper.generateSquaresFromDate(birthday)

          squares = dataHelper.deleteSquaresBeforeBirthday(squares, birthday)
          squares = dataHelper.markLivedSquares(squares)
          
          dataService.setSquares(squares);
          dataService.setEvents([]);

          initContainer.classList.remove('active')
          appContainer.classList.add('active');

          addInterfaceEventListeners();
          syncEventsWithSquares();
          render();

        }

        if (fileInput.value) {

          var file = fileInput.files[0]

          var reader = new FileReader();

          reader.addEventListener('load', function() {
            var result = JSON.parse(reader.result); // Parse the result into an object 
            
            console.log('result', result);

            dataService.setData(result);
            save();

            initContainer.classList.remove('active')
            appContainer.classList.add('active');
            addInterfaceEventListeners();
            syncEventsWithSquares();
            render();

          });
        
        reader.readAsText(file);

        }

      }
    )

  }

  
}

$(document).ready(function(){

  $('.eventColorInput').spectrum({
     allowEmpty: true
  });


  init();

})