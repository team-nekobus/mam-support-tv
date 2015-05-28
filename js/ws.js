(function() {
	var WS = {
		start: function(server) {
			var socket = new WebSocket('ws://' + server + ':9090');
	    socket.onopen = (event) => {
	      console.log("Socket is opened");
	      this._socket = socket;
	    };
	    socket.onclose = (event) => {
	      console.log("Socket is closed");
	      this._socket = null;
	    };
	    socket.error = (event) =>{
	      console.log(event.data);
	    };
	    socket.onmessage = (event) => {
	      if (this.onMessage) {
					var data = event.data;
					console.log(data);
					//data = data.substr(1, data.length - 2);
					//console.log(data);
	      	this.onMessage(JSON.parse(JSON.parse(data)));
	      }
	    };
	    // this.sendMessage = () => {
	    //   var msg = createMessage(this.pad);
	    //   this.socket.send(msg.buffer);
	    // };
		}	
	}
	window.WS = WS;
})();