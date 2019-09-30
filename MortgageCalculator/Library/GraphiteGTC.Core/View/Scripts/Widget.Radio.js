// Radio Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var RadioWidget = {

        // Options
        options: {
            ClassLabelRadioUnselected: 'gtc-classLabelRadioUnselected',
            ClassLabelRadioSelected: 'gtc-input-radio-selected',
            ClassRadioLocked: 'gtc-input-locked'
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

        // Private Methods
        _setLabelStyle: function () {

            var label = this.element.parentNode;
            if (this.element.checked) {
                Common.AddClass(label, this.options.ClassLabelRadioUnselected);
                Common.AddClass(label, this.options.ClassLabelRadioSelected);
                Common.SetAttr(label, 'aria-checked', 'true');
            }
            else {
                Common.AddClass(label, this.options.ClassLabelRadioUnselected);
                Common.RemoveClass(label, this.options.ClassLabelRadioSelected);
                Common.SetAttr(label, 'aria-checked', 'false');
            }

        },

        _bindClick: function () {

            // Initialize
            var thisWidget = this;

            // Click
            Events.On(thisWidget.element, 'click',
                function (event) {
                    var radioGroups = Common.QueryAll('.gtc-input-radio-option[name="' + this.name + '"]');
                    var index = 0, length = radioGroups.length;
                    for ( ; index < length; index++) {
                        Common.RemoveClass(radioGroups[index].parentNode, thisWidget.options.ClassLabelRadioSelected);
                        Common.SetAttr(radioGroups[index].parentNode, 'aria-checked', 'false');
                    }
                    Common.AddClass(this.parentNode, thisWidget.options.ClassLabelRadioSelected);
                    Common.SetAttr(this.parentNode, 'aria-checked', 'true');
                }
            );

            // ClearWidget
            Events.On(thisWidget.element, 'widgetClearValue',
                function (event) {
                    var radioGroups = Common.QueryAll('.gtc-input-radio-option[name="' + this.name + '"]');
                    var index = 0, length = radioGroups.length;
                    for ( ; index < length; index++) {
                        Common.RemoveClass(radioGroups[index].parentNode, thisWidget.options.ClassLabelRadioSelected);
                        Common.SetAttr(radioGroups[index].parentNode, 'aria-checked', 'false');
                        radioGroups[index].checked = false;
                    }
                }
            );

            // UpdateWidget
            Events.On(thisWidget.element, 'widgetUpdateValue',
                function (event) {
                    var radioGroups = Common.QueryAll('.gtc-input-radio-option[name="' + this.name + '"]');
                    var index = 0, length = radioGroups.length;
                    for ( ; index < length; index++) {
                        Common.RemoveClass(radioGroups[index].parentNode, thisWidget.options.ClassLabelRadioSelected);
                        Common.SetAttr(radioGroups[index].parentNode, 'aria-checked', 'false');
                    }
                    Common.AddClass(this.parentNode, thisWidget.options.ClassLabelRadioSelected);
                    Common.SetAttr(this.parentNode, 'aria-checked', 'true');
                }
            );

        },

        _disableControl: function () {

            // Initialize
            var thisWidget = this;

            // Disabled control
            if (!thisWidget.Locked) {
                thisWidget.Locked = true;
                Common.SetAttr(thisWidget.element, 'disabled', 'disabled');
                Common.SetAttr(thisWidget.element, 'data-disabled', 'true');
                var closestGroup = Common.Closest('.gtc-input-radio-group', thisWidget.element);
                Common.AddClass(closestGroup, thisWidget.options.ClassRadioLocked);
                if (Common.IsNotDefined(Common.Query('span.gtc-input-system', closestGroup))) {
                    Common.InsertHTMLString(closestGroup, Common.InsertType.Append, '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
                }
                Common.SetAttr(thisWidget.element, 'tabindex', '-1');
            }

        },

        _enableControl: function () {

            // Initialize
            var thisWidget = this;

            // Enable control
            if (thisWidget.Locked) {
                Common.RemoveAttr(thisWidget.element, 'disabled');
                Common.RemoveAttr(thisWidget.element, 'data-disabled');
                var closestGroup = Common.Closest('.gtc-input-radio-group', thisWidget.element);
                Common.RemoveClass(closestGroup, thisWidget.options.ClassRadioLocked);
                var systemInput = Common.Query('span.gtc-input-system', closestGroup);
                if (Common.IsDefined(systemInput)) {
                    Common.Remove(systemInput);
                }
                Common.SetAttr(thisWidget.element, 'tabindex', thisWidget.FocusIndex);
                thisWidget.Locked = false;
            }

        },

        _init: function () {
        },

        _create: function () {

            this.Locked = false;
            this.FocusIndex = Common.GetAttr(this.element, 'tabindex');

            // Initialize
            this._setLabelStyle();
            this._bindClick();

            // Disabled?
            var dataDisabled = Common.GetAttr(this.element, 'data-disabled');
            if (dataDisabled == 'true') {
                this._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.radio', RadioWidget);

} (window, document, Common, Cache, Events, Velocity));
