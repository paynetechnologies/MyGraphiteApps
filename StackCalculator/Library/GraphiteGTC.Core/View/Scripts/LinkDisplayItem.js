// Link Display Item
// Based On: LinkDisplayItem -> DisplayItem -> ViewElement
(function (LinkDisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    LinkDisplayItem.Render = function (linkDisplayItem, displayDetail) {

        var className = '';
        if (Common.IsDefined(linkDisplayItem.ItemSpan)) {
            className = ' gtc-columns-' + linkDisplayItem.ItemSpan;
        }

        // Li<, TabIndex@, Class@, Id@
        var linkDisplayItemMarkup = '<li data-namespace="LinkDisplayItem" class="gtc-linkdisplayitem gtc-displaydetail-column' + className + '"' + ViewElement.RenderAttributes(linkDisplayItem);

        // Data-Mask@
        if (Common.IsDefined(linkDisplayItem.Mask)) {
            linkDisplayItemMarkup += ' data-mask="' + linkDisplayItem.Mask + '"';
        }

        // Li>
        linkDisplayItemMarkup += '>';

        if (Common.IsDefined(linkDisplayItem.Label) && linkDisplayItem.Label.length > 0) {
            // Span<>, Label, Span</>
            linkDisplayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations and Label masking
            var dateRegex = new RegExp(/\/Date\((-?\d+)\)\//gi);
            var isDate = dateRegex.test(linkDisplayItem.Label);
            if (!isDate) {
                linkDisplayItemMarkup += ' data-translate="' + linkDisplayItem.Label + '"';
            }

            if (isDate && Common.IsDefined(linkDisplayItem.Mask)) {
                var formatResult = Mask.Format(linkDisplayItem.Label, Mask.BuildMaskingOptions(linkDisplayItem.Mask));
                linkDisplayItemMarkup += '>' + formatResult.Text + '</span>';
            }
            else {
                linkDisplayItemMarkup += '>' + Common.TranslateKey(linkDisplayItem.Label) + '</span>';
            }
        }

        // Span<>
        linkDisplayItemMarkup += '<span class="gtc-displaydetail-item">';

        // Links
        if (Common.IsDefined(linkDisplayItem.Links) && linkDisplayItem.Links.length > 0) {

            // Links
            var link, index = 0, length = linkDisplayItem.Links.length;
            for ( ; index < length; index++) {
                link = linkDisplayItem.Links[index];

                // Id?
                if (Common.IsDefined(displayDetail.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(displayDetail.Id);
                }

                // Li<>, Anchor, Li</>
                linkDisplayItemMarkup += Link.Render(link);
            }

        }

        // Span</>
        linkDisplayItemMarkup += '</span>';

        // Li</>
        linkDisplayItemMarkup += '</li>';
        return linkDisplayItemMarkup;

    };

} (window.LinkDisplayItem = window.LinkDisplayItem || {}, window, document, Common, Cache, Events, Velocity));
