// Currency Field
// Based On: CurrencyField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (CurrencyField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
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
        currencyFieldMarkup += ' data-namespace="CurrencyField" type="text" />';

        // Icon
        if (Common.IsDefined(currencyField.Icon)) {
            currencyFieldMarkup += Icon.Render(currencyField.Icon, true, labelExists);
        }
        return currencyFieldMarkup;

    };

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

    CurrencyField.HasValue = function (currencyField) {

        return MaskField.HasValue(currencyField);

    };

    CurrencyField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    CurrencyField.UpdateValue = function (field, fieldValue) {

        MaskField.UpdateValue(field, fieldValue);

    };

    CurrencyField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    CurrencyField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.CurrencyField = window.CurrencyField || {}, window, document, Common, Cache, Events, Velocity));
