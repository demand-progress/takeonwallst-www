// Modules
var $ = require('./vendor/jquery.min');
var each = require('lodash/each');
var reduce = require('lodash/reduce');


var StaticKit = {};

StaticKit.copy = {
    zipErrorAlert: 'Please enter a valid ZIP code.',
};

StaticKit.query = (f => {
    var result = reduce(
        location.search.slice(1).split('&'),
        (result, pair) => {
            pair = pair.split('=');
            result[pair[0]] = decodeURIComponent(pair[1] || '');
            return result;
        },
        {}
    );

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

StaticKit.fillForm = params => {
    each(params, (value, key) => {
        var $el = $('[name="' + key + '"]');
        if ($el.length > 0) {
            $el.val(value);
        }
    });
}

StaticKit.start = f => {
    if (StaticKit.query.error_zip) {
        StaticKit.fillForm(StaticKit.query);

        var $zip = $('[name="zip"]');
        if ($zip.length > 0) {
            $zip
                .val('')
                .focus();
        }

        setTimeout(
            f => alert(StaticKit.copy.zipErrorAlert),
            250
        );
    }
}

module.exports = StaticKit;
