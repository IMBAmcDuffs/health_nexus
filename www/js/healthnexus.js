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