// Mask Field
// Based On: MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (MaskField, window, document, Common, Cache, Events, Velocity, undefined) {

    MaskField.MaskingOptions = {};

    // Public Methods
    MaskField.RenderAttributes = function (maskField) {

        // Sanity Check (for Raw value)
        var fieldValue = '';
        if (Common.IsDefined(maskField.Value)) {
            fieldValue = maskField.Value;
        }

        // Data-Mask@
        var maskingOptions;
        var attributeMarkup = '';
        if (Common.IsDefined(maskField.Mask) && Common.IsNotEmptyString(maskField.Mask)) {
            // Mask Options
            maskingOptions = MaskField.MaskingOptions[maskField.Mask];
            if (Common.IsNotDefined(maskingOptions)) {
                maskingOptions = Mask.BuildMaskingOptions(maskField.Mask);
                MaskField.MaskingOptions[maskField.Mask] = maskingOptions;
            }
            attributeMarkup += ' data-mask=\'' + JSON.stringify(maskingOptions) + '\' data-raw="' + fieldValue + '"';

            // Wire Mask Events
            Events.On(document.body, 'keypress.' + maskField.Name, '#' + maskField.Name, Mask.OnKeyPress);
            Events.On(document.body, 'focusout.' + maskField.Name, '#' + maskField.Name, Mask.OnFocusOut);
        }

        // Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@
        attributeMarkup += PlaceholderField.RenderAttributesForMask(maskField, maskingOptions);
        return attributeMarkup;

    };

    MaskField.HasValue = function (maskField) {

        return ValueField.HasValue(maskField);

    };

    MaskField.IsCompleted = function (field) {

        return ValueField.IsCompleted(field);

    };

    MaskField.UpdateValue = function (field, fieldValue) {

        var formattedValue = fieldValue;
        var maskingOptions = Common.GetAttr(field, 'data-mask');
        if (Common.IsString(maskingOptions)) {
            if (fieldValue.length > 0) {
                var formatResult = Mask.Format(fieldValue, JSON.parse(maskingOptions));
                if (!formatResult.Valid) {
                    return;
                }
                formattedValue = formatResult.Text;
            }
            Common.SetAttr(field, 'data-raw', fieldValue);
        }
        ValueField.UpdateValueForMask(field, fieldValue, formattedValue);

    };

    MaskField.UpdateMask = function (field, maskString, uiParameters) {

        // Unbind Field
        MaskField.Unbind([field]);

        // Value
        ValueField.UpdateValueForMask(field, '', '');

        // Mask
        if (Common.IsEmptyString(maskString)) {
            Common.RemoveAttr(field, 'data-mask');
        }
        else {
            var maskingOptions = MaskField.MaskingOptions[maskString];
            if (typeof maskingOptions == 'undefined') {
                maskingOptions = Mask.BuildMaskingOptions(maskString);
                MaskField.MaskingOptions[maskString] = maskingOptions;
            }
            Common.SetAttr(field, 'data-mask', JSON.stringify(maskingOptions));

            // Wire Mask Events
            Events.On(document.body, 'keypress.' + field.id, '#' + field.id, Mask.OnKeyPress);
            Events.On(document.body, 'focusout.' + field.id, '#' + field.id, Mask.OnFocusOut);
        }

        // Placeholder
        if (Common.IsDefined(uiParameters) && uiParameters.length > 0 && Common.IsDefined(uiParameters[0].Value)) {
            PlaceholderField.UpdatePlaceholder(field, uiParameters[0].Value);
        }

    };

    MaskField.Unbind = function (fields) {

        if (fields.length > 0) {
            var maskField, index = 0, length = fields.length;
            for ( ; index < length; index++) {
                maskField = fields[index];
                Events.Off(document.body, 'keypress.' + maskField.id, '#' + maskField.id);
                Events.Off(document.body, 'focusout.' + maskField.id, '#' + maskField.id);
            }
        }

    };

} (window.MaskField = window.MaskField || {}, window, document, Common, Cache, Events, Velocity));
