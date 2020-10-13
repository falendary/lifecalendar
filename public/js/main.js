var appContainer = document.querySelector('.appContainer')
var interfaceContainer = appContainer.querySelector('.interfaceContainer');
var calendarContainer = appContainer.querySelector('.calendarContainer');
var eventsContainer = appContainer.querySelector('.eventsContainer');
var eventDialogContainer = document.querySelector('.eventDialogContainer')
var categoryContainerBody = document.querySelector('.categoryContainerBody')
var categorySelect = document.querySelector('.categorySelect')

var birthdayHolder = document.querySelector('.birthdayHolder')

var initContainer = document.querySelector('.initContainer')

var dataService = new DataService();
var dataHelper = new DataHelper();
var calendarModule = CalendarModule(dataService)
var categoryModule = CategoryModule(dataService)
var eventsModule = EventsModule(dataService)

EVENT_TYPES = {
  SINGLE: 1,
  REGULAR: 2,
  RANGE: 3
}

function save(){

  var data = dataService.getData();

  var preparedData = JSON.parse(JSON.stringify(data))

  delete preparedData.squares;

  localStorage.setItem('data', JSON.stringify(preparedData));

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

    var categorySelect = document.querySelector('.categorySelect')

    var categorySelectOptions = categorySelect.querySelectorAll('option')

    categorySelectOptions.forEach(function(option) {

      option.selected = false;
      
    })

}

function syncEventsWithSquares() {

  var squares = dataService.getSquares();
  var events = dataService.getEvents();

  squares.forEach(function(square) {
    square.events = []
  })


  events.forEach(function(event){

     if (event.type == 1 || !event.type) { // SINGLE

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

     if (event.type == 2) { // REGULAR

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

     if (event.type == 3) { // RANGE

        var eventFromDate = new Date(event.date_from)
        var yearFromNumber = eventFromDate.getFullYear()
        var weekFromNumber = dataHelper.getWeekNumber(eventFromDate)

        var eventToDate = new Date(event.date_to)
        var yearToNumber = eventToDate.getFullYear()
        var weekToNumber = dataHelper.getWeekNumber(eventToDate)

        squares.forEach(function(square) {

          var eventItem = Object.assign({}, event)

          if (yearFromNumber != yearToNumber) {

            if (square.year == yearFromNumber && square.week >= weekFromNumber) {

                square.events.push(eventItem)

            }

            if (square.year > yearFromNumber && square.year < yearToNumber) {

                square.events.push(eventItem)

            }

            if (square.year == yearToNumber && square.week <= weekToNumber) {

              square.events.push(eventItem)

            }

          }

          if (yearFromNumber == yearToNumber) {

            if (square.year >= yearFromNumber && square.year <= yearToNumber) {

              if (square.week >= weekFromNumber && square.week <= weekToNumber) {
                square.events.push(eventItem)

              }

            }

          }

        })

     }

     
  })

  dataService.setSquares(squares);
 
}


function addInterfaceEventListeners(){

  var saveButton = document.querySelector('.saveButton')
  var exportButton = document.querySelector('.exportButton')
  var addEventButtonDialog = document.querySelector('.addEventButtonDialog')
  var showCategoryButtonDialog = document.querySelector('.showCategoryButtonDialog')
  var categoryCloseButtonDialog = document.querySelector('.categoryCloseButtonDialog')
  var addCategoryButton = document.querySelector('.categoryCloseButtonDialog')
  var addEventButton = document.querySelector('.addEventButton')
  var saveEventButton = document.querySelector('.saveEventButton')
  var clearColorButton = document.querySelector('.clearColorButton')
  var closeEventButton = document.querySelector('.closeEventButton')
  var eventTypeInput = document.querySelector('.eventTypeInput')
  var deleteEventButton = document.querySelector('.deleteEventButton')
  var toggleYearsButtonDialog = document.querySelector('.toggleYearsButtonDialog')
  var toggleMonthsButtonDialog = document.querySelector('.toggleMonthsButtonDialog')
  var toggleSeasonsButtonDialog = document.querySelector('.toggleSeasonsButtonDialog')
  var addCategoryButton = document.querySelector('.addCategoryButton')
  var closeCategoryButton = document.querySelector('.closeCategoryButton')
  var saveCategoriesButton = document.querySelector('.saveCategoriesButton')
  var eventsFilterInput = document.querySelector('.eventsFilterInput')
  var categoriesFilterInputAdd = document.querySelector('.categoriesFilterInputAdd')
  var categoriesFilterInput = document.querySelector('.categoriesFilterInput')
  var showInYearsButton = document.querySelector('.showInYearsButton')
  var yearsCloseButtonDialog = document.querySelector('.yearsCloseButtonDialog')

  var renderType = dataService.getRenderType();

  toggleYearsButtonDialog.addEventListener('click', function(event){

    toggleYearsButtonDialog.classList.remove('active')
    toggleMonthsButtonDialog.classList.remove('active')
    toggleSeasonsButtonDialog.classList.remove('active')

    calendarContainer.classList.remove('group-by-years')
    calendarContainer.classList.remove('group-by-seasons')
    calendarContainer.classList.remove('group-by-months')

    if (renderType == 'years') {
      renderType = '';
    } else {
      renderType = 'years'
      toggleYearsButtonDialog.classList.add('active');
      calendarContainer.classList.add('group-by-years')
    }

    dataService.setRenderType(renderType);

    render()

  })

  toggleSeasonsButtonDialog.addEventListener('click', function(event){

    toggleYearsButtonDialog.classList.remove('active')
    toggleMonthsButtonDialog.classList.remove('active')
    toggleSeasonsButtonDialog.classList.remove('active')

    calendarContainer.classList.remove('group-by-years')
    calendarContainer.classList.remove('group-by-seasons')
    calendarContainer.classList.remove('group-by-months')

    if (renderType == 'seasons') {
      renderType = '';
    } else {
      renderType = 'seasons'
      toggleSeasonsButtonDialog.classList.add('active');
      calendarContainer.classList.add('group-by-seasons')
    }

    dataService.setRenderType(renderType);

    render()

  })

  toggleMonthsButtonDialog.addEventListener('click', function(event){

    toggleYearsButtonDialog.classList.remove('active')
    toggleMonthsButtonDialog.classList.remove('active')
    toggleSeasonsButtonDialog.classList.remove('active')

    calendarContainer.classList.remove('group-by-years')
    calendarContainer.classList.remove('group-by-seasons')
    calendarContainer.classList.remove('group-by-months')

    if (renderType == 'months') {
      renderType = '';
    } else {
      renderType = 'months'
      toggleMonthsButtonDialog.classList.add('active');
      calendarContainer.classList.add('group-by-months')
    }

    dataService.setRenderType(renderType);

    render()

  })

  eventsFilterInput.addEventListener('keyup', function(event){

    event.preventDefault();

    var filters = dataService.getFilters();

    filters.eventSearchString = eventsFilterInput.value;

    dataService.setFilters(filters);

    renderRightSection();


  })

  categoriesFilterInputAdd.addEventListener('click', function(event) {

    event.preventDefault();

    var categoriesFilterInput = document.querySelector('.categoriesFilterInput');

    if (categoriesFilterInput.value) {

      var filters = dataService.getFilters();

      if (!filters.categories) {
        filters.categories = []
      }

      filters.categories.push(categoriesFilterInput.value)

      dataService.setFilters(filters);

      categoriesFilterInput.value = '';

      console.log('categoriesFilter', filters);

      renderCategoriesFilterChips();

      render()
    }

  })

  categoriesFilterInput.addEventListener('keyup', function(event) {

    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      categoriesFilterInputAdd.click();
    }

  })
  
  saveButton.addEventListener('click', function(event){

    console.log("Save")

    event.preventDefault();

    save();

    toastr.success('Сохранено')

  })

  showCategoryButtonDialog.addEventListener('click', function(event){

    document.querySelector('.categoryContainer').classList.add('active');

  })

  categoryCloseButtonDialog.addEventListener('click', function(event){

    document.querySelector('.categoryContainer').classList.remove('active');

  })

  closeCategoryButton.addEventListener('click', function(event){

    document.querySelector('.categoryContainer').classList.remove('active');

  })

  saveCategoriesButton.addEventListener('click', function(event){

    var categories = dataService.getCategories();

    categories = categories.filter(function(category) {
      return !category.isDeleted;
    })

    var categoriesElems = document.querySelectorAll('.categoryItem')

    var newCategoriesData = [];

    categoriesElems.forEach(function(categoryElem, index){

      var result = {
        name: categoryElem.querySelector('.categoryNameInput').value,
        color: categoryElem.querySelector('.categoryColorInput').value
      };

      newCategoriesData.push(result);

    })

    categories = categories.map(function(category, index){

      category.name = newCategoriesData[index].name
      category.color = newCategoriesData[index].color

      return category

    })

    dataService.setCategories(categories);
    save();

    toastr.success('Категории сохранены')

    document.querySelector('.categoryContainer').classList.remove('active');

  })

  addCategoryButton.addEventListener('click', function(event){

    event.preventDefault();

    var categories = dataService.getCategories();

    if(!categories) {
      categories = []
    }

    categories.push({
      id: toMD5(categories.length + 1 + '_' + new Date().getTime()),
      name: "Новая категория",
      color: "#ffffff"
    })

    save();

    render();

  })

  exportButton.addEventListener('click', function(event){

    console.log("Export")

    event.preventDefault();

    var data = dataService.getData();

    var date = new Date().toISOString().split('T')[0]

    var preparedData = JSON.parse(JSON.stringify(data))

    delete preparedData.squares;

    downloadFile(JSON.stringify(preparedData), 'application/json',  'lifecalendar ' + date + '.json')

    toastr.success('Успешно экспортировано')

  })

  showInYearsButton.addEventListener('click', function(event){

    var yearsRenderContainer = document.querySelector('.yearsRenderContainer')
    var yearsRenderBody = document.querySelector('.yearsRenderBody')

    yearsRenderContainer.classList.add('active');

    yearsRenderBody.innerHTML = calendarModule.renderAsYears()
    calendarModule.addYearsEventListeners()

  })

  yearsCloseButtonDialog.addEventListener('click', function(event){

    var yearsRenderContainer = document.querySelector('.yearsRenderContainer')
    var yearsRenderBody = document.querySelector('.yearsRenderBody')

    yearsRenderContainer.classList.remove('active');

    yearsRenderBody.innerHTML = '';

  })

  addEventButtonDialog.addEventListener('click', function(event) {

    console.log("Show add Event dialog")

    event.preventDefault();

    eventDialogContainer.classList.remove('edit-dialog')
    eventDialogContainer.classList.add('add-dialog')
    eventDialogContainer.classList.add('active')

    var categorySelect = document.querySelector('.categorySelect')

    var categorySelectOptions = categorySelect.querySelectorAll('option')

    categorySelectOptions.forEach(function(option) {

      option.selected = false;
      
    })

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
    var categorySelect = $('.categorySelect')

    var events = dataService.getEvents()

    if(!events) {
      events = [];
    }

    var targetEvent = {
      id: toMD5(events.length + 1 + '_' + new Date().getTime()),
      type: parseInt(eventTypeInput.value, 10),
      name: eventNameInput.value,
      text: eventTextInput.value,
      color: eventColorInput.value,
      categories: categorySelect.val()
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

  clearColorButton.addEventListener('click', function(event){

     document.querySelector('.eventColorInput').value = null;
     $('.eventColorInput').spectrum({
        allowEmpty: true
     });

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
    var categorySelect = $('.categorySelect')

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
    targetEvent.categories = categorySelect.val()

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

  var birthday = dataService.getBirthday();
  var birthdayDate = new Date(birthday)
  var birthdayYear = birthdayDate.getFullYear();

  var slider = document.querySelector('.yearSlider');

  var startMin = birthdayYear + 16
  var startMax = birthdayYear + 40

  var filters = dataService.getFilters();

  if (filters) {
    startMin = filters.year_from;
    startMax = filters.year_to;
  }

  noUiSlider.create(slider, {
      start: [startMin, startMax],
      connect: true,
      tooltips: true,
      step: 1,
      range: {
          'min': birthdayYear - 1,
          'max': birthdayYear + 100
      },
      format: {
        to: function (value) {
            return parseInt(value, 10)
        },
         from: function (value) {
            return value
        }
      }
  });

  slider.noUiSlider.on('change', function () {

    var data = slider.noUiSlider.get()

    var filters = dataService.getFilters();

    if (!filters) {
      filters = {}
    }

    filters.year_from = data[0] - 1
    filters.year_to = data[1] + 1

    dataService.setFilters(filters)
    render();

  });

}

function render(){

  console.time("render")

  // deprecated
  // calendarContainer.innerHTML = calendarModule.render();
  // calendarContainer.innerHTML = calendarContainer.innerHTML +  calendarModule.renderMonths();

  var renderType = dataService.getRenderType();

  console.log('renderType', renderType);

  switch(renderType) {

      case 'years':
        calendarContainer.innerHTML = calendarModule.renderGroupByYears();
        break;
      case 'seasons':
        calendarContainer.innerHTML = calendarModule.renderGroupBySeasons();
        break;
      case 'months':
        calendarContainer.innerHTML = calendarModule.renderGroupByMonths();
        break;
      default:
        calendarContainer.innerHTML = calendarModule.renderDefault();
        break;
  }


  categoryContainerBody.innerHTML = categoryModule.render();
  categorySelect.innerHTML = categoryModule.renderOptionsForSelect()

  renderRightSection();

  document.querySelector('.eventsTitle').title =  dataService.getEvents().length + " событий";


  calendarModule.addEventListeners();
  
  categoryModule.addEventListeners();

  console.timeEnd("render")

}

function renderCategoriesFilterChips(){

  var filters = JSON.parse(JSON.stringify(dataService.getFilters()));

  var container = document.querySelector('.categoriesFilterHolder')
  var categoriesFilterChips = document.querySelector('.categoriesFilterChips');

  if (filters.categories && filters.categories.length) {

    container.classList.remove('empty');

    var result = '';

    var categories = dataService.getCategories();

    filters.categories.forEach(function(category){

      var categoryItem;

      categories.forEach(function(item){

        if(item.name.toLocaleLowerCase() == category.toLocaleLowerCase()) {
          categoryItem = item
        }

      })

      if (!categoryItem) {
        categoryItem = {color: "transparent"}
      }

      var categoryHTML = '<div class="category-filter-chip" style="background: '+ categoryItem.color +'" data-category-name="'+category+'">'

      categoryHTML = categoryHTML + '<span>' + category + '</span>';
      categoryHTML = categoryHTML + '<button class="category-filter-chip-remove categoryFilterChipRemove"><i class="fa fa-close"></i></button>'

      categoryHTML = categoryHTML + '</div>'

      result = result + categoryHTML;

    })

    categoriesFilterChips.innerHTML = result;

    var deleteButtons = document.querySelectorAll('.categoryFilterChipRemove')

    deleteButtons.forEach(function(deleteButton){

      deleteButton.addEventListener('click', function(event){

        event.preventDefault();

        console.log('hello');

        var category = event.target.parentElement.dataset.categoryName

        var filters = dataService.getFilters();

        var index = filters.categories.indexOf(category)

        filters.categories.splice(index, 1)

        console.log('filters', filters);

        dataService.setFilters(filters);

        renderCategoriesFilterChips();
        render();

      })

    })

  } else {
    container.classList.add('empty')
    categoriesFilterChips.innerHTML = '';
  }

}

function renderRightSection() {

  eventsContainer.innerHTML =  eventsModule.render();
  eventsModule.addEventListeners();

}

function generateSquares(){

  var birthday = dataService.getBirthday();

  var squares = dataHelper.generateSquaresFromDate(birthday)
  squares = dataHelper.deleteSquaresBeforeBirthday(squares, birthday)
  squares = dataHelper.markLivedSquares(squares)
  
  dataService.setSquares(squares);

}

function setInterfaceState(){

  var renderType = dataService.getRenderType();
  var filters = dataService.getFilters();

  if (renderType) {

    var toggleYearsButtonDialog = document.querySelector('.toggleYearsButtonDialog')
    var toggleSeasonsButtonDialog = document.querySelector('.toggleSeasonsButtonDialog')
    var toggleMonthsButtonDialog = document.querySelector('.toggleMonthsButtonDialog')
   
    if (renderType == 'years') {
      toggleYearsButtonDialog.classList.add('active');
    }

    if (renderType == 'seasons') {
      toggleSeasonsButtonDialog.classList.add('active');
    }

    if (renderType == 'months') {
      toggleMonthsButtonDialog.classList.add('active');
    }

  }

  if (filters && filters) {

    var eventsFilterInput = document.querySelector('.eventsFilterInput')

    eventsFilterInput.value = filters.eventSearchString

    if (filters.categories) {
      
      renderCategoriesFilterChips()

    }
    
  }

}

function init(){

  var data = localStorage.getItem('data');

  document.body.addEventListener('click', function(event) {

    document.querySelectorAll('.square-context-menu').forEach(function(element){ element.remove()});

    document.querySelectorAll('.square').forEach(function(element){ element.classList.remove('highlighted')});
    
  })


  if (data) {
    dataService.setData(JSON.parse(data));
    setInterfaceState()
  }

  if (dataService.getBirthday()) {
    
    appContainer.classList.add('active');

    generateSquares();

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

          generateSquares();

          dataService.setEvents([]);
          dataService.setCategories([]);

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

            generateSquares();

            initContainer.classList.remove('active')
            appContainer.classList.add('active');

            setInterfaceState();


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