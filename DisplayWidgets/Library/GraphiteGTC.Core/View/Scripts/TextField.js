// Text Field
// Based On: TextField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (TextField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    TextField.Render = function (textField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(textField.Label)) {
            labelExists = false;
        }

        // Label
        var textFieldMarkup = Field.RenderLabel(textField);

        // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        textFieldMarkup += '<input class="gtc-input-textbox';
        if (Common.IsDefined(textField.Icon)) {
            if (labelExists == false) {
                textFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                textFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        textFieldMarkup += '"' + MaskField.RenderAttributes(textField) + Field.RenderAttributes(textField);

        // Data-HasChanged@ Event
        if (textField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + textField.Name, '#' + textField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (textField.IsRequired == 'Yes') {
            textFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(textField.OnChange)) {
            textFieldMarkup += Field.AttachOnChange(textField, TextField.OnChange);
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        textFieldMarkup += ' data-namespace="TextField" type="text" />';

        // Icon
        if (Common.IsDefined(textField.Icon)) {
            textFieldMarkup += Icon.Render(textField.Icon, true, labelExists);
        }
        return textFieldMarkup;

    };

    TextField.OnChange = function (event) {

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

    TextField.HasValue = function (textField) {

        return MaskField.HasValue(textField);

    };

    TextField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    TextField.UpdateValue = function (field, fieldValue) {

        MaskField.UpdateValue(field, fieldValue);

    };

    TextField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    TextField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.TextField = window.TextField || {}, window, document, Common, Cache, Events, Velocity));
