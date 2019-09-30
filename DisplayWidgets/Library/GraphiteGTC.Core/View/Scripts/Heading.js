// Heading
// Based On: Heading -> ViewElement
(function (Heading, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Heading.Render = function (heading) {

        // Build classes
        var fontStyleClassName = '';
        var bottomBorderClassName = '';
        if (Common.IsDefined(heading.Font)) {
            fontStyleClassName = 'gtc-heading-' + heading.Name.toLowerCase();
        }
        if (heading.AppendLine == 'Yes') {
            bottomBorderClassName = 'gtc-heading-bottom-border';
        }

        var headingMarkup = '';
        if (Common.IsDefined(heading.Font)) {
            headingMarkup += '<style>';
            headingMarkup += '.' + fontStyleClassName + ' { ';
            if (Common.IsDefined(heading.Font.Color)) {
                headingMarkup += 'color: ' + Colors.ProcessValue(heading.Font.Color, false, null) + ';';
            }
            if (Common.IsDefined(heading.Font.Size)) {
                headingMarkup += 'font-size: ' + heading.Font.Size + heading.Font.Scale + ';';
            }
            if (Common.IsDefined(heading.Font.Weight)) {
                headingMarkup += 'font-weight: ' + heading.Font.Weight.toLowerCase() + ';';
            }
            if (Common.IsDefined(heading.Font.LineSpacing)) {
                headingMarkup += 'line-height: ' + heading.Font.LineSpacing + 'px;';
            }
            if (Common.IsDefined(heading.Font.LetterSpacing)) {
                headingMarkup += 'letter-spacing: ' + heading.Font.LetterSpacing + 'px;';
            }
            headingMarkup += ' }';
            headingMarkup += '</style>';
        }

        // Default sizing or you just get hnull
        var sizing = heading.Sizing;
        if (Common.IsNotDefined(heading.Sizing)) {
            sizing = '1';
        }

        // Heading<, TabIndex@, Class@, Id@, Heading>
        headingMarkup += '<h' + sizing + ' class="gtc-heading gtc-heading-' + sizing + ' gtc-page-theme-color ' + fontStyleClassName + ' ' + bottomBorderClassName + '" data-namespace="Heading"' + ViewElement.RenderAttributes(heading);

        // Translations
        if (Common.IsDefined(heading.TextString)) {
            headingMarkup += ' data-translate="' + heading.TextString + '"';
        }
        headingMarkup += '>';

        // Text
        headingMarkup += Common.TranslateKey(heading.TextString);

        // Heading</>
        headingMarkup += '</h' + sizing + '>';

        // Return markup
        return headingMarkup;

    };

    Heading.UpdateValue = function (heading, textValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        textValue = (Common.IsNotDefined(textValue)) ? '' : Common.Decode(textValue);

        // Check for Mask
        var maskingOptions = Common.GetAttr(heading, 'data-mask');
        if (Common.IsString(maskingOptions)) {
            if (maskingOptions.length > 0 && textValue.length > 0) {
                formatResult = Mask.Format(textValue, JSON.parse(maskingOptions), true);
                textValue = formatResult.Text;
            }
        }

        // Set Value
        Common.SetAttr(heading, 'data-translate', textValue);
        Velocity(heading, { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                heading.textContent = Common.TranslateKey(textValue);
                Velocity(heading, 'reverse',
                    function () {
                        Common.RemoveOpacity(heading);
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

} (window.Heading = window.Heading || {}, window, document, Common, Cache, Events, Velocity));
