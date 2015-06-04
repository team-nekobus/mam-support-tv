(function () {
  'use strict';
  const ADDRESS = '127.0.0.1';
  const PORT = 9943;
  var gSerialConfig = {
    devicename: 'ttyUSB0',
    bitrate: 9600
  };

  var SocketSerial = {
  	open: function() {
      var socket = navigator.mozTCPSocket.open(ADDRESS, PORT);
      this.socket = socket;
      var self = this;
      socket.onopen = function () {
        console.log('Opened');
        if (!window.navigator.tv) {
          socket.send(JSON.stringify(gSerialConfig));
        }
        if (self.onopen) {
          self.onopen();
        }
      }
      socket.ondata = function (evt) {
        if (typeof evt.data === 'string') {
          var line = evt.data;
          if (line[line.length-1] === '\n') {
            line = line.slice(0, line.length-1);
          }
          console.log(line);
          if (self.ondata) {
            self.ondata(line);
          }
        } else {
          console.error('Received a Uint8Array');
        }
      }
      socket.onerror = function (evt) {
        console.error('Error:' + evt.type);
        if (self.onerror) {
          self.onerror(evt);
        }
      }
    },
    send: function(data) {
      this.socket.send(data);
    },
    setOpenHandler: function(onopen) {
      this.onopen = onopen;
    },
    setDataHandler: function(ondata) {
      this.ondata = ondata;
    },
    setErrorHandler: function(onerror) {
      this.onerror = onerror;
    }
  };

  window.SocketSerial = SocketSerial;

})();
