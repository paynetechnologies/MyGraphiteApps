// Switch Field
// Based On: SwitchField -> ValueField -> Field -> ViewElement
(function (SwitchField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SwitchField.Render = function (switchField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(switchField.Label)) {
            labelExists = false;
        }

        // Label
        var switchFieldMarkup = Field.RenderLabel(switchField);

        // Div<, @Id, @Class, @Data-Namespace
        switchFieldMarkup += '<div id="' + switchField.Name + '-Container" class="gtc-switchbox';
        if (Common.IsDefined(switchField.Icon)) {
            if (labelExists == false) {
                switchFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                switchFieldMarkup += ' gtc-input__icon-label-left';
            }
        }

        // Display Text?
        switchFieldMarkup += '" data-ontext="'
        switchFieldMarkup += (Common.IsDefined(switchField.OnText)) ? switchField.OnText : '';
        switchFieldMarkup += '" data-offtext="'
        switchFieldMarkup += (Common.IsDefined(switchField.OffText)) ? switchField.OffText : '';
        switchFieldMarkup += '">'

        // Label<>, input<, Data-CheckboxGroup@, Name@, Value@, TabIndex@, Class@, Id@
        switchFieldMarkup += '<label class="gtc-switchbox-label" for="' + switchField.Name + '"><input data-namespace="SwitchField" data-configure="Pre" data-checkboxgroup="' + switchField.Name + '" name="' + switchField.Name + '" tabindex="' + switchField.FocusIndex + '" class="gtc-input-switchbox" id="' + switchField.Name + '"';

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(switchField.OnChange)) {
            switchFieldMarkup += Field.AttachOnChange(switchField, SwitchField.OnChange);
        }

        // 508 Compliance
        if (switchField.IsRequired == 'Yes') {
            switchFieldMarkup += ' aria-required="true"';
        }

        // Checked@
        if (switchField.Value == 'Yes') {
            switchFieldMarkup += ' checked="checked" value="Yes"';
        }

        // @Data-Serializable
        if (switchField.IsSerializable == 'Yes') {
            switchFieldMarkup += ' data-serializable';
            Events.On(document.body, 'change.fieldvaluechange.' + switchField.Name, '#' + switchField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // Data-Disabled@
        switchFieldMarkup += Field.RenderAttributes(switchField);

        // @Data-FieldType, Type@, Input>, Label</>, Div</>
        switchFieldMarkup += ' type="checkbox" /></label></div>';

        // Icon
        if (Common.IsDefined(switchField.Icon)) {
            switchFieldMarkup += Icon.Render(switchField.Icon, true, labelExists);
        }
        return switchFieldMarkup;

    };

    SwitchField.Configure = function (field, configureStage) {

        Widgets.switchbox(field, { OnText: 'Yes', OffText: 'No' });

    };

    SwitchField.OnChange = function (event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var yesNoValue = 'No';
        if (this.checked == true) {
            yesNoValue = 'Yes';
        }
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value: yesNoValue,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    SwitchField.HasValue = function (switchField) {

        return true;

    };

    SwitchField.IsCompleted = function (field) {

        return true;

    };

    SwitchField.UpdateValue = function (field, fieldValue) {

        var switchChecked = false;
        if (fieldValue == 'Yes') {
            switchChecked = true;
        }
        if (Common.IsDefined(Common.GetAttr(field, 'data-serializable'))) {
            Common.SetAttr(field, 'data-haschanged', 'Yes');
        }
        field.checked = switchChecked;
        Widgets.switchbox(field, 'FlipSwitch', switchChecked);

    };

    SwitchField.UpdateLabel = function (field, fieldLabel, promises, context) {

        Field.UpdateLabel(field, fieldLabel, promises, context);

    };

    SwitchField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    SwitchField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.SwitchField = window.SwitchField || {}, window, document, Common, Cache, Events, Velocity));
