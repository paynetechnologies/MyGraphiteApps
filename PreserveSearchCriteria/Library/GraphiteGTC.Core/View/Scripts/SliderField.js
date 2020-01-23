// Slider Field
// Based On: SliderField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (SliderField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SliderField.Render = function (sliderField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(sliderField.Label)) {
            labelExists = false;
        }

        // Label
        var sliderFieldMarkup = Field.RenderLabel(sliderField);

        // Div<, TabIndex@, Class@, Id@, Div>
        sliderFieldMarkup += '<div data-namespace="SliderField" data-configure="Pre" class="gtc-sliderfield';
        if (Common.IsDefined(sliderField.Icon)) {
            if (labelExists == false) {
                sliderFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                sliderFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        sliderFieldMarkup += '"' + ValueField.RenderAttributes(sliderField);

        // Mask exists
        var maskValue = null;
        var maskingOptions = '';
        var hasMask = Common.IsDefined(sliderField.Mask);
        if (hasMask) {
            maskingOptions = Mask.BuildMaskingOptions(sliderField.Mask);
            sliderFieldMarkup += ' data-mask=\'' + JSON.stringify(maskingOptions) + '\'';

            // Usually we wouldn't attach a change event when there is a mask but since this mask has to do with the manual entry
            // and not the actual slider field lets trick Field.AttachOnChange and attach the event anyway
            maskValue = sliderField.Mask;
            sliderField.Mask = null;
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(sliderField.OnChange)) {
            sliderFieldMarkup += Field.AttachOnChange(sliderField, SliderField.OnChange);
        }
        sliderFieldMarkup += '><div class="gtc-sliderfield-container">';

        // Minimum Display
        sliderFieldMarkup += '<span class="gtc-sliderfield-min" id="' + sliderField.Name + '-Min">';
        if (Common.IsDefined(sliderField.Minimum)) {
            if (hasMask) {
                sliderFieldMarkup += Mask.Format(sliderField.Minimum, maskingOptions).Text;
            }
            else {
                sliderFieldMarkup += sliderField.Minimum;
            }
        }
        else {
            sliderFieldMarkup += '0';
        }
        sliderFieldMarkup += '</span><div class="gtc-sliderfield-slide" id="' + sliderField.Name + '-Slider"></div>';

        // Maximum Display
        sliderFieldMarkup += '<span class="gtc-sliderfield-max" id="' + sliderField.Name + '-Max">';
        if (Common.IsDefined(sliderField.Maximum)) {
            if (hasMask) {
                sliderFieldMarkup += Mask.Format(sliderField.Maximum, maskingOptions).Text;
            }
            else {
                sliderFieldMarkup += sliderField.Maximum;
            }
        }
        else {
            sliderFieldMarkup += '&infin;';
        }
        sliderFieldMarkup += '</span></div>';

        // Initialize configuration object
        var configurationObject = {};

        // Maual Entry
        if (sliderField.HasManualEntry == 'Yes') {
            configurationObject.hasManual = true;
            configurationObject.manualFieldId = sliderField.Name + '-Text';

            // As commented above we tricked Field.AttachOnChange so lets put it back the way it was
            if (hasMask) {
                sliderField.Mask = maskValue;
            }

            // Build text field object
            var textField = {
                Name: configurationObject.manualFieldId,
                Mask: sliderField.Mask,
                Placeholder: sliderField.Placeholder,
                Value: sliderField.Value,
                IsLocked: sliderField.IsLocked
            };

            // Label
            sliderFieldMarkup += Field.RenderLabel(textField);

            // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@, @Data-NameSpace, @Data-FieldType, Type@, Input/>
            sliderFieldMarkup += '<input class="gtc-input-textbox gtc-sliderfield-input-textbox';
            sliderFieldMarkup += '"' + MaskField.RenderAttributes(textField) + Field.RenderAttributes(textField);
            sliderFieldMarkup += ' data-namespace="TextField" type="text" />';

            // Change event
            // If we have manual entry with a mask we attach a custom change event because some keyup scenarios cause this to trigger twice,
            // once before masking finishes and once after (the original change kicks off first with the wrong value and the second is after
            // masking formats and sets the correct raw value.)
            var changeEvent = 'change.';
            if (hasMask) {
                changeEvent = 'specialchange.';
            }
            Events.On(document.body, changeEvent + sliderField.Name + '-Text', '#' + sliderField.Name + '-Text',
                function (event) {
                    var value;
                    if (Common.IsDefined(Common.GetAttr(this, 'data-mask'))) {
                        value = Common.GetAttr(this, 'data-raw');
                        Widgets.sliderfield(Common.Get(sliderField.Name + '-Slider'), 'value', Common.GetAttr(this, 'data-raw'));
                    }
                    else {
                        value = this.value;
                        Widgets.sliderfield(Common.Get(sliderField.Name + '-Slider'), 'value', this.value);
                    }
                    var tooltip = '';
                    var sliderFieldElement = Common.Get(sliderField.Name);
                    if (Common.IsDefined(value)) {
                        if (hasMask) {
                            var sliderFieldText = Common.Get(sliderField.Name + '-Text');
                            var formatResult = Mask.Format(value.toString(), JSON.parse(Common.GetAttr(sliderFieldText, 'data-mask')));
                            tooltip = '<div style="display: none; opacity: 0;" class="gtc-sliderfield-tooltip"><div>' + formatResult.Text + '</div><div></div></div>';
                        }
                        else {
                            tooltip = '<div style="display: none; opacity: 0;" class="gtc-sliderfield-tooltip"><div>' + value + '</div><div></div></div>';
                        }
                    }
                    Common.Query('.gtc-ui-slider-handle', sliderFieldElement).innerHTML = tooltip;
                }
            );
        }

        // Div</>
        sliderFieldMarkup += '</div>';

        // Icon
        if (Common.IsDefined(sliderField.Icon)) {
            sliderFieldMarkup += Icon.Render(sliderField.Icon, true, labelExists);
        }

        // Build configuration object
        configurationObject.slide = function (event, ui) {
            var tooltip = '';
            var sliderFieldElement = Common.Get(sliderField.Name);
            if (sliderField.HasManualEntry == 'Yes') {
                var sliderFieldText = Common.Get(sliderField.Name + '-Text');
                if (hasMask) {
                    var formatResult = Mask.Format(ui.value.toString(), JSON.parse(Common.GetAttr(sliderFieldText, 'data-mask')));
                    sliderFieldText.value = formatResult.Text;
                    tooltip = '<div class="gtc-sliderfield-tooltip"><div>' + formatResult.Text + '</div><div></div></div>';
                }
                else {
                    sliderFieldText.value = ui.value;
                    tooltip = '<div class="gtc-sliderfield-tooltip"><div>' + ui.value + '</div><div></div></div>';
                }
            }
            else {
                var displayValue = ui.value;
                if (hasMask) {
                    var formatResult = Mask.Format(displayValue.toString(), JSON.parse(Common.GetAttr(sliderFieldElement, 'data-mask')));
                    displayValue = formatResult.Text;
                }
                tooltip = '<div class="gtc-sliderfield-tooltip"><div>' + displayValue + '</div><div></div></div>';
            }
            Common.Query('.gtc-ui-slider-handle', sliderFieldElement).innerHTML = tooltip;
        };
        configurationObject.change = function (event, ui) {
            if (Common.IsEventViewElementDefined(sliderField.OnChange)) {
                var sliderFieldElement = Common.Get(sliderField.Name);
                var eventData = {
                    FieldValue: ui.value
                };
                Events.Trigger(sliderFieldElement, 'change', eventData);
            }
        };
        configurationObject.orientation = sliderField.Orientation.toLowerCase();
        configurationObject.handle = sliderField.Name + '-Handle';
        configurationObject.animate = true;
        configurationObject.range = false;
        if (sliderField.IsLocked == 'Yes') {
            configurationObject.disabled = true;
        }
        if (sliderField.IsRange == 'Yes') {
            configurationObject.range = true;
        }
        if (Common.IsDefined(sliderField.Minimum)) {
            if (isDecimal(sliderField.Minimum)) {
                configurationObject.min = parseFloat(sliderField.Minimum);
            }
            else {
                configurationObject.min = parseInt(sliderField.Minimum, 10);
            }
        }
        if (Common.IsDefined(sliderField.Maximum)) {
            if (isDecimal(sliderField.Maximum)) {
                configurationObject.max = parseFloat(sliderField.Maximum);
            }
            else {
                configurationObject.max = parseInt(sliderField.Maximum, 10);
            }
        }
        if (Common.IsDefined(sliderField.Increment)) {
            if (isDecimal(sliderField.Increment)) {
                configurationObject.step = parseFloat(sliderField.Increment);
            }
            else {
                configurationObject.step = parseInt(sliderField.Increment, 10);
            }
        }
        if (Common.IsDefined(sliderField.Value) || Common.IsDefined(sliderField.Values)) {
            if (sliderField.IsRange == 'Yes' && Common.IsDefined(sliderField.Values)) {
                configurationObject.values = sliderField.Values;
            }
            else if (Common.IsDefined(sliderField.Value)) {
                if (isDecimal(sliderField.Value)) {
                    configurationObject.value = parseFloat(sliderField.Value);
                }
                else {
                    configurationObject.value = parseInt(sliderField.Value, 10);
                }
            }
        }
        configurationObject.start = function (event, ui) {
            Velocity(Common.Query('.gtc-sliderfield-tooltip', this), 'fadeIn');
        };
        configurationObject.stop = function (event, ui) {
            Velocity(Common.Query('.gtc-sliderfield-tooltip', this), 'fadeOut');
        };

        // configuresliderfield event: Setup configuring of slider (triggered from Page.Configure)
        Events.One(document.body, 'configuresliderfield',
            function (event) {
                var sliderFieldText = Common.Get(sliderField.Name + '-Text');
                Common.SetAttr(sliderFieldText, 'data-specialchange', 'Yes');
                Widgets.sliderfield(Common.Get(sliderField.Name + '-Slider'), configurationObject);
            }
        );
        return sliderFieldMarkup;

    };

    SliderField.Configure = function (field, configureStage) {

        var inputField = Common.GetChildren(field, 'input');
        if (inputField.length > 0) {
            Widgets.textbox(inputField);
        }
        Events.Trigger(field, 'configuresliderfield');

    };

    SliderField.OnChange = function (event, eventData) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.id);
        // Throw away change event from Mask.OnFocusOut, we will trigger it from widget always
        // and without this we will get two events when manual entry with a mask exists
        if (Common.IsNotDefined(event.isTrigger)) {
            return;
        }

        // Field Value
        var fieldValue = null;
        if (Common.IsDefined(eventData)) {
            fieldValue = eventData.FieldValue;
        }
        else {
            fieldValue = Widgets.sliderfield(Common.Get(this.id + '-Slider'), 'value');
        }
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value: fieldValue,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    SliderField.HasManualEntry = function (field) {

        var silderTextField = Common.Get(field.id + "-Text");
        if (Common.IsNotDefined(silderTextField)) {
            return false;
        }
        return true;

    };

    SliderField.UpdateValue = function (field, fieldValue) {

        if (SliderField.HasManualEntry(field)) {
            var silderTextField = Common.Get(field.id + "-Text");
            var formattedValue = fieldValue;
            var maskingOptions = Common.GetAttr(field, 'data-mask');
            if (Common.IsString(maskingOptions)) {
                if (fieldValue.length > 0) {
                    var formatResult = Mask.Format(fieldValue, JSON.parse(maskingOptions));
                    if (!formatResult.Valid) {
                        return;
                    }
                    formattedValue = formatResult.Text;
                }
                Common.SetAttr(silderTextField, 'data-raw', fieldValue);
            }
            silderTextField.value = formattedValue;
        }
        fieldValue = Widgets.sliderfield(Common.Get(field.id + '-Slider'), 'updatevalue', fieldValue);

    };

    SliderField.UpdateLabel = function (field, fieldLabel, promises, context) {

        Field.UpdateLabel(field, fieldLabel, promises, context);

    };

    SliderField.HasValue = function (sliderField) {

        return MaskField.HasValue(sliderField);

    };

    SliderField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    SliderField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

    // Private Methods
    function isDecimal(value) {

        var decimalRegex = new RegExp(/^(\d+\.\d*|\.\d+)$/);
        return decimalRegex.test(value.toString());

    };

} (window.SliderField = window.SliderField || {}, window, document, Common, Cache, Events, Velocity));
