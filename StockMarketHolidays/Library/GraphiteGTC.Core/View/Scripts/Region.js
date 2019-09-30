// Region
// Based On: Region -> ContainerElement -> ViewElement
(function (Region, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Region.Render = function (region) {

        // Attribute for sticky property
        var stickyAttribute = '';

        // Check if region is sticky
        if (region.Sticky === 'Yes') {
            stickyAttribute = 'data-region-sticky="true"';
            Common.AddClass(document.body, 'gtc-body-removescroll');
        }

        // Determine size of region
        var regionSizeClass = "";
        switch (region.Size) {
            case "10":
                regionSizeClass = "gtc-region-10";
                break;
            case "20":
                regionSizeClass = "gtc-region-20";
                break;
            case "30":
                regionSizeClass = "gtc-region-30";
                break;
            case "40":
                regionSizeClass = "gtc-region-40";
                break;
            case "50":
                regionSizeClass = "gtc-region-50";
                break;
            default:
                regionSizeClass = "gtc-region-30";
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var regionMarkup = '<div id="Page' + region.Side + 'Region" data-namespace="Region" class="gtc-page-' + region.Side.toLowerCase() + 'region ' + regionSizeClass + '" data-side="' + region.Side + '"' + ViewElement.RenderAttributes(region) + ' ' + stickyAttribute + '>';

        // Render Container ViewElements
        regionMarkup += ContainerElement.RenderElements(region);

        // Div</>
        regionMarkup += '</div>';
        return regionMarkup;

    };

} (window.Region = window.Region || {}, window, document, Common, Cache, Events, Velocity));
