"use strict";

$.fancybox.open({
  src: '#location_dialog',
  type: 'inline',
  opts: {
    touch: false,
    clickOutside: false,
    dblclickOutside: false,
    clickSlide: false,
    mobile: {
      preventCaptionOverlap: false,
      idleTime: false,
      clickContent: function clickContent(current, event) {
        return current.type === "image" ? "toggleControls" : false;
      },
      clickSlide: function clickSlide(current, event) {
        return current.type === "image" ? "toggleControls" : false;
      },
      dblclickContent: function dblclickContent(current, event) {
        return current.type === "image" ? "zoom" : false;
      },
      dblclickSlide: function dblclickSlide(current, event) {
        return current.type === "image" ? "zoom" : false;
      }
    },
    afterShow: function afterShow() {
      // bind a click event to fancybox close button
      // set the value of the currentTarget to the eTarget variable
      window.dialog_cancel = false; // reset variable

      reset_map();
      $(".fancybox-close-small").on("click", function (event) {
        dialog_cancel = true;
      });
    },
    beforeClose: function beforeClose(instance, current) {
      if (!dialog_cancel) {
        var data = $('#location-entry').serializeArray();
        var index = jQuery.grep(data, function (n, i) {
          return n['name'] === "lat";
        });
        var lat = index[0]['value'];
        index = jQuery.grep(data, function (n, i) {
          return n['name'] === "lon";
        });
        var lon = index[0]['value'];
        var convert = $.post("/get_location?lat=" + lat + "&lon=" + lon);
        convert.done(function (data, textStatus, jqXHR) {
          var json_data = JSON.parse(data);
          sites_dialog(json_data);
        });
        convert.fail(function (jqXHR, textStatus) {
          alert('conversion failed : ' + textStatus);
          close();
        });
      } else {
        close();
      }

      ;
    }
  }
});

function sites_dialog(json_data) {
  $.fancybox.open({
    src: '#site_dialog',
    type: 'inline',
    opts: {
      touch: false,
      clickOutside: false,
      dblclickOutside: false,
      clickSlide: false,
      mobile: {
        preventCaptionOverlap: false,
        idleTime: false,
        clickContent: function clickContent(current, event) {
          return current.type === "image" ? "toggleControls" : false;
        },
        clickSlide: function clickSlide(current, event) {
          return current.type === "image" ? "toggleControls" : false;
        },
        dblclickContent: function dblclickContent(current, event) {
          return current.type === "image" ? "zoom" : false;
        },
        dblclickSlide: function dblclickSlide(current, event) {
          return current.type === "image" ? "zoom" : false;
        }
      },
      afterLoad: function afterLoad(current) {
        var geolocation = json_data.geolocation,
            places = json_data.places,
            places_list = [],
            default_place = json_data.default;

        for (var key in places) {
          if (places.hasOwnProperty(key)) {
            var location = places[key];
            places_list.push(location);
          }
        }

        ;

        for (var _key in geolocation) {
          if (geolocation.hasOwnProperty(_key)) {
            var _location = geolocation[_key];
            places_list.push(_location);
          }
        }

        ;

        if (places_list.length === 0) {
          places_list.push({
            'formatted_address': default_place
          });
        }

        for (var _key2 in places_list) {
          if (places_list.hasOwnProperty(_key2)) {
            var _location2 = places_list[_key2];

            if (_location2.hasOwnProperty("formatted_address")) {
              $('#siteSelect').append("<option value='".concat(_key2, "' ").concat(_location2.formatted_address === default_place ? "selected" : "", ">").concat(_location2.formatted_address, "</option>"));
            } else {
              $('#siteSelect').append("<option value='".concat(_key2, "'>").concat(_location2.name, "</option>"));
            }
          }
        }

        ;
        json_data.places_list = places_list;
      },
      afterShow: function afterShow() {
        // from https://stackoverflow.com/questions/22062722/fancybox-get-id-of-clicked-anchor-element-in-afterclose-function
        dialog_cancel = false; // reset variable

        $(".fancybox-close-small").on("click", function (event) {
          dialog_cancel = true;
        });
      },
      beforeClose: function beforeClose(instance, current) {
        if (!dialog_cancel) {
          var data = json_data;
          var element = $('#siteSelect');
          var key = element[0].selectedOptions[0].value;
          var location = data.places_list[key];
          data['current_site'] = location;
          file_dialog(data);
          return true;
        } else {
          return close();
        }

        ;
      }
    }
  });
}

;

function file_dialog(data) {
  var folder;
  $.fancybox.open({
    src: '#file_dialog',
    type: 'inline',
    opts: {
      touch: false,
      clickOutside: false,
      dblclickOutside: false,
      clickSlide: false,
      mobile: {
        preventCaptionOverlap: false,
        idleTime: false,
        clickContent: function clickContent(current, event) {
          return current.type === "image" ? "toggleControls" : false;
        },
        clickSlide: function clickSlide(current, event) {
          return current.type === "image" ? "toggleControls" : false;
        },
        dblclickContent: function dblclickContent(current, event) {
          return current.type === "image" ? "zoom" : false;
        },
        dblclickSlide: function dblclickSlide(current, event) {
          return current.type === "image" ? "zoom" : false;
        }
      },
      afterLoad: function afterLoad(current) {
        $('#file-upload').click(function () {
          $('#file-upload').prop('disabled', true);
          send_first_file(data);
        });
      },
      afterShow: function afterShow() {
        // from https://stackoverflow.com/questions/22062722/fancybox-get-id-of-clicked-anchor-element-in-afterclose-function
        dialog_cancel = false; // reset variable

        $(".fancybox-close-small").on("click", function (event) {
          dialog_cancel = true;
        });
      },
      afterClose: function afterClose() {
        if (!dialog_cancel) {
          return true;
        } else {
          return close(folder);
        }
      }
    }
  });
}

function send_first_file(data) {
  if ($('.custom-file-input')[0].files.length > 0) {
    $(".fancybox-close-small").prop('disabled', true);
    var payload = JSON.stringify(data);
    var addrecord = $.ajax({
      url: "/add_record",
      contentType: "application/json",
      method: "POST",
      data: payload
    });
    addrecord.done(function (post_data, textStatus, jqXHR) {
      sessionStorage.removeItem('database'); //let folder=post_data

      send_file_worker(post_data, close);
      $('#file-upload').prop('disabled', true);
    });
  } else {
    $('#file-upload').prop('disabled', false);
  }
}

;

function close(folder) {
  history.pushState({}, 'Title: Database', '/database');

  if (folder) {
    window.location.href = "/database/entry?gun_id=".concat(folder);
  } else {
    window.location.href = "/database";
  }
}

function form_changed() {}

; // needed to void error in map_reset