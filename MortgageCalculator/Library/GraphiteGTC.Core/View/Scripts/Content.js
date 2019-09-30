// Content
// Based On: Content -> ContainerElement -> ViewElement
(function (Content, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Content.Render = function (content, region) {

        // Classes for sticky property
        var stickyClass = '';

        // Check if Region is Sticky
        if (Common.IsDefined(region) && region.Sticky === 'Yes') {
            stickyClass = 'gtc-page-content-scrollable';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var contentMarkup = '<div data-namespace="Content" class="gtc-page-content ' + stickyClass + '"' + ViewElement.RenderAttributes(content) + '>';

        // Render Container ViewElements
        contentMarkup += '<div id="PageMainContent" class="gtc-page-maincontent">';
        contentMarkup += ContainerElement.RenderElements(content);
        contentMarkup += '</div>';

        // Render Region
        if (Common.IsDefined(region) && Common.IsDefined(region.Side)) {
            contentMarkup += Region.Render(region);
        }

        // Add Back To Top Link
        if (!Common.IsModal()) {
            contentMarkup += BackToTop.Render();
        }

        // Div</>
        contentMarkup += '</div>';
        return contentMarkup;

    };

} (window.Content = window.Content || {}, window, document, Common, Cache, Events, Velocity));
