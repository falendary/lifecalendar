var appContainer = document.querySelector('.appContainer')
var interfaceContainer = appContainer.querySelector('.interfaceContainer');
var calendarContainer = appContainer.querySelector('.calendarContainer');
var timelineContainer = appContainer.querySelector('.timelineContainer');

var birthdayHolder = document.querySelector('.birthdayHolder')

var initContainer = document.querySelector('.initContainer')

var dataService = new DataService();
var dataHelper = new DataHelper();
var calendarModule = CalendarModule(dataService)

function addInterfaceEventListeners(){

  var saveButton = document.querySelector('.saveButton')
  var exportButton = document.querySelector('.exportButton')

  saveButton.addEventListener('click', function(event){
    event.preventDefault();

    var data = dataService.getData();

    localStorage.setItem('data', JSON.stringify(data));

  })

  exportButton.addEventListener('click', function(event){

    event.preventDefault();

    var data = dataService.getData();

    var date = new Date().toISOString().split('T')[0]

    downloadFile(JSON.stringify(data), 'application/json',  'lifecalendar ' + date + '.json')

  })

}

function render(){

  console.time("render")

  birthdayHolder.innerHTML =  'Birthday: ' + dataService.getBirthday();
  calendarContainer.innerHTML =  calendarModule.render();

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
          squares = dataHelper.markBirthdaySquare(squares, birthday)

          dataService.setSquares(squares);

          initContainer.classList.remove('active')
          appContainer.classList.add('active');

          render();

        }

        if (fileInput.value) {

          var file = fileInput.files[0]

          var reader = new FileReader();

          reader.addEventListener('load', function() {
            
            var result = JSON.parse(reader.result); // Parse the result into an object 
            
            console.log('result', result);

            dataService.setData(result);

            initContainer.classList.remove('active')
            appContainer.classList.add('active');

            render();

          });
        
        reader.readAsText(file);

        }

      }
    )

  }

  
}

init();