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