// Choice
// Based On: Choice
(function (Choice, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Choice.Render = function (checkboxField, choice, fieldAttributesMarkup) {

        // Initialize
        var convertedToken = Common.SanitizeToken(choice.Name);

        // Label<, For@, Display, Input<, @Data-NameSpace, @Data-FieldType, @Data-Translate
        var choiceMarkup = '<label role="checkbox" class="gtc-input-checkbox" for="' + checkboxField.Name + convertedToken + '"><span';
        if (checkboxField.TranslateContent == 'Yes') {
            choiceMarkup += ' data-translate="' + choice.Display + '">' + Common.TranslateKey(choice.Display);
        }
        else {
            choiceMarkup += '>' + choice.Display;
        }
        choiceMarkup += '</span><input ';

        // Data-Disabled@
        choiceMarkup += fieldAttributesMarkup;

        // Checked@
        if (choice.IsChecked == 'Yes') {
            choiceMarkup += ' checked="checked"';
        }

        // Data-Serializable@
        if (checkboxField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + checkboxField.Name + convertedToken, '#' + checkboxField.Name + convertedToken,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(checkboxField.OnChange)) {
            choiceMarkup += Field.AttachOnChange(checkboxField, CheckboxField.OnChange, convertedToken);
        }

        // 508 Compliance
        if (checkboxField.IsRequired == 'Yes') {
            choiceMarkup += ' aria-required="true"';
        }

        // Data-CheckboxGroup@, @Name, @Value, @TabIndex, @Class, @Id, @Type
        choiceMarkup += ' data-namespace="Choice" data-checkboxgroup="' + checkboxField.Name + '" name="' + checkboxField.Name + convertedToken + '" data-id="' + choice.Name + '"';
        choiceMarkup += ' tabindex="' + checkboxField.FocusIndex + '" id="' + checkboxField.Name + convertedToken + '" type="checkbox" class="gtc-input-checkbox-choice" />';

        // Label</>
        choiceMarkup += '</label>';

        // Return
        return choiceMarkup;

    };

    Choice.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    Choice.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.Choice = window.Choice || {}, window, document, Common, Cache, Events, Velocity));
