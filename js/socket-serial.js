(function () {
  'use strict';
  const ADDRESS = '127.0.0.1';
  const PORT = 9943;
  var gSerialConfig = {
    devicename: 'ttyUSB0',
    bitrate: 9600
  };

  var SocketSerial = {
    _socket: undefined,
    _buffer: '',
    _onopen: function () {},
    _ondata: function () {},
    _onerror: function () {},

  	open: function() {
      var socket = navigator.mozTCPSocket.open(ADDRESS, PORT);
      this._socket = socket;
      var self = this;
      socket.onopen = function () {
        console.log('Opened');
        if (!window.navigator.tv) {
          socket.send(JSON.stringify(gSerialConfig));
        }
        self._onopen();
      }
      socket.ondata = function (evt) {
        if (typeof evt.data === 'string') {
          var data = evt.data;
          // console.log(data);
          if (data[data.length-1] === '\n') {
            var line = self._buffer + data.slice(0, data.length-1);
            self._buffer = '';
            console.log('line ' + line);
            if (line[0] === ':') {
              self._ondata(line);
            }
          } else {
            self._buffer += data;
          }
        } else {
          console.error('Received a Uint8Array');
        }
      }
      socket.onerror = function (evt) {
        console.error('Error:' + evt.type);
        self._onerror(evt);
      }
    },
    send: function(data) {
      this._socket.send(data);
    },
    setOpenHandler: function(onopen) {
      this._onopen = onopen;
    },
    setDataHandler: function(ondata) {
      this._ondata = ondata;
    },
    setErrorHandler: function(onerror) {
      this._onerror = onerror;
    }
  };

  window.SocketSerial = SocketSerial;

})();
