// Modules
const Modal = require('./modal');
const StaticKit = require('./statickit');
window.$ = window.jQuery = require('./vendor/jquery.min');

// Constants
const SOURCE = StaticKit.query.source;
const SOURCE_CLEANED = StaticKit.query.cleanedSource;
const CALL_TOOL_COUNT = 'https://dp-call-tool-meta.herokuapp.com/api/count/sunsetthepatriotact';
const DOMAIN = 'presidentobamaslegacy.org';
const EMAIL_SUBJECT = 'Sign this petition: Tell Obama to fight secret money in politics right away';
const EMAIL_BODY = `Hi,

I just signed a petition at PresidentObamasLegacy.org telling President Obama to immediately act to fight the secret money corroding our political system.

Nearly 6 years after Citizens United, President Obama still hasn't used any of the tools he has to reduce secret money spent by billionaires and wealthy special interests in our elections

The petition is integrated with the White House We The People petition platform – so if we get to 100,000 signatures, Obama will publicly respond. Could you help us get there?

http://${DOMAIN}/?source=${SOURCE_CLEANED}-emailshare

Thanks!`;
const TWEET_TEXT = `Join me: Tell @POTUS that he must fight secret money in politics right away. PresidentObamasLegacy.org/?source=${SOURCE_CLEANED}-twittershare #ObamaMustAct`;
const WTP_API_COUNT_KEY = '556180fe1250efc8e58f9b407c4d7180b784b77c233037ac28b1b9c0c028beec';
const WTP_API_COUNT_URL = 'https://dp-wethepeople.herokuapp.com/api/v1/count?callback=?';
const WTP_API_SIGN_KEY = '011879d43dfe95dd96283030ca383e252d59c3fd414f945695dcda0fdce55b0f';
const WTP_API_SIGN_URL = 'https://dp-wethepeople.herokuapp.com/api/v1/sign?callback=?';
const WTP_PETITION_ID = '2128396';
const REQUIRED_FIELDS = [
    'first_name',
    'last_name',
    'email',
    'postcode',
];

// After the page loads
$(() => {
    // Wire up modals
    Modal.wireAll();

    // Populate special form fields
    $('[name=action_user_agent]').val(navigator.userAgent);
    $('[name=source]').val(SOURCE_CLEANED);
    $('[name=url]').val(location.href);

    let petitionWasSentToWH = false;
    const $signatureForm = $('.home-page .action form');
    $signatureForm.on('submit', (e) => {
        if (petitionWasSentToWH) {
            return true;
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

        // Thanking user
        showThanks();

        // Sending request to WH API
        $.getJSON(WTP_API_SIGN_URL, {
            email: $('#email').val(),
            key: WTP_API_SIGN_KEY,
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            petition_id: WTP_PETITION_ID,
        }, (res) => {
            if (res.success) {
                petitionWasSentToWH = true;
                $signatureForm.submit();
            } else {
                alert('Sorry, something went wrong with your submission. The servers might be overloaded. Please try again later.')
            }
        });
    });

    const $callForm = $('.call-page .action form');
    $callForm.on('submit', (e) => {
        e.preventDefault();

        Modal.show('.overlay.script');

        alert('TODO: Set up call tool.');
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
            encodeURIComponent(`${DOMAIN}/?source=${SOURCE_CLEANED}-fbshare`);
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
    if (location.hash === '#sent') {
        showCheckYourEmailPrompt();
        showThanks();
        location.hash = '';
        setTimeout(() => {
            location.href = './call';
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
        $.getJSON(WTP_API_COUNT_URL, {
            key: WTP_API_COUNT_KEY,
            petition_id: WTP_PETITION_ID,
        }, (res) => {
            if (res.count) {
                $('.counter').addClass('loaded');
                $('.counter .number-of-signatures').text(numberWithCommas(res.count));
            }
        });
    }

    function fetchCallCount() {
        $.getJSON(CALL_TOOL_COUNT, (res) => {
            if (res.count) {
                $('.counter').addClass('loaded');
                $('.counter .number-of-signatures').text(numberWithCommas(res.count));
            }
        });
    }

    if ($('body.home-page').length) {
        fetchPetitionCount();
    }

    if ($('body.call-page').length) {
        fetchCallCount();
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function showCheckYourEmailPrompt() {
        const $prompt = $('.check-your-email-prompt');
        $prompt.css({
            display: 'block',
        });
        $prompt[0].offsetHeight; // Reflow
        $prompt.css({
            opacity: 1,
        });
    }

});
