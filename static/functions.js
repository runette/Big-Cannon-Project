(function ($, callback) {
    if (typeof $ === 'function') {
        callback($)
    }
})(window.jQuery, function ($) {
    var $win = $(window);
    function initFancybox(){
        $('.fancybox').fancybox();
    }
        $win.on('scroll', function () {
            if ($win.scrollTop() > 0) {
                $('#top-link').stop().animate({opacity: 1}, 500);
            } else {
                $('#top-link').stop().animate({opacity: 0}, 500);
            }
        }).trigger('scroll');

    function initialize() {
        initFancybox();
    }
    $(initialize)
});
// Facebook API
window.fbAsyncInit = function() {
    FB.init({
        appId      : '685963501504199',
        xfbml      : true,
        version    : 'v2.4'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

    function select_button (button, action) {
        if (action === "show") {
            $('.' + button).show()
        }
        else {
            $('.' + button).hide()
        }
    }
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













