'use strict';

const SERVER_ADDRESS = '192.168.110.18';
var gVideo;
var gChBanner;

var gChannelList = [];
var gCurrentSource = null;

var gIsNotificationVisible = false;

window.onload = function() {
  window.addEventListener('keydown', KeyDownFunc);
  window.addEventListener('message', onMessage);

  gVideo = document.getElementById('tv');
  gChBanner = document.getElementById('channel-banner');
//var winObj = getFocusedWindow();
//console.log(winObj.getId());

  WebCamView.init(SERVER_ADDRESS, 'webcam-view', 'tv-view');
  // WS.start(SERVER_ADDRESS);
  WS.onMessage = function (data) {
    changeNotificationText(data['message']);
    gIsNotificationVisible = true;
    setNotificationVisible();
    console.dir(data);
  }

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
    break;
  case KeyEvent.DOM_VK_RED:
    break;
  case KeyEvent.DOM_VK_GREEN:
    WebCamView.open();
    break;
  case KeyEvent.DOM_VK_YELLOW:
    gIsNotificationVisible = !gIsNotificationVisible;
    setNotificationVisible();      
    break;
  case KeyEvent.DOM_VK_LEFT:
    //changeNotificationText('左');
    break;
  case KeyEvent.DOM_VK_RIGHT:
    //changeNotificationText('右');
    break;
  case KeyEvent.DOM_VK_UP:
    //gIsNotificationVisible = !gIsNotificationVisible;
    //setNotificationVisible();      
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

function onMessage(event) {
  var command = event.data;
  if (command === 'close') {
    if (WebCamView.isOpened()) {
      WebCamView.close();
      window.focus();
    }
  }
}

function setNotificationVisible(){
  var notificationDiv = document.getElementById('notification');
  if(gIsNotificationVisible){
    notificationDiv.style.visibility = 'visible';
  }else{
    notificationDiv.style.visibility = 'hidden';
  }
}

function changeNotificationText(text){
  var notificationDiv = document.getElementById('notification');
  notificationDiv.textContent = text;  
}
