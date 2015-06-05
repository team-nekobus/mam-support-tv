(function () {
	'use strict';

	const DIGITAL_MOTION = 0;  // DO1
	const DIGITAL_WATER  = 1;  // DO2
	const ANALOG_MOISTURE = 0; // AO1

	var motionDetectionHandler = function _defaultMotionHandler() {};
	var waterDetectionHandler = function _defaultWaterHandler() {};

	var motionValue = 0;
	var waterValue  = 0;
	var moistureValue = -1;

	function ondata(line) {
    var data = TweLiteSerial.parseLine(line);
    var digitalOut = data.digital;
    var analogOut = data.analog;

    console.log('Digital: ' + digitalOut);
    console.log('Analog: ' + analogOut);
    if (motionValue != digitalOut[DIGITAL_MOTION]) {
    	motionValue = digitalOut[DIGITAL_MOTION];
    	motionDetectionHandler(motionValue);
    }
    if (waterValue != digitalOut[DIGITAL_WATER]) {
    	waterValue = digitalOut[DIGITAL_WATER];
    	waterDetectionHandler(waterValue);
    }
    moistureValue = analogOut[ANALOG_MOISTURE];
	}

	var SensorMonitor = {};

	SensorMonitor.init = function () {
		SocketSerial.setDataHandler(ondata);
		SocketSerial.open();
	}

	SensorMonitor.setDetectionHandler = function (type, handler) {
		switch (type) {
			case 'motion':
				motionDetectionHandler = handler;
				break;
			case 'water':
				waterDetectionHandler = handler;
				break;
		}
	}

	SensorMonitor.getValue = function (type) {
		var value = -1;
		switch (type) {
			case 'motion':
				value = motionValue;
				break;
			case 'water':
				value = waterValue;
				break;
			case 'moisture':
				value = moistureValue;
				break;
		}
		return value;
	}

	window.SensorMonitor = SensorMonitor;
})()
