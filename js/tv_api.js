'use strict';

const KEY_SERVER_ADDRESS = '__server_address';
var MAX_MOISTURE_VALUE = 1300;

var gVideo;
var gChBanner;

var gChannelList = [];
var gCurrentSource = null;

var gIsNotificationVisible = false;
var gNotificationTimeout = 7500;
var gNotificationTimer;

window.onload = function() {
  window.addEventListener('keydown', KeyDownFunc);

  gVideo = document.getElementById('tv');
  gChBanner = document.getElementById('channel-banner');

  var server = getServerAddress();
  SensorMonitor.init(server);
  WebCamView.init(server, 'webcam-view', 'tv-view');
  MoistureView.init('moisture-view', 'tv-view', getMoisturePercentage);

  SensorMonitor.setDetectionHandler('motion', function (value) {
    if (value) {
      changeNotificationImage("notification_come.png")
      gIsNotificationVisible = true;
      setNotificationVisible();      
    } else {
    }
  });
  SensorMonitor.setDetectionHandler('water', function (value) {
    if (value) {
      changeNotificationImage("notification_rain.png")
      gIsNotificationVisible = true;
      setNotificationVisible();      
    } else {
    }
  });

  var tv = window.navigator.tv;
  if (!tv) {
    errlog ('failed to get tv. check permission.');
    return;
  }
  tv.getTuners()
    .then(setSource).catch(function () {
      errlog ('setSource() error');
    })
    .then(getChannels).catch(function () {
      errlog ('getChannels() error');
    })
    .then(function (channels) {
      if (channels.length == 0) {
        addBanner('Service Not Found.');
      } else {
        gChannelList = channels;
        var currentChannel = gChannelList[0];
        setChannel(currentChannel);
      }
    });
};

function setSource(tuners) {
  console.log('setCurrentSource');
  if (tuners.length == 0) {
    errlog ('getTuners() fail.');
    return;
  }
  return tuners[0].setCurrentSource('isdb-t').then(function(){
    gVideo.mozSrcObject = tuners[0].stream;
    return tuners[0];
  });
}

function getChannels(tuner) {
  console.log('getCurrentChannels');
  gCurrentSource = tuner.currentSource;
  return gCurrentSource.getChannels().then(function (channels) {
    return filterChannels(channels);
  });
}

function filterChannels(channels) {
  var filteredChannels = [];
  function sameChannel(e) {
    var ch = this;
    return (e.transportStreamId == ch.transportStreamId || e.number == ch.number);
  }
  channels.forEach(function (ch) { 
    if (filteredChannels.some(sameChannel.bind(ch)) === false) {
      filteredChannels.push(ch);
    }
  });
  return filteredChannels;
}

function setChannel(channel) {
  TvTuning(channel);

  return channel.getCurrentProgram()
    .then(function onsuccess(program) {
      createChannelProgramBanner(channel, program);
    })
    .catch(function onerror(error) {
      errlog ('getCurrentProgram() error');
    });
}

function KeyDownFunc(event) { 
  var key = event.keyCode;
  console.log('KeyDownFunc ' + key);

  if (WebCamView.isOpened()) {
    WebCamView.postKeyEvent(event);
    switch (key) {
      case KeyEvent.DOM_VK_RED:
      case KeyEvent.DOM_VK_R: // for debugging in simulator
        WebCamView.close();
        break;
    }
    event.preventDefault();
    return;
  }

  var gChannelList_index = -1;
 
  switch(key) {
  case KeyEvent.DOM_VK_1:
    gChannelList_index = 0;
    break;
  case KeyEvent.DOM_VK_2:
    gChannelList_index = 1;
    break;
  case KeyEvent.DOM_VK_3:
    gChannelList_index = 2;
    break;
  case KeyEvent.DOM_VK_4:
    gChannelList_index = 3;
    break;
  case KeyEvent.DOM_VK_5:
    gChannelList_index = 4;
    break;
  case KeyEvent.DOM_VK_6:
    gChannelList_index = 5;
    break;
  case KeyEvent.DOM_VK_7:
    gChannelList_index = 6;
    break;
  case KeyEvent.DOM_VK_8:
    gChannelList_index = 7;
    break;
  case KeyEvent.DOM_VK_9:
    gChannelList_index = 8;
    break;
  case KeyEvent.DOM_VK_10:
    gChannelList_index = 9;
    break;
  case KeyEvent.DOM_VK_11:
    gChannelList_index = 10;
    break;
  case KeyEvent.DOM_VK_12:
    gChannelList_index = 11;
    break;
  case KeyEvent.DOM_VK_BLUE:
  case KeyEvent.DOM_VK_B: // for debugging in simulator
    if (!MoistureView.isOpened()) {
      MoistureView.open();
    }
    break;
  case KeyEvent.DOM_VK_RED:
  case KeyEvent.DOM_VK_R: // for debugging in simulator
    if (WebCamView.isOpened()) {
      WebCamView.close();
    }
    if (MoistureView.isOpened()) {
      MoistureView.close();
    }
    if (gIsNotificationVisible) {
      gIsNotificationVisible = false;
      setNotificationVisible();      
    }
    break;
  case KeyEvent.DOM_VK_GREEN:
  case KeyEvent.DOM_VK_G: // for debugging in simulator
    if (!WebCamView.isOpened()) {
      WebCamView.open();
    }
    break;
  case KeyEvent.DOM_VK_YELLOW:
  case KeyEvent.DOM_VK_Y: { // for debugging in simulator
    var server = requestServerAddress();
    if (!server) {
      break;
    }
    console.log('New IP address: ' + server);
    SensorMonitor.finish();
    SensorMonitor.init(server);
    WebCamView.init(server, 'webcam-view', 'tv-view');
    break;
  }
  case KeyEvent.DOM_VK_LEFT:
    break;
  case KeyEvent.DOM_VK_RIGHT:
    break;
  case KeyEvent.DOM_VK_UP:
    break;
  case KeyEvent.DOM_VK_DOWN:
    break;
  default:
   errlog('no key action');
   break;
  }
  if (gChannelList_index < 0 || gChannelList.length <= gChannelList_index) {
    return;
  }
  var currentChannel = gChannelList[gChannelList_index];

  TvTuning(currentChannel);
  //resetBanner ();    
  setChannel(currentChannel);
}

function setNotificationVisible() {
  var notificationDiv = document.getElementById('notification');
  clearInterval(gNotificationTimer);
  if (gIsNotificationVisible) {
    notificationDiv.style.visibility = 'visible';
    gNotificationTimer = setTimeout(function(){
      gIsNotificationVisible = false;
      setNotificationVisible();
    }, gNotificationTimeout);
  } else {
    notificationDiv.style.visibility = 'hidden';
  }
}

function changeNotificationImage(imageName) {
  var notificationDiv = document.getElementById('notification');
  notificationDiv.style.backgroundImage = "url(/image/" + imageName + ")";  
}

function changeNotificationText(text) {
  var notificationDiv = document.getElementById('notification');
  notificationDiv.textContent = text;  
}

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

function getServerAddress(msg) {
  var address = window.localStorage.getItem(KEY_SERVER_ADDRESS);
  if (address) {
    return address;
  }
  return requestServerAddress();
}

function requestServerAddress(msg) {
  var addr = prompt(msg || 'Input server IP address');
  if (addr.length === 0) {
    return null;
  }
  function isValidIP(addr) {
    if (!addr || addr.length < '1.1.1.1'.length) {
      return false;
    }
    var splitted = addr.split('.');
    if (splitted.length != 4) {
      return false;
    }
    var invalid = splitted.some(function (unit) {
      var num = parseInt(unit);
      return  (num.toString() != unit || num < 0 || num > 255);
    });
    return !invalid;
  }
  if (!isValidIP(addr)) {
    return requestServerAddress('Input valid IPv4 address!');
  }
  window.localStorage.setItem(KEY_SERVER_ADDRESS, addr);
  return addr;
}

