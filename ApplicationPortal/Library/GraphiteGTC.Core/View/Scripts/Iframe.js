// Iframe
// Based On: Iframe -> ViewElement
(function (Iframe, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Iframe.Render = function (iframe) {

        // Style/Class
        var iframeClassName = 'gtc-iframe-' + iframe.Name.toLowerCase();
        var iframeClassMarkup = '<style>.' + iframeClassName + ' {';
        if (iframe.FillScreen == "Yes") {
            iframeClassMarkup += 'height: 100%;width: 101%;position: absolute;left: 0px;top: 0px;';
        }
        else {
            var dimensionStyle = StyleHelper.BuildDimensionStyle(iframe.Dimension);
            if (Common.IsDefined(dimensionStyle)) {
                if (Common.IsDefined(dimensionStyle.Height)) {
                    iframeClassMarkup += 'height:' + dimensionStyle.Height;
                }
                if (Common.IsDefined(dimensionStyle.Width)) {
                    iframeClassMarkup += 'width:' + dimensionStyle.Width;
                }
            }
        }
        iframeClassMarkup += ' }';
        iframeClassMarkup += '</style>';

        // Initialize
        var iframeMarkup = iframeClassMarkup + '<iframe class="' + iframeClassName + '"';

        // Url Prefix and Url
        if (Common.IsDefined(iframe.Prefix) && Common.IsDefined(iframe.Url)) {
            iframeMarkup += ' src="' + iframe.Prefix + iframe.Url + '"';
        }

        // Close and Return markup
        iframeMarkup += '></iframe>';
        return iframeMarkup;

    };

} (window.Iframe = window.Iframe || {}, window, document, Common, Cache, Events, Velocity));