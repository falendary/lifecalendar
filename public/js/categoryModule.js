function CategoryModule(dataService) {

	function addEventListeners(){

	  $('.categoryColorInput').spectrum({
	     allowEmpty: true
	  });

	  var categories = dataService.getCategories();
	  var deleteButtons = document.querySelectorAll('.categoryDeleteButton');

	  for (var i = 0; i < deleteButtons.length; i = i + 1) {

	  	deleteButtons[i].addEventListener('click', function(event) {

	  		event.preventDefault();

	  		console.log('event', event.target.parentElement)
	  		var categoryId = event.target.parentElement.dataset.id
	  		console.log('categoryId', categoryId);

	  		var category;

	  		categories.forEach(function(categoryItem){

	  			if (categoryItem.id == categoryId) {
	  				category = categoryItem
	  			}

	  		})

	  		category.isDeleted = true;

	  		dataService.setCategory(category.id, category)

	  		console.log(dataService.getCategories())

	  		window.render() // global render method from main.js

	  	})

	  }
		
	}
	
	function render(){

		var result = '';

		var categories = JSON.parse(JSON.stringify(dataService.getCategories()))

		categories.forEach(function(category){

			if (!category.isDeleted) {

				var categoryHTML = '<div class="category-item categoryItem" data-id="' + category.id + '">';

				categoryHTML = categoryHTML + '<div class="category-color-input-holder">'+
					'<label>Цвет</label>' +  
	                '<input type="text" name="categoryColor" class="category-color-input categoryColorInput" value="' + category.color + '">' +
	            '</div>'

				categoryHTML = categoryHTML + '<div class="category-name-input-holder">'+ 
					'<label>Имя</label>' +  
					'<input class="category-name-input categoryNameInput" value="' + category.name + '">' +
				'</div>'

				categoryHTML = categoryHTML + '<button class="simple-button category-delete-button categoryDeleteButton">Удалить</button>'

				categoryHTML = categoryHTML + '</div>';

				result = result + categoryHTML;

			}

		})
	
		return result;

	}

	function renderOptionsForSelect(){

		var result = '';

		var categories = JSON.parse(JSON.stringify(dataService.getCategories()))

		categories.forEach(function(category){

			var optionHTML = '<option value="'+category.id+'">'

			optionHTML = optionHTML + category.name

			optionHTML = optionHTML + '</option>'

			result = result + optionHTML

		})

		return result;

	}

	return {
		render: render,
		renderOptionsForSelect: renderOptionsForSelect,
		addEventListeners: addEventListeners
	}

}