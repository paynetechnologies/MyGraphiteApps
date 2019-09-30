// Header
// Based On: Header -> ContainerElement -> ViewElement
(function (Header, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Header.Render = function (header) {

        // Initialize
        var headerMarkup = '';

        // Sanity Check
        if (Common.IsNotDefined(header.ViewElements) || header.ViewElements.length <= 0) {
            return headerMarkup;
        }

        // Classes for sticky property
        var stickyClass = '';
        var stickyAttribute = '';

        // Check if Footer is sticky
        if (header.Sticky === 'Yes') {
            stickyClass = 'gtc-page-header-sticky';
            stickyAttribute = 'data-header-sticky="true"';
        }

        // Header<, TabIndex@, Class@, Id@, Header>
        headerMarkup = '<header id="PageHeader" data-namespace="Header" class="gtc-page-header ' + stickyClass + '"' + ViewElement.RenderAttributes(header) + ' ' + stickyAttribute + '>';

        // Render Container ViewElements
        headerMarkup += ContainerElement.RenderElements(header);

        // Header</>
        headerMarkup += '</header>';
        return headerMarkup;

    };

} (window.Header = window.Header || {}, window, document, Common, Cache, Events, Velocity));
