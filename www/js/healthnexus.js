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
    baseUrl: 'http://imba.tv/healthnexus/api/',
	output: '#app_content',
	messages: '#app_messages',
	templates: '#loose-templates',
    questions: null,
    initialize: function() {
		alert('test');
		api.getQuestions();
    },
    authUser: function(user,pass) {
		
    },
	handleTemplate: function(type, data) {
		
	},
	getQuestions: function() {
        var url = api.baseUrl + 'hn_question/get';
        $.ajax(url, 
			{
				type: 'GET',
				dataType: 'jsonp',
				jsonpCallback: 'jsonCallback',
				contentType: "application/json",
				success: function(data) {
					console.log(data);
					var questions = data.questions;
					alert(data.status);
					api.handleTemplate('questions', questions);
				},
				error: function(e) {
				   console.log(e.message);
				}
			}
		);
	}
};

$(document).ready(function() {

});

document.addEventListener('touchmove', function() {
    global.moved = true;
},false);
