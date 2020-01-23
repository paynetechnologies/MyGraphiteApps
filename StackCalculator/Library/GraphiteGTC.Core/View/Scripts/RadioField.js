// Radio Field
// Based On: RadioField -> ValueField -> Field -> ViewElement
(function (RadioField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    RadioField.Render = function (radioField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(radioField.Label)) {
            labelExists = false;
        }

        // 508 Compliance
        var className = '';
        if (Common.IsNotDefined(radioField.Label)) {
            var generatedLabel = {
                TextString: radioField.Name,
                ScreenReaderOnly: true
            };
            if (Common.IsDefined(radioField.Placeholder)) {
                generatedLabel.TextString = radioField.Placeholder;
            }
            radioField.Label = generatedLabel;
        }

        // 508 Compliance
        if (radioField.Label.ScreenReaderOnly == true) {
            className += ' gtc-sr-only';
        }

        // FieldSet<, @Data-TranslateContent, Legend<
        var radioFieldMarkup = '<fieldset role="radiogroup" class="gtc-input-radio-group';
        if (Common.IsDefined(radioField.Icon)) {
            if (labelExists == false) {
                radioFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                radioFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        radioFieldMarkup += '" data-translatecontent="' + radioField.TranslateContent + '"><legend class="gtc-input-radio-label gtc-label' + className + '" for="' + radioField.Name + '"><span';

        // Translations
        if (Common.IsDefined(radioField.Label) && Common.IsDefined(radioField.Label.TextString)) {
            radioFieldMarkup += ' data-translate="' + radioField.Label.TextString + '"';
        }

        // Span>, Label, Legend>, Span</>
        radioFieldMarkup += '>' + Common.TranslateKey(radioField.Label.TextString) + '</span>';
        radioFieldMarkup += Field.RenderLabel(radioField, true) + '</legend>';

        // Tooltip
        if (Common.IsDefined(radioField.Label.Tooltip)) {
            radioFieldMarkup += '<a class="gtc-tooltip gtc-label-tooltip" data-translate="[data-tooltip]' + radioField.Label.Tooltip + '" data-tooltip="' + Common.TranslateKey(radioField.Label.Tooltip) + '"></a>';
        }

        // Data-Disabled@
        var fieldAttributesMarkup = Field.RenderAttributes(radioField);

        // Build Radio
        radioFieldMarkup += '<div class="gtc-radiogroup-divforlabels">';
        if (Common.IsDefined(radioField.OptionDetail.Options)) {
            var option, index = 0, length = radioField.OptionDetail.Options.length;
            for ( ; index < length; index++) {
                option = radioField.OptionDetail.Options[index];
                var convertedToken = Common.SanitizeToken(option.Value);

                // @Data-NameSpace, @Data-FieldType, Label<, For@, Span<>, Input<
                radioFieldMarkup += '<label role="radio" class="gtc-input-radio" for="' + radioField.Name + convertedToken + '">';
                if (radioField.TranslateContent == 'Yes') {
                    radioFieldMarkup += '<span data-translate="' + option.Display + '">' + Common.TranslateKey(option.Display);
                }
                else {
                    radioFieldMarkup += '<span>' + option.Display;
                }
                radioFieldMarkup += '</span><input data-namespace="RadioField" data-configure="Pre"';

                // 508 Compliance
                if (radioField.IsRequired == 'Yes') {
                    radioFieldMarkup += ' aria-required="true"';
                }

                // Data-Serializable@
                if (radioField.IsSerializable == 'Yes') {
                    radioFieldMarkup += ' data-serializable';
                    Events.On(document.body, 'change.fieldvaluechange.' + radioField.Name + convertedToken, '#' + radioField.Name + convertedToken,
                        function () {
                            Common.SetAttr(this, 'data-haschanged', 'Yes');
                        }
                    );
                }

                // Data-Disabled@
                radioFieldMarkup += fieldAttributesMarkup;

                // @Checked
                if (Common.SanitizeToken(radioField.Value) == convertedToken) {
                    radioFieldMarkup += ' checked="checked"';
                }

                // Data-ControllerPath/ActionName@, Wire OnChange!
                if (Common.IsEventViewElementDefined(radioField.OnChange)) {
                    radioFieldMarkup += Field.AttachOnChange(radioField, RadioField.OnChange, convertedToken);
                }

                // @TabIndex, @Class, @Data-TranslateContent, @Id, @Name, @Type, @Value
                radioFieldMarkup += ' tabindex="' + radioField.FocusIndex + '" class="gtc-input-radio-option" data-translatecontent="' + radioField.TranslateContent + '" id="' + radioField.Name + convertedToken + '" name="' + radioField.Name + '" type="radio" value="' + option.Value + '" />';

                // Label</>
                radioFieldMarkup += '</label>';
            }
        }
        radioFieldMarkup += '</div></fieldset>';

        // Icon
        if (Common.IsDefined(radioField.Icon)) {
            radioFieldMarkup += Icon.Render(radioField.Icon, true, labelExists);
        }

        // Return
        return radioFieldMarkup;

    };

    RadioField.Configure = function (radioOption, configureStage) {

        Widgets.radio(radioOption, { ClassLabelRadioUnselected: 'gtc-classLabelRadioUnselected', ClassLabelRadioSelected: 'gtc-input-radio-selected' });

    };

    RadioField.OnChange = function (event) {

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

    RadioField.HasValue = function (radioField) {

        if (Common.IsDefined(radioField.Value)) {
            return true;
        }
        return false;

    };

    RadioField.IsCompleted = function (field) {

        var radioName = field.name;
        var index = 0, radios = Common.GetByName(radioName), radioLength = radios.length, radioValue;
        for ( ; index < radioLength; index++) {
            if (radios[index].checked == true) {
                radioValue = radios[index].value;
                break;
            }
        }
        if (Common.IsDefined(radioValue)) {
            return true;
        }
        return false;

    };

    RadioField.UpdateValue = function (field, fieldValue) {

        if (Common.IsNotEmptyString(fieldValue)) {
            if (fieldValue.length > 0) {
                var radioField = FindRadioField(field, fieldValue);
                if (Common.IsDefined(radioField)) {
                    radioField.checked = true;
                    if (Common.IsDefined(Common.GetAttr(radioField, 'data-serializable'))) {
                        Common.SetAttr(radioField, 'data-haschanged', 'Yes');
                    }
                    Common.SetAttr(radioField, 'value', fieldValue);
                    GTC.TriggerEvent(radioField, 'widgetUpdateValue');
                }
            }
        }
        else {
            GTC.TriggerEvent(field[0], 'widgetClearValue');
        }
        Events.Trigger(field, 'focusout');

    };

    RadioField.UpdateLabel = function (field, fieldLabel, promises, context) {

        var radioFieldSet = field[0].parentElement.parentElement.parentElement;
        var label = Common.Query('legend', radioFieldSet);
        Label.UpdateLabel(label, fieldLabel, promises, context, Common.IsHidden(radioFieldSet));

    };

    RadioField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    RadioField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

    function FindRadioField (field, fieldValue) {

        // Sanity Check
        if (Common.IsNotDefined(field)) {
            return null;
        }

        // Find Radio Field
        var radioField = null;
        var currentRadio, index = 0, length = field.length;
        for ( ; index < length; index++) {
            currentRadio = field[index];
            if (Common.SanitizeToken(currentRadio.value) == Common.SanitizeToken(fieldValue)) {
                radioField = currentRadio;
                break;
            }
        }
        return radioField;

    };

} (window.RadioField = window.RadioField || {}, window, document, Common, Cache, Events, Velocity));
