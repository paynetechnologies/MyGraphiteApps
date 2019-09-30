// MultiSelect Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var MultiSelectWidget = {

        // Options
        options: {
            AllSelected: false,
            IsValidations: false
        },

        // Public Methods
        GetSelected: function () {

            return this.CurrentSelected;

        },

        GetAll: function () {

            return this._getAll();

        },

        UpdateSelected: function () {

            this._updateSelected();

        },

        IntializeNewDetails: function () {

            this._intializeNewDetails();

        },

        // Private Methods
        _getAll: function () {

            var thisWidget = this;
            var allSelectables = null;
            var selectables = Common.QueryAll(thisWidget.IntializedSelector, thisWidget.element);
            var selectable, object, index = 0, length = selectables.length;
            if (length > 0) {
                allSelectables = [];
                for ( ; index < length; index++) {
                    var selectable = selectables[index];
                    object = {
                        Name: selectable.id,
                        Value: Common.GetAttr(selectable, 'data-selectableid'),
                        Checked: Common.Query(thisWidget.CheckboxSelector, selectable).checked
                    };
                    allSelectables.push(object);
                }
            }
            return allSelectables;

        },

        _bindSelectingEvent: function () {

            var thisWidget = this;
            Events.On(thisWidget.element, 'selectableselecting',
                function (event, ui) {
                    Events.Trigger(Common.Get(Common.GetAttr(ui.selecting, 'data-selectablename') + 'MultiSelectCheckbox'), 'focusin');
                }
            );

        },

        _bindSelectedEvent: function () {

            var thisWidget = this;
            Events.On(thisWidget.element, 'selectableselected',
                function (event, ui) {
                    var selectedElement = ui.selected;
                    var checkbox = Common.Get(Common.GetAttr(ui.selected, 'data-selectablename') + 'MultiSelectCheckbox');
                    Events.Trigger(checkbox, 'focusout');
                    if (!checkbox.checked) {
                        // Force checkbox click or let event bubbling handling it
                        if ((Common.IsDefined(event.originalEvent) && !Common.CheckNodeType(event.originalEvent.target, 'label') && !Common.GetChildren(event.originalEvent.target, thisWidget.CheckboxSelector).length > 0) || Common.IsNotDefined(event.originalEvent)) {
                            Events.Trigger(checkbox.parentNode, 'click', { stopProp: ui.stopProp });
                        }
                        thisWidget.CurrentSelected.push(selectedElement);
                        Events.Trigger(checkbox, 'focusout');
                    }
                }
            );

        },

        _bindUnselectingEvent: function () {

            var thisWidget = this;
            Events.On(thisWidget.element, 'selectableunselecting',
                function (event, ui) {
                    Events.Trigger(Common.Get(Common.GetAttr(ui.selecting, 'data-selectablename') + 'MultiSelectCheckbox'), 'focusin');
                }
            );

        },

        _bindUnselectedEvent: function () {

            var thisWidget = this;
            Events.On(thisWidget.element, 'selectableunselected',
                function (event, ui) {
                    var unselectedElement = ui.unselected;
                    var checkbox = Common.Get(Common.GetAttr(ui.unselected, 'data-selectablename') + 'MultiSelectCheckbox');
                    Events.Trigger(checkbox, 'focusout');
                    if (checkbox.checked) {
                        // Force checkbox click or let event bubbling handling it
                        if ((Common.IsDefined(event.originalEvent) && !Common.CheckNodeType(event.originalEvent.target, 'label') && !Common.GetChildren(event.originalEvent.target, thisWidget.CheckboxSelector).length > 0) || Common.IsNotDefined(event.originalEvent)) {
                            Events.Trigger(checkbox.parentNode, 'click', { stopProp: ui.stopProp });
                        }
                        thisWidget.CurrentSelected = Common.FilterArray(thisWidget.CurrentSelected,
                            function (value) {
                                return Common.GetAttr(value.parentNode, 'data-selectableid') != Common.GetAttr(unselectedElement.parentNode, 'data-selectableid');
                            }
                        );
                        Events.Trigger(checkbox, 'focusout');
                    }
                }
            );

        },

        _bindSelectAllButtonEvent: function () {

            var thisWidget = this;
            var selectAllButton = Common.Get(thisWidget.element.id + 'SelectAllButton');
            if (Common.IsDefined(selectAllButton)) {
                Widgets.uibutton(selectAllButton);
                Events.On(selectAllButton, 'click',
                    function () {
                        var icon = this.firstChild;
                        var span = this.lastChild;
                        var multiSelectDetails = Common.QueryAll(thisWidget.IntializedSelector, thisWidget.element);
                        var multiSelectDetail, multiSelectBody, index = 0, length = multiSelectDetails.length;
                        if (thisWidget.options.AllSelected) {
                            thisWidget.options.AllSelected = false;
                            for ( ; index < length; index++) {
                                multiSelectDetail = multiSelectDetails[index];
                                multiSelectBody = Common.Query(thisWidget.FilterSelector, multiSelectDetail);
                                Common.SwitchClass(multiSelectBody, 'gtc-ui-selected', 'gtc-ui-unselecting');
                                Cache.Get(multiSelectDetail, 'gtc-selectable')._mouseStop(null, true);
                            }
                            Common.SwitchClass(icon, 'fa-check-square-o', 'fa-square-o');
                            Common.SetAttr(span, 'data-translate', 'SelectAll');
                            span.textContent = Common.TranslateKey('SelectAll');
                        }
                        else {
                            thisWidget.options.AllSelected = true;
                            for ( ; index < length; index++) {
                                multiSelectDetail = multiSelectDetails[index];
                                multiSelectBody = Common.Query(thisWidget.FilterSelector, multiSelectDetail);
                                Common.AddClass(multiSelectBody, 'gtc-ui-selecting');
                                Cache.Get(multiSelectDetail, 'gtc-selectable')._mouseStop(null, true);
                            }
                            Common.SwitchClass(icon, 'fa-square-o', 'fa-check-square-o');
                            Common.SetAttr(span, 'data-translate', 'UnselectAll');
                            span.textContent = Common.TranslateKey('UnselectAll');
                        }
                    }
                );
            }

        },

        _initializeSelectable: function () {

            var thisWidget = this;
            var elements = Common.QueryAll(thisWidget.IntializedSelector, thisWidget.element);
            Events.On(elements, 'mousedown',
                function (event) {
                    // This allows continuous selecting without holding ctrl
                    event.metaKey = true;
                }
            );
            Widgets.selectable(elements, { filter: thisWidget.FilterSelector, cancel: 'input,textarea,button,select,option,a' });

        },

        _initializeCheckboxes: function () {

            var thisWidget = this;
            Widgets.checkbox(Common.QueryAll(thisWidget.CheckboxSelector, thisWidget.element),
                {
                    ClassLabelCheckboxUnchecked: 'gtc-classLabelCheckboxUnchecked',
                    ClassLabelCheckboxUncheckedHover: 'gtc-classLabelCheckboxUncheckedHover',
                    ClassLabelCheckboxChecked: 'gtc-input-checkbox-selected',
                    ClassLabelCheckboxCheckedHover: 'gtc-classLabelCheckboxCheckedHover',
                    ClassCheckboxLocked: 'gtc-input-locked'
                }
            );

            // Apply selected
            var checkboxes = Common.QueryAll(thisWidget.CheckboxSelector, thisWidget.element);
            var checkbox, index = 0, length = checkboxes.length;
            for ( ; index < length; index++) {
                checkbox = checkboxes[index];
                if (checkbox.checked) {
                    var closestFilter = Common.Closest(thisWidget.FilterSelector, checkbox);
                    Common.AddClass(closestFilter, 'gtc-ui-selected');
                    thisWidget.CurrentSelected.push(closestFilter);
                }
            }

        },

        _updateSelected: function () {

            var thisWidget = this;
            this.CurrentSelected = [];
            var selectables = Common.QueryAll(thisWidget.IntializedSelector + '[data-selectableid]', thisWidget.element);
            var selectee, index = 0, length = selectables.length;
            for ( ; index < length; index++) {
                selectee = selectables[index];
                var selectableBody = Common.Query(thisWidget.FilterSelector, selectee);
                var checkbox = Common.Get(selectee.id + 'MultiSelectCheckbox');
                if (Common.HasClass(selectableBody, 'gtc-ui-selected')) {
                    thisWidget.CurrentSelected.push(selectableBody);
                    if (!checkbox.checked) {
                        Events.Trigger(checkbox.parentNode, 'click');
                        Events.Trigger(checkbox, 'focusout');
                    }
                }
                else {
                    if (checkbox.checked) {
                        Events.Trigger(checkbox.parentNode, 'click');
                        Events.Trigger(checkbox, 'focusout');
                    }
                }
            }

        },

        _intializeNewDetails: function () {

            var thisWidget = this;
            var newDetails = Common.QueryAll(thisWidget.IntializedSelector + ':not(.gtc-ui-selectable)', thisWidget.element);
            Events.On(newDetails, 'mousedown',
                function (event) {
                    // This allows continuous selecting without holding ctrl
                    event.metaKey = true;
                }
            );
            Widgets.selectable(newDetails, { filter: thisWidget.FilterSelector, cancel: 'input,textarea,button,select,option,a' });

            // Checkboxes
            var checkboxes = [];
            if (newDetails.length > 0) {
                var index = 0, length = newDetails.length;
                for ( ; index < length; index++) {
                    checkboxes = checkboxes.concat(Common.QueryAll(thisWidget.CheckboxSelector, newDetails[index]));
                }
            }
            if (checkboxes.length > 0) {
                Widgets.checkbox(checkboxes,
                    {
                        ClassLabelCheckboxUnchecked: 'gtc-classLabelCheckboxUnchecked',
                        ClassLabelCheckboxUncheckedHover: 'gtc-classLabelCheckboxUncheckedHover',
                        ClassLabelCheckboxChecked: 'gtc-input-checkbox-selected',
                        ClassLabelCheckboxCheckedHover: 'gtc-classLabelCheckboxCheckedHover',
                        ClassCheckboxLocked: 'gtc-input-locked'
                    }
                );

                // Apply selected
                var checkbox, index = 0, length = checkboxes.length;
                for ( ; index < length; index++) {
                    checkbox = checkboxes[index];
                    if (checkbox.checked) {
                        var closestFilter = Common.Closest(thisWidget.FilterSelector, checkbox);
                        Common.AddClass(closestFilter, 'gtc-ui-selected');
                        thisWidget.CurrentSelected.push(closestFilter);
                    }
                }
            }

        },

        _destroy: function () {

            var thisWidget = this;
            Events.Off(thisWidget.element, 'selectableselecting');
            Events.Off(thisWidget.element, 'selectableselected');
            Events.Off(thisWidget.element, 'selectableunselecting');
            Events.Off(thisWidget.element, 'selectableunselected');
            var selectAllButton = Common.Get(thisWidget.element.id + 'SelectAllButton');
            if ((thisWidget.options.IsValidations != true) && (Common.IsDefined(selectAllButton))) {
                Events.Off(selectAllButton, 'click');
            }
            var allSelectables = Common.QueryAll(thisWidget.IntializedSelector, thisWidget.element);
            Events.Off(allSelectables, 'mousedown');
            Widgets.selectable(allSelectables, 'destroy');
            this.CurrentSelected = [];

        },

        _init: function () {
        },

        _create: function () {

            var thisWidget = this;
            thisWidget.CurrentSelected = [];
            if (thisWidget.options.IsValidations == true) {
                thisWidget.IntializedSelector = 'li';
                thisWidget.FilterSelector = '.gtc-validation-body';
                thisWidget.CheckboxSelector = '.gtc-validation-multiselect-checkbox';
            }
            else {
                thisWidget.IntializedSelector = '.gtc-multiselectdetail';
                thisWidget.FilterSelector = '.gtc-multiselectdetail-body';
                thisWidget.CheckboxSelector = '.gtc-multiselectdetail-multiselectcheckbox';
            }
            thisWidget._initializeSelectable();
            thisWidget._initializeCheckboxes();
            thisWidget._bindSelectingEvent();
            thisWidget._bindSelectedEvent();
            thisWidget._bindUnselectingEvent();
            thisWidget._bindUnselectedEvent();
            if (thisWidget.options.IsValidations != true) {
                thisWidget._bindSelectAllButtonEvent();
            }

        }

    };

    WidgetFactory.Register('gtc.multiselect', MultiSelectWidget);

} (window, document, Common, Cache, Events, Velocity));
