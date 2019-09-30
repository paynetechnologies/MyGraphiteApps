// Percent Field
// Based On: PercentField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (PercentField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    PercentField.Render = function (percentField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(percentField.Label)) {
            labelExists = false;
        }

        // Label
        var percentFieldMarkup = Field.RenderLabel(percentField);

        // Remove trailing zeros
        if (Common.IsDefined(percentField.Value) && percentField.Value.length > 0) {
            percentField.Value = (parseFloat(percentField.Value)).toString();
        }

        // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        percentFieldMarkup += '<input class="gtc-input-percentfield';
        if (Common.IsDefined(percentField.Icon)) {
            if (labelExists == false) {
                percentFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                percentFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        percentFieldMarkup += '"' + MaskField.RenderAttributes(percentField) + Field.RenderAttributes(percentField);

        // Data-HasChanged@ Event
        if (percentField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + percentField.Name, '#' + percentField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (percentField.IsRequired == 'Yes') {
            percentFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(percentField.OnChange)) {
            percentFieldMarkup += Field.AttachOnChange(percentField, PercentField.OnChange);
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        percentFieldMarkup += ' data-namespace="PercentField" type="text" />';

        // Icon
        if (Common.IsDefined(percentField.Icon)) {
            percentFieldMarkup += Icon.Render(percentField.Icon, true, labelExists);
        }
        return percentFieldMarkup;

    };

    PercentField.OnChange = function (event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var rawData = Common.GetAttr(this, 'data-raw');
        if (rawData.length <= 0) {
            rawData = null;
        }
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value: rawData,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    PercentField.HasValue = function (percentField) {

        return MaskField.HasValue(percentField);

    };

    PercentField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    PercentField.UpdateValue = function (field, fieldValue) {

        // Remove trailing zeros
        if (Common.IsDefined(fieldValue) && fieldValue.length > 0) {
            fieldValue = (parseFloat(fieldValue)).toString();
        }

        // Update Field with Value
        MaskField.UpdateValue(field, fieldValue);

    };

    PercentField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    PercentField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.PercentField = window.PercentField || {}, window, document, Common, Cache, Events, Velocity));
