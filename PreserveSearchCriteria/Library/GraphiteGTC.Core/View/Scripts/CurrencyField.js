/** 
 * @class CurrencyField
 * @classdesc Supports the CurrencyField View Element<br>
 *            Based On: ViewElement > Field > valueField > PlaceholderField > MaskField
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (CurrencyField, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function CurrencyField.Render
     * @param {object} currencyField - The CurrencyField View Element in JSON format
     * @description Generates the HTML markup for the CurrencyField View Element 
     * @returns {string} HTML Markup of the CurrencyField View Element
     * @listens change.fieldvaluechange (id = <var>currencyFieldName</var>)
     */
    CurrencyField.Render = function (currencyField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(currencyField.Label)) {
            labelExists = false;
        }

        // Label
        var currencyFieldMarkup = Field.RenderLabel(currencyField);

        // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        currencyFieldMarkup += '<input class="gtc-input-calculator';
        if (Common.IsDefined(currencyField.Icon)) {
            if (labelExists == false) {
                currencyFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                currencyFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        currencyFieldMarkup += '"' + MaskField.RenderAttributes(currencyField) + Field.RenderAttributes(currencyField);

        // Data-HasChanged@ Event
        if (currencyField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + currencyField.Name, '#' + currencyField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (currencyField.IsRequired == 'Yes') {
            currencyFieldMarkup += ' aria-required="true"';
        }

        // Currency Details
        var currencyDefiniton = null;
        var currentCurrency = Common.GetStorage('CurrentCurrency');
        if (Common.IsDefined(currentCurrency)) {
            currencyDefiniton = JSON.parse(currentCurrency);
            if (Common.IsNotDefined(currencyField.Code)) {
                currencyField.Code = currencyDefiniton.Code;
                currencyField.Symbol = currencyDefiniton.Symbol;
                currencyField.NumberOfDecimalPlaces = currencyDefiniton.NumberOfDecimalPlaces;
            }

            // Data-CurrencyCode@, Data-CurrencySymbol@, Data-CurrencyDecimalPlaces@
            currencyFieldMarkup += ' data-currencycode="' + currencyField.Code + '" data-currencysymbol="' + currencyField.Symbol + '" data-currencydecimalplaces="' + currencyField.NumberOfDecimalPlaces + '"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(currencyField.OnChange)) {
            currencyFieldMarkup += Field.AttachOnChange(currencyField, CurrencyField.OnChange);
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        currencyFieldMarkup += ' data-namespace="CurrencyField" data-configure="Pre" type="text" />';

        // Icon
        if (Common.IsDefined(currencyField.Icon)) {
            currencyFieldMarkup += Icon.Render(currencyField.Icon, true, labelExists);
        }
        return currencyFieldMarkup;

    };

    /**
     * @function CurrencyField.Configure
     * @param {object} field - The CurrencyField DOM element
     * @param {string} configureStage - Pre for Configuration before Translations or Post for Configuration after Translations
     * @description Called by Page.Configure after the dynamic HTML markup is added to the DOM
     */
    CurrencyField.Configure = function (field, configureStage) {

        Widgets.calculator(field, { UpdateValueCallback: Mask.SetFormattedValue });

    };

    /**
     * @function CurrencyField.OnChange
     * @param {event} event - A DOM click Event
     * @description Calls Field.OnChange (which will call the OnChange<i>CurrencyField</i> Behavior)
     */
    CurrencyField.OnChange = function (event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var rawData = Common.GetAttr(this, 'data-raw');
        if (rawData.length <= 0) {
            rawData = null;
        }
        var uiParameters = null;
        var currencyCode = Common.GetAttr(this, 'data-currencycode');
        if (Common.IsDefined(currencyCode)) {
            uiParameters = [
                {
                    Name: 'Code',
                    Value: currencyCode,
                    UiParameters: null
                }
            ];
        }
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value: rawData,
                UiParameters: uiParameters
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    /**
     * @function CurrencyField.HasValue
     * @param {object} currencyField - The CurrencyField View Element in JSON format
     * @description Check if the field has a value
     * @returns {boolean} Returns <i>true</i> if it has a value, <i>false</i> otherwise
     */
    CurrencyField.HasValue = function (currencyField) {

        return MaskField.HasValue(currencyField);

    };

    /**
     * @function CurrencyField.IsCompleted
     * @param {object} currencyField - The CurrencyField DOM element
     * @description Check if the field has a value
     * @returns {boolean} Returns <i>true</i> if it has a value, <i>false</i> otherwise
     */
    CurrencyField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    /**
     * @function CurrencyField.UpdateValue
     * @param {object} field - The CurrencyField DOM element
     * @param {string} fieldValue - The new Value of the CurrencyField
     * @description Updates the value of the CurrencyField
     */
    CurrencyField.UpdateValue = function (field, fieldValue) {

        MaskField.UpdateValue(field, fieldValue);

    };

    /**
     * @function CurrencyField.UpdateLabel
     * @param {object} field - The CurrencyField DOM element
     * @param {string} fieldLabel - The new Label of the CurrencyField
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Label of the CurrencyField
     */
    CurrencyField.UpdateLabel = function (field, fieldLabel, promises, context) {

        Field.UpdateLabel(field, fieldLabel, promises, context);

    };

    /**
     * @function CurrencyField.ShowPinwheel
     * @param {object} field - The CurrencyField DOM element
     * @description Shows Pinwheel on the View Element
     */
    CurrencyField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    /**
     * @function CurrencyField.HidePinwheel
     * @param {object} field - The CurrencyField DOM element
     * @description Hides Pinwheel on the View Element
     */
    CurrencyField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.CurrencyField = window.CurrencyField || {}, window, document, Common, Cache, Events, Velocity));
