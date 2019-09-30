// Switch Mask Field
// Based On: SwitchMaskField -> ValueField -> Field -> ViewElement
(function (SwitchMaskField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SwitchMaskField.Render = function (switchMaskField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(switchMaskField.Label)) {
            labelExists = false;
        }

        // Initialize (Currency)
        var currencyDefiniton = null;
        var currentCurrency = Common.GetStorage('CurrentCurrency');
        if (Common.IsDefined(currentCurrency)) {
            var currencyDefiniton = JSON.parse(Common.GetStorage('CurrentCurrency'));
            if (Common.IsDefined(currencyDefiniton)) {
                if (switchMaskField.RightSwitch.IsCurrency == 'Yes' && Common.IsNotDefined(switchMaskField.RightSwitch.Code)) {
                    switchMaskField.RightSwitch.Code = currencyDefiniton.Code;
                    switchMaskField.RightSwitch.Symbol = currencyDefiniton.Symbol;
                    switchMaskField.RightSwitch.NumberOfDecimalPlaces = currencyDefiniton.NumberOfDecimalPlaces;
                }
                else if (switchMaskField.LeftSwitch.IsCurrency == 'Yes' && Common.IsNotDefined(switchMaskField.LeftSwitch.Code)) {
                    switchMaskField.LeftSwitch.Code = currencyDefiniton.Code;
                    switchMaskField.LeftSwitch.Symbol = currencyDefiniton.Symbol;
                    switchMaskField.LeftSwitch.NumberOfDecimalPlaces = currencyDefiniton.NumberOfDecimalPlaces;
                }
            }
        }

        // Label
        var switchMaskFieldMarkup = Field.RenderLabel(switchMaskField);

        // Div<, @Id, @Class, @Data-Namespace
        switchMaskFieldMarkup += '<div id="' + switchMaskField.Name + '" class="gtc-switchmask';
        if (Common.IsDefined(switchMaskField.Icon)) {
            if (labelExists == false) {
                switchMaskFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                switchMaskFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        switchMaskFieldMarkup += '" data-namespace="SwitchMaskField"';

        // Checkbox: SwitchMaskOptions
        var switchMaskOptions = {
            Name: switchMaskField.Name,
            Selection: switchMaskField.Selection,
            LeftSwitch: switchMaskField.LeftSwitch,
            RightSwitch: switchMaskField.RightSwitch
        };
        switchMaskFieldMarkup += ' data-switchmask=\'' + JSON.stringify(switchMaskOptions) + '\'';

        // @Data-Serializable
        if (switchMaskField.IsSerializable == 'Yes') {
            switchMaskFieldMarkup += ' data-serializable';
        }

        // Checkbox: Data-ControllerPath/ActionName@, Wire OnChange!
        var switchMaskName = switchMaskField.Name;
        switchMaskField.Name += '-Checkbox';
        if (Common.IsEventViewElementDefined(switchMaskField.OnChange)) {
            switchMaskFieldMarkup += Field.AttachOnChange(switchMaskField, SwitchMaskField.OnChange);
        }
        switchMaskField.Name = switchMaskName;
        switchMaskFieldMarkup += '>';

        // Checkbox: input<, Data-CheckboxGroup@, Value@, TabIndex@, Class@, Id@
        switchMaskFieldMarkup += '<label id="' + switchMaskField.Name + 'Label" class="gtc-switchmask-label" for="' + switchMaskField.Name + '-Checkbox">';
        switchMaskFieldMarkup += '<input data-namespace="SwitchMaskCheckbox" data-checkboxgroup="' + switchMaskField.Name + '-Checkbox" value="' + switchMaskField.Selection + '" tabindex="' + switchMaskField.FocusIndex + '" class="gtc-input-switchmask" name="' + switchMaskField.Name + '-Checkbox" id="' + switchMaskField.Name + '-Checkbox"';

        // 508 Compliance
        if (switchMaskField.IsRequired == 'Yes') {
            switchMaskFieldMarkup += ' aria-required="true"';
        }

        // HasChanged
        if (switchMaskField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + switchMaskField.Name + '-Checkbox', '#' + switchMaskField.Name + '-Checkbox',
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // Checkbox: Checked@
        if (switchMaskField.Selection == 'Right') {
            switchMaskFieldMarkup += ' checked="checked"';
        }

        // Checkbox: Data-Disabled@
        switchMaskFieldMarkup += Field.RenderAttributes(switchMaskField);

        // Checkbox: Type@, Input>
        switchMaskFieldMarkup += ' type="checkbox" /></label>';

        // Text: Setup MaskField
        var currentSwitchPlaceholder = '';
        var currentSwitchMask = '';
        if (Common.IsDefined(switchMaskField.LeftSwitch)) {
            currentSwitchPlaceholder = switchMaskField.LeftSwitch.Placeholder;
            currentSwitchMask = switchMaskField.LeftSwitch.Mask;
        }
        if (Common.IsDefined(switchMaskField.RightSwitch) && switchMaskField.Selection == 'Right') {
            currentSwitchPlaceholder = switchMaskField.RightSwitch.Placeholder;
            currentSwitchMask = switchMaskField.RightSwitch.Mask;
        }
        var maskTextField = {
            Name: switchMaskField.Name + 'Text',
            FocusIndex: switchMaskField.FocusIndex,
            IsDisplayed: switchMaskField.IsDisplayed,
            Label: switchMaskField.Label,
            IsLocked: switchMaskField.IsLocked,
            IsRequired: switchMaskField.IsRequired,
            OnChange: switchMaskField.OnChange,
            Value: switchMaskField.Value,
            Placeholder: currentSwitchPlaceholder,
            Mask: currentSwitchMask
        };

        // Text: input<, Data-CheckboxGroup@ (used for label focus), Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        switchMaskFieldMarkup += '<input alt="SwitchMaskText" class="gtc-switchmask-text"' + MaskField.RenderAttributes(maskTextField) + Field.RenderAttributes(maskTextField);

        // Data-HasChanged@ Event
        if (switchMaskField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + maskTextField.Name, '#' + maskTextField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(maskTextField.OnChange)) {
            switchMaskFieldMarkup += Field.AttachOnChange(maskTextField, SwitchMaskField.OnChange);
        }

        // 508 Compliance
        if (switchMaskField.IsRequired == 'Yes') {
            switchMaskFieldMarkup += ' aria-required="true"';
        }

        // Text: Data-CurrencyCode@
        if (Common.IsDefined(currencyDefiniton)) {
            if (switchMaskField.Selection == 'Right' && switchMaskField.RightSwitch.IsCurrency == 'Yes') {
                switchMaskFieldMarkup += ' data-currencycode="' + switchMaskField.RightSwitch.Code + '"';
            }
            else if (switchMaskField.Selection == 'Left' && switchMaskField.LeftSwitch.IsCurrency == 'Yes') {
                switchMaskFieldMarkup += ' data-currencycode="' + switchMaskField.LeftSwitch.Code + '"';
            }
        }

        // Text: Data-ParameterName@
        var parameterName = '';
        if (Common.IsDefined(switchMaskField.LeftSwitch)) {
            parameterName = switchMaskField.LeftSwitch.Name;
        }
        if (Common.IsDefined(switchMaskField.RightSwitch) && switchMaskField.Selection == 'Right') {
            parameterName = switchMaskField.RightSwitch.Name;
        }
        switchMaskFieldMarkup += ' data-parametername="' + parameterName + '"';

        // Text: Data-NameSpace@, Type@, Input/> (Data-NameSpace is used to avoid serializing Form)
        switchMaskFieldMarkup += ' data-namespace="SwitchMaskText" type="text" />';

        // Checkbox/Text: Setup configuring of switchbox and textbox (triggered from Page.Configure)
        var offText = '';
        var onText = '';
        if (Common.IsDefined(switchMaskField.LeftSwitch)) {
            offText = switchMaskField.LeftSwitch.Label;
        }
        if (Common.IsDefined(switchMaskField.RightSwitch)) {
            onText = switchMaskField.RightSwitch.Label;
        }
        Events.On(document.body, 'configureswitchmask.' + switchMaskField.Name + '-Checkbox', '#' + switchMaskField.Name + '-Checkbox',
            function (event) {
                Widgets.textbox(Common.Get(switchMaskField.Name + 'Text'));
                Widgets.switchbox(Common.Get(switchMaskField.Name + '-Checkbox'), { OnText: onText, OffText: offText, Type: 'SwitchMask' });
            }
        );

        // Div</>
        switchMaskFieldMarkup += '</div>';

        // Icon
        if (Common.IsDefined(switchMaskField.Icon)) {
            switchMaskFieldMarkup += Icon.Render(switchMaskField.Icon, true, labelExists);
        }

        // Return
        return switchMaskFieldMarkup;

    };

    SwitchMaskField.OnChange = function (event) {

        // Initialize (TODO: RemovePrefix of ParameterName)
        var switchMask = Common.Closest('.gtc-switchmask', this);
        var data = JSON.parse(Common.GetAttr(switchMask, 'data-switchmask'));
        var fieldName = null;
        var fieldValue = null;
        var uiParameters = null;

        // Send up correct value depending on what changed
        switch (this.type) {
            case "checkbox":
                if (this.checked == true) {
                    fieldValue = 'Yes';
                }
                else {
                    fieldValue = 'No';
                }
                fieldName = switchMask.id;
                break;
            case "text":
                fieldValue = Common.GetAttr(this, 'data-raw');
                if (Common.IsNotDefined(fieldValue)) {
                    fieldValue = this.value;
                }
                if (fieldValue.length <= 0) {
                    fieldValue = null;
                }
                else {
                    fieldValue = fieldValue.replace(/\r?\n/g, '\r\n');
                }
                fieldName = Common.GetAttr(this, 'data-parametername');
                var currencyCode = JSON.parse(Common.GetAttr(this, 'data-currencycode'));
                if (Common.IsDefined(currencyCode)) {
                    uiParameters = [
                        {
                            Name: 'Code',
                            Value: currencyCode,
                            UiParameters: null
                        }
                    ];
                }
                break;
        }

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldName,
                Value: fieldValue,
                UiParameters: uiParameters
            }
        ];

        // Call OnChange
        Field.OnChange(switchMask, fieldValueUiParameter);

    };

    SwitchMaskField.HasValue = function (switchMaskField) {

        return MaskField.HasValue(switchMaskField);

    };

    SwitchMaskField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    SwitchMaskField.UpdateValue = function (field, fieldValue) {

        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }
        MaskField.UpdateValue(Common.Get(field.id + 'Text'), fieldValue);

    };

    SwitchMaskField.UpdateSwitchMask = function (field, fieldValue, uiParameters, promises) {

        var switchboxField = Common.Get(field.id + '-Checkbox');
        if (uiParameters.length == 1) {
            var uiParameter = uiParameters[0];
            if (uiParameter.Value == 'Left') {
                if (switchboxField.checked == true) {
                    switchboxField.checked = false;
                }
            }
            else if (uiParameter.Value == 'Right') {
                if (switchboxField.checked != true) {
                    switchboxField.checked = true;
                }
            }
        }
        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }
        Widgets.switchbox(switchboxField, 'UpdateControl');
        MaskField.UpdateValue(Common.Get(field.id + 'Text'), fieldValue);

    };

    SwitchMaskField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    SwitchMaskField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.SwitchMaskField = window.SwitchMaskField || {}, window, document, Common, Cache, Events, Velocity));

// TODO: Find a better way to do this!
// Fake namespace for swtich mask text field on change
(function (SwitchMaskText, window, document, Common, Cache, Events, Velocity, undefined) {

    SwitchMaskText.OnChange = function (event) {

        SwitchMaskField.OnChange.call(this);

    };

} (window.SwitchMaskText = window.SwitchMaskText || {}, window, document, Common, Cache, Events, Velocity));
