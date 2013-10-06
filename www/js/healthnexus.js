var global = {
    user: null,
    active: null,
    campid: 20,
    camperid: null,
    connectionStatus: null,
    camps: [],
    campers: [],
    db: null,
    store: null,
    moved: false,
    scrollers: {},
    forms: {
      checkin: [],
      logs: []
    }
};

var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', app.deviceready, false);
    },
    deviceready: function() {
        document.addEventListener('online',app.online, false);
        document.addEventListener('offline',app.offline, false);
        document.addEventListener('pause',app.pause, false);
        document.addEventListener('resume',app.resume, false);
        app.adjustView();
        api.initialize();
		alert("ready");
    },
    online: function() {
        global.connectionStatus = true;
        app.updateConnectionDisplay(global.connectionStatus);
    },
    offline: function() {
        global.connectionStatus = false;
        app.updateConnectionDisplay(global.connectionStatus);
    },
    pause: function() {

    },
    resume: function() {

    },
    updateConnectionDisplay: function(connected) {
        if(connected) {
            $('#connection-status').text('connected');
        }
        else{
            $('#connection-status').text('not connected');
        }
    },
    adjustView: function() {
        var top = $('#header').height() + 10;
        var bottom = $('#footer').height() + 5;
        var height = $('body').height() - (top + bottom);
        $('#views .view .content').css({ height : height, paddingTop : top, paddingBottom : bottom });
    }
};


var api = {
    baseUrl: 'http://healthnexus.imbalanced.tv/api/',
	output: '#app_content',
	messages: '#app_messages',
	templates: '#loose-templates',
    questions: null,
    initialize: function() {
		console.log('initapi');
		api.getQuestions();
    },
    authUser: function(user,pass) {
		
    },
	handleTemplate: function(type, data) {
		
	},
	getQuestions: function() {
        var url = api.baseUrl + 'hn_question/get';
        $.get(url, function(data){
            var questions = data.questions;
			console.log(data);
			api.handleTemplate('questions', questions);
        });
	}
};

$(document).ready(function() {

  $('#menu-btn').on('touchstart',function(){
    $('#menu').toggleClass('active');
  });
  $('.menu-icon').parent('li').on('click',function() {
      $('.menu-icon').parent('li').removeClass('active');
      $(this).addClass('active');
      $('#menu').toggleClass('active');
      appviews.showView($(this).attr('data-view'));
  });
$('.menu-icon, .dash-icon, .camper-item, .subview-back').noClickDelay();
});

document.addEventListener('touchmove', function() {
    global.moved = true;
},false);
