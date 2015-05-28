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
			this.iframe.focus();
			this.opened = true;
		},
		close: function () {
			show(this.hideViewElement);
			hide(this.camViewElement);
			var iframe = this.camViewElement.querySelector('iframe');
			this.iframe.src = '';
			//this.hideViewElement.focus();
			window.focus();
			//document.body.focus();
			this.opened = false;
		},
		isOpened: function() {
			return this.opened;
		}
	}
	window.WebCamView = WebCamView;
});
