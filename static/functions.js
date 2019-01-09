(function ($, callback) {
    if (typeof $ === 'function') {
        callback($)
    }
})(window.jQuery, function ($) {
    var $win = $(window);

    function initFancybox(){
        $('.fancybox').fancybox();
    }

    function initMobileSideBarNav() {
        // Mobile sidebar menu
        $(".open-mobile-nav").click(function(e){
            e.preventDefault();
            $('#mobile-nav').animate({width: 'toggle'});
        });
        $(".close-mobile-nav").click(function(e){
            e.preventDefault();
            $('#mobile-nav').animate({width: 'toggle'});
        });

        $(".toggle-filters").click(function(e){
            e.preventDefault();
            $('.filters .container').fadeToggle();
            $('.toggle-filters').toggleClass('active');
        });
    }

    function initAccordion() {
        // Accordion
        $(".accordion li").hover(function(){
            $(this).children('ul').slideToggle();
        });

        $('#faq .question').click(function (e) {
            e.preventDefault();
            $(this).toggleClass('active');
            $(this).next('#faq .answer').stop(true, true).slideToggle();
        });
    }

    function initSlideShow() {
        // Slideshow Progress Bar
        var progress = $('#progress'),
            slideshow = $( '.cycle-slideshow' );

        //replace images
        var $images = $( '.cycle-slideshow > img' );
        if (slideshow.length && $images.length) {
            $images.each(function(){
                var $img = $(this);

                $img.replaceWith('<div class="slide parallax" style="background-image: url('+$img.attr('src')+')"></div>');
            });
        }

        slideshow.on( 'cycle-initialized cycle-before', function( e, opts ) {
            progress.stop(true).css( 'width', 0 );
        });

        slideshow.on( 'cycle-initialized cycle-after', function( e, opts ) {
            if ( ! slideshow.is('.cycle-paused') )
                progress.animate({ width: '100%' }, opts.timeout, 'linear' );
        });

        slideshow.on( 'cycle-paused', function( e, opts ) {
            progress.stop();
        });

        slideshow.on( 'cycle-resumed', function( e, opts, timeoutRemaining ) {
            progress.animate({ width: '100%' }, timeoutRemaining, 'linear' );
        });

        slideshow.cycle();
    }

    function initGotoTop() {
        $('#top-link').off('click').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            $('html, body').animate({
                scrollTop: 0
            }, 'fast');
        });

        $win.on('scroll', function () {
            if ($win.scrollTop() > 0) {
                $('#top-link').stop().animate({opacity: 1}, 500);
            } else {
                $('#top-link').stop().animate({opacity: 0}, 500);
            }
        }).trigger('scroll');
    }

    function initFadeThis() {
        $win.on('resize', function () {
            // Slide in items
            if ($win.width() > 767) {
                $win.fadeThis({
                    baseName:       "slide-",
                    speed:          500,
                    easing:         "swing",
                    offset:         -200,
                    reverse:        false,
                    distance:       100,
                    scrolledIn:     null, // Function to call when the element come in viewport.
                    scrolledOut:    null // Function to call when the element go out of the viewport.
                });
            }
        }).trigger('resize');
    }

    function initialize() {
        initGotoTop();
        initMobileSideBarNav();
        initAccordion();
        initSlideShow();
        initFadeThis();
        initFancybox();
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

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));













