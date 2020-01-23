/** 
 * @class CheckboxField
 * @classdesc Supports the CheckboxField View Element<br>
 *            Based On: ViewElement > Field
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (CheckboxField, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function CheckboxField.Render
     * @param {object} checkboxField - The CheckboxField View Element in JSON format
     * @description Generates the HTML markup for the CheckboxField View Element 
     * @returns {string} HTML Markup of the CheckboxField View Element
     * @listens click (id = <var>checkboxFieldName</var>Wrapper)
     * @listens click (window)
     */
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

        // FieldSet<, @Data-TranslateContent, Legend<
        var checkboxFieldMarkup = '<fieldset class="gtc-input-checkbox-group';
        if (Common.IsDefined(checkboxField.Icon)) {
            if (labelExists == false) {
                checkboxFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                checkboxFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        checkboxFieldMarkup += '" id="' + checkboxField.Name + '" name="' + checkboxField.Name + '" data-serializable role="checkboxgroup" data-namespace="CheckboxField" data-configure="Pre"';
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
        
        // Vertical Checkbox markup
        var idNamespaces = '';
        if (checkboxField.Orientation == 'Vertical') {
            // Div<, Span</>, Anchor</>, Div<
            checkboxFieldMarkup += '<div class="gtc-vertical-checkbox-wrapper"><div class="gtc-vertical-checkbox" id="' + checkboxField.Name + 'Wrapper"><span class="gtc-vertical-TagsSpan gtc-classSpanSelectbox"><a class="gtc-vertical-tags" role="button">&nbsp;</a></span></div><div id="' + checkboxField.Name + 'DropdownWrapper" class="gtc-dropdown-wrapper">';
            idNamespaces += '.' + checkboxField.Name + 'Wrapper';
        }

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

        // Vertical Checkbox Div>, Div>
        if (checkboxField.Orientation == 'Vertical') {
            checkboxFieldMarkup += '</div></div>';
        }

        // Div>, Fieldset>
        checkboxFieldMarkup += '</div></fieldset>';

        // Icon
        if (Common.IsDefined(checkboxField.Icon)) {
            checkboxFieldMarkup += Icon.Render(checkboxField.Icon, true, labelExists);
        }

        // Attach click event
        if (checkboxField.Orientation == 'Vertical') {
            var mobileEventType = '';
            if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
                mobileEventType += ' touchstart' + idNamespaces;
            }
            Events.On(document.body, 'click' + mobileEventType, '#' + checkboxField.Name + 'Wrapper',
                function (event) {
                    var checkBox = event.currentTarget.nextSibling;
                    CloseCheckboxDropDowns();
                    if (Common.IsHidden(checkBox)) {
                        Common.AddClass(event.currentTarget, 'gtc-tagsDropdown-upArrow');
                        Velocity(checkBox, 'slideDown', 200);
                    } 
                    else {
                        Common.RemoveClass(event.currentTarget, 'gtc-tagsDropdown-upArrow');
                        Velocity(checkBox, 'slideUp', 200);
                    }
                }
            );

            // Outside click event handling
            Events.On(window, 'click',
                function (event) {
                    if (Common.IsDefined(event.target.parentElement)) {
                        var currentClass = Common.GetAttr(event.target.parentElement, 'class');
                        if (Common.IsDefined(currentClass)) {
                            if (currentClass.indexOf('gtc-vertical') == '-1' && currentClass.indexOf('gtc-input-checkbox') == '-1' && currentClass.indexOf('gtc-checkboxgroup-divforlabels') == '-1') {
                                CloseCheckboxDropDowns();
                            } 
                        }
                    }
                }
            );
        }

        // Return
        return checkboxFieldMarkup;

    };

    /**
     * @function CheckboxField.Configure
     * @param {object} field - The CheckboxField DOM element
     * @param {string} configureStage - Pre for Configuration before Translations or Post for Configuration after Translations
     * @description Called by Page.Configure after the dynamic HTML markup is added to the DOM
     */
    CheckboxField.Configure = function (field, configureStage) {

        var checkboxChoices = Common.QueryAll('.gtc-input-checkbox-choice', field);
        if (checkboxChoices.length > 0) {
            Widgets.checkbox(checkboxChoices, { ClassLabelCheckboxUnchecked: 'gtc-classLabelCheckboxUnchecked', ClassLabelCheckboxUncheckedHover: 'gtc-classLabelCheckboxUncheckedHover', ClassLabelCheckboxChecked: 'gtc-input-checkbox-selected', ClassLabelCheckboxCheckedHover: 'gtc-classLabelCheckboxCheckedHover' });
        }

    };

    /**
     * @function CheckboxField.SerializeArray
     * @param {object} serializable - The CheckboxField DOM element
     * @description Serializes the choices in the CheckboxField
     * @returns {UiParameter} An UiParameter with the property UiParameters set to the checked choices of the CheckboxField
     */
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

    /**
     * @function CheckboxField.OnChange
     * @param {event} event - A DOM click Event
     * @description Calls Field.OnChange (which will call the OnChange<i>CheckboxField</i> Behavior)
     */
    CheckboxField.OnChange = function (event) {

        // Serialize
        var fieldValueUiParameter = [];
        serializable = event.target.parentElement;
        fieldValueUiParameter.push(CheckboxField.SerializeArray(serializable));

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    /**
     * @function CheckboxField.IsCompleted
     * @param {object} field - The CheckboxField DOM element
     * @description Returns <i>true</i>
     * @returns {boolean} Returns <i>true</i>
     */
    CheckboxField.IsCompleted = function (field) {

        return true;

    };

    /**
     * @function CheckboxField.HasValue
     * @param {object} field - The CheckboxField DOM element
     * @description Returns <i>true</i>
     * @returns {boolean} Returns <i>true</i>
     */
    CheckboxField.HasValue = function (field) {

        return true;

    };

    /**
     * @function CheckboxField.ReplaceElement
     * @param {object} field - The CheckboxField DOM element
     * @param {object[]} viewElements -  An array that contains one CheckboxField View Element in JSON format
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @description Replaces the choices inside a CheckboxField
     * @fires focusout (CheckboxField)
     */
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

    /**
     * @function CheckboxField.UpdateLabel
     * @param {object} field - The CheckboxField DOM element
     * @param {string} fieldLabel - The new label for the Field
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the label of the CheckboxField
     */
    CheckboxField.UpdateLabel = function (field, fieldLabel, promises, context) {

        var label = Common.Query('legend', field);
        Label.UpdateLabel(label, fieldLabel, promises, context, Common.IsHidden(field));

    };

    // Private Methods
    function IsChecked (choiceArray, checkbox) {

        var checkboxChoice, choiceIndex = 0, choiceLength = choiceArray.length;
        for (; choiceIndex < choiceLength; choiceIndex++) {
            checkboxChoice = choiceArray[choiceIndex];
            if (checkboxChoice.Name == checkbox.name) {
                return checkboxChoice.Value;
            }
        }
        return false;

    };

    function CloseCheckboxDropDowns () {

        var index = 0, checkBoxWrapper = Common.QueryAll('.gtc-vertical-checkbox-wrapper');
        for (; index < checkBoxWrapper.length; index++) {
            var boxWrapperChildren = Common.GetChildren(checkBoxWrapper[index], '.gtc-dropdown-wrapper');
            var tagDropDownArrow = Common.GetChildren(checkBoxWrapper[index], '.gtc-vertical-checkbox');
            var checkBoxDropdownDiv = Common.GetByClass('gtc-dropdown-wrapper', checkBoxWrapper[index]);
            if (Common.IsVisible(checkBoxDropdownDiv[0])) {
                Velocity(boxWrapperChildren, 'slideUp', 300);
            }
            Common.RemoveClass(tagDropDownArrow[0], 'gtc-tagsDropdown-upArrow');
        }

    };

} (window.CheckboxField = window.CheckboxField || {}, window, document, Common, Cache, Events, Velocity));
