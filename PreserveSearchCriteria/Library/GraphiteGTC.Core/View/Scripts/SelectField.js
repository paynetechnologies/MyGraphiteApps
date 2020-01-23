// Select Field
// Based On: SelectField -> ValueField -> Field -> ViewElement
(function (SelectField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SelectField.Render = function (selectField) {

        // Label/Icon Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(selectField.Label)) {
            labelExists = false;
        }
        var iconExists = true;
        if (Common.IsNotDefined(selectField.Icon)) {
            iconExists = false;
        }

        // Sanity Check: IsFirstBlank = Yes
        if (Common.IsDefined(selectField.OptionDetail.Options) && selectField.OptionDetail.Options.length > 0) {
            if (selectField.OptionDetail.IsFirstBlank == 'Yes') {
                var blankOption = {
                    Display: '&nbsp;',
                    Value: ''
                };
                selectField.OptionDetail.Options.unshift(blankOption);
            }
        }

        // Sanity Check: Set default Value
        if (Common.IsNotDefined(selectField.Value)) {
            if (Common.IsDefined(selectField.OptionDetail.Options) && selectField.OptionDetail.Options.length > 0 && Common.IsNotEmptyString(selectField.OptionDetail.Options[0].Value)) {
                selectField.Value = selectField.OptionDetail.Options[0].Value;
            }
        }

        // Label
        var selectFieldMarkup = Field.RenderLabel(selectField);

        // Select<, @Data-NameSpace, @Data-FieldType, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Data-LabelExists@, @Data-TranslateContent, Id@, Data-Disabled@, Select>
        selectFieldMarkup += '<select data-namespace="SelectField" data-configure="Pre" class="gtc-input-selectbox" data-iconexists="' + iconExists + '" data-labelexists="' + labelExists + '" data-translatecontent="' + selectField.TranslateContent + '" ' + ValueField.RenderAttributes(selectField) + Field.RenderAttributes(selectField);

        // Data-HasChanged@ Event
        if (selectField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + selectField.Name, '#' + selectField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (selectField.IsRequired == 'Yes') {
            selectFieldMarkup += ' aria-required="true"';
        }

        // @Data-IsFirstBlank
        selectFieldMarkup += ' data-isfirstblank="' + selectField.OptionDetail.IsFirstBlank + '"';

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(selectField.OnChange)) {
            selectFieldMarkup += Field.AttachOnChange(selectField, SelectField.OnChange);
        }
        selectFieldMarkup += '>';

        // Build Options
        var convertedToken = Common.SanitizeToken(selectField.Value);
        if (Common.IsDefined(selectField.OptionDetail.Options) && selectField.OptionDetail.Options.length > 0) {
            var option, index = 0, length = selectField.OptionDetail.Options.length;
            for ( ; index < length; index++) {
                option = selectField.OptionDetail.Options[index];

                // Option<
                selectFieldMarkup += '<option';

                // @Selected
                if (convertedToken == Common.SanitizeToken(option.Value)) {
                    selectFieldMarkup += ' selected="selected"';
                }

                // @Value, Option>, Display, Option</>
                selectFieldMarkup += ' value="' + option.Value + '">' + option.Display + '</option>';
            }
        }
        else {
            // Empty Default Option
            selectFieldMarkup += '<option value="">&nbsp;</option>';
        }

        // Select</>
        selectFieldMarkup += '</select>';

        // Icon
        if (Common.IsDefined(selectField.Icon)) {
            selectFieldMarkup += Icon.Render(selectField.Icon, true, labelExists);
        }

        // Return
        return selectFieldMarkup;

    };

    SelectField.Configure = function (field, configureStage) {

        Widgets.selectbox(field, { ClassSelectbox: 'gtc-classSpanSelectbox', ClassSelectboxActiveOption: 'gtc-classSelectboxActiveOption', ParentElement: 'PageContent' });

    };

    SelectField.OnChange = function (event) {

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

    SelectField.HasValue = function (selectField) {

        if (Common.IsDefined(selectField.Value)) {
            return true;
        }
        return false;

    };

    SelectField.IsCompleted = function (field) {

        var fieldValue = field.value;
        if (Common.IsDefined(fieldValue) && Common.IsNotEmptyString(fieldValue)) {
            return true;
        }
        return false;

    };

    SelectField.UpdateValue = function (field, fieldValue) {

        var found = false, sanitizedValue = Common.SanitizeToken(fieldValue);
        var options = Common.QueryAll('option', field);
        var option, index = 0, length = options.length;
        for ( ; index < length; index++) {
            option = options[index];
            if (Common.SanitizeToken(Common.GetAttr(option, 'value')) == sanitizedValue) {
                Common.SetAttr(option, 'value', fieldValue);
                found = true;
                break;
            }
        }

        // Don't try to update if no option found, will cause widget error
        if (found) {
            ValueField.UpdateValue(field, fieldValue);
            GTC.TriggerEvent(field, 'widgetUpdateValue');
        }
        else {
            console.log('Selectbox: UpdateValue - The value: ' + fieldValue + ' was not found!')
        }

    };

    SelectField.UpdateLabel = function (field, fieldLabel, promises, context) {

        Field.UpdateLabel(field, fieldLabel, promises, context);

    };

    SelectField.UpdateOptions = function (field, optionParameters) {

        // Intialize
        var selectedValue = '';

        // SanityCheck and IsFirstBlank = Yes
        var isFirstBlank = Common.GetAttr(field, 'data-isfirstblank');
        if (Common.IsDefined(optionParameters) && optionParameters.length > 0) {
            if (isFirstBlank == 'Yes') {
                var blankOptionParameter = {
                    Name: '&nbsp;',
                    Value: ''
                };
                optionParameters.unshift(blankOptionParameter);
            }
            else {
                selectedValue = optionParameters[0].Value;
            }
        }
        else {
            optionParameters = [
                {
                    'Name': '&nbsp;',
                    'Value': ''
                }
            ];
        }

        // Set Options
        var optionMarkup = '';
        var option, index = 0, length = optionParameters.length;
        for ( ; index < length; index++) {
            option = optionParameters[index];
            optionMarkup += '<option';
            if (selectedValue == option.Value) {
                optionMarkup += ' selected="selected"';
            }
            optionMarkup += ' value="' + option.Value + '">' + option.Name + '</option>';
        }
        field.innerHTML = optionMarkup;

        // Trigger events for widget
        GTC.TriggerEvent(field, 'widgetUpdateOptions');
        GTC.TriggerEvent(field, 'widgetUpdateValue');
        Field.UpdateRequiredStatus(field);

    };

    SelectField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    SelectField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.SelectField = window.SelectField || {}, window, document, Common, Cache, Events, Velocity));
