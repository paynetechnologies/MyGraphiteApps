// Rich Text Display
// Based On: RichTextDisplay -> ViewElement
(function (RichTextDisplay, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var defaultSanitizationPolicy;

    // Public Methods
    RichTextDisplay.Render = function (richTextDisplay) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var richTextDisplayMarkup = '<div class="gtc-richtextdisplay" data-namespace="RichTextDisplay"' + ViewElement.RenderAttributes(richTextDisplay) + '>';

        // Value
        if (Common.IsDefined(richTextDisplay.Value)) {
            var decodedHtml = '';
            if (Common.IsDefined(window['html'])) {
                defaultSanitizationPolicy = html.makeTagPolicy();
                decodedHtml = html.sanitizeWithPolicy(Common.Decode(richTextDisplay.Value), CustomSanitizationPolicy);
            }
            else if (Common.IsDefined(window.parent['html'])) {
                defaultSanitizationPolicy = window.parent.html.makeTagPolicy();
                decodedHtml = window.parent.html.sanitizeWithPolicy(Common.Decode(richTextDisplay.Value), CustomSanitizationPolicy);
            }
            richTextDisplayMarkup += decodedHtml;
        }

        // Div</>
        richTextDisplayMarkup += '</div>';
        return richTextDisplayMarkup;

    };

    RichTextDisplay.UpdateValue = function (richTextDisplay, richTextValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        richTextValue = (Common.IsNotDefined(richTextValue)) ? '' : richTextValue;

        // Set Value
        Velocity(richTextDisplay, 'slideUp', 'slow',
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
                richTextDisplay.innerHTML = decodedHtml;

                // Show updated content
                Velocity(richTextDisplay, 'slideDown', 'slow',
                    function () {
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

} (window.RichTextDisplay = window.RichTextDisplay || {}, window, document, Common, Cache, Events, Velocity));
