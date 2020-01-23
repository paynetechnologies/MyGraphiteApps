// Rich Text Display Item
// Based On: RichTextDisplayItem -> DisplayItem -> ViewElement
(function (RichTextDisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var defaultSanitizationPolicy;

    // Public Methods
    RichTextDisplayItem.Render = function (richTextDisplayItem, displayDetail) {

        var className = '';
        if (Common.IsDefined(richTextDisplayItem.ItemSpan)) {
            className = ' gtc-columns-' + richTextDisplayItem.ItemSpan;
        }

        // Li<, TabIndex@, Class@, Id@, </li>
        var displayItemMarkup = '<li data-namespace="RichTextDisplayItem" class="gtc-displaydetail-column' + className + ' gtc-richtextdisplayitem"' + ViewElement.RenderAttributes(richTextDisplayItem) + '>';

        if (Common.IsDefined(richTextDisplayItem.Label) && richTextDisplayItem.Label.length > 0) {
            // Span<>, Label, Span</>
            displayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations and Label masking
            var dateRegex = new RegExp(/\/Date\((-?\d+)\)\//gi);
            var isDate = dateRegex.test(richTextDisplayItem.Label);
            if (!isDate) {
                displayItemMarkup += ' data-translate="' + richTextDisplayItem.Label + '"';
            }

            if (isDate && Common.IsDefined(richTextDisplayItem.Mask)) {
                var formatResult = Mask.Format(richTextDisplayItem.Label, Mask.BuildMaskingOptions(richTextDisplayItem.Mask));
                displayItemMarkup += '>' + formatResult.Text + '</span>';
            }
            else {
                displayItemMarkup += '>' + Common.TranslateKey(richTextDisplayItem.Label) + '</span>';
            }
        }

        // Sanity Check
        richTextDisplayItem.Value = (Common.IsNotDefined(richTextDisplayItem.Value)) ? '' : richTextDisplayItem.Value;

        // Span<>, Value, Span</>
        displayItemMarkup += '<span id="' + richTextDisplayItem.Name + 'DisplayArea" class="gtc-displaydetail-item">';
        var decodedHtml = '';
        if (Common.IsDefined(window['html'])) {
            defaultSanitizationPolicy = html.makeTagPolicy();
            decodedHtml = html.sanitizeWithPolicy(Common.Decode(richTextDisplayItem.Value), CustomSanitizationPolicy);
        }
        else if (Common.IsDefined(window.parent['html'])) {
            defaultSanitizationPolicy = window.parent.html.makeTagPolicy();
            decodedHtml = window.parent.html.sanitizeWithPolicy(Common.Decode(richTextDisplayItem.Value), CustomSanitizationPolicy);
        }
        displayItemMarkup += decodedHtml;
        displayItemMarkup += '</span>';

        // Li</>
        displayItemMarkup += '</li>';
        return displayItemMarkup;

    };

    RichTextDisplayItem.UpdateValue = function (displayItem, richTextValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        richTextValue = (Common.IsNotDefined(richTextValue)) ? '' : richTextValue;

        // Set Value
        var displayItemId = displayItem.id;
        var displayArea = Common.Get(displayItemId + 'DisplayArea');
        if (Common.IsNotDefined(displayArea)) {
            displayArea = Common.Query('#' + displayItemId + 'DisplayArea', displayItem);
        }
        Velocity(displayArea, { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var decodedHtml = '';
                if (Common.IsDefined(window['html'])) {
                    defaultSanitizationPolicy = html.makeTagPolicy();
                    decodedHtml = html.sanitizeWithPolicy(Common.Decode(richTextValue), CustomSanitizationPolicy);
                }
                else if (Common.IsDefined(window.parent['html'])) {
                    defaultSanitizationPolicy = window.parent.html.makeTagPolicy();
                    decodedHtml = window.parent.html.sanitizeWithPolicy(Common.Decode(richTextValue), CustomSanitizationPolicy);
                }
                displayArea.innerHTML = decodedHtml;

                // Show updated content
                Velocity(displayArea, 'reverse',
                    function () {
                        Common.RemoveOpacity(displayArea);
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

    // Private Methods
    function CustomSanitizationPolicy (tagName, attribs) {

        // Check for imgs with a base64 data string
        if (tagName == 'img') {
            var srcIndex = attribs.indexOf('src');
            if (srcIndex != -1) {
                var dataValue = attribs[srcIndex + 1];
                if (dataValue.indexOf('data:image/') != -1) {
                    // Still scrub img tag for anything extra
                    var returnObject = defaultSanitizationPolicy(tagName, attribs);

                    // Then put base64 data back
                    returnObject.attribs[srcIndex + 1] = dataValue;
                    return returnObject;
                }
            }
        }

        // Always fall back to the default policy
        return defaultSanitizationPolicy(tagName, attribs);

    };

} (window.RichTextDisplayItem = window.RichTextDisplayItem || {}, window, document, Common, Cache, Events, Velocity));
