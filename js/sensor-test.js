(function() {
	'use strict';
	var MAX_MOISTURE_VALUE = 1300;

	window.addEventListener('load', function() {
		var motion = document.getElementById('notify-motion');
		var water = document.getElementById('notify-water');
		var moisture = document.getElementById('notify-moisture');
		SensorMonitor.setDetectionHandler('motion', function (value) {
			if (value) {
				motion.style.visibility = 'visible';
			} else {
				motion.style.visibility = 'hidden';
			}
		});
		SensorMonitor.setDetectionHandler('water', function (value) {
			if (value) {
				water.style.visibility = 'visible';
			} else {
				water.style.visibility = 'hidden';
			}
		});

  	window.addEventListener('keydown', function(evt) {
  		switch (evt.keyCode) {
			  case KeyEvent.DOM_VK_BLUE:
				case KeyEvent.DOM_VK_B:
		  		MoistureView.open();
					break;
				case KeyEvent.DOM_VK_R:
		  		MoistureView.close();
					break;
  		}
  	});
		
		SensorMonitor.init();
  	MoistureView.init('moisture-view', 'tv-view', getMoisturePercentage);

		setInterval(function () {
			moisture.textContent = (Math.floor(getMoisturePercentage() * 100) / 100);
		}, 1000);

		function getMoisturePercentage() {
			var value = SensorMonitor.getValue('moisture');	
			if (value === -1) {
				return 0;
			}
			if (value > MAX_MOISTURE_VALUE) {
				MAX_MOISTURE_VALUE = value;
			}
			return value * (100 / MAX_MOISTURE_VALUE);
		}
	});

})();