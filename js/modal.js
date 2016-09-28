const $ = require('./vendor/jquery.min');

const Modal = {
    show: function(modal) {
        var $modal = $(modal);

        $modal.css({
            display: 'table',
        });

        setTimeout(function() {
            $modal.removeClass('invisible');
        }, 50);
    },

    hide: function(modal) {
        var $modal = $(modal);

        $modal.addClass('invisible');

        setTimeout(function() {
            $modal.css({
                display: 'none',
            });
        }, 400);
    },

    wire: function(modal) {
        var $modal = $(modal);

        if ($modal.length === 0) {
            return;
        }

        $modal.find('.close').on('click', function(e) {
            e.preventDefault();

            Modal.hide(modal);
        });

        $modal.find('.gutter').on('click', function(e) {
            if (e.target !== e.currentTarget) {
                return;
            }

            e.preventDefault();

            Modal.hide(modal);
        });
    },

    setup: function() {
        $('.overlay').each(function(i, el) {
            Modal.wire(el);
        });

        // Update max-height on resize
        $(window).off('resize', Modal.updateMaxHeight).on('resize', Modal.updateMaxHeight);
        Modal.updateMaxHeight();
    },

    updateMaxHeight: function() {
        $('.modal').css({
            'max-height': innerHeight + 'px',
        });
    },
};

module.exports = Modal;
