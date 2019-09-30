// Date Field
// Based On: DateField -> MaskField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (DateField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    DateField.Render = function (dateField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(dateField.Label)) {
            labelExists = false;
        }

        // Label
        var dateFieldMarkup = Field.RenderLabel(dateField);

        // input<, Data-Mask@, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        dateFieldMarkup += '<input class="gtc-input-calendar gtc-dateselectiontype-' + dateField.SelectionType.toLowerCase();
        if (Common.IsDefined(dateField.Icon)) {
            if (labelExists == false) {
                dateFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                dateFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        dateFieldMarkup += '"' + MaskField.RenderAttributes(dateField) + Field.RenderAttributes(dateField);

        // Data-HasChanged@ Event
        if (dateField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + dateField.Name, '#' + dateField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (dateField.IsRequired == 'Yes') {
            dateFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(dateField.OnChange)) {
            dateFieldMarkup += Field.AttachOnChange(dateField, DateField.OnChange);
        }

        // Configure date field
        if (dateField.SelectionType == 'MonthViewer') {
            Events.One(document.body, 'configuremonthviewdatefield', '#' + dateField.Name,
                function () {
                    var dateFieldObject = Common.Get(dateField.Name);
                    var tabIndex = Common.GetAttr(dateFieldObject, 'tabindex');
                    var tabIndexAttribute = '';
                    if (Common.IsDefined(tabIndex) && parseInt(tabIndex, 10) > 0) {
                        tabIndexAttribute = ' tabindex="' + tabIndex + '"';
                    }
                    var anchorName = 'AnchorOpenCalendar-' + dateFieldObject.id;
                    dateFieldObject.insertAdjacentHTML('afterend', '<a' + tabIndexAttribute + ' class="gtc-input-system" id="' + anchorName + '" aria-haspopup="true"><i class="gtc-icon-styles fa fa-calendar"></i><span class="gtc-sr-only" data-translate="OpensSimulatedDialog508">' + Common.TranslateKey('OpensSimulatedDialog508') + '</span></a>');
                    var openCalendar = Common.Get(anchorName);

                    // TODO: Solve for all date formats
                    var dateFormat = 'mm/dd/yy';
                    var mask = JSON.parse(Common.GetAttr(dateFieldObject, 'data-mask'));
                    if (Common.IsDefined(mask) && mask.Definition == 'DD/MM/YYYY') {
                        dateFormat = 'dd/mm/yy';
                    }

                    // 508 Compliance - Focus In/Focus Out
                    Events.On(openCalendar, 'focusin.' + anchorName,
                        function (event) {
                            Events.On(document, 'keyup.' + anchorName,
                                function (event) {
                                    var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                                    if (pressedKeyCode == GTC.Keyboard.Enter) {
                                        document.activeElement.blur();
                                        var element = Common.Get(anchorName);
                                        Events.Trigger(element, 'click');
                                    }
                                }
                            );
                        }
                    );
                    Events.On(openCalendar, 'focusout.' + anchorName,
                        function (event) {
                            Events.Off(document, 'keyup.' + anchorName);
                        }
                    );

                    // Click Event
                    Events.On(openCalendar, 'click',
                        function () {
                            if (Common.HasClass(document.body, 'gtc-modal-resizing')) {
                                return;
                            }
                            if (Common.HasClass(this, 'gtc-showingdatepicker')) {
                                Common.RemoveClass(this, 'gtc-showingdatepicker');
                                Widgets.monthlydatepicker(dateFieldObject, 'hide');
                            }
                            else {
                                Common.AddClass(this, 'gtc-showingdatepicker');
                                Widgets.monthlydatepicker(dateFieldObject, 'show');

                                // Adjust screen height if needed
                                var calendarDisplayHeight = Common.Height(Common.Get('gtc-ui-datepicker-div'), true);
                                var coords = Common.Offset(this.previousSibling);
                                if (Common.IsModal()) {
                                    var modalCalendar = Common.Query('.gtc-modal-iframe', null, true);
                                    var modalBottom = Common.Height(modalCalendar.parentNode) + Common.Offset(modalCalendar.parentNode).top;
                                    var calendarBottom = calendarDisplayHeight + Common.Offset(this.parentNode).top + coords.top + Common.Height(this.parentNode) + Common.Offset(modalCalendar.parentNode).top;
                                    if (calendarBottom > modalBottom) {
                                        Cache.Set(this, 'IsHeightIncreased', true);
                                        Cache.Set(this, 'HeightIncrease', calendarBottom - modalBottom + (parseInt(calendarDisplayHeight) * 2));
                                        var currentHeight = parseInt(modalCalendar.parentNode.style.height, 10);
                                        modalCalendar.parentNode.style.height = (currentHeight + Cache.Get(this, 'HeightIncrease')) + 'px';
                                    }
                                }
                            }
                        }
                    );
                    Widgets.monthlydatepicker(dateFieldObject,
                        {
                            showButtonPanel: true,
                            showOn: '',
                            showOtherMonths: true,
                            selectOtherMonths: true,
                            dateFormat: dateFormat,
                            onClose: function () {
                                var openAnchor = Common.Get(anchorName);
                                Common.RemoveClass(openAnchor, 'gtc-showingdatepicker');

                                // Adjust Height if it was added
                                if (Cache.Get(openAnchor, 'IsHeightIncreased')) {
                                    Cache.Set(openAnchor, 'IsHeightIncreased', false);
                                    if (Common.IsModal() && Common.IsNotDefined(dateField.OnChange)) {
                                        var modalCalendar = Common.Query('.gtc-modal-iframe', null, true);
                                        var currentHeight = parseInt(modalCalendar.parentNode.style.height, 10);
                                        modalCalendar.parentNode.style.height = (currentHeight - Cache.Get(openAnchor, 'HeightIncrease')) + 'px';
                                    }
                                }
                            },
                            onSelect: function () {
                                // Get Milliseconds from 1970
                                var milliSecondsFrom1970 = Date.parse(Widgets.monthlydatepicker(dateFieldObject, 'getDate'));

                                // Build Date String
                                var rawData = '/Date(' + milliSecondsFrom1970.toString() + ')/';
                                MaskField.UpdateValue(dateFieldObject, rawData);
                                dateFieldObject.focus();
                            }
                        }
                    );

                    // Handle locked field
                    if (dateField.IsLocked == 'Yes') {
                        Common.SetAttr(dateFieldObject, 'data-locked', 'true');
                        Common.SetAttr(dateFieldObject, 'disabled', 'disabled');
                        Common.SetAttr(dateFieldObject, 'data-focusindex', Common.GetAttr(dateFieldObject, 'tabindex'));
                        Common.SetAttr(dateFieldObject, 'tabindex', '-1');
                        Common.Get('AnchorOpenCalendar-' + dateFieldObject.id).style.display = 'none';
                        Common.AddClass(dateFieldObject, 'gtc-input-locked');
                        dateFieldObject.insertAdjacentHTML('afterend', '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
                    }
                }
            );
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/>
        dateFieldMarkup += ' data-namespace="DateField" type="text" />';

        // Icon
        if (Common.IsDefined(dateField.Icon)) {
            dateFieldMarkup += Icon.Render(dateField.Icon, true, labelExists);
        }
        return dateFieldMarkup;

    };

    DateField.OnChange = function (event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Don't kick off onchanges when they are only selecting dates
        if (Common.HasClass(Common.Get('AnchorOpenCalendar-' + this.id), 'gtc-showingdatepicker')) {
            return;
        }

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value: Common.GetAttr(this, 'data-raw'),
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    DateField.Lock = function (field, onParent) {

        if (Common.HasClass(field, 'gtc-dateselectiontype-datepicker')) {
            Widgets.calendar(field, 'DisableControl');
        }
        else {
            if (Common.IsNotDefined(Common.GetAttr(field, 'data-locked'))) {
                Common.SetAttr(field, 'data-locked', 'true');
                Common.SetAttr(field, 'disabled', 'disabled');
                Common.SetAttr(field, 'data-focusindex', Common.GetAttr(field, 'tabindex'));
                Common.SetAttr(field, 'tabindex', '-1');
                Common.Get('AnchorOpenCalendar-' + field.name, onParent).style.display = 'none';
                Common.AddClass(field, 'gtc-input-locked');
                field.insertAdjacentHTML('afterend', '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
            }
        }

    };

    DateField.Unlock = function (field, onParent) {

        if (Common.HasClass(field, 'gtc-dateselectiontype-datepicker')) {
            Widgets.calendar(field, 'EnableControl');
        }
        else {
            if (Common.IsDefined(Common.GetAttr(field, 'data-locked'))) {
                Common.RemoveAttr(field, 'disabled');
                Common.RemoveAttr(field, 'data-disabled');
                Common.SetAttr(field, 'tabindex', Common.GetAttr(field, 'data-focusindex'));
                Common.Get('AnchorOpenCalendar-' + field.name, onParent).style.display = 'inline-table';
                Common.RemoveClass(field, 'gtc-input-locked');
                Common.Remove(Common.Query('.gtc-input-system', field.parentNode));
                Common.RemoveAttr(field, 'data-locked');
            }
        }

    };

    DateField.HasValue = function (dateField) {

        return MaskField.HasValue(dateField);

    };

    DateField.IsCompleted = function (field) {

        return MaskField.IsCompleted(field);

    };

    DateField.UpdateValue = function (field, fieldValue) {

        MaskField.UpdateValue(field, fieldValue);

    };

    DateField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    DateField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.DateField = window.DateField || {}, window, document, Common, Cache, Events, Velocity));
