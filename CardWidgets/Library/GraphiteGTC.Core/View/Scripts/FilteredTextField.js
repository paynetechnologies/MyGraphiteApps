// Filtered Text Field
// Based On: FilteredTextField -> TextField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (FilteredTextField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    FilteredTextField.Render = function (filteredTextField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(filteredTextField.Label)) {
            labelExists = false;
        }

        // Label
        var filteredTextFieldMarkup = Field.RenderLabel(filteredTextField);

        // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        filteredTextFieldMarkup += '<input class="gtc-input-filteredtextfield';
        if (Common.IsDefined(filteredTextField.Icon)) {
            if (labelExists == false) {
                filteredTextFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                filteredTextFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        filteredTextFieldMarkup += '"' + MaskField.RenderAttributes(filteredTextField) + Field.RenderAttributes(filteredTextField);

        // Data-HasChanged@ Event
        if (filteredTextField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + filteredTextField.Name, '#' + filteredTextField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (filteredTextField.IsRequired == 'Yes') {
            filteredTextFieldMarkup += ' aria-required="true"';
        }

        // Free Form?
        filteredTextFieldMarkup += ' data-isfreeform="' + filteredTextField.IsFreeForm + '"';

        // Data-ControllerPath/ActionName@, Wire OnChange!
        var hasOnChange = false;
        if (Common.IsEventViewElementDefined(filteredTextField.OnChange)) {
            hasOnChange = true;
            filteredTextFieldMarkup += ' data-change=\'' + JSON.stringify(filteredTextField.OnChange) + '\'';
        }

        // OnKeyUp?
        if (Common.IsEventViewElementDefined(filteredTextField.OnKeyUp)) {
            filteredTextFieldMarkup += ' data-keyup=\'' + JSON.stringify(filteredTextField.OnKeyUp) + '\'';
        }

        // Create Filtered Text Array
        var currentValue = null;
        var convertedToken = Common.SanitizeToken(filteredTextField.Value);
        var labelValueArray = [];
        if (Common.IsDefined(filteredTextField.OptionDetail.Options)) {
            var option, decodedValue, index = 0, length = filteredTextField.OptionDetail.Options.length;
            for ( ; index < length; index++) {
                option = filteredTextField.OptionDetail.Options[index];
                decodedValue = Common.Decode(option.Display);
                var labelValueObject = {
                    label: decodedValue,
                    value: option.Value
                };
                labelValueArray.push(labelValueObject);

                // @Selected
                if (convertedToken == Common.SanitizeToken(option.Value)) {
                    filteredTextFieldMarkup += ' data-raw="' + option.Value + '"';
                    currentValue = decodedValue;
                }
            }
        }
        else if (filteredTextField.IsFreeForm == 'Yes') {
            currentValue = convertedToken;
        }

        // Call event once element is rendered
        Events.On(document.body, 'filteredtextfieldcreate.' + filteredTextField.Name, '#' + filteredTextField.Name,
            function (event) {
                var filteredTextFieldObj = Common.Get(filteredTextField.Name);
                var filteredTextFieldOption = Common.Get(filteredTextField.Name + 'OptionsSpan');

                // Store label\Values for lookups later
                Cache.Set(filteredTextFieldObj, 'labelValueArray', labelValueArray);

                // Set current display value
                filteredTextFieldObj.value = currentValue;

                // Attach focusin event for updating values correctly
                Events.On(filteredTextFieldObj, 'focusin',
                    function () {
                        Events.Off(this, 'keyup.filteredTextField');
                        Events.On(this, 'keyup.filteredTextField',
                            function (event) {
                                if (Common.IsEmptyString(this.value)) {
                                    Common.RemoveAttr(this, 'data-raw');
                                    return true;
                                }
                                var labelValueArray = Cache.Get(this, 'labelValueArray');
                                var selectedOption = FilteredTextField.Validate(this, labelValueArray);
                                if (!selectedOption) {
                                    Common.RemoveAttr(this, 'data-raw');
                                }
                                else {
                                    Common.SetAttr(this, 'data-raw', selectedOption.value);
                                    this.value = selectedOption.label;
                                }
                            }
                        );
                    }
                );

                // Attach focusout event for updating values correctly
                Events.On(filteredTextFieldObj, 'focusout',
                    function () {
                        Events.Off(filteredTextFieldObj, 'keyup.filteredTextField');
                    }
                );

                // Attach blur event for updating values correctly
                Events.On(filteredTextFieldObj, 'blur',
                    function (event) {
                        if (Common.IsEmptyString(this.value)) {
                            if (Common.HasClass(this, 'gtc-failed-masking-validation')) {
                                Form.RemoveMaskingError(this);
                            }
                            Common.RemoveAttr(this, 'data-raw');
                            return true;
                        }
                        var labelValueArray = Cache.Get(this, 'labelValueArray');
                        var selectedOption = FilteredTextField.Validate(this, labelValueArray);
                        if (filteredTextField.IsFreeForm == 'No' && !selectedOption) {
                            Common.RemoveAttr(this, 'data-raw');
                            this.select();
                            this.focus();
                            return false;
                        }
                        else if (filteredTextField.IsFreeForm == 'Yes' && !selectedOption) {
                            Common.SetAttr(this, 'data-raw', this.value);
                            return true;
                        }
                        else {
                            if (Common.HasClass(this, 'gtc-failed-masking-validation')) {
                                Form.RemoveMaskingError(this);
                            }
                            Common.SetAttr(this, 'data-raw', selectedOption.value);
                            this.value = selectedOption.label;
                            return true;
                        }
                    }
                );

                // Minimum Characters?
                var minimumCharacters = 1;
                if (filteredTextField.MinimumCharacters > 0) {
                    minimumCharacters = filteredTextField.MinimumCharacters;
                }

                var dataSource = null;
                // OnKeyUp?
                if (Common.IsEventViewElementDefined(filteredTextField.OnKeyUp)) {
                    dataSource = FilteredTextField.OnKeyUp;
                }
                else {
                    dataSource = labelValueArray;
                }

                // Initialize autocomplete
                Widgets.filteredtextfield(filteredTextFieldObj,
                    {
                        appendTo: filteredTextFieldOption,
                        minLength: minimumCharacters,
                        source: dataSource,
                        focus:
                            function (event, ui) {
                                Common.SetAttr(this, 'data-raw', ui.item.value);
                                this.value = ui.item.label;
                                return false;
                            },
                        change:
                            function (event, ui) {
                                if (filteredTextField.IsFreeForm == 'No' && Common.IsNotDefined(ui.item) && Common.IsNotEmptyString(event.target.value)) {
                                    Common.RemoveAttr(this, 'data-raw');
                                    this.select();
                                    this.focus();
                                    return false;
                                }
                                if (hasOnChange) {
                                    FilteredTextField.OnChange(event);
                                }
                            },
                        select:
                            function (event, ui) {
                                if (Common.HasClass(this, 'gtc-failed-masking-validation')) {
                                    Form.RemoveMaskingError(this);
                                }
                                Common.SetAttr(this, 'data-raw', ui.item.value);
                                this.value = ui.item.label;
                                return false;
                            },
                        response:
                            function (event, ui) {
                                var pos = Common.Position(filteredTextFieldObj);
                                var posLeft = pos.left;
                                var posTop = pos.top + Common.Height(filteredTextFieldObj, true);
                                var filteredTextFieldOptionStyle = filteredTextFieldOption.style;
                                filteredTextFieldOptionStyle.left = posLeft + 'px';
                                filteredTextFieldOptionStyle.top = posTop + 'px';
                                filteredTextFieldOptionStyle.width = Common.Height(this, true) + 'px';
                                filteredTextFieldOptionStyle.display = 'block';
                            },
                        close:
                            function (event, ui) {
                                filteredTextFieldOption.style.display = 'none';
                            },
                        position:
                            {
                                my: 'left top',
                                at: 'left top',
                                of: filteredTextFieldOption,
                                collision: 'fit',
                                within: filteredTextFieldOption
                            }
                    }
                );
            }
        );

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        filteredTextFieldMarkup += ' data-namespace="FilteredTextField" type="text" /><span class="gtc-input-system"><i class="gtc-icon-styles fa fa-filter"></i></span>';
        filteredTextFieldMarkup += '<span id="' + filteredTextField.Name + 'OptionsSpan"></span>';

        // Icon
        if (Common.IsDefined(filteredTextField.Icon)) {
            filteredTextFieldMarkup += Icon.Render(filteredTextField.Icon, true, labelExists);
        }
        return filteredTextFieldMarkup;

    };

    FilteredTextField.OnChange = function (event) {

        // Initialize
        var eventTarget = event.target;

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(eventTarget.name);

        // Get Field Value
        if (Common.GetAttr(eventTarget, 'data-isfreeform') == 'No' && Common.IsNotEmptyString(eventTarget.value)) {
            rawData = Common.GetAttr(eventTarget, 'data-raw');
            if (rawData.length <= 0) {
                rawData = null;
            }
        }
        else {
            rawData = eventTarget.value;
        }

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value: rawData,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(eventTarget, fieldValueUiParameter);

    };

    FilteredTextField.OnKeyUp = function (request, response) {

        // Initialize
        var field = this.element;
        var fieldId = Common.RemovePrefix(field.name);
        var onKeyUpParameters = [];

        // Get Change Event
        var onKeyUpEvent = JSON.parse(Common.GetAttr(field, 'data-keyup'));
        if (Common.IsDefined(onKeyUpEvent.UiParameters)) {
            onKeyUpParameters = onKeyUpParameters.concat(onKeyUpEvent.UiParameters);
        }

        // Change Parameters
        if (Common.IsDefined(onKeyUpEvent.FormToSerialize)) {
            var addAttr = false;
            if (Common.Closest('.gtc-form', field).id == onKeyUpEvent.FormToSerialize && Common.HasAttr(field, 'data-serializable')) {
                addAttr = true;

                // Removing and adding back after form is serialized avoids failing mask validations
                Common.RemoveAttr(field, 'data-serializable');
            }
            onKeyUpParameters = onKeyUpParameters.concat(Form.SerializeArray(Common.Get(onKeyUpEvent.FormToSerialize)));
            if (addAttr) {
                Common.SetAttr(field, 'data-serializable', '');
            }
        }

        // Create and Add Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldId,
                Value: request.term,
                UiParameters: null
            }
        ];
        onKeyUpParameters = onKeyUpParameters.concat(fieldValueUiParameter);

        // Response Handler
        var callback = function (pageInstructionData, requestingElement) {
            if (Common.IsDefined(pageInstructionData.PageInstructions) && pageInstructionData.PageInstructions.length == 1) {
                var updateInstruction = pageInstructionData.PageInstructions[0];
                var labelValueArray = [];
                var option, decodedDisplayValue, decodedValue, index = 0, length = updateInstruction.UiParameters.length;
                for ( ; index < length; index++) {
                    option = updateInstruction.UiParameters[index];
                    decodedDisplayValue = Common.Decode(option.Name.replace("&amp;", "&"));
                    decodedValue = Common.Decode(option.Value.replace("&amp;", "&"));
                    var labelValueObject = {
                        label: decodedDisplayValue,
                        value: decodedValue
                    };
                    labelValueArray.push(labelValueObject);
                }
                Cache.Set(field, 'labelValueArray', labelValueArray);
                response(labelValueArray);
            }
        };

        // Execute View Behavior
        Common.ExecuteViewBehavior(onKeyUpEvent.ControllerPath + onKeyUpEvent.ActionName, onKeyUpParameters, callback, field, true);

    };

    FilteredTextField.Validate = function (field, labelValueArray) {

        var selectedValue = Common.GetAttr(field, 'data-raw');
        var selectedLabel = field.value;
        var selectedOption;
        if (Common.IsDefined(labelValueArray)) {
            Common.FilterArray(labelValueArray,
                function (item) {
                    if (item.label == selectedLabel) {
                        selectedOption = item;
                    }
                }
            );
        }
        return selectedOption;

    };

    FilteredTextField.HasValue = function (filteredTextField) {

        if (Common.IsDefined(filteredTextField.Value)) {
            return true;
        }
        return false;

    };

    FilteredTextField.IsCompleted = function (filteredTextField) {

        var fieldValue = filteredTextField.value;
        if (fieldValue.length > 0) {
            return true;
        }
        return false;

    };

    FilteredTextField.UpdateValue = function (field, fieldValue) {

        Common.SetAttr(field, 'data-raw', fieldValue);
        var isFreeForm = Common.GetAttr(field, 'data-isfreeform');
        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }
        if (Common.IsDefined(fieldValue) && Common.IsNotEmptyString(fieldValue)) {
            var matchingOption = FilteredTextField.FindMatchingOption(field, fieldValue);
            if (isFreeForm == 'Yes' && !matchingOption) {
                field.value = fieldValue;
            }
            else {
                field.value = matchingOption.label;
                matchingOption.value = fieldValue;
            }
        }
        else {
            field.value = '';
        }

    };

    FilteredTextField.FindMatchingOption = function (field, fieldValue) {

        var labelValueArray = Cache.Get(field, 'labelValueArray');
        var matchingOption;
        var convertedToken = Common.SanitizeToken(fieldValue);
        var option, index = 0, length = labelValueArray.length;
        for ( ; index < length; index++) {
            option = labelValueArray[index];
            if (Common.SanitizeToken(option.value) == convertedToken) {
                matchingOption = option;
                break;
            }
        }
        return matchingOption;

    };

    FilteredTextField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    FilteredTextField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.FilteredTextField = window.FilteredTextField || {}, window, document, Common, Cache, Events, Velocity));
