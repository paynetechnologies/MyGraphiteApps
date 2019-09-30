// Icon
// Based On: Icon -> ViewElement
(function (Icon, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Icon.Render = function (icon, isOnField, labelExists) {

        var iconTextMarkup = '';
        if (Common.IsDefined(icon.Symbol)) {
            var iconType = icon.Symbol.split('-')[0];
            if (iconType == 'gtc') {
                iconType += '-icon';
            }
            iconTextMarkup += '<i class="';
            if (isOnField) {
                if (labelExists) {
                    iconTextMarkup += 'gtc-input-custom ';
                }
                else {
                    iconTextMarkup += 'gtc-input-custom-nolabel ';
                }
            }
            iconTextMarkup += 'gtc-icon-styles ' + iconType;
            iconTextMarkup += ' ' + icon.Symbol.toLowerCase() + '"';
            iconTextMarkup += '></i>';
        }
        return iconTextMarkup;

    };

} (window.Icon = window.Icon || {}, window, document, Common, Cache, Events, Velocity));
