// Footer
// Based On: Footer -> ContainerElement -> ViewElement
(function (Footer, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Footer.Render = function (footer) {

        // Initialize
        var footerMarkup = '';

        // Classes for sticky property
        var stickyClass = '';
        var stickyAttribute = '';

        // Check if Footer is sticky
        if (footer.Sticky === 'Yes') {
            stickyClass = 'gtc-page-footer-sticky';
            stickyAttribute = 'data-footer-sticky="true"';
        }

        // Sanity Check
        if (Common.IsNotDefined(footer.ViewElements) || footer.ViewElements.length <= 0) {
            return footerMarkup;
        }

        // Footer<, TabIndex@, Class@, Id@, Div>
        footerMarkup = '<footer id="PageFooter" data-namespace="Footer" class="gtc-page-footer ' + stickyClass + '"' + ViewElement.RenderAttributes(footer) + ' ' + stickyAttribute + '>';

        // Render Container ViewElements
        footerMarkup += ContainerElement.RenderElements(footer);

        // Footer</>
        footerMarkup += '<div class="gtc-page-footer-border gtc-page-theme-border-bottom"></div></footer>';
        return footerMarkup;

    };

} (window.Footer = window.Footer || {}, window, document, Common, Cache, Events, Velocity));
