var appContainer = document.querySelector('.appContainer')
var interfaceContainer = appContainer.querySelector('.interfaceContainer');
var calendarContainer = appContainer.querySelector('.calendarContainer');
var timelineContainer = appContainer.querySelector('.timelineContainer');


var initContainer = document.querySelector('.initContainer')

var dataService = new DataService();
var dataHelper = new DataHelper();
var calendarModule = CalendarModule(dataService)

function addEvenListeners(){

  var saveButton = document.querySelector('.saveButton')

  saveButton.addEventListener('click', function(event){
    event.preventDefault();

    var data = dataService.getData();

    localStorage.setItem('data', JSON.stringify(data));

  })

}

function render(){

  console.time("render")

  var interfaceResult = '';

  interfaceResult = interfaceResult + 'Birthday: ' + dataService.getBirthday();
  interfaceResult = interfaceResult + '<button class="save-button saveButton">Сохранить</button>';

  interfaceContainer.innerHTML = interfaceResult
  calendarContainer.innerHTML =  calendarModule.render();

  addEvenListeners();

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

    render();

  } else {
    
    initContainer.classList.add('active')
    appContainer.classList.remove('active')

    document.querySelector('.initFinishButton').addEventListener('click', function(event){

        event.preventDefault();

        var input = document.querySelector('.birthdayInput')

        var birthday = input.value

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
    )

  }

  
}

init();