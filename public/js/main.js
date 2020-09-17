var appContainer = document.querySelector('.appContainer')
var interfaceContainer = appContainer.querySelector('.interfaceContainer');
var calendarContainer = appContainer.querySelector('.calendarContainer');
var eventsContainer = appContainer.querySelector('.eventsContainer');
var addEventDialogContainer = document.querySelector('.addEventDialogContainer')

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

function syncEventsWithSquares() {

  var squares = dataService.getSquares();
  var events = dataService.getEvents();

  events.forEach(function(event){

     if (event.type == 1 || !event.type) {

      var eventDate = new Date(event.date)
      var yearNumber = eventDate.getFullYear()
      var weekNumber = dataHelper.getWeekNumber(eventDate)

     }

     squares.forEach(function(square) {

        if(square.year == yearNumber && square.week == weekNumber) {

          if (!square.events) {
            square.events = []
          }

          square.events.push(event)
        }


    })

  })

 

}

function addInterfaceEventListeners(){

  var saveButton = document.querySelector('.saveButton')
  var exportButton = document.querySelector('.exportButton')
  var addEventButtonDialog = document.querySelector('.addEventButtonDialog')
  var addEventButton = document.querySelector('.addEventButton')
  var closeEventButton = document.querySelector('.closeEventButton')
  var eventTypeInput = document.querySelector('.eventTypeInput')

  saveButton.addEventListener('click', function(event){

    console.log("Save")

    event.preventDefault();

    save();

  })

  exportButton.addEventListener('click', function(event){

    console.log("Export")

    event.preventDefault();

    var data = dataService.getData();

    var date = new Date().toISOString().split('T')[0]

    downloadFile(JSON.stringify(data), 'application/json',  'lifecalendar ' + date + '.json')

  })

  addEventButtonDialog.addEventListener('click', function(event) {

    console.log("Show add Event dialog")

    event.preventDefault();

    addEventDialogContainer.classList.add('active')

  })

  closeEventButton.addEventListener('click', function(event) {

    console.log("Close add Event dialog")

    event.preventDefault();

    var eventNameInput = document.querySelector('.eventNameInput')
    var eventDateInput = document.querySelector('.eventDateInput')
    var eventTextInput = document.querySelector('.eventTextInput')

    eventNameInput.value = '';
    eventDateInput.value = null;
    eventTextInput.value = '';

    addEventDialogContainer.classList.remove('active')

  })

  addEventButton.addEventListener('click', function(event) {

    console.log("add Event dialog")

    event.preventDefault();

    var eventNameInput = document.querySelector('.eventNameInput')
    var eventDateInput = document.querySelector('.eventDateInput')
    var eventTypeInput = document.querySelector('.eventTypeInput')
    var eventTextInput = document.querySelector('.eventTextInput')

    var events = dataService.getEvents()

    if(!events) {
      events = [];
    }

    var event = {
      id: toMD5(events.length + 1),
      type: parseInt(eventTypeInput, 10),
      name: eventNameInput.value,
      text: eventTextInput.value
    }

    if (event.type == 1) {
      event.date = new Date(eventDateInput.value)
    }

    if (event.type == 2) {
      event.cron =  new Date(eventDateInput.value)
    }

    if (event.type == 3) {
      event.date_from = new Date(eventDateInput.value)
      event.date_to = new Date(eventDateInput.value)
    }

    events.push(event)

    dataService.setEvents(events)

    eventNameInput.value = '';
    eventDateInput.value = null;
    eventTextInput.value = '';

    addEventDialogContainer.classList.remove('active')
    save();
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

  birthdayHolder.innerHTML =  'Birthday: ' + dataService.getBirthday();
  calendarContainer.innerHTML =  calendarModule.render();
  eventsContainer.innerHTML =  eventsModule.render();

  console.timeEnd("render")

}

function init(){

  var data = localStorage.getItem('data');

  console.log('data', data);

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

init();