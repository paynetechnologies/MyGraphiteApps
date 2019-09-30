// Numeric Field
// Based On: NumericField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (NumericField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    NumericField.Render = function (numericField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(numericField.Label)) {
            labelExists = false;
        }

        // Label
        var numericFieldMarkup = Field.RenderLabel(numericField);

        // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        numericFieldMarkup += '<input class="gtc-input-calculator';
        if (Common.IsDefined(numericField.Icon)) {
            if (labelExists == false) {
                numericFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                numericFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        numericFieldMarkup += '"' + MaskField.RenderAttributes(numericField) + Field.RenderAttributes(numericField);

        // Data-HasChanged@ Event
        if (numericField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + numericField.Name, '#' + numericField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (numericField.IsRequired == 'Yes') {
            numericFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(numericField.OnChange)) {
            numericFieldMarkup += Field.AttachOnChange(numericField, NumericField.OnChange);
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        numericFieldMarkup += ' data-namespace="NumericField" type="text" />';

        // Icon
        if (Common.IsDefined(numericField.Icon)) {
            numericFieldMarkup += Icon.Render(numericField.Icon, true, labelExists);
        }
        return numericFieldMarkup;

    };

    NumericField.OnChange = function(event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value:  this.value,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    NumericField.HasValue = function (numericField) {

        return MaskField.HasValue(numericField);

    };

    NumericField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    NumericField.UpdateValue = function (field, fieldValue) {

        MaskField.UpdateValue(field, fieldValue);

    };

    NumericField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    NumericField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.NumericField = window.NumericField || {}, window, document, Common, Cache, Events, Velocity));
