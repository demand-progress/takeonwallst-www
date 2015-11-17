const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

function validate(email) {
    email = email.trim();

    if (/ /.test(email)) {
        return false;
    }

    const segments = email.split('.');
    const TLD = segments[segments.length - 1];
    const validTLD = /^[A-z]+$/.test(TLD);
    if (!validTLD) {
        return false;
    }

    if (!emailRegex.test(email)) {
        return false;
    }

    return true;
}

module.exports = {
    validate: validate,
};
