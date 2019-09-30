// Currency Display Item
// Based On: CurrencyDisplayItem -> DisplayItem -> ViewElement
(function (CurrencyDisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    CurrencyDisplayItem.Render = function (currencyDisplayItem, displayDetail) {

        var className = '';
        if (Common.IsDefined(currencyDisplayItem.ItemSpan)) {
            className = ' gtc-columns-' + currencyDisplayItem.ItemSpan;
        }

        // Sanity Check
        currencyDisplayItem.Value = (Common.IsNotDefined(currencyDisplayItem.Value)) ? '' : currencyDisplayItem.Value;

        // Li<, TabIndex@, Class@, Id@
        var currencyDisplayItemMarkup = '<li data-namespace="CurrencyDisplayItem" class="gtc-displaydetail-column' + className + '"' + ViewElement.RenderAttributes(currencyDisplayItem);

        // Currency Details
        var currencyDefiniton = null;
        var currentCurrency = Common.GetStorage('CurrentCurrency');
        if (Common.IsDefined(currentCurrency)) {
            currencyDefiniton = JSON.parse(currentCurrency);
            if (Common.IsDefined(currencyDefiniton)) {
                if (Common.IsNotDefined(currencyDisplayItem.Code)) {
                    currencyDisplayItem.Code = currencyDefiniton.Code;
                    currencyDisplayItem.Symbol = currencyDefiniton.Symbol;
                    currencyDisplayItem.NumberOfDecimalPlaces = currencyDefiniton.NumberOfDecimalPlaces;
                }

                // Data-CurrencyCode@, Data-CurrencySymbol@, Data-CurrencyDecimalPlaces@
                currencyDisplayItemMarkup += ' data-currencycode="' + currencyDisplayItem.Code + '" data-currencysymbol="' + currencyDisplayItem.Symbol + '" data-currencydecimalplaces="' + currencyDisplayItem.NumberOfDecimalPlaces + '"';
            }
        }

        // Data-Mask@
        if (Common.IsDefined(currencyDisplayItem.Mask)) {
            currencyDisplayItemMarkup += ' data-mask="' + currencyDisplayItem.Mask + '"';
        }

        // Li>
        currencyDisplayItemMarkup += '>';

        // Color
        if (Common.IsDefined(currencyDisplayItem.TextColor)) {
            currencyDisplayItemMarkup += '<style>';
            currencyDisplayItemMarkup += '#' + displayDetail.Name + ' #' + currencyDisplayItem.Name + ' > .gtc-displaydetail-item { ';
            if (Common.IsDefined(currencyDisplayItem.TextColor)) {
                currencyDisplayItemMarkup += 'color: ' + Colors.ProcessValue(currencyDisplayItem.TextColor, false, null) + ';';
            }
            currencyDisplayItemMarkup += ' }';
            currencyDisplayItemMarkup += '</style>';
        }

        if (Common.IsDefined(currencyDisplayItem.Label) && currencyDisplayItem.Label.length > 0) {
            // Span<>, Label, Span</>
            currencyDisplayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations and Label masking
            var dateRegex = new RegExp(/\/Date\((-?\d+)\)\//gi);
            var isDate = dateRegex.test(currencyDisplayItem.Label);
            if (!isDate) {
                currencyDisplayItemMarkup += ' data-translate="' + currencyDisplayItem.Label + '"';
            }

            if (isDate && Common.IsDefined(currencyDisplayItem.Mask)) {
                var formatResult = Mask.Format(currencyDisplayItem.Label, Mask.BuildMaskingOptions(currencyDisplayItem.Mask));
                currencyDisplayItemMarkup += '>' + formatResult.Text + '</span>';
            }
            else {
                currencyDisplayItemMarkup += '>' + Common.TranslateKey(currencyDisplayItem.Label) + '</span>';
            }
        }

        // Mask
        var displayValue = currencyDisplayItem.Value;
        if (Common.IsDefined(currencyDisplayItem.Mask) && currencyDisplayItem.Value.length > 0) {
            var formatResult = Mask.Format(currencyDisplayItem.Value, Mask.BuildMaskingOptions(currencyDisplayItem.Mask), true);
            displayValue = formatResult.Text;
        }

        // Span<>, Value, Span</>
        currencyDisplayItemMarkup += '<span class="gtc-displaydetail-item"';

        // Add Currency Code Data Attribute
        if (Common.IsDefined(currencyDisplayItem.Code)) {
            currencyDisplayItemMarkup += ' data-currencycode="' + currencyDisplayItem.Code + '"';
        }
        currencyDisplayItemMarkup += '>' + displayValue;

        // Display currency code
        if (Common.IsDefined(currencyDisplayItem.Code) && (currencyDisplayItem.Value.length > 0 || currencyDisplayItem.AlwaysShowCurrency == 'Yes')) {
            currencyDisplayItemMarkup += '<span class="gtc-currency">' + currencyDisplayItem.Code + '</span>';
        }
        currencyDisplayItemMarkup += '</span>';

        // Li</>
        currencyDisplayItemMarkup += '</li>';
        return currencyDisplayItemMarkup;

    };

    CurrencyDisplayItem.UpdateValue = function (displayItem, fieldValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        fieldValue = (Common.IsNotDefined(fieldValue)) ? '' : fieldValue;

        // Check for Mask
        var maskString = Common.GetAttr(displayItem, 'data-mask');
        if (Common.IsString(maskString)) {
            if (maskString.length > 0 && fieldValue.length > 0) {
                formatResult = Mask.Format(fieldValue, Mask.BuildMaskingOptions(maskString), true);
                fieldValue = formatResult.Text;
            }
        }

        // Display currency code
        if (Common.IsDefined(Common.GetAttr(displayItem, 'data-currencycode')) && fieldValue.length > 0) {
            fieldValue += '<span class="gtc-currency"></span>';
        }

        // Set Value
        var spanValue = Common.Query('.gtc-displaydetail-item', displayItem);
        Velocity(spanValue, { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                spanValue.innerHTML = fieldValue;
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

    CurrencyDisplayItem.UpdateColor = function (displayItem, colorValue, promises) {

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

} (window.CurrencyDisplayItem = window.CurrencyDisplayItem || {}, window, document, Common, Cache, Events, Velocity));
