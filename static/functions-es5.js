"use strict";

//#MIT License
//#Copyright (c) 2019 Paul Harwood
//#Permission is hereby granted, free of charge, to any person obtaining a copy
//#of this software and associated documentation files (the "Software"), to deal
//#in the Software without restriction, including without limitation the rights
//#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//#copies of the Software, and to permit persons to whom the Software is
//#furnished to do so, subject to the following conditions:
//#The above copyright notice and this permission notice shall be included in all
//#copies or substantial portions of the Software.
//#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//#SOFTWARE.
(function ($, callback) {
  if (typeof $ === 'function') {
    callback($);
  }
})(window.jQuery, function ($) {
  var $win = $(window); // Initialize fancybox

  function initFancybox() {
    $('[data-fancybox]').fancybox({
      protect: true
    });
  } // Initialize Firebase


  function initFirebase() {
    var config = {
      apiKey: "AIzaSyCtkhYNFASY1jLhLg0mJ1gVfBkiyWczzUE",
      authDomain: "ultima-ratio-221014.firebaseapp.com",
      databaseURL: "https://ultima-ratio-221014.firebaseio.com",
      projectId: "ultima-ratio-221014",
      storageBucket: "ultima-ratio-221014.appspot.com",
      messagingSenderId: "927628257279"
    };
    var app = firebase.initializeApp(config);
    var ui = new firebaseui.auth.AuthUI(firebase.auth(app)); // FirebaseUI config.

    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function signInSuccessWithAuthResult(authResult, redirectUrl) {
          var user = authResult.user;
          user.getIdToken().then(function (token) {
            setCookie("token", token);
            $('#login').text("Logout");
            $('#login-modal').modal('hide');

            if (window.location.pathname.includes('/database/entry')) {
              location.reload(true);
            } else {
              window.location.href = "/database";
            }
          });
          return false;
        },
        signInFailure: function signInFailure(error) {
          return alert(stringify(error));
        }
      },
      signInOptions: [// Comment out any lines corresponding to providers you did not check in
      // the Firebase console.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID, firebase.auth.EmailAuthProvider.PROVIDER_ID, {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        scopes: ['public_profile', 'email']
      } //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      //firebase.auth.GithubAuthProvider.PROVIDER_ID,
      //firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
      // Terms of service url.
      tosUrl: '/tor',
      privacyPolicyUrl: '/privacy'
    };

    if (ui.isPendingRedirect()) {
      $('#login-modal').modal('show');
      ui.start('#firebaseui-auth-container', uiConfig);
    }

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in, so display the "sign out" button and login info.
        user.getIdToken().then(function (token) {
          setCookie("token", token);
        });
        console.log("Signed in as ".concat(user.displayName, " (").concat(user.email, ")"));

        if ($('#login')[0].innerText === "Login") {
          sessionStorage.removeItem('database');
          window.location.href = "/";
        }

        $('#login').click(function () {
          firebase.auth().signOut();
          clearCookie('token');
          sessionStorage.removeItem('database');
          $('#firebaseui-auth-container').text("You are now logged out");
          $('[data-dismiss="modal"]').click(function () {
            window.location.href = "/";
          });
        });
      } else {
        $('#login').click(function () {
          ui.start('#firebaseui-auth-container', uiConfig);
        });
      }

      ;
    }, function (error) {
      console.log(error);
      alert('Unable to log in: ' + error);
    });
  }

  function initialize() {
    initFirebase();
    initFancybox();
    var update_list = $('.update-field');

    if (update_list) {
      for (var i = 0; i < update_list.length; i++) {
        var element = update_list[i];
        select_button(element.id);
      }
    }

    ;
    $('.custom-file-input').on('change', function () {
      var fileName = "";
      var files = this.files;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;

          if (fileName.length > 0) {
            fileName += ",";
          }

          fileName += file.name;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      $(this).next('.custom-file-label').addClass("selected").html(fileName);
    });
  }

  $(initialize);
}); // Facebook API
//window.fbAsyncInit = function() {
//FB.init({
//appId      : '685963501504199',
//xfbml      : true,
//version    : 'v2.4'
//});
//};


function select_button(cl) {
  var action = "hide";
  var button = $('#' + cl);

  if (button.is(':checked')) {
    action = 'show';
  }

  if (action === "show") {
    $('.' + cl).show();
  } else {
    $('.' + cl).hide();
  }
}

function radio_button(name) {
  var elements = $("input[name=" + name + "]");
  var action;

  for (var i = 0; i < elements.length; i++) {
    var button = $('#' + elements[i].id);

    if (button.is(':checked')) {
      $('.' + button[0].id).show();
    } else {
      $('.' + button[0].id).hide();
    }
  }
} //(function(d, s, id){
//var js, fjs = d.getElementsByTagName(s)[0];
//if (d.getElementById(id)) {return;}
//js = d.createElement(s); js.id = id;
//js.src = "//connect.facebook.net/en_US/sdk.js";
//fjs.parentNode.insertBefore(js, fjs);
//}(document, 'script', 'facebook-jssdk'));
//from https://stackoverflow.com/a/16808048/9652221


function send_file_worker(folder, callback) {
  var imageRef, root, storage, files, number_files, count, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, file_name, uploadTask, snapshot, payload, addphoto;

  return regeneratorRuntime.async(function send_file_worker$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          $('#file-upload').prop('disabled', true);
          storage = firebase.storage();

          if (dev) {
            root = "dev";
          } else {
            root = "prod";
          }

          files = $('.custom-file-input')[0].files;

          if (files) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return");

        case 6:
          $('.progress').removeClass('hidden');
          number_files = Object.keys(files).length;
          count = 0;
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 12;
          _iterator2 = files[Symbol.iterator]();

        case 14:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 33;
            break;
          }

          file = _step2.value;
          file_name = file.name;
          imageRef = storage.ref().child(root).child(folder).child(file_name + "/original");
          console.log("uploading " + imageRef.fullPath);
          uploadTask = imageRef.put(file);
          uploadTask.on('state_changed', function (snapshot) {
            var progress = Math.floor(snapshot.bytesTransferred / snapshot.totalBytes * 10) * 10 / number_files + 100 / number_files * count;
            $('.progress-bar').css('width', progress + '%');
          });
          _context.next = 23;
          return regeneratorRuntime.awrap(uploadTask);

        case 23:
          snapshot = _context.sent;
          console.log('Uploaded a blob or file!');
          $('#status-message').html('<p>Your image is being processed and you will be taken to the new record shortly.</p><p> If this does not happen, your record will almost certainly have been created. Go to the Database screen using the BACK button and check the last record.</p>');
          payload = JSON.stringify(snapshot.metadata);
          addphoto = $.ajax({
            url: "/add_photo?id=" + folder,
            contentType: "application/json",
            method: "POST",
            data: payload
          });
          addphoto.done(function (data, textStatus, jqXHR) {
            data = JSON.parse(data);
            $("#imgs").append("<a href=\"".concat(data.original, "\" data-fancybox=\"image-gallery\" data-caption=\"cannon photo\">\n\t\t\t\t<img src=\"").concat(data.s200, "\" alt=\"\" />"));
            console.log(data);

            if (callback) {
              callback(folder);
            }

            ;
            $('.custom-file-input').val(null);
            $('#file-upload').prop('disabled', false);
          });
          count += 1;

        case 30:
          _iteratorNormalCompletion2 = true;
          _context.next = 14;
          break;

        case 33:
          _context.next = 39;
          break;

        case 35:
          _context.prev = 35;
          _context.t0 = _context["catch"](12);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t0;

        case 39:
          _context.prev = 39;
          _context.prev = 40;

          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }

        case 42:
          _context.prev = 42;

          if (!_didIteratorError2) {
            _context.next = 45;
            break;
          }

          throw _iteratorError2;

        case 45:
          return _context.finish(42);

        case 46:
          return _context.finish(39);

        case 47:
          $('.custom-file-label').removeClass("selected").html("");
          $('.progress').addClass('hidden');
          $('.progress-bar').css('width', '0%');

        case 50:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[12, 35, 39, 47], [40,, 42, 46]]);
}

function send_file() {
  if ($('.custom-file-input')[0].files.length > 0) {
    var folder = $('#id').val().toString();
    send_file_worker(folder, null);
  } else {
    $('#file-upload').prop('disabled', false);
  }
}

;

function BNG_convert(form) {
  var data = $('form').serializeArray();
  var index = jQuery.grep(data, function (n, i) {
    return n['name'] === "eastings";
  });
  var eastings = index[0]['value'];
  index = jQuery.grep(data, function (n, i) {
    return n['name'] === "northings";
  });
  var northings = index[0]['value'];
  var convert = $.post("/bng_convert?eastings=" + eastings + "&northings=" + northings);
  convert.done(function (data, textStatus, jqXHR) {
    var json_data = JSON.parse(data);
    $('#lat').val(json_data['LATITUDE']);
    $('#lon').val(json_data['LONGITUDE']);
    reset_map();
  });
  convert.fail(function (jqXHR, textStatus) {
    alert('conversion failed : ' + textStatus);
  });
}

function LL_convert(form) {
  var data = $(form).serializeArray();
  var index = jQuery.grep(data, function (n, i) {
    return n['name'] === "lat";
  });
  var lat = index[0]['value'];
  index = jQuery.grep(data, function (n, i) {
    return n['name'] === "lon";
  });
  var lon = index[0]['value'];
  var convert = $.post("/ll_convert?lat=" + lat + "&lon=" + lon);
  convert.done(function (data, textStatus, jqXHR) {
    var json_data = JSON.parse(data);
    $('#eastings').val(json_data['EASTING']);
    $('#northings').val(json_data['NORTHING']);
  });
  convert.fail(function (jqXHR, textStatus) {
    alert('conversion failed : ' + textStatus);
  });
  radio_button('geolocation', 'bng');
}

function reset_map() {
  var location = {
    lat: parseFloat($('#lat').val()),
    lng: parseFloat($('#lon').val())
  };
  map.setCenter(location);

  if (marker != null) {
    marker.setMap(null);
    marker = null;
  }

  marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: map_icons[marker_quality],
    draggable: true
  });
  google.maps.event.addListener(marker, 'dragend', function () {
    var location = marker.getPosition();
    $('#lat').val(location.lat);
    $('#lon').val(location.lng);
    form_changed();
  });
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  $('#lat').val(position.coords.latitude);
  $('#lon').val(position.coords.longitude);
  reset_map();
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;

    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;

    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;

    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

function locate_action(name) {
  getLocation();
  radio_button(name);
} //from https://www.quirksmode.org/js/cookies.html


function setCookie(name, value) {
  createCookie(name, value, 0.1);
}

function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";

  document.cookie = name + "=" + value + expires + "; path=/";
}

function clearCookie(name) {
  createCookie(name, "", -1);
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }

    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
}