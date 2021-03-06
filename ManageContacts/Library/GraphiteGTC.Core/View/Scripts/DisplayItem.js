// Display Item
// Based On: DisplayItem -> ViewElement
(function (DisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    DisplayItem.Render = function (displayItem, displayDetail) {

        var className = '';
        if (Common.IsDefined(displayItem.ItemSpan)) {
            className = ' gtc-columns-' + displayItem.ItemSpan;
        }

        // Li<, TabIndex@, Class@, @Data-TranslateContent, Id@
        var displayItemMarkup = '<li data-namespace="DisplayItem" class="gtc-displaydetail-column' + className + '" data-translatecontent="' + displayItem.TranslateContent + '"' + ViewElement.RenderAttributes(displayItem);

        // Data-Mask@
        if (Common.IsDefined(displayItem.Mask)) {
            displayItemMarkup += ' data-mask="' + displayItem.Mask + '"';
        }

        // Li>
        displayItemMarkup += '>';

        // Color
        if (Common.IsDefined(displayItem.TextColor)) {
            displayItemMarkup += '<style>';
            displayItemMarkup += '#' + displayDetail.Name + ' #' + displayItem.Name + ' > .gtc-displaydetail-item { ';
            if (Common.IsDefined(displayItem.TextColor)) {
                displayItemMarkup += 'color: ' + Colors.ProcessValue(displayItem.TextColor, false, null) + ';';
            }
            displayItemMarkup += ' }';
            displayItemMarkup += '</style>';
        }

        if (Common.IsDefined(displayItem.Label) && displayItem.Label.length > 0) {
            // Span<>, Label, Span</>
            displayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations and Label masking
            var dateRegex = new RegExp(/\/Date\((-?\d+)\)\//gi);
            var isDate = dateRegex.test(displayItem.Label);
            if (!isDate) {
                displayItemMarkup += ' data-translate="' + displayItem.Label + '"';
            }

            if (isDate && Common.IsDefined(displayItem.Mask)) {
                var formatResult = Mask.Format(displayItem.Label, Mask.BuildMaskingOptions(displayItem.Mask));
                displayItemMarkup += '>' + formatResult.Text + '</span>';
            }
            else {
                displayItemMarkup += '>' + Common.TranslateKey(displayItem.Label) + '</span>';
            }
        }

        // Sanity Check
        displayItem.Value = (Common.IsNotDefined(displayItem.Value)) ? '' : displayItem.Value;

        // Mask
        var displayValue = Common.Decode(displayItem.Value);
        if (Common.IsDefined(displayItem.Mask) && displayItem.Value.length > 0) {
            var formatResult = Mask.Format(displayItem.Value, Mask.BuildMaskingOptions(displayItem.Mask), true);
            displayValue = formatResult.Text;
        }

        // Span<>, Value, Span</>
        displayItemMarkup += '<span class="gtc-displaydetail-item"';
        if (displayItem.TranslateContent == 'Yes') {
            displayItemMarkup += ' data-translate="' + displayValue + '">' + Common.TranslateKey(displayValue) + '</span>';
        }
        else {
            displayItemMarkup += '>' + displayValue + '</span>';
        }

        // Li</>
        displayItemMarkup += '</li>';
        return displayItemMarkup;

    };

    DisplayItem.UpdateValue = function (displayItem, fieldValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        fieldValue = (Common.IsNotDefined(fieldValue)) ? '' : fieldValue;

        // Initialize
        var spanValue = Common.Query('.gtc-displaydetail-item', displayItem);

        // Check for Mask, Set data-translate (for value), or Decode Value
        var maskString = Common.GetAttr(displayItem, 'data-mask');
        if (Common.IsString(maskString) && maskString.length > 0 && fieldValue.length > 0) {
            formatResult = Mask.Format(fieldValue, Mask.BuildMaskingOptions(maskString), true);
            fieldValue = formatResult.Text;
        }
        else {
            if (Common.GetAttr(displayItem, 'data-translatecontent') == 'Yes') {
                Common.SetAttr(spanValue, 'data-translate', fieldValue);
                fieldValue = Common.Decode(Common.TranslateKey(fieldValue));
            }
            else {
                fieldValue = Common.Decode(fieldValue);
            }
        }

        // Set Value
        Velocity(spanValue, { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                spanValue.textContent = fieldValue;
                Velocity(spanValue, 'reverse',
                    function () {
                        Common.RemoveOpacity(spanValue);
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

    DisplayItem.UpdateColor = function (displayItem, colorValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Set Color
        var spanValue = Common.Query('.gtc-displaydetail-item', displayItem);
        Velocity(spanValue, { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                spanValue.style.color = Colors.ProcessValue(colorValue, false, null);
                Velocity(spanValue, 'reverse',
                    function () {
                        Common.RemoveOpacity(spanValue);
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

} (window.DisplayItem = window.DisplayItem || {}, window, document, Common, Cache, Events, Velocity));
