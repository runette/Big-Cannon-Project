(function ($, callback) {
    if (typeof $ === 'function') {
        callback($)
    }
})(window.jQuery, function ($) {
    var $win = $(window);
    
     // Initialize fancybox
    function initFancybox(){
        $('[data-fancybox]').fancybox({
	    protect: true
        })}

	// Initialize Firebase
    function initFirebase(){
	var config = {
	  apiKey: "AIzaSyCtkhYNFASY1jLhLg0mJ1gVfBkiyWczzUE",
	  authDomain: "ultima-ratio-221014.firebaseapp.com",
	  //databaseURL: "https://ultima-ratio-221014.firebaseio.com",
	  projectId: "ultima-ratio-221014",
	  storageBucket: "ultima-ratio-221014.appspot.com",
	  //messagingSenderId: "927628257279"
	};
	firebase.initializeApp(config);
	let ui = new firebaseui.auth.AuthUI(firebase.auth());
	// FirebaseUI config.
		let uiConfig = {
		  callbacks:{
		  signInSuccessWithAuthResult: function(authResult, redirectUrl){
			user=authResult.user;
			user.getIdToken().then(function (token) {
			    setCookie("token", token)
			    if (window.location.pathname.includes('/database/entry')) {location.reload(true)}
			    })
			return false
		    },
		    signInFailure(error){
			return alert(stringify(error))
		    }
		    },
		    
		  signInOptions: [
		    // Comment out any lines corresponding to providers you did not check in
		    // the Firebase console.
		    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		    //firebase.auth.EmailAuthProvider.PROVIDER_ID,
		    //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
		    //firebase.auth.GithubAuthProvider.PROVIDER_ID,
		    //firebase.auth.PhoneAuthProvider.PROVIDER_ID
	      
		  ],
		  // Terms of service url.
		  tosUrl: '/static/tos.html',
		  privacyPolicyUrl: '/static/privacy.html'
		};
	if (ui.isPendingRedirect()){
	    ui.start('#firebaseui-auth-container', uiConfig);
	    $('#login').text("Logout");
	    
	    }
	$('#login').click(function(){
	    if ($('#login').text().includes("Logout")){
		firebase.auth().signOut()
		clearCookie('token');
		$('#firebaseui-auth-container').text("You are now logged out")
		$('[data-dismiss="modal"]').click(function(){window.location.href ="/" })
		}
	    else {
		firebase.auth().onAuthStateChanged(function (user) {
		    if (user) {
		      // User is signed in, so display the "sign out" button and login info.
		      $('#login').text("Logout")
		      console.log(`Signed in as ${user.displayName} (${user.email})`);
		    } else {
		      //clearCookie('token');
		      ;
		    }
		  }, function (error) {
		    console.log(error);
		    alert('Unable to log in: ' + error)
		  });
		ui.start('#firebaseui-auth-container', uiConfig);
	    }
	    });
      }

    function initialize() {
	initFirebase();
        initFancybox();
        let update_list = $('.update-field');
        if (update_list) {
            for (var i = 0; i < update_list.length; i++) {
                let element = update_list[i];
                select_button(element.id,)
            }
        }
    }
    $(initialize);
});
// Facebook API
window.fbAsyncInit = function() {
    FB.init({
        appId      : '685963501504199',
        xfbml      : true,
        version    : 'v2.4'
    });
};

function select_button ( cl) {
        let action = "hide";
        let button = $('#' + cl);
        if (button.is(':checked')) {
            action = 'show'
        }
        if (action === "show") {
            $('.' + cl).show()
        }
        else {
            $('.' + cl).hide()
        }
    }

    function radio_button ( name ) {
        let elements = $("input[name=" + name + "]");
        let action;
        for (let i = 0; i < elements.length; i++) {
            let button = $('#' + elements[i].id ) ;
            if (button.is(':checked')) {
                $('.' + button[0].id).show()
            }
            else {
                $('.' + button[0].id).hide()
            }
        }
    }

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


    //from https://stackoverflow.com/a/16808048/9652221
    async function send_file() {
            let files = await selectFile("image/*", false);
            let json_data = await new Promise( function(resolve){
                $.post(
            "/get_upload_key",
            function (data, status) {
                let json_data = JSON.parse(data);
                resolve(json_data)
            })
            });
            let url = json_data.url;
            let request_body = JSON.stringify({
                "name": "/" + $('#id').val() + "/" +  files.name
            });
            let reader = new FileReader();
            reader.onload = function (event) {
                let payload = event.target.result;
                let length = payload.length;
                let request_headers = {
                    "Authorization": "Bearer " + json_data.key,
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Length": length,
                };
                request = $.ajax({
                    url: url,
                    method: "POST",
                    data: request_body,
                    headers: request_headers
                });
                request.done(function (data, textStatus, jqXHR) {
                    let location = jqXHR.getResponseHeader("location");
                    upload = $.ajax({
                        url: location,
                        method: "PUT",
                        data: payload,
                        processData: false,
                        contentType: false,
                    });
                    upload.done(function (data, textStatus, jqXHR) {
                        let json_data = JSON.stringify(data);
                        addphoto = $.post({
                            url: "/add_photo?id=" + $('#id').val(),
                            method: "POST",
                            data: json_data
                        });
                        addphoto.done(function (data, textStatus, jqXHR) {
                            $("#image_container").attr("src", data);
                        })
                    });
                    upload.fail(function (jqXHR, textStatus) {
                        alert("upload failed" + textStatus)
                    });
                });
                request.fail(function (jqXHR, textStatus) {
                    alert("upload request failed" + textStatus)
                });
                };
            reader.readAsArrayBuffer(files);
        }
// from https://stackoverflow.com/questions/16215771/how-open-select-file-dialog-via-js
    function selectFile (contentType, multiple){
        return new Promise(function (resolve, reject){
            let input = document.createElement('input');
            input.type = 'file';
            input.multiple = multiple;
            input.accept = contentType;
            input.onchange = _ => {
                let files = Array.from(input.files);
			if (multiple)
				resolve(files);
			else
				resolve(files[0]);
            };
            input.click();
        })}

    function BNG_convert(form) {
        let data = $('form').serializeArray();
        let index = jQuery.grep(data, function(n,i) { return n['name'] === "eastings" });
        let eastings = index[0]['value'];
        index = jQuery.grep(data, function(n,i) { return n['name'] === "northings" });
        let northings = index[0]['value'];
        let convert = $.post("/bng_convert?eastings=" + eastings + "&northings=" + northings);
        convert.done(function (data, textStatus, jqXHR) {
            let json_data = JSON.parse(data);
            $('#lat').val(json_data['LATITUDE']);
            $('#lon').val(json_data['LONGITUDE']);
            reset_map()
        });
        convert.fail (function (jqXHR, textStatus) {
            alert('conversion failed : ' + textStatus)}
        );

    }
    function LL_convert(form) {
        let data = $('form').serializeArray();
        let index = jQuery.grep(data, function(n,i) { return n['name'] === "lat" });
        let lat = index[0]['value'];
        index = jQuery.grep(data, function(n,i) { return n['name'] === "lon" });
        let lon = index[0]['value'];
        let convert = $.post("/ll_convert?lat=" + lat + "&lon=" + lon);
        convert.done(function (data, textStatus, jqXHR) {
            let json_data = JSON.parse(data);
            $('#eastings').val(json_data['EASTING']);
            $('#northings').val(json_data['NORTHING']);
        });
        convert.fail (function (jqXHR, textStatus) {
            alert('conversion failed : ' + textStatus)}
        );
        radio_button('geolocation','bng')
    }
    function reset_map() {
        let location = {
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
                            draggable:true,
                        });
        google.maps.event.addListener(marker, 'dragend', function(){
            let location = marker.getPosition();
            $('#lat').val(location.lat);
            $('#lon').val(location.lng);
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
      reset_map()
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert( "User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert( "Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }
    //from https://www.quirksmode.org/js/cookies.html
    function setCookie(name,value){
	createCookie(name, value, 1)
	}
	
    function createCookie(name,value,days) {
	if (days) {
	    var date = new Date();
	    date.setTime(date.getTime()+(days*24*60*60*1000));
	    var expires = "; expires="+date.toGMTString();
	    }
	else var expires = "";
	document.cookie = name + "="+value + expires + "; path=/";
	}
	
    function clearCookie(name){
	createCookie(name,"",-1);
    }
    
    function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
	    var c = ca[i];
	    while (c.charAt(0)==' ') c = c.substring(1,c.length);
	    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	return null;
	}
	
    












