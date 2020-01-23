// Field
// Based On: Field -> ViewElement
(function (Field, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Field.RenderLabel = function (field, isRadioGroup) {

        // Label
        var labelMarkup = '';

        // 508 Compliance
        if (Common.IsNotDefined(field.Label)) {
            var generatedLabel = {
                TextString: field.Name,
                ScreenReaderOnly: true
            };
            if (Common.IsDefined(field.Placeholder)) {
                generatedLabel.TextString = field.Placeholder;
            }
            field.Label = generatedLabel;
        }
        if (Common.IsNotDefined(isRadioGroup) || isRadioGroup == false) {
            labelMarkup += Label.RenderLabel(field.Label, field.Name);
        }

        // Required?
        if (field.IsRequired == 'Yes') {
            var fieldNamespace = window[field.Type.toString()];
            if (fieldNamespace.HasValue(field)) {
                labelMarkup += '<span id="SpanRequired' + field.Name + '" class="gtc-classSpanRequired gtc-classSpanRequiredCompleted">!</span>';
            }
            else {
                labelMarkup += '<span id="SpanRequired' + field.Name + '" class="gtc-classSpanRequired gtc-classSpanRequiredYes">!</span>';
            }

            // GetFieldIdentifier returns array of ids (RadioFields and CheckboxFields have multiple options/choices)
            var fieldIdentifiers = GetFieldIdentifier(field);

            // Focus Out - Required Update
            // Loop over ids and attach event for required fields
            var index = 0, length = fieldIdentifiers.length;
            for ( ; index < length; index++) {
                AttachUpdateRequiredFieldEvent(fieldIdentifiers[index]);
            }
        }
        else {
            labelMarkup += '<span id="SpanRequired' + field.Name + '" class="gtc-classSpanRequired gtc-classSpanRequiredNo">!</span>';
        }

        // Return
        return labelMarkup;

    };

    Field.RenderAttributes = function (field) {

        // Data-Disabled@
        var attributeMarkup = '';
        if (field.IsLocked == 'Yes') {
            attributeMarkup = ' data-disabled="true"';
        }
        return attributeMarkup;

    };

    Field.IsCompleted = function (field) {

        var fieldType = Common.GetAttr(field, 'data-namespace');
        if (Common.IsDefined(fieldType)) {
            var fieldNamespace = window[fieldType.toString()];
            if (Common.IsDefined(fieldNamespace) && Common.IsFunction(fieldNamespace.IsCompleted)) {
                return fieldNamespace.IsCompleted(field);
            }
        }
        return true;

    };

    Field.UpdateRequiredStatus = function (field) {

        var requiredSpan = Common.Get('SpanRequired' + field.name);
        if (Field.IsCompleted(field)) {
            Common.RemoveClass(requiredSpan, 'gtc-classSpanRequiredYes');
            Common.AddClass(requiredSpan, 'gtc-classSpanRequiredCompleted');
        }
        else {
            Common.RemoveClass(requiredSpan, 'gtc-classSpanRequiredCompleted');
            Common.AddClass(requiredSpan, 'gtc-classSpanRequiredYes');
        }

    };

    Field.UpdateValue = function (field, value, isRadioArray) {

        // Sanity Check
        var fieldValue = "";
        if (Common.IsDefined(value)) {
            fieldValue = value;
        }

        // Field Type and Namespace
        var fieldType, fieldNamespace;
        if (isRadioArray) {
            fieldType = Common.GetAttr(field[0], 'data-namespace');
            fieldNamespace = window[Common.GetAttr(field[0], 'data-namespace')];
        }
        else {
            fieldType = Common.GetAttr(field, 'data-namespace');
            fieldNamespace = window[Common.GetAttr(field, 'data-namespace')];
        }

        // Update
        ViewElement.TestExists(fieldType, fieldNamespace, null, 'UpdateValue');
        fieldNamespace.UpdateValue(field, fieldValue);

    };

    Field.UpdateLabel = function (field, fieldLabel, promises, context) {

        var onParent = context == 'Parent';
        var label = Common.Get(field.id + '-Label', onParent);
        Label.UpdateLabel(label, fieldLabel, promises, context, Common.IsHidden(field));

    };

    Field.AttachOnChange = function (field, onChangeFunction, token) {

        // Initialize
        var eventMarkup = '';

        // No fully defined event?
        if (Common.IsEventViewElementDefined(field.OnChange)) {
            // No Mask?
            if (Common.IsNotDefined(field.Mask) || Common.IsEmptyString(field.Mask)) {
                if (Common.IsNotDefined(token)) {
                    token = '';
                }

                // Attach change event
                eventMarkup += EventElement.AttachEvent(field.Name + token, 'change', field.OnChange, onChangeFunction);
            }
            else {
                // Set data-change (change event is process in Mask.OnFocusOut)
                eventMarkup += ' data-change=\'' + JSON.stringify(field.OnChange) + '\'';
            }
        }
        return eventMarkup;

    };

    // Common function used by most elements that inherit from field
    Field.OnChange = function (field, fieldValueUiParameter) {

        // Initialize
        var onChangeParameters = [];

        // Get Change Event
        var onChangeEvent = JSON.parse(Common.GetAttr(field, 'data-change'));
        if (Common.IsDefined(onChangeEvent.UiParameters)) {
            onChangeParameters = onChangeParameters.concat(onChangeEvent.UiParameters);
        }

        // Change Parameters
        if (Common.IsDefined(onChangeEvent.FormToSerialize)) {
            onChangeParameters = onChangeParameters.concat(Form.SerializeArray(Common.Get(onChangeEvent.FormToSerialize)));
            if (Common.Closest('form', field).id != onChangeEvent.FormToSerialize) {
                onChangeParameters = onChangeParameters.concat(fieldValueUiParameter);
            }
        }
        else {
            onChangeParameters = onChangeParameters.concat(fieldValueUiParameter);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onChangeEvent.ControllerPath + onChangeEvent.ActionName, onChangeParameters, Page.RunInstructions, field);

    };

    Field.ShowPinwheel = function (field, customType) {

        var closestLi = Common.Closest('li', field);
        SpinKit.Show(closestLi, customType || 'FadingCircle');

    };

    Field.HidePinwheel = function (field) {

        var closestLi = Common.Closest('li', field);
        SpinKit.Hide(closestLi);

    };

    function GetFieldIdentifier (field) {

        // Initialize
        var fieldIds = [];
        var index = 0, length;

        // RadioField
        if (field.Type == 'RadioField') {
            if (Common.IsDefined(field.OptionDetail) && Common.IsDefined(field.OptionDetail.Options)) {
                var option;
                length = field.OptionDetail.Options.length;
                for ( ; index < length; index++) {
                    option = field.OptionDetail.Options[index];
                    fieldIds.push(field.Name + Common.SanitizeToken(option.Value));
                }
            }
        }
        else if (field.Type == 'CheckboxField') {
            // CheckboxField
            if (Common.IsDefined(field.ChoiceDetail) && Common.IsDefined(field.ChoiceDetail.Choices)) {
                var choice, convertedToken;
                length = field.ChoiceDetail.Choices.length;
                for ( ; index < length; index++) {
                    choice = field.ChoiceDetail.Choices[index];
                    convertedToken = Common.SanitizeToken(choice.Name);
                    fieldIds.push(convertedToken);
                }
            }
        }
        else {
            // All Fields other fields
            fieldIds.push(field.Name);
        }

        // Return
        return fieldIds;

    };

    function AttachUpdateRequiredFieldEvent (fieldIdentifier) {

        Events.On(document.body, 'focusout.requiredField.' + fieldIdentifier, '#' + fieldIdentifier,
            function (event) {
                event.stopPropagation();
                Field.UpdateRequiredStatus(event.target);
            }
        );

    };

} (window.Field = window.Field || {}, window, document, Common, Cache, Events, Velocity));
