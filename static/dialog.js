$.fancybox.open({
        src  : '#location_dialog',
        type : 'inline',
        opts : {
                touch: false,
                clickOutside: false,
                dblclickOutside: false,
                clickSlide:false,
                beforeClose : function(instance, current ) {
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
                                alert('conversion failed : ' + textStatus)}
                        );
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
                        for (let key in geolocation){
                                if (geolocation.hasOwnProperty(key)) {
                                        let location =  geolocation[key];
                                        let index = key + 2;
                                        $('#siteSelect').append('<option value="' + index + '">' + location.formatted_address + '</option> ');
                                }};
                        },
                beforeClose : function(instance, current ) {
                                let data = json_data;
                                let element = $('#siteSelect');
                                let key = element[0].selectedOptions[0].value.charAt(0);
                                let location = data.geolocation[key];
                                data['current_site'] = location;
                                file_dialog(data);
                                return true
                        }
                }
        })};
        
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
                afterClose: function() {
                window.location.href = "/database/entry?id=" + data.gunid.toString() ;
                }
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
                        })
                    
                    })
    };