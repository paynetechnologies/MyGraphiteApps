// Checkbox Field
// Based On: CheckboxField -> Field -> ViewElement
(function (CheckboxField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    CheckboxField.Render = function (checkboxField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(checkboxField.Label)) {
            labelExists = false;
        }

        // 508 Compliance
        var className = '';
        if (Common.IsNotDefined(checkboxField.Label)) {
            var generatedLabel = {
                TextString: checkboxField.Name,
                ScreenReaderOnly: true
            };
            if (Common.IsDefined(checkboxField.Placeholder)) {
                generatedLabel.TextString = checkboxField.Placeholder;
            }
            checkboxField.Label = generatedLabel;
        }

        // 508 Compliance
        if (checkboxField.Label.ScreenReaderOnly == true) {
            className += ' gtc-sr-only';
        }

        // Choice Type?
        var choiceType = '';
        if (Common.IsDefined(checkboxField.ChoiceDetail) && Common.IsDefined(checkboxField.ChoiceDetail.Source)) {
            choiceType = checkboxField.ChoiceDetail.Source;
        }

        // FieldSet</>, @Data-TranslateContent, Legend<
        var checkboxFieldMarkup = '<fieldset class="gtc-input-checkbox-group';
        if (Common.IsDefined(checkboxField.Icon)) {
            if (labelExists == false) {
                checkboxFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                checkboxFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        checkboxFieldMarkup += '" id="' + checkboxField.Name + '" name="' + checkboxField.Name + '" data-serializable role="checkboxgroup" data-namespace="CheckboxField"';
        checkboxFieldMarkup += ' data-choicetype="' + choiceType + '" data-translatecontent="' + checkboxField.TranslateContent + '"><legend class="gtc-input-checkbox-label gtc-label' + className + '" for="' + checkboxField.Name + '"><span';

        // Translations
        if (Common.IsDefined(checkboxField.Label) && Common.IsDefined(checkboxField.Label.TextString)) {
            checkboxFieldMarkup += ' data-translate="' + checkboxField.Label.TextString + '"';
        }

        // Span>, Label, Span</>
        checkboxFieldMarkup += '>' + Common.TranslateKey(checkboxField.Label.TextString) + '</span>';
        checkboxFieldMarkup += Field.RenderLabel(checkboxField, true) + '</legend>';

        // Tooltip
        if (Common.IsDefined(checkboxField.Label.Tooltip)) {
            checkboxFieldMarkup += '<a class="gtc-tooltip gtc-label-tooltip" data-translate="[data-tooltip]' + checkboxField.Label.Tooltip + '" data-tooltip="' + Common.TranslateKey(checkboxField.Label.Tooltip) + '"></a>';
        }

        // Data-Disabled@
        var fieldAttributesMarkup = Field.RenderAttributes(checkboxField);

        // Build Checkbox
        checkboxFieldMarkup += '<div class="gtc-checkboxgroup-divforlabels">';
        if (Common.IsDefined(checkboxField.ChoiceDetail) && Common.IsDefined(checkboxField.ChoiceDetail.Choices)) {
            var choice, index = 0, length = checkboxField.ChoiceDetail.Choices.length;
            for ( ; index < length; index++) {
                // Choice
                choice = checkboxField.ChoiceDetail.Choices[index];
                checkboxFieldMarkup += Choice.Render(checkboxField, choice, fieldAttributesMarkup);
            }
        }
        checkboxFieldMarkup += '</div></fieldset>';

        // Icon
        if (Common.IsDefined(checkboxField.Icon)) {
            checkboxFieldMarkup += Icon.Render(checkboxField.Icon, true, labelExists);
        }

        // Return
        return checkboxFieldMarkup;

    };

    CheckboxField.SerializeArray = function (serializable) {

        // Serialize Checkboxes
        fieldParameterName = Common.RemovePrefix(serializable.id);
        var choiceType = Common.GetAttr(serializable, 'data-choicetype');
        var checkboxes = Common.QueryAll('.gtc-input-checkbox-choice', serializable);
        uiParameters = [];
        var checkbox, entityParameter, uiParameter, index = 0, length = checkboxes.length;
        for ( ; index < length; index++) {
            checkbox = checkboxes[index];
            entityParameter = {
                Name: choiceType,
                Value: null,
                UiParameters: []
            };
            if (checkbox.checked == true) {
                entityParameter.UiParameters.push({
                    Name: 'Id',
                    Value: Common.GetAttr(checkbox, 'data-id')
                });
                uiParameters.push(entityParameter);
            }
        }    

        // Field UiParameter
        var uiParameter = {
            Name: fieldParameterName,
            Value: null,
            UiParameters: uiParameters
        }
        return uiParameter;

    };

    CheckboxField.OnChange = function (event) {

        // Serialize
        var fieldValueUiParameter = [];
        serializable = event.target.parentElement.parentElement;
        fieldValueUiParameter.push(CheckboxField.SerializeArray(serializable));

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    CheckboxField.IsCompleted = function (field) {

        return true;

    };

    CheckboxField.HasValue = function (field) {

        return true;

    };

    CheckboxField.ReplaceElement = function (field, viewElements, promises) {

        // Build Choice Array
        var choiceArray = [];
        var choiceDetail = viewElements[0].ChoiceDetail;
        var checkboxChoice, choiceIndex = 0, choiceLength = choiceDetail.Choices.length;
        for (; choiceIndex < choiceLength; choiceIndex++) {
            checkboxChoice = choiceDetail.Choices[choiceIndex];
            var checkBoxName = field.name + Common.SanitizeToken(checkboxChoice.Name);
            var checkBoxValue = (checkboxChoice.IsChecked == "Yes") ? true : false;
            choiceArray.push(
                {
                    Name: checkBoxName,
                    Value: checkBoxValue
                }
            );
        }

        // Update checkboxes
        var checkboxes = Common.QueryAll('.gtc-input-checkbox-choice');
        var checkbox, index = 0, length = checkboxes.length;
        for (; index < length; index++) {
            checkbox = checkboxes[index];
            if (IsChecked(choiceArray, checkbox)) {
                Common.SetAttr(checkbox, "checked", "checked");
                checkbox.checked = true;
            }
            else {
                Common.RemoveAttr(checkbox, "checked");
                checkbox.checked = false;
            }
            GTC.TriggerEvent(checkbox, 'widgetUpdateValue');
        }
        Events.Trigger(field, 'focusout');

    };

    // Private Methods
    function IsChecked(choiceArray, checkbox) {

        var checkboxChoice, choiceIndex = 0, choiceLength = choiceArray.length;
        for (; choiceIndex < choiceLength; choiceIndex++) {
            checkboxChoice = choiceArray[choiceIndex];
            if (checkboxChoice.Name == checkbox.name) {
                return checkboxChoice.Value;
            }
        }
        return false;

    };

} (window.CheckboxField = window.CheckboxField || {}, window, document, Common, Cache, Events, Velocity));
