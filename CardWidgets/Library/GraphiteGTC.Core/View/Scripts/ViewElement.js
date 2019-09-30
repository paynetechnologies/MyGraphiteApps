// View Element
(function (ViewElement, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ViewElement.RenderAttributes = function (viewElement) {

        // Initialize
        var attributeMarkup = '';

        // TabIndex@
        if (viewElement.FocusIndex > 0) {
            attributeMarkup += ' tabindex="' + viewElement.FocusIndex + '"';
        }

        // Id@
        if (Common.IsDefined(viewElement.Name)) {
            attributeMarkup += ' id="' + viewElement.Name + '"';
        }

        // Style@, display: none;
        if (viewElement.IsDisplayed == 'No') {
            attributeMarkup += ' style="display: none;"';
        }

        // Return
        return attributeMarkup;

    };

    ViewElement.TestExists = function (type, namespace, childText, functionText) {

        functionText = functionText || 'Render';
        if (Common.IsNotDefined(namespace)) {
            if (Common.IsDefined(window.console)) {
                console.log('Error[' + type + ']: Namespace missing');
            }
        }
        else if (!Common.IsFunction(namespace[functionText])) {
            if (Common.IsDefined(window.console)) {
                console.log('Error[' + type + ']: ' + (childText || type) + '.' + functionText + '() missing');
            }
        }

    };

} (window.ViewElement = window.ViewElement || {}, window, document, Common, Cache, Events, Velocity));
