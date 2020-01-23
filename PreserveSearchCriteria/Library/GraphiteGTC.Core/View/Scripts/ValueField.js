// Value Field
// Based On: ValueField -> Field -> ViewElement
(function (ValueField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ValueField.RenderAttributes = function (valueField) {

        // Sanity Check
        var fieldValue = '';
        if (Common.IsDefined(valueField.Value)) {
            fieldValue = valueField.Value;
        }

        // Name@ (uses ViewElement.Name), Value@
        var attributeMarkup = ' name="' + valueField.Name + '" value="' + fieldValue + '"';

        // Data-Serializable@
        if (valueField.IsSerializable == 'Yes' && valueField.IsEditableDisplayItem != true) {
            attributeMarkup += ' data-serializable';
        }
        else {
            attributeMarkup += ' data-serializabledisplayitem';
        }

        // TabIndex@, Class@, Id@
        attributeMarkup += ViewElement.RenderAttributes(valueField);
        return attributeMarkup;

    };

    ValueField.RenderAttributesForMask = function (valueField, maskingOptions) {

        // Format Value
        var fieldValue = '';
        var formattedValue = '';
        if (Common.IsDefined(valueField.Value)) {
            fieldValue = valueField.Value;
            formattedValue = valueField.Value;
            if (Common.IsObject(maskingOptions)) {
                var formatResult = Mask.Format(valueField.Value, maskingOptions);
                formattedValue = formatResult.Text;
            }
        }

        // Name@ (uses ViewElement.Name), Value@
        var attributeMarkup = ' name="' + valueField.Name + '" value="' + formattedValue + '"';

        // Data-Serializable@
        if (valueField.IsSerializable == 'Yes' && valueField.IsEditableDisplayItem != true) {
            attributeMarkup += ' data-serializable';
        }
        else {
            attributeMarkup += ' data-serializabledisplayitem';
        }

        // TabIndex@, Class@, Id@
        attributeMarkup += ViewElement.RenderAttributes(valueField);
        return attributeMarkup;

    };

    ValueField.HasValue = function (valueField) {

        if (Common.IsDefined(valueField.Value)) {
            return true;
        }
        return false;

    };

    ValueField.IsCompleted = function (field) {

        var fieldValue = field.value;
        if (fieldValue.length > 0) {
            return true;
        }
        return false;

    };

    ValueField.UpdateValue = function (field, fieldValue) {

        field.value = fieldValue;
        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }
        Events.Trigger(field, 'focusout');

    };

    ValueField.UpdateValueForMask = function (field, fieldValue, formattedValue) {

        field.value = formattedValue;
        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }
        Events.Trigger(field, 'focusout');

    };

} (window.ValueField = window.ValueField || {}, window, document, Common, Cache, Events, Velocity));
