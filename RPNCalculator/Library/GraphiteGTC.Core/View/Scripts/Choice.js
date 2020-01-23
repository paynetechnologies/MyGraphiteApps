/** 
 * @class Choice
 * @classdesc Supports the Choice property inside the CheckboxField<br>
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (Choice, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function Choice.Render
     * @param {object} checkboxField - The CheckboxField View Element in JSON format
     * @param {object} choice - The Choice in JSON format
     * @param {string} fieldAttributesMarkup - The Field attributes of the CheckboxField
     * @description Generates the HTML markup for a Choice inside a CheckboxField View Element 
     * @returns {string} HTML Markup of the Choice
     * @listens change.fieldvaluechange (id = <var>checkboxFieldNamechoiceName</var>)
     */
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

    /**
     * @function Choice.ShowPinwheel
     * @param {object} field - The CheckboxField DOM element
     * @description Shows Pinwheel on the View Element
     */
    Choice.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    /**
     * @function Choice.HidePinwheel
     * @param {object} field - The CheckboxField DOM element
     * @description Hides Pinwheel on the View Element
     */
    Choice.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.Choice = window.Choice || {}, window, document, Common, Cache, Events, Velocity));
