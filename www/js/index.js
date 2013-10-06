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
        appstore.initialize();
        appdb.initialize();
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

var appdb = {
    initialize: function() {
        global.db = window.openDatabase("ndadb", "1.0", "CampAppData", 5000000);
        global.db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS campers (camper_id,name,dob,sex,school,shirt_size,pic)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS checks (camper_id, station_id, camp_id, label, value, PRIMARY KEY (camper_id, station_id, camp_id, label))');
            tx.executeSql('CREATE TABLE IF NOT EXISTS cmlogs (id unique, camper_id, camp_id, date, tod, glucose, insulin1, insulin2, insulin3, carbs, pumpchange, medications, note, initials)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS camper_data (camper_id, label, value, form_id, form_name)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS api_cache (api,data,multi)');
        },function() { appdb.errorCB('db init errors') }, function() { appdb.successCB('db init complete') });
    },
    successCB: function(msg) {
        console.log(msg);
    },
    errorCB: function(error) {
        console.log(error);
    }
};

var appstore = {
    initialize: function() {
        global.store = window.localStorage;
    },
    set: function(key,value) {
        global.store.setItem(key,value);
    },
    get: function(key) {
        global.store.getItem(key);
    },
    remove: function(key) {
        global.store.removeItem(key);
    },
    clear: function() {
        global.store.clear();
    }
};

var appviews = {
    showView: function(view) {
      $('button').attr('disabled','disabled');
      $('.subview').removeClass('active');
      $('.sidebarpad .subview:first-child').addClass('active');
      $('.view').css({ 'display' : 'none' });
      $('#'+view+'-view').css({ 'display' : 'block' });
      appfilters.viewFilter(view);
    },
    subView: function() {

    }
};

var appfilters = {
    viewFilter: function(view) {
        switch(view) {
            case 'login':
                appfilters.filters.login();
            break;
            case 'dashboard':
                appfilters.filters.dashboard();
                $('#section').html('');
            break;
            case 'checkin':
                $('#section').html(': Checkin');
                appfilters.filters.loadCampers('checkin');
                appfilters.filters.checkin();
                global.active = 'checkin';
            break;
            case 'logs':
                $('#section').html(': Journal');
                appfilters.filters.loadCampers('logs');
                appfilters.filters.logs();
                global.active = 'logs';
            break;
            case 'campers':
              $('#section').html(': Campers');
            break;
            case 'checkout':
              $('#section').html(': Checkout');
            break;
        }
    },
    filters: {
        login: function() {
            $('#login-btn').on('touchend',function() {
                api.authUser($('#username').val(),$('#userpassword').val());
            });
        },
        dashboard: function() {
            $('.dash-icon').on('click',function() {
                appviews.showView($(this).attr('data-view'));
                $('.menu-icon').parent('li').removeClass('active');
                $('#menu-'+$(this).attr('data-menu')).addClass('active');
            });
        },
        checkin: function() {
          api.getCheckinForms();
        },
        logs: function() {
          api.getLogSheetForm();
        },
        loadCampers: function(which) {
            var list = $('.campers-list');
            list.html('');
            var len = api.campers.length;
            for(var i=0;i<len;i++) {
                var camper = api.campers[i];
                list.append('<li class="camper-item" id="camper-'+camper.id+'" data-id="'+camper.id+'"><div class="climage icon-user"></div><div class="clname">'+camper.first_name+' '+camper.last_name+'</div><div class="cldob">DOB: <span>'+camper.dob+'</span></div></li>');
            }
            setScroll('campers'+which);
            apphelpers.clickCamper();
        },
        loadCamper: function() {
          var len = api.campers.length;
          for(var i=0;i<len;i++) {
            var item = api.campers[i];
            if(global.camperid == item.id) {
              $('.cname').html(item.first_name+' '+item.last_name);
              $('.cdob span').html(item.dob);
              $('.cgender span').html(item.gender);
              api.getFormData('logs');
            }
          }
        }
    }
};

var apphelpers = {
    formSubmit: function() {
        var btn = $('.form-submit');
        btn.off();
        btn.on('click', function() {
          $('button').attr('disabled','disabled');
          $('.subview').removeClass('active');
          $('.sidebarpad .subview:first-child').addClass('active');
          var data = $('#'+$(this).attr('data-rel')).serializeObject();
          var id = $(this).attr('data-id');
          var type = $(this).attr('data-type');
          api.saveForm(id,data,type);
          $('#'+$(this).attr('data-rel'))[0].reset();
            setScroll('logforms');
        });
    },
    formBackButton: function() {
        var btns = $('.form_buttons .form-back');
        btns.off();
        btns.on('touchend', function() {
            var form = $(this).attr('data-rel');
            var id = $(this).attr('data-id');
			$('#formbtns').css('display','block');
			
            $('#form-'+id).css('display','none');
            $('#form-buttons-'+id).css('display','none');
        });
    },
    formButtons: function() {
        var btns = $('#formbtns button');
        btns.off();
        btns.on('touchend', function() {
            if(global.moved == false) {
                var form = $(this).attr('data-rel');
                var id = $(this).attr('data-id');
                $('#formbtns').css('display', 'none');
                $('#'+form).css('display','block');
                $('#form-buttons-'+id).css('display','block');
                setScroll('checkinforms');
                apphelpers.formBackButton();
            }
            else {
                global.moved = false;
            }
        });
    },
    clickCamper: function() {
        var btn = $('.camper-item');
        btn.off();
        btn.on('click', function() {
          global.camperid = $(this).attr('data-id');
          appfilters.filters.loadCamper();
          $(this).parents('.sidebarpad').children('.subview').toggleClass('active');
          $('button').removeAttr('disabled');
        });
        apphelpers.camperBack();
    },
    camperBack: function() {
      var btn = $('.subview-back');
      btn.off();
      btn.on('click', function() {
        $('button').attr('disabled','disabled');
        $(this).parents('.sidebarpad').children('.subview').toggleClass('active');
        global.camperid = null;
      });
    }

};

var appcache = {
    get: function(which,keys,from) {
        if(from == 'appstore') {
            return appstore.get(which);
        }
        else{

        }
    },
    set: function(which,keys,to) {
        if(to == appstore) {

        }
        else{

        }
    }
};

//SCRIPTS

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

(function( $ ) {
$.fn.noClickDelay = function() {
var $wrapper = this;
var $target = this;
var moved = false;
$wrapper.bind('touchstart mousedown',function(e) {
e.preventDefault();
moved = false;
$target = $(e.target);
if($target.nodeType == 3) {
$target = $($target.parent());
}
$target.addClass('pressed');
$wrapper.bind('touchmove mousemove',function(e) {
moved = true;
$target.removeClass('pressed');
});
$wrapper.bind('touchend mouseup',function(e) {
$wrapper.unbind('mousemove touchmove');
$wrapper.unbind('mouseup touchend');
if(!moved && $target.length) {
$target.removeClass('pressed');
$target.trigger('click');
$target.focus();
}
});
});
};
})( jQuery );


function setScroll(id) {
  if(global.scrollers[id]){
    global.scrollers[id].destroy();
    global.scrollers[id] = null;
  }
  global.scrollers[id] = new iScroll(id, {
        hScrollbar: false,
        vScrollbar: false,
        onBeforeScrollStart: function (e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();
        }
    });
}


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

var formBuilder = {
  makeField: function(field_obj) {
    field_obj.meta_value = JSON.parse(field_obj.meta_value);
    switch(field_obj.meta_value.field_type){
      case 'text':
        return formBuilder.textField(field_obj);
      break;
      case 'textarea':
        return formBuilder.textAreaField(field_obj);
      break;
      case 'dropdown':
        return formBuilder.dropdownField(field_obj);
      break;
    }
  },
  textField: function(field) {
    return '<div class="form-field"><label for="field_'+field.meta_id+'">'+field.meta_value.label+'</label><input type="text" name="field_'+field.meta_id+'" id="field_'+field.meta_id+'" value="" placeholder="'+field.meta_value.placeholder+'" /></div>';
  },
  textAreaField: function(field) {
    return '<div class="form-field"><label for="field_'+field.meta_id+'">'+field.meta_value.label+'</label><textarea name="field_'+field.meta_id+'" id="field_'+field.meta_id+'">'+field.meta_value.placeholder+'</textarea></div>';
  },
  dropdownField: function(field) {
    var out = '<div class="form-field"><label for="field_'+field.meta_id+'">'+field.meta_value.label+'</label>';
    out += '<select name="field_'+field.meta_id+'" id="field_'+field.meta_id+'">';
    for(var key in field.meta_value.options) {
        var option = field.meta_value.options[key];
        out += '<option value="'+option.value+'">'+option.label+'</option>';
    }
    out += '</select></div>';
    return out;
  }
};