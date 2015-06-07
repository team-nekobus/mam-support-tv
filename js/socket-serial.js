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

  	open: function(server) {
      var addr = ADDRESS;
      var port = PORT;
      if (server) {
        var colonIndex = server.indexOf(':');
        if (colonIndex < 0) {
          addr = server;
        } else {
          addr = server.slice(0, colonIndex);
          port = server.slice(colonIndex+1);
        }
      }
      var socket = navigator.mozTCPSocket.open(addr, port);
      this._server = addr + ':' + port;
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
        console.error('Error:', evt.data.name, evt.data.message, 'server=' + self._server);
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
    },
    close: function() {
      if (this._socket) {
        this._socket.close();
      }
      this._socket = undefined;
      this._buffer = '';
    }
  };

  window.SocketSerial = SocketSerial;

})();
