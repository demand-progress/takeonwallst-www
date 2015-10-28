(function() { // Begin closure




// Share text
var DOMAIN = "fightbigmoney.com";
var TWEET_TEXT = "I just called on the presidential candidates to lay out a concrete plan to #FightBigMoney in politics! Join here: http://" + DOMAIN + "/?source=${source}";
var EMAIL_SUBJECT = "Sign this petition to fight big money in politics?";
var EMAIL_BODY = "Hi,\
\n\n\
I just signed the petition telling the presidential candidates to lay out a concrete, serious plan to fight big money in politics.\
\n\n\
The only way we'll make progress is if candidates know the American people are demanding a change. Could you sign, too?\
\n\n\
http://www." + DOMAIN + "/?source=${source}\
\n\n\
Thanks!";





// Check for outdated browsers
var isIE = navigator.userAgent.match(/MSIE (\d+)\./);
if (isIE) {
    var version = +isIE[1];
    if (version < 10) {
        alert('Unfortunately your browser, Internet Explorer ' + version + ', is not supported.\nPlease visit the site with a modern browser like Firefox or Chrome.\nThanks!');
    }
}

if (navigator.userAgent.match(/Android 2\.3/)) {
    alert('Unfortunately your browser, Android 2.3, is not supported.\nPlease visit the site with a modern browser like Firefox or Chrome.\nThanks!');
}



// Fill in dynamic form fields
document.querySelector('[name=action_user_agent]').value = navigator.userAgent;
document.querySelector('[name=source]').value = StaticKit.query.source;
document.querySelector('[name=url]').value = location.href;



var requiredFields = [
    'email',
    'postcode',
];

document.querySelector('.email_signup form').addEventListener('submit', function(e) {
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];

        if (!document.getElementById(field).value) {
            e.preventDefault();
            alert('Please enter your ' + field.replace(/_/g, ' ') + '.');
            return document.getElementById(field).focus();
        }
    }

    // document.activeElement.blur();
    // var thanks = document.getElementById('thanks');
    // document.querySelector('form button').setAttribute('disabled', true);
    // thanks.style.display = 'block';
    // thanks.clientWidth;
    // thanks.style.opacity = 1;

    // // Send to Queue
    // var xhr1 = new XMLHttpRequest();
    // xhr1.onreadystatechange = function() {
    //     if (xhr1.readyState === 4) {
    //         // console.log('response:', xhr1.response);
    //     }
    // };
    // xhr1.open('post', 'https://queue.fightforthefuture.org/action', true);
    // xhr1.send(data);

    // modal_show('thank-you');
    // document.querySelector('input[type=tel]').focus();
}, false);

function modal_show(id) {
    var overlayNode = document.getElementById(id);
    overlayNode.style.display = 'table';
    setTimeout(function() {
        overlayNode.className = overlayNode.className.replace(/ ?invisible ?/, ' ');
    }, 50);
};

function modal_hide(id) {
    var overlayNode = document.getElementById(id);
    overlayNode.className += 'invisible';
    setTimeout(function() {
        overlayNode.style.display = 'none';
    }, 400);
}

var bindModalEvents = function(modal, permanent) {
    modal = document.getElementById(modal);

    if (!modal)
        return;

    var closeButton = modal.querySelector('.modal .close');

    if (permanent) {
        closeButton.parentElement.removeChild(closeButton);
        return;
    }

    closeButton.addEventListener('click', function(e) {
        e.preventDefault();
        modal_hide(modal.id);
    }, false);

    modal.querySelector('.gutter').addEventListener('click', function(e) {
        if (e.target === e.currentTarget) {
            e.preventDefault();
            modal_hide(modal.id);
        }
    }, false);
}
bindModalEvents('confirmed', true);
bindModalEvents('goodbye_modal', true);
bindModalEvents('letter');
bindModalEvents('sent');

var fb = document.querySelectorAll('a.facebook');
for (var i = 0; i < fb.length; i++) {
    fb[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.open(
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(DOMAIN + '/?source=' + StaticKit.query.cleanedSource + '-fbshare')
        );
    }, false);
}

var tws = document.querySelectorAll('a.twitter');
for (var i = 0; i < tws.length; i++) {
    tws[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.open(
            'https://twitter.com/intent/tweet?text=' +
            encodeURIComponent(
                TWEET_TEXT.replace('${source}', StaticKit.query.cleanedSource + '-twittershare')
            )
        );
    }, false);
}

var ems = document.querySelectorAll('a.email');
for (var i = 0; i < ems.length; i++) {
    ems[i].addEventListener('click', function(e) {
        e.preventDefault();

        window.location.href =
            'mailto:?subject=' + encodeURIComponent(EMAIL_SUBJECT) +
            '&body=' + encodeURIComponent(
                EMAIL_BODY.replace('${source}', StaticKit.query.cleanedSource + '-emailshare')
            );
    }, false);
}

document.querySelector('a.the-letter').addEventListener('click', function(e) {
    e.preventDefault();
    modal_show('letter');
});

document.querySelector('button.add-your-name').addEventListener('click', function(e) {
    e.preventDefault();
    location.hash = 'add-your-name';
});

function removeNode(target) {
    var node = document.querySelector(target);
    node.parentElement.removeChild(node);
}

var disclaimer = document.querySelector('.disclaimer');

var resizeTimeout = false;
window.addEventListener('resize', function(e) {
    resizeTimeout = setTimeout(onResize, 300);
}, false);

function onResize() {
    var modals = document.getElementsByClassName('modal');
    for (var i = 0; i < modals.length; i++) {
        modals[i].style.maxHeight = innerHeight + 'px';
    }
}

if (window.location.href.indexOf('dropoff=1') != -1) {
    window.location.href = '#dropoff';
}

function directOpenCallModal() {
    document.getElementById('call_header').textContent = 'Enter your phone number and we\'ll connect you.';
    modal_show('call_tool');
}
if (window.location.href.indexOf('call=1') != -1) {
    directOpenCallModal()
}

// Hashes
if (location.hash === '#confirmed') {
    modal_show('confirmed');
    showThanks();
    location.hash = '';
} else if (location.hash === '#sent') {
    modal_show('sent');
    showThanks();
    location.hash = '';
}

function showThanks() {
    var thanks = document.getElementById('thanks');
    document.querySelector('form button').setAttribute('disabled', true);
    thanks.style.display = 'block';
    thanks.style.opacity = 1;
}

function shuffleLogos() {
    // Get array of logos
    var logos = Array.prototype.slice.call(document.querySelectorAll('.logos .clamp a'));

    // Randomize order
    logos.forEach(function (logo) {
        logo.randomValue = Math.random();
    });

    logos.sort(function (a, b) {
        return a.randomValue - b.randomValue;
    });

    // Re-append all logos
    logos.forEach(function (logo) {
        var parent = logo.parentElement;
        parent.removeChild(logo);
        parent.appendChild(logo);
    });
}

function fetchActionKitCount() {
    // Embed https://act.demandprogress.org/progress/fight-big-money?callback=onActionKitCount
    var script = document.createElement('script');
    script.src = 'https://act.demandprogress.org/progress/fight-big-money?callback=onActionKitCount';
    document.head.appendChild(script);
}

function onActionKitCount(data) {
    createCounter(data.total.actions);
}
window.onActionKitCount = onActionKitCount;

function createCounter(size) {
    var wrapperEl = document.querySelector('.action-wrapper');
    wrapperEl.className += ' counter-is-visible';

    var counterDestinationLength = size.toString().length;
    var counterStartingNumber = Math.pow(10, counterDestinationLength - 1);
    var counter = new flipCounter('flip-counter', {
        value: counterStartingNumber,

        // Sizing
        bFH: 40,
        bOffset: 200,
        fW: 30,
        tFH: 20,
    });
    counter.incrementTo(size, 1.6, 120);
    var el = document.querySelector('#flip-counter');
    el.style.width = counterDestinationLength * 30 + Math.floor((counterDestinationLength - 1) / 3) * 7 + 'px';
}

fetchActionKitCount();
// shuffleLogos();



})(); // End closure
