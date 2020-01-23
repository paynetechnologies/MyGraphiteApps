/** 
 * @class CoupledFieldSet
 * @classdesc Supports the CoupledFieldSet View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (CoupledFieldSet, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function CoupledFieldSet.Render
     * @param {object} coupledFieldSet - The CoupledFieldSet View Element in JSON format
     * @description Generates the HTML markup for the CoupledFieldSet View Element 
     * @returns {string} HTML Markup of the CoupledFieldSet View Element
     */
    CoupledFieldSet.Render = function (coupledFieldSet) {

        // Fieldset<, TabIndex@, Class@, Id@, Fieldset>
        var additionalClass = '';
        if (coupledFieldSet.IsRightDisplayed == 'No') {
            additionalClass = ' gtc-coupledfieldset-norightdisplayed';
        }
        var coupledFieldSetMarkup = '<fieldset data-namespace="CoupledFieldSet"' + ViewElement.RenderAttributes(coupledFieldSet) + ' class="gtc-coupledfieldset' + additionalClass + '">';

        // Legend<>, Title, SubTitle, Legend</>
        if (Common.IsOneDefined([coupledFieldSet.Title, coupledFieldSet.SubTitle])) {
            coupledFieldSetMarkup += '<legend class="gtc-legend gtc-page-theme-color">';
            if (Common.IsDefined(coupledFieldSet.Title)) {
                coupledFieldSetMarkup += '<span class="gtc-coupledfieldset-legend-title" data-translate="' + coupledFieldSet.Title + '">' + Common.TranslateKey(coupledFieldSet.Title) + '</span>';
            }
            if (Common.IsDefined(coupledFieldSet.SubTitle)) {
                coupledFieldSetMarkup += '<span class="gtc-coupledfieldset-legend-subtitle" data-translate="' + coupledFieldSet.SubTitle + '">' + Common.TranslateKey(coupledFieldSet.SubTitle) + '</span>';
            }
            coupledFieldSetMarkup += '</legend>';
        }

        // Render Fields
        if (Common.IsOneDefined([coupledFieldSet.LeftFields, coupledFieldSet.RightFields, coupledFieldSet.LongFields])) {
            // Ol<>
            coupledFieldSetMarkup += '<ol>';

            // Li<>, LeftTitle, RightTitle, Li</>
            if (Common.IsOneDefined([coupledFieldSet.LeftTitle, coupledFieldSet.RightTitle])) {
                coupledFieldSetMarkup += '<li class="gtc-field gtc-coupledfieldset-titles">';
                if (Common.IsDefined(coupledFieldSet.LeftTitle)) {
                    coupledFieldSetMarkup += '<span class="gtc-coupledfieldset-left-title" data-translate="' + coupledFieldSet.LeftTitle + '">' + Common.TranslateKey(coupledFieldSet.LeftTitle) + '</span>';
                }
                if (Common.IsDefined(coupledFieldSet.RightTitle)) {
                    coupledFieldSetMarkup += '<span class="gtc-coupledfieldset-right-title"';
                    if (coupledFieldSet.IsRightDisplayed == 'No') {
                        coupledFieldSetMarkup += ' style="display: none;"';
                    }
                    coupledFieldSetMarkup += ' data-translate="' + coupledFieldSet.RightTitle + '">' + Common.TranslateKey(coupledFieldSet.RightTitle) + '</span>';
                }
                coupledFieldSetMarkup += '</li>';
            }

            // Render Left\Right Fields
            var length, fieldNamespace;
            if (Common.IsOneDefined([coupledFieldSet.LeftFields, coupledFieldSet.RightFields])) {

                // Initialize if no fields on one side
                if (Common.IsNotDefined(coupledFieldSet.LeftFields)) {
                    coupledFieldSet.LeftFields = [];
                }
                if (Common.IsNotDefined(coupledFieldSet.RightFields)) {
                    coupledFieldSet.RightFields = [];
                }

                // Get larger array for padding if lengths are not equal
                if (coupledFieldSet.LeftFields.length != coupledFieldSet.RightFields.length) {
                    var paddingIndex;
                    if (coupledFieldSet.LeftFields.length > coupledFieldSet.RightFields.length) {
                        paddingIndex = coupledFieldSet.RightFields.length, length = coupledFieldSet.LeftFields.length;
                        for ( ; paddingIndex < length; paddingIndex++) {
                            coupledFieldSet.RightFields.push({ Padding: true });
                        }
                    }
                    else {
                        paddingIndex = coupledFieldSet.LeftFields.length, length = coupledFieldSet.RightFields.length;
                        for ( ; paddingIndex < length; paddingIndex++) {
                            coupledFieldSet.LeftFields.push({ Padding: true });
                        }
                    }
                }

                // Fields
                var leftField, leftFieldIndex = 0;
                length = coupledFieldSet.LeftFields.length;
                for ( ; leftFieldIndex < length; leftFieldIndex++) {
                    leftField = coupledFieldSet.LeftFields[leftFieldIndex];

                    // Li<>, Span<>
                    coupledFieldSetMarkup += '<li class="gtc-field"><span';

                    // Render Left Field
                    if (leftField.Padding != true) {
                        coupledFieldSetMarkup += '>';
                        fieldNamespace = window[leftField.Type];
                        ViewElement.TestExists(leftField.Type, fieldNamespace);
                        coupledFieldSetMarkup += fieldNamespace.Render(leftField);
                    }
                    else {
                        coupledFieldSetMarkup += ' class="gtc-coupledfieldset-empty-leftfield">';
                    }

                    // Span<>, Span</>
                    coupledFieldSetMarkup += '</span><span';

                    if (coupledFieldSet.IsRightDisplayed == 'No') {
                        coupledFieldSetMarkup += ' style="display: none;"';
                    }

                    // Render Right Field
                    var rightField = coupledFieldSet.RightFields[leftFieldIndex];
                    if (rightField.Padding != true) {
                        coupledFieldSetMarkup += '>';
                        fieldNamespace = window[rightField.Type];
                        ViewElement.TestExists(rightField.Type, fieldNamespace);
                        coupledFieldSetMarkup += fieldNamespace.Render(rightField);
                    }
                    else {
                        coupledFieldSetMarkup += ' class="gtc-coupledfieldset-empty-rightfield">';
                    }

                    // Span</>, Li</>
                    coupledFieldSetMarkup += '</span></li>';
                }
            }

            // Long Fields
            if (Common.IsDefined(coupledFieldSet.LongFields)) {
                // Render Long Fields
                var longField, index = 0;
                length = coupledFieldSet.LongFields.length;
                for ( ; index < length; index++) {
                    longField = coupledFieldSet.LongFields[index];

                    // Li<>
                    coupledFieldSetMarkup += '<li class="gtc-field gtc-coupledfieldset-longfield">';

                    // Field
                    fieldNamespace = window[longField.Type];
                    ViewElement.TestExists(longField.Type, fieldNamespace);
                    coupledFieldSetMarkup += fieldNamespace.Render(longField);

                    // Li</>
                    coupledFieldSetMarkup += '</li>';
                }
            }

            // Ol</>
            coupledFieldSetMarkup += '</ol>';
        }

        // Fieldset</>
        coupledFieldSetMarkup += '</fieldset>';
        return coupledFieldSetMarkup;

    };

    /**
     * @function CoupledFieldSet.HideRightFields
     * @param {object} coupledFieldSet - The CoupledFieldSet DOM element
     * @description Hides the right column in the CoupledFieldSet DOM element
     */
    CoupledFieldSet.HideRightFields = function (coupledFieldSet) {

        Common.AddClass(coupledFieldSet, 'gtc-coupledfieldset-norightdisplayed');
        Common.SlideElements(Common.QueryAll('ol > li > span:last-child', coupledFieldSet), 'hide', 'left', 'fast');

    };

    /**
     * @function CoupledFieldSet.ShowRightFields
     * @param {object} coupledFieldSet - The CoupledFieldSet DOM element
     * @description Shows the right column in the CoupledFieldSet DOM element
     */
    CoupledFieldSet.ShowRightFields = function (coupledFieldSet) {

        Common.RemoveClass(coupledFieldSet, 'gtc-coupledfieldset-norightdisplayed');
        Common.SlideElements(Common.QueryAll('ol > li > span:last-child', coupledFieldSet), 'show', 'left', 'fast');

    };

} (window.CoupledFieldSet = window.CoupledFieldSet || {}, window, document, Common, Cache, Events, Velocity));
