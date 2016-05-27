// Modules
var $ = require('./vendor/jquery.min');
var Analytics = require('./analytics');
var each = require('lodash/each');
var Email = require('./email');
var Modal = require('./modal');
var reduce = require('lodash/reduce');
var StaticKit = require('./statickit');

// Constants
var ACTIONKIT_CAMPAIGN = 'take-on-wall-street-www';
var SOURCE = StaticKit.query.source;
var SOURCE_CLEANED = StaticKit.query.cleanedSource;
var FEEDBACK_TOOL_URL = 'https://dp-feedback-tool.herokuapp.com/api/v1/feedback?callback=?';
var CALL_TOOL_URL = 'https://call-congress.fightforthefuture.org/create?callback=?';
var CALL_TOOL_COUNT_URL = 'https://dp-call-tool-meta.herokuapp.com/api/count/sunsetthepatriotact?callback=?';
var DOMAIN = 'takeonwallst.com';
var EMAIL_SUBJECT = 'I just signed this';
var EMAIL_BODY = `Hi,

I just signed a petition telling Congress to take on Wall Street.

Wall Street billionaires have rigged our economy and our democracy. Let's fix our financial system and make it work for ordinary Americans.

Can you sign too?

https://takeonwallst.com

Thanks!`;
var TWEET_TEXT = `#WallStreet billionaires have rigged our economy and our democracy. Let's tell Congress to #TakeOnWallSt! takeonwallst.com`;
var REQUIRED_FIELDS = [
    // 'first_name',
    // 'last_name',
    'email',
    'postcode',
];
var NON_SWAP_DISCLAIMERS = {
    'mediavoicesforchildren_ns': 'Media Voices for Children may contact you about future campaigns.',
    'nea_ns': 'National Education Association may contact you about future campaigns.',
};
var AFTER_ACTION_URLS = {
    dfa: 'https://secure.actblue.com/contribute/page/wallst?refcode=AWS052516',
    pfaw: 'https://secure.pfaw.org/site/SPageNavigator/ms_donation_15347.html?autologin=true',
    rootstrikers: 'https://secure.actblue.com/contribute/page/takeonwallstreet?refcode=tows&recurring=12&amount=25',
};

// Globalize jQuery
window.jQuery = window.$ = $;

// After the page loads
$(f => {
    // Wire up modals
    Modal.wireAll();

    // Check for form errors
    StaticKit.start();

    // Redirects
    redirectBasedOnSource();

    // Populate special form fields
    $('[name=action_user_agent]').val(navigator.userAgent);
    $('[name=source]').val(SOURCE_CLEANED);
    $('[name=url]').val(location.href);

    var nonSwapDisclaimer = NON_SWAP_DISCLAIMERS[SOURCE_CLEANED];
    if (nonSwapDisclaimer) {
        $('.action span.disclaimer').text(nonSwapDisclaimer);
    }

    var readyToSendToActionKit = false;
    var $signatureForm = $('.home-page .action form');
    $signatureForm.on('submit', e => {
        if (readyToSendToActionKit) {
            return true;
        }

        if (window.optimizely) {
            window.optimizely.push(["trackEvent", "formSubmissionAttempt"]);
        }

        e.preventDefault();

        var valid = true;

        each(REQUIRED_FIELDS, field => {
            var $field = $('#' + field);
            var value = $field.val() && $field.val().trim();
            if (!value) {
                alert('Please enter your ' + $field.attr('placeholder'));
                $field.focus();
                valid = false;
                return false;
            }
        });

        if (!valid) {
            return false;
        }

        var email = $('#email').val().trim().toLowerCase();

        if (!Email.validate(email)) {
            $('#email').focus();
            alert('Please enter your valid email');
            return false;
        }

        if (window.optimizely) {
            window.optimizely.push(['trackEvent', 'formSubmissionSuccess']);
        }

        // Thanking user
        showThanks();

        // Getting ready to send to AK
        readyToSendToActionKit = true;
        $signatureForm.submit();
    });

    var $callForm = $('.call-page .action form');
    $callForm.on('submit', e => {
        e.preventDefault();

        var phone = $('#phone').val().replace(/[^\d]/g, '');

        if (phone.length < 10) {
            $('#phone').focus();
            return alert('Please enter your 10 digit phone number.');
        }

        $.getJSON(CALL_TOOL_URL, {
            campaignId: 'president-obamas-legacy',
            fftfCampaign: 'president-obamas-legacy',
            fftfReferer: SOURCE,
            fftfSession: '' + Date.now() + Math.floor(Math.random(9999)),
            source_id: SOURCE,
            userPhone: phone,
            zipcode: 90210,
        }, res => {
            if (res.message !== 'queued') {
                alert('Sorry, something went wrong with your submission. The servers might be overloaded. Please try again later.')
            }
        });

        showCallingScript();
    });

    // Special URLs
    if ($callForm.length) {
        if (StaticKit.query.after === 'signing-petition') {
            $('body').addClass('coming-from-petition');
        }

        if (StaticKit.query.test === 'calling') {
            showCallingScript();
        }
    }

    var $feedbackForm = $('.calling-wrapper form');
    $feedbackForm.on('submit', e => {
        e.preventDefault();

        var message = reduce(
            $feedbackForm.serializeArray(),
            field => message += `${field.name}:\n${field.value}\n\n`,
            ''
        );

        $.getJSON(FEEDBACK_TOOL_URL, {
            campaign: 'take-on-wall-street',
            subject: 'Feedback from President Obama\'s Legacy',
            text: message,
        });

        $feedbackForm.addClass('sent');
    });

    $('.animated-scroll').on('click', e => {
        var target = $(e.target).data('target');
        $('html, body').stop().animate({
            scrollTop: $(target).offset().top,
        }, 640);
    });

    $('a.facebook').on('click', e => {
        e.preventDefault();

        var url =
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(DOMAIN);
        window.open(url);
    });

    $('a.twitter').on('click', e => {
        e.preventDefault();

        var url =
            'https://twitter.com/intent/tweet?text=' +
            encodeURIComponent(TWEET_TEXT);
        window.open(url);
    });

    $('a.email').on('click', e => {
        e.preventDefault();

        var url =
            'mailto:?subject=' + encodeURIComponent(EMAIL_SUBJECT) +
            '&body=' + encodeURIComponent(EMAIL_BODY);
        window.location.href = url;
    });

    $('a.the-letter').on('click', e => {
        e.preventDefault();
        Modal.show('#letter');
    });

    $('button.add-your-name').on('click', e => {
        e.preventDefault();
        location.hash = 'add-your-name';
    });

    var resizeTimeout = false;
    $(window).on('resize', e => {
        resizeTimeout = setTimeout(onResize, 300);
    }, false);

    function onResize() {
        $('.modal').css({
            'max-height': innerHeight + 'px',
        });
    }

    // Hashes
    if (
        location.hash === '#sent' ||
        StaticKit.query.sent
    ) {
        showCheckYourEmailPrompt();
        showThanks();
        location.hash = '';
        setTimeout(f => {
            location.href = './call?after=signing-petition';
        }, 30 * 1000);
    }

    function showThanks() {
        $('form button').attr('disabled', true);

        $('#thanks').css({
            display: 'block',
            opacity: 1,
        });
    }

    function fetchPetitionCount() {
        // Get signature count
        $.ajax({
            url: `https://act.demandprogress.org/progress/${ACTIONKIT_CAMPAIGN}?callback=?`,
            dataType: 'jsonp',
            success: data => {
                $('.counter').addClass('loaded');
                $('.counter .number-of-signatures').text(numberWithCommas(data.total.actions));
            },
        });
    }

    function fetchCallCount() {
        $.getJSON(CALL_TOOL_COUNT_URL, res => {
            if (res.count) {
                $('.counter').addClass('loaded');
                $('.counter .number-of-signatures').text(numberWithCommas(res.count));
            }
        });
    }

    if ($('body.home-page').length) {
        fetchPetitionCount();
    }

    // if ($('body.call-page').length) {
    //     fetchCallCount();
    // }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function showCheckYourEmailPrompt() {
        var $prompt = $('.check-your-email-prompt');
        $prompt.addClass('visible');
        $prompt[0].offsetHeight; // Reflow
        $prompt.css({
            opacity: 1,
        });
    }

    function showCallingScript() {
        $('body').addClass('calling');
        document.body.offsetHeight; // Reflow
        $('html, body').stop().animate({
            scrollTop: $('.calling-wrapper').offset().top - 16,
        }, 640);
    }

    function redirectBasedOnSource() {
        if (window.location.pathname === '/thanks/') {
            var afterActionURL = AFTER_ACTION_URLS[SOURCE_CLEANED];
            if (afterActionURL) {
                location.href = afterActionURL;
            }
        }
    }

});
