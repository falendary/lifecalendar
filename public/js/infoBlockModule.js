function InfoBlockModule(dataService) {

	function addEventListeners(){

		var infoblockShowButton = document.querySelector('.infoblockShowButton');
		var infoblockHideButton = document.querySelector('.infoblockHideButton');

		var infoBlockShort = document.querySelector('.infoBlockShort');
		var infoBlockFull = document.querySelector('.infoBlockFull');

		var infoblockHeaderTotal = document.querySelector('.infoblockHeaderTotal');
		var infoblockHeaderLeft = document.querySelector('.infoblockHeaderLeft');

		infoblockShowButton.addEventListener('click', function(){

			infoBlockShort.classList.remove('active');
			infoBlockFull.classList.add('active');

		})

		infoblockHideButton.addEventListener('click', function(){


			infoBlockFull.classList.remove('active');
			infoBlockShort.classList.add('active');

		})

		infoblockHeaderTotal.addEventListener('click', function(){

			infoblockHeaderTotal.classList.remove('active');
			infoblockHeaderLeft.classList.add('active');

		})

		infoblockHeaderLeft.addEventListener('click', function(){

			infoblockHeaderLeft.classList.remove('active');
			infoblockHeaderTotal.classList.add('active');

		})
	  
		
	}

	function render(){

		var result = '';

		var yearsToLive = 64;
		var extraDays = 64 / 4; // leap year

		var daysToLive = yearsToLive * 365 + extraDays

		var birthday = dataService.getBirthday();
		console.log('birthday',birthday);

		var diffInMs   = new Date() - new Date(birthday)	
		var daysLived = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
		var daysLivedSlept = Math.floor(daysLived / 3)
		var daysFutureSleep = Math.floor(daysToLive / 3) - daysLivedSlept

		console.log('daysToLive', daysToLive);
		console.log('daysLived', daysLived);


		var daysLivedPercent = Math.floor(daysLived / (daysToLive / 100))
		var daysLivedSleptPercent = Math.floor(daysLivedSlept / (daysToLive / 100))
		var daysFutureSleepPercent = Math.floor(daysFutureSleep / (daysToLive / 100))

		var daysLeftPercent = 100 - daysLivedPercent
		var daysLeft = daysToLive - daysLived;

		var progressBarHtml = '<div class="infloblock-progress-container">' + 
							'<div class="infloblock-progress" title="Всего дней: '+ numberWithSpaces(daysToLive) +'"> '+
								'<div class="infloblock-progress-lived-percent" style="width: '+daysLivedPercent+'%" title="Прожито дней: ' + numberWithSpaces(daysLived)+ ' ('+daysLivedPercent+'%)"></div>' +
								'<div class="infloblock-progress-lived-slept-percent" style="width: '+daysLivedSleptPercent+'%" title="Дней ушло на сон: ' + numberWithSpaces(daysLivedSlept) + ' ('+daysLivedSleptPercent+'%)"></div>' + 
								'<div class="infloblock-progress-future-live-percent" style="width: '+daysLeftPercent+'%" title="Осталось дней: ' + numberWithSpaces(daysLeft) + ' ('+daysLeftPercent+'%)"></div>' +
								'<div class="infloblock-progress-future-sleep-percent" style="width: '+daysFutureSleepPercent+'%" title="Дней уйдет на сон: ' + numberWithSpaces(daysFutureSleep)+ ' ('+daysFutureSleepPercent+'%)"></div>';
							
		for (var x = 0; x < yearsToLive; x = x + 5) {

			var xPercent = Math.floor(x / (yearsToLive / 100))

			var res = x;

			if (x < 10) {
				res = '&nbsp;' + x 
			} 
			
			progressBarHtml = progressBarHtml + '<div class="infloblock-progress-age-pillar" style="left: '+xPercent+'%"  title="'+ x + ' лет">'+res+'</div>'

		}

		progressBarHtml = progressBarHtml + '<div class="infloblock-progress-age-pillar" style="left: 100%"  title="'+ yearsToLive + ' лет">'+yearsToLive+'</div>'

		progressBarHtml = progressBarHtml + '</div>' + 
						'</div>';


		result = result + 
					'<div class="infloblock-short active infoBlockShort">' +
						'<div>' +
							'<h3 class="infoblock-header-total infoblockHeaderTotal active" style="margin: 4px 0; padding-left: 16px" title="Всего дней: '+ numberWithSpaces(daysToLive) +'">О Жизни в днях</h3>' +
							'<h3 class="infoblock-header-left infoblockHeaderLeft" style="margin: 4px 0; padding-left: 16px" title="Оставшиеся дни минус дни которые уйдут на сон">Активных дней осталось: '+ (numberWithSpaces(daysLeft - daysFutureSleep))+'</h3>' +
						'</div>'+

						progressBarHtml + 

                    	'<button class="infoblock-show-button infoblockShowButton">Показать</button>'+
                    '</div>'

        result = result + 
        			'<div class="infloblock-full infoBlockFull">' +
                    
                    '<h3 style="margin: 4px 0; padding-left: 16px">О Жизни в днях</h3>' +

                    progressBarHtml +

                    '<hr>' +

                    '<div class="infoblock-days-total">' +
                        '<div>Дней в жизни: 23 360</div>' +
                        '<div>Дней на сон: 7 786</div>' +
                        '<div>Дней активности: 15 574</div>' +
                    '</div>' +

                    '<hr>' +

                    '<div class="infoblock-days-lived">' +
                        '<div>Дней прожито: 8 760</div>' +
                        '<div>Дней на сон: 2 920</div>' +
                        '<div>Дней активности: 5 840</div>' +
                    '</div>' +

                    '<hr>' +

                     '<div class="infoblock-days-to-live">' +
                        '<div>Дней осталось: 14 600</div>' +
                        '<div>Дней на сон: 4 866</div>' +
                        '<div>Дней активности: 9 734</div>' +
                    '</div>' +

                    '<hr>' +

                    '<div class="infoblock-other">' +
                        '<div title="500 000 * 1,5 / 24">Дней на все фильмы: 31 250 - 2 жизни</div>' +
                        '<div titlee="130 000 000 * 5 / 24">Дней на все книги: 27 083 333 - 1 739 жизней</div>' +
                        '<div title="11 000 * 20 * 0,5 / 24">Дней на все аниме: 4 583 - 1/3 жизни</div>' +
                        '<div title="97 000 000 * 0,05 / 24">Дней на всю музыку: 202 083 - 12 жизней</div>' +
                        '<div title="1 200 000 * 20 / 24">Дней на все видеоигры: 1 000 000 - 64 жизни</div>' +
                        
                    '</div>' +

                    '<button class="infoblock-hide-button infoblockHideButton">Скрыть</button>' +

                '</div>'

		

		result = result + '</div>'


		return result;

	}

	return {
		render: render,
		addEventListeners: addEventListeners
	}

}