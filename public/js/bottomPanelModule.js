function BottomPanelModule(dataService) {

	function addEventListeners(){

		
		var openBalanceDialogBtn = document.querySelector('.openBalanceDialogBtn')

		openBalanceDialogBtn.addEventListener('click', function(event){


			renderBalanceDialog()


		})
	  
		
	}

	function getNumberOfWeek() {
	    return Math.ceil(new Date().getDate() / 7)
	}


	function renderBalancesBodyDialog(){

		var result = '';


		var balances = dataService.getBalances();

		console.log("get balances", balances)

		balances.forEach(function(item){

			var itemHtml = '<div class="dialog-balance-item" data-id="'+item.id+'">'

			date = new Date(item.date).toISOString().split('T')[0];

			itemHtml = itemHtml + '<input type="date" class="dialog-balance-item-date" placeholder="Date" value="'+ date +'">'

			itemHtml = itemHtml + '<input type="number" class="dialog-balance-item-amount" placeholder="Amount" value="'+ item.amount+'">'
			itemHtml = itemHtml + '<input type="number" class="dialog-balance-item-usd-fx-rate" placeholder="USD FX Rate" value="'+item.usd_fx_rate+'">'
			itemHtml = itemHtml + '<input type="number" class="dialog-balance-item-eur-fx-rate" placeholder="EUR FX Rate" value="'+item.eur_fx_rate+'">'
			

			itemHtml = itemHtml + '<span class="dialog-balance-item-remove dialogBalanceItemRemove">x</span>'

			itemHtml = itemHtml + '</div>'


			result = result + itemHtml ;

		})




		return result

	}

	function renderBalanceDialog(){

		var result = '';

		result = '<div class="balances-dialog-container dialog active balancesDialogContainer">' +

	        '<div class="balances-container-content">' +

	            '<button class="balance-close-button-dialog balanceCloseButtonDialog">x</button>' +

	            '<h4 class="balance-header">Список Балансов</h4>' +

	            '<div class="balance-container-body balanceContainerBody">' +

	            renderBalancesBodyDialog() + 
	                
	            '</div>' +

	            '<div class="balance-container-footer">' +

	                '<button class="simple-button close-balance-button closebalanceButton">Закрыть</button>' +

	                '<button class="simple-button add-balance-button addbalanceButton">Добавить баланс</button>' +

	                '<button class="simple-button save-balance-button savebalanceButton">Сохранить</button>' +
	                
	            '</div>' +
	            
	        '</div>' +
	        
	    '</div>'


		var parent = document.querySelector('.main-container')

		$(parent).append(result)

		var balanceCloseButtonDialog = document.querySelector('.balanceCloseButtonDialog')
		var closebalanceButton = document.querySelector('.closebalanceButton')
		var addbalanceButton = document.querySelector('.addbalanceButton')
		var savebalanceButton = document.querySelector('.savebalanceButton')

		balanceCloseButtonDialog.addEventListener('click', function(event){

			$('.balancesDialogContainer').remove();

		})

		closebalanceButton.addEventListener('click', function(event){

			$('.balancesDialogContainer').remove();

		})

		addbalanceButton.addEventListener('click', function(event){


			var balances = dataService.getBalances();

			var newBalance = {
				id: toMD5(balances.length + 1 + '_' + new Date().getTime()),
				date: new Date(),
				amount: 0,
				usd_fx_rate: 0,
				eur_fx_rate: 0
			}

			balances.push(newBalance)

			dataService.setBalances(balances)

			$('.balancesDialogContainer').remove();

			renderBalanceDialog();

		})

		savebalanceButton.addEventListener('click', function(event){

			var balancesItems = document.querySelectorAll('.dialog-balance-item')

			var balances = []

			balancesItems.forEach(function(item){

				balances.push({
					id: item.dataset.id,
					amount: parseInt(item.querySelector('.dialog-balance-item-amount').value),
					usd_fx_rate: parseInt(item.querySelector('.dialog-balance-item-usd-fx-rate').value),
					eur_fx_rate: parseInt(item.querySelector('.dialog-balance-item-eur-fx-rate').value),
					date: item.querySelector('.dialog-balance-item-date').value
				})

			})

			console.log("Save balances", balances)

			dataService.setBalances(balances)


			$('.balancesDialogContainer').remove();

		})


		var btns = document.querySelectorAll('.dialogBalanceItemRemove')
		

		btns.forEach(function(button){

			button.addEventListener('click', function(event){


				$(event.target.parentElement).remove();

			})

		})

	}

	function getCurrentBalance(){

		var result = null;

		var balances = dataService.getBalances()

		if (balances.length) {
			result = balances[balances.length - 1]
		}

		return result;

	}

	function renderMoneyBalanceBlock(){

		var result = '<div class="bottom-panel-money-balance-block">';

		var balance = getCurrentBalance();

		var amount = 0

		if (balance) {
			amount = balance.amount
		}

		var symbol = '₽'

		


		result = result + '<i class="fas fa-coins openBalanceDialogBtn"  aria-hidden="true"></i> ' + numberWithSpaces(amount) + ' ' + symbol

		result = result + '</div>'

		return result

	}

	function getDayOfYear(date){
		return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
	}

	function renderDateBlock(){

		var dateBlock = '<div class="bottom-panel-date-block">'

		var dayOfYear = getDayOfYear(new Date())

		var one_percent = 365 / 100

		var percent = Math.floor(dayOfYear / one_percent)

		dateBlock = dateBlock + 'Год: ' + new Date().getFullYear() + ', '
		dateBlock = dateBlock + 'Месяц: ' + (new Date().getMonth() + 1) + ', '
		dateBlock = dateBlock + 'Неделя: ' + getNumberOfWeek() + ', ' 
		dateBlock = dateBlock + 'День: ' + new Date().getDate() + '. '
		dateBlock = dateBlock +   percent + '%'

		dateBlock = dateBlock + '</div>'

		return dateBlock;

	}

	function render(){

		var result = '';

		var dateBlock = renderDateBlock();
		var moneyBalanceBlock = renderMoneyBalanceBlock();

		result = result + moneyBalanceBlock;
		result = result + dateBlock;


		return result;

	}

	return {
		render: render,
		addEventListeners: addEventListeners
	}

}