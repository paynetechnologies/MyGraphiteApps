// Checkbox Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var CheckboxWidget = {

        // Options
        options: {
            ClassLabelCheckboxUnchecked: 'gtc-classLabelCheckboxUnchecked',
            ClassLabelCheckboxUncheckedHover: 'gtc-classLabelCheckboxUncheckedHover',
            ClassLabelCheckboxChecked: 'gtc-input-checkbox-selected',
            ClassLabelCheckboxCheckedHover: 'gtc-classLabelCheckboxCheckedHover',
            ClassCheckboxLocked: 'gtc-input-locked'
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

            // Initialize
            var thisWidget = this;
            var label = thisWidget.element.parentNode;
            if (thisWidget.element.checked == true) {
                Common.AddClass(label, thisWidget.options.ClassLabelCheckboxUnchecked);
                Common.AddClass(label, thisWidget.options.ClassLabelCheckboxChecked);
                Common.SetAttr(label, 'aria-checked', 'true');
            }
            else {
                Common.AddClass(label, thisWidget.options.ClassLabelCheckboxUnchecked);
                Common.SetAttr(label, 'aria-checked', 'false');
            }

        },

        _bindFocus: function () {

            // Initialize
            var thisWidget = this;

            // Focus In
            Events.On(thisWidget.element, 'focusin',
                function (event) {
                    thisWidget.Focused = true;
                    if (thisWidget.element.checked == true) {
                        Common.AddClass(thisWidget.element.parentNode, thisWidget.options.ClassLabelCheckboxCheckedHover);
                    }
                    else {
                        Common.AddClass(thisWidget.element.parentNode, thisWidget.options.ClassLabelCheckboxUncheckedHover);
                    }
                }
            );

            // Focus Out
            Events.On(thisWidget.element, 'focusout',
                function (event) {
                    thisWidget.Focused = false;
                    if (thisWidget.element.checked == true) {
                        Common.RemoveClass(thisWidget.element.parentNode, thisWidget.options.ClassLabelCheckboxCheckedHover);
                    }
                    else {
                        Common.RemoveClass(thisWidget.element.parentNode, thisWidget.options.ClassLabelCheckboxUncheckedHover);
                    }
                }
            );

        },

        _updateDisplay: function () {

            // Initialize
            var thisWidget = this;

            // Update Field Display
            var serializable = Common.ParentsUntil(null, thisWidget.element, '.gtc-dropdown-wrapper');
            if (Common.IsDefined(serializable[0])) {
                var tagsWrapper = serializable[0].previousSibling;
                var checkBoxes = Common.GetByClass('gtc-input-checkbox-choice', serializable[0]);
                var tagsText = '', tags = [], index = 0;
                for ( ; index < checkBoxes.length; index++) {
                    if (checkBoxes[index].checked ) {
                        tagsText += checkBoxes[index].value;
                        tags.push(' ' + checkBoxes[index].previousSibling.innerHTML);
                    }
                }
                var tagsContainer = Common.GetByClass('gtc-vertical-tags', tagsWrapper);
                tagsContainer[0].innerHTML = tags.join();
            }
        },

        _bindClick: function () {

            // Initialize
            var thisWidget = this;

            // Click
            Events.On(thisWidget.element.parentNode, 'click',
                function (event, data) {
                    event.preventDefault();
                    if (data && data.stopProp) {
                        event.stopPropagation();
                    }
                    if (thisWidget.element.checked == true) {
                        Common.RemoveClass(this, thisWidget.options.ClassLabelCheckboxChecked);
                        Common.SetAttr(this, 'aria-checked', 'false');
                        thisWidget.element.checked = false;
                    }
                    else {
                        Common.AddClass(this, thisWidget.options.ClassLabelCheckboxChecked);
                        Common.SetAttr(this, 'aria-checked', 'true');
                        thisWidget.element.checked = true;
                    }
                    thisWidget._updateDisplay();
                    Events.Trigger(thisWidget.element, 'change');
                }
            );

            // UpdateWidget
            Events.On(thisWidget.element, 'widgetUpdateValue',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (thisWidget.element.checked == true) {
                        Common.AddClass(thisWidget.element.parentNode, thisWidget.options.ClassLabelCheckboxChecked);
                        Common.SetAttr(thisWidget.element.parentNode, 'aria-checked', 'true');
                    }
                    else {
                        Common.RemoveClass(thisWidget.element.parentNode, thisWidget.options.ClassLabelCheckboxChecked);
                        Common.SetAttr(thisWidget.element.parentNode, 'aria-checked', 'false');
                    }
                    thisWidget._updateDisplay();
                }
            );

        },

        _disableControl: function () {

            // Initialize
            var thisWidget = this;

            // Disabled control
            if (!thisWidget.Locked) {
                thisWidget.Locked = true;
                Events.Off(thisWidget.element.parentNode, 'click');
                Common.SetAttr(thisWidget.element, 'data-disabled', 'true');
                thisWidget.element.disabled = true;
                var closestGroup = Common.Closest('.gtc-input-checkbox-group', thisWidget.element);
                Common.AddClass(closestGroup, thisWidget.options.ClassCheckboxLocked);
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
                thisWidget._bindClick();
                Common.RemoveAttr(thisWidget.element, 'data-disabled');
                thisWidget.element.disabled = false;
                var closestGroup = Common.Closest('.gtc-input-checkbox-group', thisWidget.element);
                Common.RemoveClass(closestGroup, thisWidget.options.ClassCheckboxLocked);
                var systemInput = Common.Query('span.gtc-input-system', closestGroup);
                if (Common.IsDefined(systemInput)) {
                    Common.Remove(systemInput);
                }
                Common.SetAttr(thisWidget.element, 'tabindex', thisWidget.FocusIndex);
                thisWidget.Locked = false;
            }

        },

        _destroy: function () {

            // Initialize
            var thisWidget = this;

            // Click
            Events.Off(thisWidget.element.parentNode, 'click');
            Events.Off(thisWidget.element, 'widgetUpdateValue');
            Events.Off(thisWidget.element, 'focusin');
            Events.Off(thisWidget.element, 'focusout');

        },

        _init: function () {
        },

        _create: function () {

            // Initialize
            var thisWidget = this;

            // Data
            this.Locked = false;
            thisWidget.Focused = false;
            thisWidget.FocusIndex = Common.GetAttr(thisWidget.element, 'tabindex');

            // Initialize
            thisWidget._setLabelStyle();
            thisWidget._bindFocus();
            thisWidget._bindClick();
            thisWidget._updateDisplay();

            // Disabled?
            var dataDisabled = Common.GetAttr(thisWidget.element, 'data-disabled');
            if (dataDisabled == 'true') {
                thisWidget._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.checkbox', CheckboxWidget);

} (window, document, Common, Cache, Events, Velocity));
