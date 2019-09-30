// Placeholder Field
// Based On: PlaceholderField -> ValueField -> Field -> ViewElement
(function (PlaceholderField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    PlaceholderField.RenderAttributes = function (placeholderField) {

        // Placeholder@, Translations
        var attributeMarkup = '';
        if (Common.IsDefined(placeholderField.Placeholder)) {
            attributeMarkup += ' placeholder="' + Common.TranslateKey(placeholderField.Placeholder) + '" data-translate="[placeholder]' + placeholderField.Placeholder + '"';
        }

        // Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@
        attributeMarkup += ValueField.RenderAttributes(placeholderField);
        return attributeMarkup;

    };

    PlaceholderField.RenderAttributesForMask = function (placeholderField, maskingOptions) {

        // Placeholder@, Translations
        var attributeMarkup = '';
        if (Common.IsDefined(placeholderField.Placeholder)) {
            attributeMarkup += ' placeholder="' + Common.TranslateKey(placeholderField.Placeholder) + '" data-translate="[placeholder]' + placeholderField.Placeholder + '"';
        }

        // Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@
        attributeMarkup += ValueField.RenderAttributesForMask(placeholderField, maskingOptions);
        return attributeMarkup;

    };

    PlaceholderField.UpdatePlaceholder = function (placeholderField, placeholderText) {

        Common.SetAttr(placeholderField, 'data-translate', '[placeholder]' + placeholderText);
        placeholderField.placeholder = Common.TranslateKey(placeholderText);

    };

} (window.PlaceholderField = window.PlaceholderField || {}, window, document, Common, Cache, Events, Velocity));
