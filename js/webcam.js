window.addEventListener('load', function() {
  'use strict';
	const PORT = '3088';

	function show(elm) {
		elm.style.display = 'block';
	}

	function hide(elm) {
		elm.style.display = 'none';
	}

	var WebCamView = {
		init: function (server, targetView, hideView) {
			this.server = server;
			this.camViewElement = document.getElementById(targetView);
			this.hideViewElement = document.getElementById(hideView);
			this.opened = false;
			this.iframe = this.camViewElement.querySelector('iframe');
		},
		open: function () {
			console.log("opening webcam view");
			hide(this.hideViewElement);
			show(this.camViewElement);
			this.iframe.src = 'http://' + this.server + ':' + PORT;
			this.opened = true;
		},
		close: function () {
			show(this.hideViewElement);
			hide(this.camViewElement);
			var iframe = this.camViewElement.querySelector('iframe');
			this.iframe.src = '';
			this.opened = false;
		},
		isOpened: function() {
			return this.opened;
		},
		postMessage: function(message) {
			if (this.isOpened()) {
				this.iframe.contentWindow.postMessage(message, '*');
			}
		},
		postKeyEvent: function(evt) {
			const COPY_KEYS = [ 'keyCode' ];
			var message = {};
			COPY_KEYS.forEach(function(key) {
				message[key] = evt[key];
			});
			this.postMessage(message);
		}
	}
	window.WebCamView = WebCamView;
});
