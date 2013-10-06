var api = {
    baseUrl: 'http://nda.campviews.com/api/',
    campers: null,
    cabins: null,
    initialize: function() {
        /*if(global.store.user) {
            global.user = global.store.user;*/
            appviews.showView('dashboard');
        /*}
        else{
            appviews.showView('login');
        }*/
        api.getCabins();
        api.getCampers();
    },
    authUser: function(user,pass) {
        //add login functions here
        appviews.showView('dashboard');
    },
    getCabins: function() {
        var url = api.baseUrl + 'cv_camp/get_cabins';
        $.get(url, { id : global.campid }, function(data){
            api.cabins = data.cabins;
            var len = api.cabins.length;
            var list = $('.cabin-filter ul');
            list.html('<li class="cf active">All</li>');
            for(var i=0;i<len;i++) {
                var cabin = api.cabins[i];
                list.append('<li class="cf" data-cabin-id="'+cabin.id+'">'+cabin.name+'</li>');
            }
        });
    },
    getCampers: function(){
        var url = api.baseUrl + 'cv_camp/get_campers';
        $.get(url, { id : global.campid }, function(data){
            api.campers = data.campers;
            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 2500);
        });

    },
    getCheckinForms: function() {
      global.forms.checkin = [];
      var url = api.baseUrl + 'cv_camp/get_form/';
      $.get(url, { camp_id : global.campid, type : 'checkin' }, function(data) {
        var len = data.forms.length;
        if(len == 1){
            global.forms.checkin.push(data.forms[0].id);
            var output = api.loadFormFields(data.forms[0].id, data.forms[0].fields,'checkin');
            $('#checkinform-area').html(output);
        }
        else {
          var output = '';
          var outputbtns = '<div id="formbtns"><ul>';
          var outputforms = '<div id="forms">';
          for(var i=0;i<len;i++){
            global.forms.checkin.push(data.forms[i].id);
            outputbtns += '<li><button id="form-btn-'+data.forms[i].id+'" data-rel="form-'+data.forms[i].id+'" data-id="'+data.forms[i].id+'" data-type="checkin" disabled="disabled">'+data.forms[i].name+'</button></li>';
            outputforms += api.loadFormFields(data.forms[i].id,data.forms[i].fields,'checkin');
          }
          outputbtns += '</ul></div>';
          outputforms += '</div>';
          output += outputbtns + outputforms;
          $('#checkinform-area').html(output);
        }
        setScroll('checkinforms');
        apphelpers.formSubmit();
        apphelpers.formButtons();
      });
    },
    getLogSheetForm: function() {
        global.forms.logs = [];
        var url = api.baseUrl + 'cv_camp/get_form/';
        $.get(url, { camp_id : global.campid, type : 'log' }, function(data) {
            global.forms.logs.push(data.forms[0].id);
            var output = api.loadFormFields(data.forms[0].id, data.forms[0].fields,'log');
            $('#logform-area').html(output);
            setScroll('logforms');
            apphelpers.formSubmit();
			var d = new Date(), sec = d.getSeconds().toString(), min = d.getMinutes().toString(), hour = d.getHours().toString(), day = d.getDate().toString(), month = d.getMonth()+1, year = d.getFullYear().toString();
			if(sec.length < 2) sec = '0' + sec;
			if(min.length < 2) min = '0' + min;
			if(hour.length < 2) hour = '0' + hour;
			if(day.length < 2) day = '0' + day;
			if(month.toString().length < 2) month = '0' + month;
			var dateOutput = year +'-'+ month +'-'+ day +' '+ hour +':'+ min +':'+ sec;
			$('#field_396').val(dateOutput);
        });
    },
    loadFormFields: function(id,fields,type) {
      var output = '<form name="form-'+id+'" class="form" id="form-'+id+'">';
        var len = fields.length;
      for(var j=0;j<len;j++){
        output += formBuilder.makeField(fields[j]);
      }
      output += '</form><div class="form_buttons" id="form-buttons-'+id+'"><button id="form-submit-'+id+'" class="form-submit" data-rel="form-'+id+'" data-id="'+id+'" data-type="'+type+'" disabled="disabled">Save Form</button><button id="form-back-'+id+'" class="form-back" data-rel="form-'+id+'" data-id="'+id+'" data-type="'+type+'" disabled="disabled">Back</button></div>';
      return output;
    },
    saveForm: function(id,data,type) {
      var url = api.baseUrl + 'cv_form/save/';
      var apidata = { camp_id : global.campid, camper_id : global.camperid, form_id : id, form_type : type, form_values : JSON.stringify(data) };
      $.post(url, apidata, function(res) {
        global.camperid = null;
      });
    },
    getFormData: function() {
      var formids = global.forms[global.active];
      var url = api.baseUrl + 'cv_form/get_values/';
      var apidata = { camp_id : global.campid, camper_id : global.camperid, form_id : formids };
      $.get(url, apidata, function(res) {
        if(global.active == 'checkin'){
          $('#camper-checkin-data').html('');
          var forms = res.forms;
          var len = forms.length;
            for(var i=0;i<len;i++) {
                $('#camper-checkin-data').append('<div class="log-entry">');
                $('#camper-checkin-data').append('<h2>'+res.forms[i].form+'</h2>');
              var fields = res.forms[i].fields;
              var len = fields.length;
              for(var j=0;j<len;j++) {
                $('#camper-checkin-data').append('<div>'+fields[j].label+': '+fields[j].user_value+'</div>');
              }
                $('#camper-checkin-data').append('</div><br /><br />');
            }
          setScroll('camperCheckinDataScroller');
        }
        else{
          $('#camper-logs-data').html('');
          var forms = res.forms;
          var len = forms.length;
          for(var i=0;i<len;i++) {
            $('#camper-logs-data').append('<div class="log-entry">');
            var fields = forms[i].fields;
            var flen = fields.length;
            for(var j=0;j<flen;j++) {
              $('#camper-logs-data').append('<div>'+fields[j].label+': '+fields[j].user_value+'</div>');
            }
            $('#camper-logs-data').append('</div><br /><br />');
          }
          setScroll('camperLogsDataScroller');
        }
      });
    }
};