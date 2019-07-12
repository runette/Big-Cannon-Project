$.fancybox.open({
        src  : '#location_dialog',
        type : 'inline',
        opts : {
                touch: false,
                clickOutside: false,
                dblclickOutside: false,
                clickSlide:false,
                afterShow: function () {
                        // bind a click event to fancybox close button
                        // set the value of the currentTarget to the eTarget variable
                        dialog_cancel=false; // reset variable
                        reset_map();
                        $(".fancybox-close-small").on("click", function (event) {
                        dialog_cancel=true;
            })},
                beforeClose : function(instance, current ) {
                        if (!dialog_cancel) {
                                let data = $('#location-entry').serializeArray();
                                let index = jQuery.grep(data, function(n,i) { return n['name'] === "lat" });
                                let lat = index[0]['value'];
                                index = jQuery.grep(data, function(n,i) { return n['name'] === "lon" });
                                let lon = index[0]['value'];
                                let convert = $.post("/get_location?lat=" + lat + "&lon=" + lon);
                                convert.done(function (data, textStatus, jqXHR) {
                                        let json_data = JSON.parse(data);
                                        sites_dialog(json_data);
                                        return true;
                                });
                                convert.fail (function (jqXHR, textStatus) {
                                        alert('conversion failed : ' + textStatus)});
                                } else {
                                return true
                                };
                }
        }
});

function sites_dialog(json_data) {
        $.fancybox.open({
        src  : '#site_dialog',
        type : 'inline',
        opts : {
                touch: false,
                clickOutside: false,
                dblclickOutside: false,
                clickSlide:false,
                afterLoad: function(current){
                        let geolocation = json_data.geolocation;
                        let places = json_data.places
                        let location = new google.maps.LatLng(json_data.location[0],json_data.location[1]);
                        let places_list = [];
                        for (let key in places){
                                if (places.hasOwnProperty(key)) {
                                        let location =  places[key];
                                        places_list.push(location);
                                }};
                        for (let key in geolocation){
                                if (geolocation.hasOwnProperty(key)){
                                        let location = geolocation[key];
                                        places_list.push(location);
                                        }};
                        for (let key in places_list) {
                                if (places_list.hasOwnProperty(key)){
                                        let location = places_list[key];
                                        let index = key + 1;
                                        if (location.hasOwnProperty("formatted_address")){
                                                $('#siteSelect').append('<option value="' + index + '">' + location.formatted_address + '</option> ');
                                        } else {
                                                $('#siteSelect').append('<option value="' + index + '">' + location.name + '</option> ');
                                        }
                                }};       
                        },
                afterShow: function() {
                        // from https://stackoverflow.com/questions/22062722/fancybox-get-id-of-clicked-anchor-element-in-afterclose-function
                        dialog_cancel=false; // reset variable
                        $(".fancybox-close-small").on("click", function (event) {
                        dialog_cancel = true;
                })},
                beforeClose : function(instance, current ) {
                        if (!dialog_cancel) {
                                let data = json_data;
                                let element = $('#siteSelect');
                                let key = element[0].selectedOptions[0].value.charAt(0);
                                let location = data.places[key];
                                data['current_site'] = location;
                                file_dialog(data);
                                return true
                        }else {
                                return true
                                };
                        
                }
        }})};
        
function file_dialog(data) {
        $.fancybox.open({
        src  : '#file_dialog',
        type : 'inline',
        opts : {
                touch: false,
                clickOutside: false,
                dblclickOutside: false,
                clickSlide:false,
                afterLoad: function(current){
                        $('#file_upload').click(function(){send_first_file(data)})
                 },
                 afterShow: function() {
                        // from https://stackoverflow.com/questions/22062722/fancybox-get-id-of-clicked-anchor-element-in-afterclose-function
                        dialog_cancel=false; // reset variable
                        $(".fancybox-close-small").on("click", function (event) {
                        dialog_cancel = true;
                })},
                afterClose: function() {
                if (!dialog_cancel){
                        window.location.href = "/database/entry?gun_id=" + data.gunid.toString() ;
                } else {
                        return true
                }}
}
})
}

function send_first_file(data) {
        let folder = data.gunid.toString();
        send_file_worker(folder, function(snapshot) {
                    console.log('Uploaded a blob or file!');
                    data.metadata = snapshot.metadata;
                    let payload = JSON.stringify(data);
                    let addrecord = $.ajax({
                            url: "/add_record",
                            contentType: "application/json",
                            method: "POST",
                            data: payload
                        });
                        addrecord.done(function (data, textStatus, jqXHR) {
                            $("#imgs").attr("src", data);
                            console.log(data);
                            $('.custom-file-label').removeClass("selected").html("");
                            $('.progress').addClass('hidden');
                            $('.progress-bar').css('width', '0%')
                            $('#file_close').removeAttr("disabled");
                        })
                    
                    })
    };