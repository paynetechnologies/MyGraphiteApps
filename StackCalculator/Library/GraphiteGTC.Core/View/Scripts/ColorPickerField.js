// ColorPicker Field
// Based On: ColorPickerField -> ValueField -> Field -> ViewElement
(function (ColorPickerField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ColorPickerField.Render = function (colorPickerField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(colorPickerField.Label)) {
            labelExists = false;
        }

        // Label
        var colorPickerFieldMarkup = Field.RenderLabel(colorPickerField);

        // <input type="color" id="html5colorpicker" onchange="clickColor(0, -1, -1, 5)" value="#ff0000" style="width:85%;">

        // input<, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        colorPickerFieldMarkup += '<input class="gtc-input-colorpicker';
        if (Common.IsDefined(colorPickerField.Icon)) {
            if (labelExists == false) {
                textFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                textFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        colorPickerFieldMarkup += '"' + ValueField.RenderAttributes(colorPickerField) + Field.RenderAttributes(colorPickerField);

        // Data-HasChanged@ Event
        if (colorPickerField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + colorPickerField.Name, '#' + colorPickerField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (colorPickerField.IsRequired == 'Yes') {
            colorPickerFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(colorPickerField.OnChange)) {
            colorPickerFieldMarkup += Field.AttachOnChange(colorPickerField, ColorPickerField.OnChange);
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        colorPickerFieldMarkup += ' data-namespace="ColorPickerField" type="color" />';

        // Icon
        if (Common.IsDefined(colorPickerField.Icon)) {
            textFieldMarkup += Icon.Render(colorPickerField.Icon, true, labelExists);
        }
        return colorPickerFieldMarkup;

    };

    ColorPickerField.OnChange = function (event) {

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

    ColorPickerField.HasValue = function (colorPickerField) {

        return ValueField.HasValue(colorPickerField);

    };

    ColorPickerField.IsCompleted = function (field) {

        return ValueField.IsCompleted(field);

    };

    ColorPickerField.UpdateValue = function (field, fieldValue) {

        ValueField.UpdateValue(field, fieldValue);

    };

    ColorPickerField.UpdateLabel = function (field, fieldLabel, promises, context) {

        Field.UpdateLabel(field, fieldLabel, promises, context);

    };

    ColorPickerField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    ColorPickerField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.ColorPickerField = window.ColorPickerField || {}, window, document, Common, Cache, Events, Velocity));
