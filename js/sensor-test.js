(function() {
	'use strict';

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
		setInterval(function () {
			var value = SensorMonitor.getValue('moisture');	
			if (value === -1) {
				moisture.textContent = '???';
			} else {
				moisture.textContent = value;
			}
		});
		SensorMonitor.init();
	});

})();