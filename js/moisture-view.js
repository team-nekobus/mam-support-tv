window.addEventListener('load', function() {
  'use strict';
  const MOISTURE_INTERVAL = 1000;

	function show(elm) {
		elm.style.display = 'block';
	}

	function hide(elm) {
		elm.style.display = 'none';
	}

	function initGauge(canvas) {
	  // http://bernii.github.io/gauge.js/
	  canvas.width  = 900;
	  canvas.height = 450;
	  var opts = {
	    lines: 12, // The number of lines to draw
	    angle: 0.15, // The length of each line
	    lineWidth: 0.44, // The line thickness
	    pointer: {
	      length: 0.9, // The radius of the inner circle
	      strokeWidth: 0.035, // The rotation offset
	      color: '#000000' // Fill color
	    },
	    limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
	    colorStart: '#33ccff',   // Colors
	    colorStop: '#66ffff',    // just experiment with them
	    strokeColor: '#f8f8f8',   // to see which ones work best for you
	    generateGradient: true
	  };
	  var gauge = new Gauge(canvas).setOptions(opts); // create sexy gauge!

	  return gauge;
	}

	function getMoisturePercentage() {
		if (value === -1) {
			return 0;
		}
		if (value > MAX_MOISTURE_VALUE) {
			MAX_MOISTURE_VALUE = value;
		}
		return value * (100 / MAX_MOISTURE_VALUE);
	}

	var MoistureView = {
		init: function (targetView, hideView, getMoistureValue) {
			this.gaugeViewElement = document.getElementById(targetView);
			this.hideViewElement = document.getElementById(hideView);
			this.opened = false;
			this.getMoistureValue = getMoistureValue;
			this.gauge = initGauge(this.gaugeViewElement.querySelector('canvas'));
		  this.gauge.maxValue = 100; // set max gauge value
	  	this.gauge.animationSpeed = 32; // set animation speed (32 is default value)
	  	this.intervalID = null;
		},
		open: function () {
			console.log("opening moisture view");
			hide(this.hideViewElement);
			show(this.gaugeViewElement);
			this.opened = true;
			var self = this;
			this.intervalID = setInterval(function() {
				var value = Math.floor(self.getMoistureValue());
				console.log('Moisture: ' + value);
				self.gauge.set(value);
			}, MOISTURE_INTERVAL);
		},
		close: function () {
			show(this.hideViewElement);
			hide(this.gaugeViewElement);
			this.opened = false;
		},
		isOpened: function() {
			return this.opened;
		}
	};	
	window.MoistureView = MoistureView;
});
