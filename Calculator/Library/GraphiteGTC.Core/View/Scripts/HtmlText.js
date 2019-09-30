// Html Text
// Based On: HtmlText -> ViewElement
(function (HtmlText, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    HtmlText.Render = function (htmlText) {

        var extraClassing = '';
        if (Common.IsDefined(htmlText.Tooltip)) {
            extraClassing = ' gtc-tooltip gtc-link-tooltip';
        }
        var htmlTextMarkup = '<span data-namespace="HtmlText" class="gtc-htmltext' + extraClassing + '"' + ViewElement.RenderAttributes(htmlText);

        // Data-Mask@
        var maskingOptions;
        if (Common.IsDefined(htmlText.Mask)) {
            // Mask Options
            maskingOptions = MaskField.MaskingOptions[htmlText.Mask];
            if (Common.IsNotDefined(maskingOptions)) {
                maskingOptions = Mask.BuildMaskingOptions(htmlText.Mask);
                MaskField.MaskingOptions[htmlText.Mask] = maskingOptions;
            }
            htmlTextMarkup += ' data-mask=\'' + JSON.stringify(maskingOptions) + '\'';
        }

        // Tooltip
        if (Common.IsDefined(htmlText.Tooltip)) {
            htmlTextMarkup += ' data-translate="[data-tooltip]' + htmlText.Tooltip + ';"';
            htmlTextMarkup += ' data-tooltip="' + Common.TranslateKey(htmlText.Tooltip) + '"';
        }

        // Masking/Translations (Don't translate if masking is defined)
        var htmlTextString = htmlText.TextString || '';
        if (Common.IsDefined(htmlText.Mask)) {
            // Format Value
            if (Common.IsObject(maskingOptions)) {
                var formatResult = Mask.Format(htmlTextString, maskingOptions);
                htmlTextString = formatResult.Text;
            }
        }
        htmlTextMarkup += '>';

        // Color
        if (Common.IsDefined(htmlText.TextColor)) {
            htmlTextMarkup += '<style>';
            htmlTextMarkup += '#' + htmlText.Name + ' { ';
            htmlTextMarkup += 'color: ' + Colors.ProcessValue(htmlText.TextColor, false, null) + ' !important;';
            htmlTextMarkup += ' }';
            htmlTextMarkup += '</style>';
        }
        htmlTextMarkup += '<span data-translate="' + htmlTextString + '">' + Common.TranslateKey(htmlTextString) + '</span></span>';

        // Return markup
        return htmlTextMarkup;

    };

    HtmlText.UpdateValue = function (htmlText, textValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        textValue = (Common.IsNotDefined(textValue)) ? '' : textValue;

        // Check for Mask
        var maskingOptions = Common.GetAttr(htmlText, 'data-mask');
        if (Common.IsString(maskingOptions)) {
            if (maskingOptions.length > 0 && textValue.length > 0) {
                formatResult = Mask.Format(textValue, JSON.parse(maskingOptions), true);
                textValue = formatResult.Text;
            }
        }

        // Set Value
        Common.SetAttr(htmlText, 'data-translate', textValue);
        Velocity(htmlText, { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                htmlText.textContent = Common.TranslateKey(textValue);
                Velocity(htmlText, 'reverse',
                    function () {
                        Common.RemoveOpacity(htmlText);
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

    HtmlText.ReplaceElement = function (htmlText, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);
        Velocity(htmlText, { 'opacity': 0 }, 'slow',
            function () {
                // Build Markup
                var viewElement = viewElements[0];
                var htmlTextMarkup = HtmlText.Render(viewElement);
                Common.InsertHTMLString(htmlText, Common.InsertType.After, htmlTextMarkup);
                Common.Remove(htmlText);
                htmlText = Common.Get(viewElement.Name);
                htmlText.style.opacity = '0';

                // Show new HtmlText
                Velocity(htmlText, { 'opacity': 1 }, 'slow',
                    function () {
                        Common.RemoveOpacity(htmlText);
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

} (window.HtmlText = window.HtmlText || {}, window, document, Common, Cache, Events, Velocity));
