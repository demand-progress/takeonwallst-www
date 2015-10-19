var StaticKit = {};

StaticKit.copy = {
    zipErrorAlert: 'Please enter a valid ZIP code.',
};

StaticKit.query = (function () {
    var pairs = location.search.slice(1).split('&');

    var result = {};
    pairs.forEach(function (pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
})();

// Loading source
if (!StaticKit.query.source) {
    try {
        StaticKit.query.source = sessionStorage.savedSource;
    } catch (e) {}
}

// Defaulting source
if (!StaticKit.query.source) {
    StaticKit.query.source = 'website';
}

StaticKit.query.source = StaticKit.query.source.split(/[^\w-]/)[0] || '';
StaticKit.query.cleanedSource = StaticKit.query.source.split(/[^\w]/)[0];

// Saving source
try {
    sessionStorage.savedSource = StaticKit.query.source;
} catch (e) {}

StaticKit.fillForm = function (params) {
    for (var key in params) {
        var el = document.querySelector('[name="' + key + '"]');
        if (el) {
            el.value = params[key];
        }
    }
}

if (StaticKit.query.error_zip) {
    StaticKit.fillForm(StaticKit.query);
    var el = document.querySelector('[name="zip"]');
    if (el) {
        el.value = '';
        el.focus();
    }
    setTimeout(function () {
        alert(StaticKit.copy.zipErrorAlert);
    }, 250);
}
