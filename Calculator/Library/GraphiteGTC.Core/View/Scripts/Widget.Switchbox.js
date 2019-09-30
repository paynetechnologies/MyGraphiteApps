// Switchbox Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var SwitchboxWidget = {

        // Options
        options: {
            OnText: 'YES',
            OffText: 'NO',
            Type: 'Default',
            ClassSwitchboxLocked: 'gtc-input-locked'
        },

        // Public Methods
        IsDisabled: function () {

            return GTC.IsControlDisabled(this.element);

        },

        DisableControl: function () {

            this._disableControl();

        },

        EnableControl: function () {

            this._enableControl();

        },

        UpdateControl: function () {

            var isChecked = this.element.checked;
            if (isChecked == true && !this.SwitchOn) {
                this._switchOn();
            }
            else if (isChecked != true && this.SwitchOn) {
                this._switchOff();
            }

        },

        FlipSwitch: function (flipOn) {

            if (flipOn == true && this.SwitchOn == false) {
                this._switchOn();
            }
            else if (flipOn == false && this.SwitchOn == true) {
                this._switchOff();
            }

        },

        // Private Methods
        _destroy: function () {

            // Initialize
            var thisWidget = this;

            // Unbind events
            var focusElementsId = '#' + htmlInputId + '-SwitchContainer';
            if (thisWidget.options.Type == 'SwitchMask') {
                focusElementsId += ', #' + htmlInputId + 'Text';
            }
            var focusElements = Common.QueryAll(focusElementsId);
            Events.Off(focusElements, 'focusin');
            Events.Off(focusElements, 'focusout');

            // Remove generated html
            Common.Remove(Common.GetAllSibling(thisWidget.element, '.gtc-switch'));

        },

        _createSwitchbox: function () {

            // Intialize
            var thisWidget = this;
            var htmlInputId = thisWidget.element.id;
            var elementStyle = thisWidget.element.style;
            elementStyle.left = '-9999px';
            elementStyle.position = 'absolute';
            if (thisWidget.element.checked) {
                thisWidget.SwitchOn = true;
            }
            else {
                thisWidget.SwitchOn = false;
            }

            // Switchbox Markup
            var spanSwitchMarkup = '<span role="checkbox" aria-checked="' + thisWidget.SwitchOn + '" id="' + htmlInputId + '-SwitchContainer" class="gtc-switch" tabindex="' + thisWidget.FocusIndex + '">';
            spanSwitchMarkup += '<span class="gtc-switch-value" data-translate="' + thisWidget.options.OffText + '">' + Common.TranslateKey(thisWidget.options.OffText) + '</span>';
            spanSwitchMarkup += '<span class="gtc-switch-track">';
            spanSwitchMarkup += '<span id="' + htmlInputId + '-SwitchButton" class="gtc-switch-button"></span>';
            spanSwitchMarkup += '</span>';
            spanSwitchMarkup += '<span class="gtc-switch-value" data-translate="' + thisWidget.options.OnText + '">' + Common.TranslateKey(thisWidget.options.OnText) + '</span>';
            spanSwitchMarkup += '</span>';

            // Insert HTML
            Common.InsertHTMLString(thisWidget.element, Common.InsertType.After, spanSwitchMarkup);

        },

        _bindAnchorFocus: function () {

            // Initialize
            var thisWidget = this;
            var htmlInputId = thisWidget.element.id;
            var focusElementsId = '#' + htmlInputId + '-SwitchContainer';
            if (thisWidget.options.Type == 'SwitchMask') {
                focusElementsId += ', #' + htmlInputId + 'Text';
            }
            var focusElements = Common.QueryAll(focusElementsId);

            // Focus In
            Events.On(focusElements, 'focusin',
                function (event) {
                    if (thisWidget.Focused != true) {
                        if (thisWidget.options.Type == 'SwitchMask') {
                            Common.AddClass(Common.Query('.gtc-label[for="' + htmlInputId + '"]'), 'gtc-label-focused');
                        }
                        else {
                            Events.Trigger(thisWidget.element, 'focusin');
                        }
                        Events.Off(document, 'keydown.switchboxKeyboardClicks');
                        Events.On(document, 'keydown.switchboxKeyboardClicks.' + thisWidget.element.id,
                            function (event) {
                                switch (event.keyCode) {
                                    case GTC.Keyboard.Enter:
                                    case GTC.Keyboard.Space:
                                        Events.Trigger(thisWidget.element, 'click');
                                        break;
                                }
                            }
                        );
                        thisWidget.Focused = true;
                    }
                }
            );

            // Focus Out
            Events.On(focusElements, 'focusout',
                function (event) {
                    if (thisWidget.options.Type == 'SwitchMask') {
                        Common.RemoveClass(Common.Query('.gtc-label[for="' + htmlInputId + '"]'), 'gtc-label-focused');
                    }
                    else {
                        Events.Trigger(thisWidget.element, 'focusout');
                    }
                    Events.Off(document, 'keydown.switchboxKeyboardClicks');
                    thisWidget.Focused = false;
                }
            );

        },

        _switchOn: function () {

            // Initialize
            var thisWidget = this;
            var htmlInputId = thisWidget.element.id;

            if (thisWidget.options.Type == 'SwitchMask') {
                // Position, Placeholder, ParameterName, CurrencyCode(?) and Mask Options
                thisWidget.element.value = 'Right';
                var switchMaskOptions = JSON.parse(Common.GetAttr(Common.Closest('.gtc-switchmask', thisWidget.element), 'data-switchmask'));
                var switchMaskTextFieldName = switchMaskOptions.Name + 'Text';
                var textField = Common.Get(switchMaskTextFieldName);
                textField.value = '';
                Common.SetAttr(textField, 'placeholder', Common.TranslateKey(switchMaskOptions.RightSwitch.Placeholder));
                Common.SetAttr(textField, 'data-translate', '[placeholder]' + switchMaskOptions.RightSwitch.Placeholder);
                Common.SetAttr(textField, 'data-parametername', switchMaskOptions.RightSwitch.Name);
                Common.RemoveAttr(textField, 'data-currencycode');
                if (switchMaskOptions.RightSwitch.IsCurrency == 'Yes') {
                    Common.SetAttr(textField, 'data-currencycode', switchMaskOptions.RightSwitch.Code);
                }
                var hasMask = Common.IsDefined(switchMaskOptions.RightSwitch.Mask);
                if (hasMask) {
                    var maskingOptions = Mask.BuildMaskingOptions(switchMaskOptions.RightSwitch.Mask);
                    Common.SetAttr(textField, 'data-mask', JSON.stringify(maskingOptions));
                    setTimeout(
                        function () {
                            textField.focus();
                        }, 10
                    );
                }
            }
            Common.SetAttr(Common.Get(htmlInputId + '-SwitchContainer'), 'aria-checked', 'true');
            thisWidget.SwitchOn = true;

        },

        _switchOff: function () {

            // Initialize
            var thisWidget = this;
            var htmlInputId = thisWidget.element.id;

            if (thisWidget.options.Type == 'SwitchMask') {
                // Position, Placeholder, ParameterName, CurrencyCode(?) and Mask Options
                thisWidget.element.value = 'Left';
                var switchMaskOptions = JSON.parse(Common.GetAttr(Common.Closest('.gtc-switchmask', thisWidget.element), 'data-switchmask'));
                var switchMaskTextFieldName = switchMaskOptions.Name + 'Text';
                var textField = Common.Get(switchMaskTextFieldName);
                textField.value = '';
                Common.SetAttr(textField, 'placeholder', Common.TranslateKey(switchMaskOptions.LeftSwitch.Placeholder));
                Common.SetAttr(textField, 'data-translate', '[placeholder]' + switchMaskOptions.LeftSwitch.Placeholder);
                Common.SetAttr(textField, 'data-parametername', switchMaskOptions.LeftSwitch.Name);
                Common.RemoveAttr(textField, 'data-currencycode');
                if (switchMaskOptions.LeftSwitch.IsCurrency == 'Yes') {
                    Common.SetAttr(textField, 'data-currencycode', switchMaskOptions.LeftSwitch.Code);
                }
                var hasMask = Common.IsDefined(switchMaskOptions.LeftSwitch.Mask);
                if (hasMask) {
                    var maskingOptions = Mask.BuildMaskingOptions(switchMaskOptions.LeftSwitch.Mask);
                    Common.SetAttr(textField, 'data-mask', JSON.stringify(maskingOptions));
                    setTimeout(
                        function(){
                            textField.focus();
                        }, 10
                    );
                }
            }
            Common.SetAttr(Common.Get(htmlInputId + '-SwitchContainer'), 'aria-checked', 'false');
            thisWidget.SwitchOn = false;

        },

        _bindElementChange: function () {

            // Initialize
            var thisWidget = this;

            // Bind change event
            Events.On(thisWidget.element, 'change.updateSwitchBox',
                function () {
                    if (this.checked) {
                        thisWidget._switchOn();
                    }
                    else {
                        thisWidget._switchOff();
                    }
                }
            );

        },

        _disableControl: function () {

            // Initialize
            var thisWidget = this;

            // Disable
            if (!this.Locked) {
                this.Locked = true;
                Common.SetAttr(thisWidget.element, 'disabled', 'disabled');
                Common.SetAttr(thisWidget.element, 'data-disabled', 'true');
                if (thisWidget.options.Type != 'SwitchMask') {
                    var switchbox = Common.Closest('.gtc-switchbox', thisWidget.element);
                    Common.AddClass(switchbox, thisWidget.options.ClassSwitchboxLocked);
                    Common.InsertHTMLString(switchbox, Common.InsertType.After, '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
                }
                else if (thisWidget.options.Type == 'SwitchMask') {
                    var closestSwitchMask = Common.Closest('.gtc-switchmask', thisWidget.element);
                    Common.AddClass(closestSwitchMask, thisWidget.options.ClassSwitchboxLocked);
                    var textField = Common.Query('.gtc-switchmask-text', closestSwitchMask);
                    if (!Common.HasClass(textField, 'gtc-input-locked')) {
                        Widgets.textbox(textField, 'DisableControl');
                    }
                }
            }

        },

        _enableControl: function () {

            // Initialize
            var thisWidget = this;

            // Enable
            if (this.Locked) {
                Common.RemoveAttr(thisWidget.element, 'disabled');
                Common.RemoveAttr(thisWidget.element, 'data-disabled');
                if (thisWidget.options.Type != 'SwitchMask') {
                    var switchbox = Common.Closest('.gtc-switchbox', thisWidget.element);
                    Common.RemoveClass(switchbox, thisWidget.options.ClassSwitchboxLocked);
                    Common.Remove(Common.GetSibling(switchbox, Common.SiblingType.Next));
                }
                else if (thisWidget.options.Type == 'SwitchMask') {
                    var switchMask = Common.Closest('.gtc-switchmask', thisWidget.element);
                    Common.RemoveClass(switchMask, thisWidget.options.ClassSwitchboxLocked);
                    var textField = Common.Query('.gtc-switchmask-text', switchMask);
                    if (Common.HasClass(textField, 'gtc-input-locked')) {
                        Widgets.textbox(textField, 'EnableControl');
                    }
                }
                this.Locked = false;
            }

        },

        _init: function () {
        },

        _create: function () {

            // Data
            this.Locked = false;
            this.Focused = false;
            this.SwitchOn = false;
            this.FocusIndex = Common.GetAttr(this.element, 'tabindex');
            Common.SetAttr(this.element, 'tabindex', '-1');

            // Display Text
            var parentDiv = Common.Closest('.gtc-switchbox', this.element);
            if (Common.IsDefined(parentDiv)) {
                this.options.OnText = Common.GetAttr(parentDiv, 'data-ontext') || '';
                this.options.OffText = Common.GetAttr(parentDiv, 'data-offtext') || '';
            }
            else {
                if (Common.IsNotDefined(this.options.OnText)) {
                    this.options.OnText = 'Yes';
                }
                if (Common.IsNotDefined(this.options.OffText)) {
                    this.options.OffText = 'No';
                }
            }

            // Initialize
            this._createSwitchbox();
            this._bindElementChange();
            this._bindAnchorFocus();

            // Check if field is disabled
            var dataDisabled = Common.GetAttr(this.element, 'data-disabled');
            if (dataDisabled == 'true') {
                this._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.switchbox', SwitchboxWidget);

} (window, document, Common, Cache, Events, Velocity));
