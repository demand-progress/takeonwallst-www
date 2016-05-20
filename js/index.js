// Modules
const Email = require('./email');
const Modal = require('./modal');
const StaticKit = require('./statickit');
const $ = require('./vendor/jquery.min');

// Constants
const ACTIONKIT_CAMPAIGN = 'take-on-wall-street-www';
const SOURCE = StaticKit.query.source;
const SOURCE_CLEANED = StaticKit.query.cleanedSource;
const FEEDBACK_TOOL_URL = 'https://dp-feedback-tool.herokuapp.com/api/v1/feedback?callback=?';
const CALL_TOOL_URL = 'https://call-congress.fightforthefuture.org/create?callback=?';
const CALL_TOOL_COUNT_URL = 'https://dp-call-tool-meta.herokuapp.com/api/count/sunsetthepatriotact?callback=?';
const DOMAIN = 'takeonwallst.com';
const EMAIL_SUBJECT = 'Sign this petition: Tell Congress to Take On Wall Street';
const EMAIL_BODY = `Hi,

I just signed a petition telling Congress to take on Wall Street.

Wall Street billionaires have rigged our economy and our democracy. Let's fix our financial system and make it work for ordinary Americans.

Would you like to sign too?

https://takeonwallst.com

Thanks!`;
const TWEET_TEXT = `Wall Street billionaires have rigged our economy and our democracy. Let's tell Congress to #TakeOnWallStreet takeonwallst.com`;
const REQUIRED_FIELDS = [
    'first_name',
    'last_name',
    'email',
    'postcode',
];

// Globalize jQuery
window.jQuery = window.$ = $;

// After the page loads
$(f => {
    // Wire up modals
    Modal.wireAll();

    // Populate special form fields
    $('[name=action_user_agent]').val(navigator.userAgent);
    $('[name=source]').val(SOURCE_CLEANED);
    $('[name=url]').val(location.href);

    let readyToSendToActionKit = false;
    const $signatureForm = $('.home-page .action form');
    $signatureForm.on('submit', (e) => {
        if (readyToSendToActionKit) {
            return true;
        }

        if (window.optimizely) {
            window.optimizely.push(["trackEvent", "formSubmissionAttempt"]);
        }

        e.preventDefault();

        let valid = true;

        REQUIRED_FIELDS.forEach((field) => {
            if (!valid) {
                return;
            }

            const $field = $('#' + field);
            const value = $field.val() && $field.val().trim();
            if (!value) {
                alert('Please enter your ' + $field.attr('placeholder'));
                $field.focus();

                valid = false;
            }
        });

        if (!valid) {
            return;
        }

        const email = $('#email').val().trim().toLowerCase();

        if (!Email.validate(email)) {
            $('#email').focus();
            alert('Please enter your valid email');
            return;
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

    const $callForm = $('.call-page .action form');
    $callForm.on('submit', (e) => {
        e.preventDefault();

        const phone = $('#phone').val().replace(/[^\d]/g, '');

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
        }, (res) => {
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

    const $feedbackForm = $('.calling-wrapper form');
    $feedbackForm.on('submit', (e) => {
        e.preventDefault();

        let message = '';
        const fields = $feedbackForm.serializeArray();
        fields.forEach((field) => {
            message += `${field.name}:\n${field.value}\n\n`;
        });

        $.getJSON(FEEDBACK_TOOL_URL, {
            campaign: 'take-on-wall-street',
            subject: 'Feedback from President Obama\'s Legacy',
            text: message,
        });

        $feedbackForm.addClass('sent');
    });

    $('.animated-scroll').on('click', (e) => {
        const target = $(e.target).data('target');
        $('html, body').stop().animate({
            scrollTop: $(target).offset().top,
        }, 640);
    });

    $('a.facebook').on('click', (e) => {
        e.preventDefault();

        const url =
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(DOMAIN);
        window.open(url);
    });

    $('a.twitter').on('click', (e) => {
        e.preventDefault();

        const url =
            'https://twitter.com/intent/tweet?text=' +
            encodeURIComponent(TWEET_TEXT);
        window.open(url);
    });

    $('a.email').on('click', (e) => {
        e.preventDefault();

        const url =
            'mailto:?subject=' + encodeURIComponent(EMAIL_SUBJECT) +
            '&body=' + encodeURIComponent(EMAIL_BODY);
        window.location.href = url;
    });

    $('a.the-letter').on('click', (e) => {
        e.preventDefault();
        Modal.show('#letter');
    });

    $('button.add-your-name').on('click', (e) => {
        e.preventDefault();
        location.hash = 'add-your-name';
    });

    var resizeTimeout = false;
    $(window).on('resize', (e) => {
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
        setTimeout(() => {
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
            success: (data) => {
                console.log(data);
                $('.counter').addClass('loaded');
                $('.counter .number-of-signatures').text(numberWithCommas(data.total.actions));
            },
        });
    }

    function fetchCallCount() {
        $.getJSON(CALL_TOOL_COUNT_URL, (res) => {
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
        const $prompt = $('.check-your-email-prompt');
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

});
