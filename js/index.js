// Modules
const _ = require('./vendor/lodash.min');
const Modal = require('./modal');
const StaticKit = require('./statickit');
window.$ = window.jQuery = require('./vendor/jquery.min');


// After the page loads
$(() => {

    // Defining Constants
    var DOMAIN = 'presidentobamaslegacy.com';
    var EMAIL_SUBJECT = 'Sign this petition to fight big money in politics?';
    var EMAIL_BODY = 'Hi,\n\n\
I just signed the petition telling the presidential candidates to lay out a concrete, serious plan to fight big money in politics.\n\n\
The only way we\'ll make progress is if candidates know the American people are demanding a change. Could you sign, too?\n\n\
http://www.' + DOMAIN + '/?source=${source}\n\n\
Thanks!';
    var TWEET_TEXT = 'I just called on the presidential candidates to lay out a concrete plan to #FightBigMoney in politics! Join here: http://' + DOMAIN + '/?source=${source}';
    var WTP_API_COUNT_KEY = '556180fe1250efc8e58f9b407c4d7180b784b77c233037ac28b1b9c0c028beec';
    var WTP_API_COUNT_URL = 'https://dp-wethepeople.herokuapp.com/api/v1/count?callback=?';
    var WTP_API_SIGN_KEY = '011879d43dfe95dd96283030ca383e252d59c3fd414f945695dcda0fdce55b0f';
    var WTP_API_SIGN_URL = 'https://dp-wethepeople.herokuapp.com/api/v1/sign?callback=?';
    var WTP_PETITION_ID = '2128396';
    // end Defining Constants


    // Checking Browser Compatibility
    var isIE = navigator.userAgent.match(/MSIE (\d+)\./);
    if (isIE) {
        var version = +isIE[1];
        if (version < 9) {
            alert('Unfortunately your browser, Internet Explorer ' + version + ', is not supported.\nPlease visit the site with a modern browser like Firefox or Chrome.\nThanks!');
        }
    }

    if (navigator.userAgent.match(/Android 2\.3/)) {
        alert('Unfortunately your browser, Android 2.3, is not supported.\nPlease visit the site with a modern browser like Firefox or Chrome.\nThanks!');
    }
    // end Checking Browser Compatibility


    // Wire up modals
    Modal.wireAll();


    // Populate special form fields
    $('[name=action_user_agent]').val(navigator.userAgent);
    $('[name=source]').val(StaticKit.query.source);
    $('[name=url]').val(location.href);

    var requiredFields = [
        'first_name',
        'last_name',
        'email',
        'postcode',
    ];

    var petitionWasSentToWH = false;
    var $form = $('.action form');
    $form.on('submit', (e) => {
        if (petitionWasSentToWH) {
            return true;
        }

        e.preventDefault();

        var valid = true;

        _.each(requiredFields, (field) => {
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
                $form.submit();
            } else {
                alert('Sorry, something went wrong with your submission. The servers might be overloaded. Please try again later.')
            }
        });
    });

    $('a.facebook').on('click', (e) => {
        e.preventDefault();

        window.open(
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(DOMAIN + '/?source=' + StaticKit.query.cleanedSource + '-fbshare')
        );
    });

    $('a.twitter').on('click', (e) => {
        e.preventDefault();

        window.open(
            'https://twitter.com/intent/tweet?text=' +
            encodeURIComponent(
                TWEET_TEXT.replace('${source}', StaticKit.query.cleanedSource + '-twittershare')
            )
        );
    });

    $('a.email').on('click', (e) => {
        e.preventDefault();

        window.location.href =
            'mailto:?subject=' + encodeURIComponent(EMAIL_SUBJECT) +
            '&body=' + encodeURIComponent(
                EMAIL_BODY.replace('${source}', StaticKit.query.cleanedSource + '-emailshare')
            );
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
        Modal.show('#sent');
        showThanks();
        location.hash = '';
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
                $('.counter .number').text(numberWithCommas(res.count));
            }
        });
    }

    fetchPetitionCount();

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

});
