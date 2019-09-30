// Signature Field
// Based On: SignatureField -> ValueField -> Field -> ViewElement
(function (SignatureField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SignatureField.Render = function (signatureField) {

        // Sanity Check
        var fieldValue = '';
        if (Common.IsDefined(signatureField.Value)) {
            fieldValue = signatureField.Value;
        }

        // Label
        var signatureFieldMarkup = Field.RenderLabel(signatureField);

        // Div<, Data-NameSpace@, Data-Signature@
        signatureFieldMarkup += '<div class="gtc-input-signaturefield" data-namespace="SignatureField" data-export="' + signatureField.ExportType.toLowerCase() + '" data-signature=\'' + fieldValue + '\'';

        // Data-Serializable@
        if (signatureField.IsSerializable == 'Yes') {
            signatureFieldMarkup += ' data-serializable';
        }

        // TabIndex@, Class@, Id@
        signatureFieldMarkup += ViewElement.RenderAttributes(signatureField);

        // Data-HasChanged@ Event
        if (signatureField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + signatureField.Name, '#' + signatureField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(signatureField.OnChange)) {
            signatureFieldMarkup += Field.AttachOnChange(signatureField, SignatureField.OnChange);
        }

        // Div>, Div<>, Div</>
        signatureFieldMarkup += '><div></div>';

        // Clear Button?
        if (signatureField.ShowClearButton == 'Yes') {
            signatureFieldMarkup += '<a id="' + signatureField.Name + 'ClearButton" class="gtc-signaturefield-clearbutton" data-translate="Clear">' + Common.TranslateKey('Clear') + '</a>';

            // Attach clear event
            Events.On(document.body, 'click.' + signatureField.Name + 'ClearButton', '#' + signatureField.Name + 'ClearButton',
                function (event) {
                    var signatureData = Widgets.signature(Common.Get(signatureField.Name), 'ExportSignature');
                    var stopOnChange = false;
                    if (Common.IsNotDefined(signatureData) || signatureData.length <= 0) {
                        stopOnChange = true;
                    }
                    Widgets.signature(Common.Get(signatureField.Name), 'ClearSignatureArea', stopOnChange);
                }
            );
        }

        // Disable Button?
        if (signatureField.ShowDisableButton == 'Yes') {
            var buttonValue = 'Disable';
            if (signatureField.IsLocked == 'Yes') {
                buttonValue = 'Enable';
            }
            signatureFieldMarkup += '<a id="' + signatureField.Name + 'DisableButton" class="gtc-signaturefield-disablebutton" data-translate="' + buttonValue + '">' + Common.TranslateKey(buttonValue) + '</a>';

            // Attach disable event
            Events.On(document.body, 'click.' + signatureField.Name + 'DisableButton', '#' + signatureField.Name + 'DisableButton',
                function (event) {
                    Widgets.signature(Common.Get(signatureField.Name), 'SwitchDisabled');
                }
            );
        }

        // Div</>
        signatureFieldMarkup += '</div>';

        // Setup configuring of signature (triggered from Page.Configure)
        Events.On(document.body, 'configuresignature.' + signatureField.Name, '#' + signatureField.Name,
            function (event) {
                var overrideOptions = {};
                overrideOptions.AddSignatureLine = true;
                if (signatureField.IsLocked == 'Yes') {
                    overrideOptions.Disabled = true;
                }
                if (Common.IsDefined(signatureField.Dimension)) {
                    if (Common.IsDefined(signatureField.Dimension.Height)) {
                        overrideOptions.Height = signatureField.Dimension.Height + signatureField.Dimension.Scale;
                    }
                    else {
                        overrideOptions.Height = '100px';
                    }
                    overrideOptions.Width = '100%';
                }
                else {
                    overrideOptions.Height = '100px';
                    overrideOptions.Width = '100%';
                }
                if (signatureField.IsDisplayed == 'No' || Common.IsHidden(this)) {
                    overrideOptions.InitiallyHidden = true;
                }
                Widgets.signature(this, overrideOptions);
                if (signatureField.ShowClearButton == 'Yes') {
                    Widgets.uibutton(Common.Get(signatureField.Name + 'ClearButton'));
                }
                if (signatureField.ShowDisableButton == 'Yes') {
                    Widgets.uibutton(Common.Get(signatureField.Name + 'DisableButton'));
                }
            }
        );
        return signatureFieldMarkup;

    };

    SignatureField.OnChange = function(event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value:  Widgets.signature(this, 'ExportSignature'),
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    SignatureField.HasValue = function (field) {

        return ValueField.HasValue(field);

    };

    SignatureField.IsCompleted = function (field) {

        return Widgets.signature(field, 'IsSignatureEmpty');

    };

    SignatureField.UpdateValue = function (field, fieldValue) {

        if (Common.IsNotDefined(fieldValue) || fieldValue.length <= 0) {
            Widgets.signature(field, 'ClearSignatureArea', true);
        }
        else {
            Widgets.signature(field, 'DrawSignatureFromJSON', fieldValue);
        }
        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }

    };

    SignatureField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    SignatureField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.SignatureField = window.SignatureField || {}, window, document, Common, Cache, Events, Velocity));
