// Navigation
(function (Navigation, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Navigation.RenderAttributes = function (navigation) {

        var navigationMarkup = '';
        if (Common.IsDefined(navigation)) {
            // Href@
            if (Common.IsDefined(navigation.View)) {
                navigationMarkup += ' href="' + navigation.View + '"';
            }

            // UiParameters Attribute
            var uiParameters = null;
            if (Common.IsDefined(navigation.UiParameters)) {
                uiParameters = JSON.stringify(navigation.UiParameters);
            }

            // Data-OnLoad@ - Quotes in single since JSON has double quotes
            navigationMarkup += ' data-load=\'' + uiParameters + '\'';
        }
        return navigationMarkup;

    };

} (window.Navigation = window.Navigation || {}, window, document, Common, Cache, Events, Velocity));
