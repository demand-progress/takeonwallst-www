(function() { // Begin closure





// Organizations
var organizations = [
    {
        "disclaimer": true,
        "id": "dp",
        "isPooling": true,
        "title": "Demand Progress",
    },

    {
        "disclaimer": "<a href=\"http://www.fightforthefuture.org/\" target=\"_blank\">Fight for the Future</a> will contact you about future campaigns. <a href=\"http://www.fightforthefuture.org/privacy/\" target=\"_blank\">Privacy Policy</a>.</p>",
        "id": "fftf",
        "isPooling": false,
        "title": "Fight for the Future",
    },

    {
        "disclaimer": true,
        "id": "dk",
        "isPooling": true,
        "title": "Daily Kos",
    },

    {
        "disclaimer": true,
        "id": "om",
        "isPooling": true,
        "title": "OpenMedia",
    },

    {
        "disclaimer": true,
        "id": "cc",
        "isPooling": true,
        "title": "Color of Change",
    },
];

var ref = location.search.match(/ref=([\w-]+)/);
var org;
if (ref) {
    for (var i = 0; i < organizations.length; i++) {
        if (ref[1] === organizations[i].id) {
            org = organizations[i];
            break;
        }
    }
}

var maverick = false;
if (!org) {
    maverick = true;
    org = organizations[0];
}



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
document.querySelector('[name=source]').value = org.id;
document.querySelector('[name=url]').value = location.href;



var requiredFields = [
    'first_name',
    'email',
    'street_address',
    'postcode',
];

document.querySelector('.email_signup form').addEventListener('submit', function(e) {
    var eligible = document.querySelector('[name=eligible]');
    if (!eligible.checked) {
        e.preventDefault();
        return alert('Signers must be citizens or permanent residents of the United States, who are 18 years of age or older. You can also help by sharing the page. Thanks for your support!');
    }

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

var bindModalEvents = function(modal) {
    modal = document.getElementById(modal);
    if (!modal)
        return;
    modal.querySelector('.gutter').addEventListener('click', function(e) {
        if (e.target === e.currentTarget) {
            e.preventDefault();
            modal_hide(modal.id);
        }
    }.bind(this), false);

    modal.querySelector('.modal .close').addEventListener('click', function(e) {
        e.preventDefault();
        modal_hide(modal.id);
    }.bind(this), false);
}
bindModalEvents('share_modal');
bindModalEvents('call_tool');
bindModalEvents('call_tool_script');
bindModalEvents('letter');
bindModalEvents('thank-you');
bindModalEvents('drop_in');

var fb = document.querySelectorAll('a.facebook');
for (var i = 0; i < fb.length; i++) {
    fb[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fnetneutralitybrief.com%2F%3Fref%3D' + org.id);
    }, false);
}

var tws = document.querySelectorAll('a.twitter');
for (var i = 0; i < tws.length; i++) {
    tws[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(TWEET_TEXT) + org.id);
    }, false);
}

var ems = document.querySelectorAll('a.email');
for (var i = 0; i < ems.length; i++) {
    ems[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mailto:?subject=' + encodeURIComponent(EMAIL_SUBJECT) + '&body=http%3A%2F%2Fnetneutralitybrief.com%2F';
    }, false);
}

/*
document.querySelector('a.open-call-tool').addEventListener('click', function(e) {
    e.preventDefault();

    modal_show('call_tool');
});
*/

document.querySelector('.call_tool a.share').addEventListener('click', function(e) {
    e.preventDefault();

    modal_hide('call_tool');
    modal_show('share_modal');
});

document.querySelector('.call_tool form').addEventListener('submit', function(e) {
    e.preventDefault();

    var zip = document.getElementById('postcode').value || '';

    var phone = document.querySelector('input[type=tel]').value.replace(/[^\d]/g, '');

    if (phone.length < 10) {
        return alert('Please enter your 10 digit phone number.');
    }

    if (org.newCallTool)
        var url = 'https://call-congress.fightforthefuture.org/create?campaignId=endsurveillance&userPhone=' + phone + '&zipcode=' + zip;
    else
        var url = 'https://dp-call-congress.herokuapp.com/create?campaignId=sunsetthepatriotact&userPhone=' + phone + '&zipcode=' + zip;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log(xhr.response);
        }
    };
    xhr.open('get', url, true);
    xhr.send();

    modal_hide('call_tool');
    modal_show('call_tool_script');
}, false);

function removeNode(target) {
    var node = document.querySelector(target);
    node.parentElement.removeChild(node);
}

var disclaimer = document.querySelector('.disclaimer');
if (org.isPooling) {
    if (org.disclaimer === false) {
        removeNode('.disclaimer');
    }
} else {
    removeNode('.squaredFour.pooling');
    document.querySelector('.disclaimer').innerHTML = org.disclaimer;
}

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



})(); // End closure
