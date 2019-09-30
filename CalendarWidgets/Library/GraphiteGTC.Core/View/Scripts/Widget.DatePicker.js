// Date Picker Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var datepicker_instActive;

    // Date picker manager.
    // Use the singleton instance of this class, Widgets.datepicker, to interact with the date picker.
    // Settings for (groups of) date pickers are maintained in an instance object,
    // allowing multiple different settings on the same page.
    function Datepicker () {
        this._curInst = null; // The current instance in use
        this._keyEvent = false; // If the last event was a key event
        this._disabledInputs = []; // List of date picker inputs that have been disabled
        this._datepickerShowing = false; // True if the popup picker is showing , false if not
        this._inDialog = false; // True if showing within a "dialog", false if not
        this._mainDivId = 'gtc-ui-datepicker-div'; // The ID of the main datepicker division
        this._inlineClass = 'gtc-ui-datepicker-inline'; // The name of the inline marker class
        this._appendClass = 'gtc-ui-datepicker-append'; // The name of the append marker class
        this._triggerClass = 'gtc-ui-datepicker-trigger'; // The name of the trigger marker class
        this._dialogClass = 'gtc-ui-datepicker-dialog'; // The name of the dialog marker class
        this._disableClass = 'gtc-ui-datepicker-disabled'; // The name of the disabled covering marker class
        this._unselectableClass = 'gtc-ui-datepicker-unselectable'; // The name of the unselectable cell marker class
        this._currentClass = 'gtc-ui-datepicker-current-day'; // The name of the current day marker class
        this._dayOverClass = 'gtc-ui-datepicker-days-cell-over'; // The name of the day hover marker class
        this.regional = []; // Available regional settings, indexed by language code
        this.regional[''] = { // Default regional settings
            closeText: 'Done', // Display text for close link
            prevText: 'Prev', // Display text for previous month link
            nextText: 'Next', // Display text for next month link
            currentText: 'Today', // Display text for current month link
            monthNames: ['January','February','March','April','May','June', 'July','August','September','October','November','December'], // Names of months for drop-down and formatting
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // For formatting
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
            dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'], // Column headings for days starting at Sunday
            weekHeader: 'Wk', // Column header for week of the year
            dateFormat: 'mm/dd/yy', // See format options on parseDate
            firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
            isRTL: false, // True if right-to-left language, false if left-to-right
            showMonthAfterYear: false, // True if the year select precedes month, false for month then year
            yearSuffix: '' // Additional text to append to the year in the month headers
        };
        this._defaults = { // Global defaults for all the date picker instances
            showOn: 'focus', // "focus" for popup on focus,
                // "button" for trigger button, or "both" for either
            showOptions: {}, // Options for enhanced animations
            defaultDate: null, // Used when field is blank: actual date,
                // +/-number for offset from today, null for today
            appendText: '', // Display text following the input box, e.g. showing the format
            buttonText: '...', // Text for trigger button
            buttonImage: '', // URL for trigger button image
            buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
            hideIfNoPrevNext: false, // True to hide next/previous month links
                // if not applicable, false to just disable them
            navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
            gotoCurrent: false, // True if today link goes back to current selection instead
            changeMonth: false, // True if month can be selected directly, false if only prev/next
            changeYear: false, // True if year can be selected directly, false if only prev/next
            yearRange: 'c-10:c+10', // Range of years to display in drop-down,
                // either relative to today's year (-nn:+nn), relative to currently displayed year
                // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
            showOtherMonths: false, // True to show dates in other months, false to leave blank
            selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
            showWeek: false, // True to show week of the year, false to not show it
            calculateWeek: this.iso8601Week, // How to calculate the week of the year,
                // takes a Date and returns the number of the week for it
            shortYearCutoff: '+10', // Short year values < this are in the current century,
                // > this are in the previous century,
                // string value starting with "+" for current year + value
            minDate: null, // The earliest selectable date, or null for no limit
            maxDate: null, // The latest selectable date, or null for no limit
            beforeShowDay: null, // Function that takes a date and returns an array with
                // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
                // [2] = cell title (optional), e.g. Widgets.datepicker.noWeekends
            beforeShow: null, // Function that takes an input field and
                // returns a set of custom settings for the date picker
            onSelect: null, // Define a callback function when a date is selected
            onChangeMonthYear: null, // Define a callback function when the month or year is changed
            onClose: null, // Define a callback function when the datepicker is closed
            numberOfMonths: 1, // Number of months to show at a time
            showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
            stepMonths: 1, // Number of months to step back/forward
            stepBigMonths: 12, // Number of months to step back/forward for the big links
            altField: '', // Selector for an alternate field to store selected dates into
            altFormat: '', // The date format to use for the alternate field
            constrainInput: true, // The input is constrained by the current date format
            showButtonPanel: false, // True to show button panel, false to not show it
            autoSize: false, // True to size the input for the date format, false to leave as is
            disabled: false // The initial disabled state
        };
        Common.MergeObjects(this._defaults, this.regional['']);
        this.regional.en = Common.MergeObjects(true, {}, this.regional['']);
        this.regional['en-US'] = Common.MergeObjects(true, {}, this.regional.en);
        this.dpDiv = datepicker_bindHover(Common.GenerateHTML('<div id="' + this._mainDivId + '" class="gtc-ui-datepicker gtc-ui-widget gtc-ui-widget-content gtc-ui-helper-clearfix gtc-ui-corner-all"></div>'));
    };

    Common.MergeObjects(Datepicker.prototype, {
        // Class name added to elements to indicate already configured with a date picker.
        markerClassName: 'hasDatepicker',

        //Keep track of the maximum number of rows displayed (see #7043)
        maxRows: 4,

        // TODO rename to "widget" when switching to widget factory
        _widgetDatepicker: function () {

            return this.dpDiv;

        },

        // Override the default settings for all instances of the date picker.
        // @param  settings  object - the new settings to use as defaults (anonymous object)
        // @return the manager object
        setDefaults: function (settings) {

            datepicker_extendRemove(this._defaults, settings || {});
            return this;

        },

        // Attach the date picker to a target.
        // @param  target   element - the target input field or division or span
        // @param  settings  object - the new settings to use for this date picker instance (anonymous)
        _attachDatepicker: function (target, settings) {

            var nodeName, inline, inst;
            nodeName = target.nodeName.toLowerCase();
            inline = (nodeName === 'div' || nodeName === 'span');
            if (!target.id) {
                this.uuid += 1;
                target.id = 'dp' + this.uuid;
            }
            inst = this._newInst(target, inline);
            inst.settings = Common.MergeObjects({}, settings || {});
            if (nodeName === 'input') {
                this._connectDatepicker(target, inst);
            }
            else if (inline) {
                this._inlineDatepicker(target, inst);
            }

        },

        // Create a new instance object.
        _newInst: function (target, inline) {

            var id = target.id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1"); // escape meta chars
            return {
                id: id, input: target, // associated target
                selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
                drawMonth: 0, drawYear: 0, // month being drawn
                inline: inline, // is datepicker inline or not
                dpDiv: (!inline ? this.dpDiv : // presentation div
                datepicker_bindHover(Common.GenerateHTML('<div class="' + this._inlineClass + ' gtc-ui-datepicker gtc-ui-widget gtc-ui-widget-content gtc-ui-helper-clearfix gtc-ui-corner-all"></div>')))};

        },

        // Attach the date picker to an input field.
        _connectDatepicker: function (target, inst) {

            var input = target;
            inst.append = null;
            inst.trigger = null;
            if (Common.HasClass(input, this.markerClassName)) {
                return;
            }
            this._attachments(input, inst);
            Common.AddClass(input, this.markerClassName);
            Events.On(input, 'keydown', this._doKeyDown);
            Events.On(input, 'keypress', this._doKeyPress);
            Events.On(input, 'keyup', this._doKeyUp);
            this._autoSize(inst);
            Cache.Set(target, 'datepicker', inst);
            // If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
            if (inst.settings.disabled) {
                this._disableDatepicker(target);
            }

        },

        // Make attachments based on settings.
        _attachments: function (input, inst) {

            var context, showOn, buttonText, buttonImage,
                appendText = this._get(inst, 'appendText'),
                isRTL = this._get(inst, 'isRTL');

            if (inst.append) {
                Common.Remove(inst.append);
            }
            if (appendText) {
                inst.append = Common.GenerateHTML('<span class="' + this._appendClass + '">' + appendText + '</span>');
                context = input;
                if (!isRTL) {
                    context = input.nextSibling;
                }
                input.parentNode.insertBefore(inst.append, context);
            }

            Events.Off(input, 'focus', this._showDatepicker);

            if (inst.trigger) {
                Common.Remove(inst.trigger);
            }

            showOn = this._get(inst, 'showOn');
            if (showOn === 'focus' || showOn === 'both') { // pop-up date picker when in the marked field
                input.focus(this._showDatepicker);
            }
            if (showOn === 'button' || showOn === 'both') { // pop-up date picker when button clicked
                buttonText = this._get(inst, 'buttonText');
                buttonImage = this._get(inst, 'buttonImage');
                var triggerElement;
                if (this._get(inst, 'buttonImageOnly')) {
                    triggerElement = Common.GenerateHTML('<img/>');
                    Common.AddClass(triggerElement, this._triggerClass);
                    Common.SetAttr(triggerElement, 'src', buttonImage);
                    Common.SetAttr(triggerElement, 'alt', buttonText);
                    Common.SetAttr(triggerElement, 'title', buttonText);
                }
                else {
                    var triggerElement = Common.GenerateHTML('<button type="button"></button>');
                    Common.AddClass(triggerElement, this._triggerClass);
                    if (!buttonImage) {
                        triggerElement.innerHTML = buttonText;
                    }
                    else {
                        var img = Common.GenerateHTML('<img/>');
                        Common.SetAttr(img, 'src', buttonImage);
                        Common.SetAttr(img, 'alt', buttonText);
                        Common.SetAttr(img, 'title', buttonText);
                        triggerElement.appendChild(img);
                    }
                }
                inst.trigger = triggerElement;
                context = input;
                if (!isRTL) {
                    context = input.nextSibling;
                }
                input.parentNode.insertBefore(inst.trigger, context);
                Events.On(inst.trigger, 'click',
                    function () {
                        if (Widgets.datepicker._datepickerShowing && Widgets.datepicker._lastInput === input) {
                            Widgets.datepicker._hideDatepicker();
                        }
                        else if (Widgets.datepicker._datepickerShowing && Widgets.datepicker._lastInput !== input) {
                            Widgets.datepicker._hideDatepicker();
                            Widgets.datepicker._showDatepicker(input);
                        }
                        else {
                            Widgets.datepicker._showDatepicker(input);
                        }
                        return false;
                    }
                );
            }

        },

        // Apply the maximum length for the date format.
        _autoSize: function (inst) {

            if (this._get(inst, 'autoSize') && !inst.inline) {
                var findMax, max, maxI, i,
                    date = new Date(2009, 12 - 1, 20), // Ensure double digits
                    dateFormat = this._get(inst, 'dateFormat');

                if (dateFormat.match(/[DM]/)) {
                    findMax = function (names) {
                        max = 0;
                        maxI = 0;
                        for (i = 0; i < names.length; i++) {
                            if (names[i].length > max) {
                                max = names[i].length;
                                maxI = i;
                            }
                        }
                        return maxI;
                    };
                    date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ? 'monthNames' : 'monthNamesShort'))));
                    date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ? 'dayNames' : 'dayNamesShort'))) + 20 - date.getDay());
                }
                Common.SetAttr(inst.input, 'size', this._formatDate(inst, date).length);
            }

        },

        // Attach an inline date picker to a div.
        _inlineDatepicker: function (target, inst) {

            var divSpan = target;
            if (Common.HasClass(divSpan, this.markerClassName)) {
                return;
            }
            Common.AddClass(divSpan, this.markerClassName);
            divSpan.appendChild(inst.dpDiv);
            Cache.Set(target, 'datepicker', inst);
            this._setDate(inst, this._getDefaultDate(inst), true);
            this._updateDatepicker(inst);
            this._updateAlternate(inst);

            // If disabled option is true, disable the datepicker before showing it (see ticket #5665)
            if (inst.settings.disabled) {
                this._disableDatepicker(target);
            }
            inst.dpDiv.style.display = 'block';

        },

        // Pop-up the date picker in a "dialog" box.
        // @param  input element - ignored
        // @param  date string or Date - the initial date to display
        // @param  onSelect  function - the function to call when a date is selected
        // @param  settings  object - update the dialog date picker instance's settings (anonymous object)
        // @param  pos int[2] - coordinates for the dialog's position within the screen or
        //                  event - with x/y coordinates or
        //                  leave empty for default (screen centre)
        // @return the manager object
        _dialogDatepicker: function (input, date, onSelect, settings, pos) {

            var id, browserWidth, browserHeight, scrollX, scrollY,
                inst = this._dialogInst; // internal instance

            if (!inst) {
                this.uuid += 1;
                id = 'dp' + this.uuid;
                this._dialogInput = Common.GenerateHTML('<input type="text" id="' + id + '" style="position: absolute; top: -100px; width: 0px;"/>');
                Events.On(this._dialogInput, 'keydown', this._doKeyDown);
                document.body.appendChild(this._dialogInput);
                inst = this._dialogInst = this._newInst(this._dialogInput, false);
                inst.settings = {};
                Cache.Set(this._dialogInput, 'datepicker', inst);
            }
            datepicker_extendRemove(inst.settings, settings || {});
            date = (date && date.constructor === Date ? this._formatDate(inst, date) : date);
            this._dialogInput.value = date;

            this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
            if (!this._pos) {
                browserWidth = document.documentElement.clientWidth;
                browserHeight = document.documentElement.clientHeight;
                scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                this._pos = // should use actual width/height below
                    [(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
            }

            // move input on screen for focus, but hidden behind dialog
            this._dialogInput.style.left = (this._pos[0] + 20) + 'px';
            this._dialogInput.style.top = this._pos[1] + 'px';
            inst.settings.onSelect = onSelect;
            this._inDialog = true;
            Common.AddClass(this.dpDiv, this._dialogClass);
            this._showDatepicker(this._dialogInput);
            Cache.Set(this._dialogInput, 'datepicker', inst);
            return this;

        },

        // Detach a datepicker from its control.
        // @param  target   element - the target input field or division or span
        _destroyDatepicker: function (target) {

            var nodeName,
                inst = Cache.Get(target, 'datepicker');

            if (!Common.HasClass(target, this.markerClassName)) {
                return;
            }

            nodeName = target.nodeName.toLowerCase();
            Cache.Remove(target, 'datepicker');
            if (nodeName === 'input') {
                Common.Remove(inst.append);
                Common.Remove(inst.trigger);
                Common.RemoveClass(target, this.markerClassName);
                Events.Off(target, 'focus', this._showDatepicker);
                Events.Off(target, 'keydown', this._doKeyDown);
                Events.Off(target, 'keypress', this._doKeyPress);
                Events.Off(target, 'keyup', this._doKeyUp);
            }
            else if (nodeName === 'div' || nodeName === 'span') {
                Common.RemoveClass(target, this.markerClassName);
                if (target.nodeType === 1) {
                    // Get all elements inside element to be removed and clean up their data and events as well
                    // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
                    Cache.CleanElementData(target.getElementsByTagName('*'));
                }
                target.textContent = '';
            }

            if (datepicker_instActive === inst) {
                datepicker_instActive = null;
            }

        },

        // Enable the date picker on a target
        // @param  target   element - the target input field or division or span
        _enableDatepicker: function (target) {

            var nodeName, inline, index, length,
                inst = Cache.Get(target, 'datepicker');

            if (!Common.HasClass(target, this.markerClassName)) {
                return;
            }

            nodeName = target.nodeName.toLowerCase();
            if (nodeName === 'input') {
                target.disabled = false;
                var buttons = Common.GetByTagName('button', inst.trigger);
                index = 0, length = buttons.length;
                for ( ; index < length; index++) {
                    buttons[index].disabled = false;
                }
                var images = Common.GetByTagName('img', inst.trigger);
                index = 0, length = images.length;
                for ( ; index < length; index++) {
                    images[index].style.opacity = '1.0';
                    images[index].style.cursor = '';
                }
            }
            else if (nodeName === 'div' || nodeName === 'span') {
                inline = Common.GetChildren(target, '.' + this._inlineClass);
                index = 0, length = inline.length;
                for ( ; index < length; index++) {
                    var inlineChildren = Common.GetChildren(inline[index]);
                    var childIndex = 0, childLength = inlineChildren.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        Common.RemoveClass(inlineChildren[childIndex], 'gtc-ui-state-disabled');
                    }
                    var selects = Common.QueryAll('select.gtc-ui-datepicker-month, select.gtc-ui-datepicker-year', inline[index]);
                    childIndex = 0, childLength = selects.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        selects[childIndex].disabled = false;
                    }
                }
            }

            // Delete entry
            this._disabledInputs = Common.FilterArray(this._disabledInputs,
                function (value) {
                    return (value === target ? false : true);
                }
            );

        },

        // Disable the date picker to a target
        // @param  target   element - the target input field or division or span
        _disableDatepicker: function (target) {

            var nodeName, inline, index, length,
                inst = Cache.Get(target, 'datepicker');

            if (!Common.HasClass(target, this.markerClassName)) {
                return;
            }

            nodeName = target.nodeName.toLowerCase();
            if (nodeName === 'input') {
                target.disabled = true;
                var buttons = Common.GetByTagName('button', inst.trigger);
                index = 0, length = buttons.length;
                for ( ; index < length; index++) {
                    buttons[index].disabled = true;
                }
                var images = Common.GetByTagName('img', inst.trigger);
                index = 0, length = images.length;
                for ( ; index < length; index++) {
                    images[index].style.opacity = '.5';
                    images[index].style.cursor = 'default';
                }
            }
            else if (nodeName === 'div' || nodeName === 'span') {
                inline = Common.GetChildren(target, '.' + this._inlineClass);
                index = 0, length = inline.length;
                for ( ; index < length; index++) {
                    var inlineChildren = Common.GetChildren(inline[index]);
                    var childIndex = 0, childLength = inlineChildren.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        Common.AddClass(inlineChildren[childIndex], 'gtc-ui-state-disabled');
                    }
                    var selects = Common.QueryAll('select.gtc-ui-datepicker-month, select.gtc-ui-datepicker-year', inline[index]);
                    childIndex = 0, childLength = selects.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        selects[childIndex].disabled = true;
                    }
                }
            }

            // Delete entry
            this._disabledInputs = Common.FilterArray(this._disabledInputs,
                function (value) {
                    return (value === target ? false : true);
                }
            );
            this._disabledInputs[this._disabledInputs.length] = target;

        },

        // Is target disabled as a datepicker?
        // @param  target   element - the target input field or division or span
        // @return boolean - true if disabled, false if enabled
        _isDisabledDatepicker: function (target) {

            if (!target) {
                return false;
            }
            for (var i = 0; i < this._disabledInputs.length; i++) {
                if (this._disabledInputs[i] === target) {
                    return true;
                }
            }
            return false;

        },

        // Retrieve the instance data for the target control.
        // @param  target  element - the target input field or division or span
        // @return  object - the associated instance data
        // @throws  error if a problem getting data
        _getInst: function (target) {

            try {
                return Cache.Get(target, 'datepicker');
            }
            catch (err) {
                throw 'Missing instance data for this datepicker';
            }

        },

        // Update or retrieve the settings for a date picker attached to an input field or division.
        // @param  target  element - the target input field or division or span
        // @param  name object - the new settings to update or
        //              string - the name of the setting to change or retrieve,
        //              when retrieving also "all" for all instance settings or
        //              "defaults" for all global defaults
        // @param  value   any - the new value for the setting
        //              (omit if above is an object or to retrieve a value)
        _optionDatepicker: function (target, name, value) {

            var settings, date, minDate, maxDate,
                inst = this._getInst(target);

            if (arguments.length === 2 && Common.IsString(name)) {
                return (name === 'defaults' ? Common.MergeObjects({}, Widgets.datepicker._defaults) :
                    (inst ? (name === "all" ? Common.MergeObjects({}, inst.settings) :
                    this._get(inst, name)) : null));
            }

            settings = name || {};
            if (Common.IsString(name)) {
                settings = {};
                settings[name] = value;
            }

            if (inst) {
                if (this._curInst === inst) {
                    this._hideDatepicker();
                }

                date = this._getDateDatepicker(target, true);
                minDate = this._getMinMaxDate(inst, 'min');
                maxDate = this._getMinMaxDate(inst, 'max');
                datepicker_extendRemove(inst.settings, settings);

                // Reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
                if (minDate !== null && settings.dateFormat !== undefined && settings.minDate === undefined) {
                    inst.settings.minDate = this._formatDate(inst, minDate);
                }
                if (maxDate !== null && settings.dateFormat !== undefined && settings.maxDate === undefined) {
                    inst.settings.maxDate = this._formatDate(inst, maxDate);
                }
                if ('disabled' in settings) {
                    if (settings.disabled) {
                        this._disableDatepicker(target);
                    }
                    else {
                        this._enableDatepicker(target);
                    }
                }
                this._attachments(target, inst);
                this._autoSize(inst);
                this._setDate(inst, date);
                this._updateAlternate(inst);
                this._updateDatepicker(inst);
            }

        },

        // Change method deprecated
        _changeDatepicker: function (target, name, value) {

            this._optionDatepicker(target, name, value);

        },

        // Redraw the date picker attached to an input field or division.
        // @param  target  element - the target input field or division or span
        _refreshDatepicker: function (target) {

            var inst = this._getInst(target);
            if (inst) {
                this._updateDatepicker(inst);
            }

        },

        // Set the dates for a target
        // @param  target element - the target input field or division or span
        // @param  date Date - the new date
        _setDateDatepicker: function (target, date) {

            var inst = this._getInst(target);
            if (inst) {
                this._setDate(inst, date);
                this._updateDatepicker(inst);
                this._updateAlternate(inst);
            }

        },

        // Get the date(s) for the first entry in a target
        // @param  target element - the target input field or division or span
        // @param  noDefault boolean - true if no default date is to be used
        // @return Date - the current date
        _getDateDatepicker: function (target, noDefault) {

            var inst = this._getInst(target);
            if (inst && !inst.inline) {
                this._setDateFromField(inst, noDefault);
            }
            return (inst ? this._getDate(inst) : null);

        },

        // Handle keystrokes.
        _doKeyDown: function (event) {

            var onSelect, dateStr, sel,
                inst = Widgets.datepicker._getInst(event.target),
                handled = true,
                isRTL = Common.HasClass(inst.dpDiv, 'gtc-ui-datepicker-rtl');

            inst._keyEvent = true;
            if (Widgets.datepicker._datepickerShowing) {
                switch (event.keyCode) {
                    case 9:
                        Widgets.datepicker._hideDatepicker();
                        handled = false;
                        break; // hide on tab out
                    case 13:
                        sel = Common.Query('td.' + Widgets.datepicker._dayOverClass + ':not(.' + Widgets.datepicker._currentClass + ')', inst.dpDiv);
                        if (sel) {
                            Widgets.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel);
                        }

                        onSelect = Widgets.datepicker._get(inst, 'onSelect');
                        if (onSelect) {
                            dateStr = Widgets.datepicker._formatDate(inst);

                            // trigger custom callback
                            onSelect.apply((inst.input ? inst.input : null), [dateStr, inst]);
                        }
                        else {
                            Widgets.datepicker._hideDatepicker();
                        }

                        return false; // don't submit the form
                    case 27:
                        Widgets.datepicker._hideDatepicker();
                        break; // hide on escape
                    case 33:
                        Widgets.datepicker._adjustDate(event.target, (event.ctrlKey ?
                            -Widgets.datepicker._get(inst, 'stepBigMonths') :
                            -Widgets.datepicker._get(inst, 'stepMonths')), 'M');
                        break; // previous month/year on page up/+ ctrl
                    case 34:
                        Widgets.datepicker._adjustDate(event.target, (event.ctrlKey ?
                            +Widgets.datepicker._get(inst, 'stepBigMonths') :
                            +Widgets.datepicker._get(inst, 'stepMonths')), 'M');
                        break; // next month/year on page down/+ ctrl
                    case 35:
                        if (event.ctrlKey || event.metaKey) {
                            Widgets.datepicker._clearDate(event.target);
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // clear on ctrl or command +end
                    case 36:
                        if (event.ctrlKey || event.metaKey) {
                            Widgets.datepicker._gotoToday(event.target);
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // current on ctrl or command +home
                    case 37:
                        if (event.ctrlKey || event.metaKey) {
                            Widgets.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), 'D');
                        }
                        handled = event.ctrlKey || event.metaKey;
                        // -1 day on ctrl or command +left
                        if (event.originalEvent.altKey) {
                            Widgets.datepicker._adjustDate(event.target, (event.ctrlKey ?
                                -Widgets.datepicker._get(inst, 'stepBigMonths') :
                                -Widgets.datepicker._get(inst, 'stepMonths')), 'M');
                        }
                        // next month/year on alt +left on Mac
                        break;
                    case 38:
                        if (event.ctrlKey || event.metaKey) {
                            Widgets.datepicker._adjustDate(event.target, -7, 'D');
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // -1 week on ctrl or command +up
                    case 39:
                        if (event.ctrlKey || event.metaKey) {
                            Widgets.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), 'D');
                        }
                        handled = event.ctrlKey || event.metaKey;
                        // +1 day on ctrl or command +right
                        if (event.originalEvent.altKey) {
                            Widgets.datepicker._adjustDate(event.target, (event.ctrlKey ?
                                +Widgets.datepicker._get(inst, 'stepBigMonths') :
                                +Widgets.datepicker._get(inst, 'stepMonths')), 'M');
                        }
                        // next month/year on alt +right
                        break;
                    case 40:
                        if (event.ctrlKey || event.metaKey) {
                            Widgets.datepicker._adjustDate(event.target, +7, 'D');
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break; // +1 week on ctrl or command +down
                    default:
                        handled = false;
                }
            }
            else if (event.keyCode === 36 && event.ctrlKey) {
                // Display the date picker on ctrl+home
                Widgets.datepicker._showDatepicker(this);
            }
            else {
                handled = false;
            }

            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }

        },

        // Filter entered characters - based on date format.
        _doKeyPress: function (event) {

            var chars, chr,
                inst = Widgets.datepicker._getInst(event.target);

            if (Widgets.datepicker._get(inst, 'constrainInput')) {
                chars = Widgets.datepicker._possibleChars(Widgets.datepicker._get(inst, 'dateFormat'));
                chr = String.fromCharCode(event.charCode == null ? event.keyCode : event.charCode);
                return event.ctrlKey || event.metaKey || (chr < ' ' || !chars || chars.indexOf(chr) > -1);
            }

        },

        // Synchronise manual entry and field/alternate field.
        _doKeyUp: function (event) {

            var date,
                inst = Widgets.datepicker._getInst(event.target);

            if (inst.input.value !== inst.lastVal) {
                try {
                    date = Widgets.datepicker.parseDate(Widgets.datepicker._get(inst, 'dateFormat'),
                        (inst.input ? inst.input.value : null),
                        Widgets.datepicker._getFormatConfig(inst));

                    if (date) { // only if valid
                        Widgets.datepicker._setDateFromField(inst);
                        Widgets.datepicker._updateAlternate(inst);
                        Widgets.datepicker._updateDatepicker(inst);
                    }
                }
                catch (err) {
                }
            }
            return true;

        },

        // Pop-up the date picker for a given input field.
        // If false returned from beforeShow event handler do not show.
        // @param  input  element - the input field attached to the date picker or
        //                  event - if triggered by focus
        _showDatepicker: function (input) {

            input = input.target || input;
            if (input.nodeName.toLowerCase() !== 'input') { // find from button/image trigger
                input = Common.Query("input", input.parentNode);
            }

            if (Widgets.datepicker._isDisabledDatepicker(input) || Widgets.datepicker._lastInput === input) {
                return;
            }

            var inst, beforeShow, beforeShowSettings, isFixed,
                offset;

            inst = Widgets.datepicker._getInst(input);
            if (Widgets.datepicker._curInst && Widgets.datepicker._curInst !== inst) {
                Velocity(Widgets.datepicker._curInst.dpDiv, 'stop', true);
                if (inst && Widgets.datepicker._datepickerShowing) {
                    Widgets.datepicker._hideDatepicker(Widgets.datepicker._curInst.input);
                }
            }

            beforeShow = Widgets.datepicker._get(inst, 'beforeShow');
            beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
            if (beforeShowSettings === false){
                return;
            }
            datepicker_extendRemove(inst.settings, beforeShowSettings);

            inst.lastVal = null;
            Widgets.datepicker._lastInput = input;
            Widgets.datepicker._setDateFromField(inst);

            if (Widgets.datepicker._inDialog) { // hide cursor
                input.value = '';
            }
            if (!Widgets.datepicker._pos) { // position below input
                Widgets.datepicker._pos = Widgets.datepicker._findPos(input);
                Widgets.datepicker._pos[1] += input.offsetHeight; // add the height
            }

            isFixed = false;
            var inputParents = Common.ParentsUntil(null, input);
            var index = 0, length = inputParents.length;
            for ( ; index < length; index++) {
                isFixed = Common.GetStyle(inputParents[index], 'position') === 'fixed';
                if (isFixed) {
                    break;
                }
            }

            offset = {left: Widgets.datepicker._pos[0], top: Widgets.datepicker._pos[1]};
            Widgets.datepicker._pos = null;

            // To avoid flashes on Firefox
            if (inst.dpDiv.nodeType === 1) {
                // Get all elements inside element to be removed and clean up their data and events as well
                // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
                Cache.CleanElementData(inst.dpDiv.getElementsByTagName('*'));
            }
            inst.dpDiv.textContent = '';

            // determine sizing offscreen
            inst.dpDiv.style.position = 'absolute';
            inst.dpDiv.style.display = 'block';
            inst.dpDiv.style.top = '-1000px';
            Widgets.datepicker._updateDatepicker(inst);

            // fix width for dynamic number of date pickers
            // and adjust position before showing
            offset = Widgets.datepicker._checkOffset(inst, offset, isFixed);
            inst.dpDiv.style.position = isFixed ? 'fixed' : 'absolute';
            inst.dpDiv.style.display = 'none';
            inst.dpDiv.style.left = offset.left + 'px';
            inst.dpDiv.style.top = offset.top + 'px';

            if (!inst.inline) {
                Widgets.datepicker._datepickerShowing = true;

                Velocity(inst.dpDiv, 'fadeIn', 'fast');

                if (Widgets.datepicker._shouldFocusInput(inst)) {
                    inst.input.focus();
                }

                Widgets.datepicker._curInst = inst;
            }

        },

        // Generate the date picker content.
        _updateDatepicker: function (inst) {

            this.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
            datepicker_instActive = inst; // for delegate hover events

            if (inst.dpDiv.nodeType === 1) {
                // Get all elements inside element to be removed and clean up their data and events as well
                // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
                Cache.CleanElementData(inst.dpDiv.getElementsByTagName('*'));
            }
            inst.dpDiv.textContent = '';
            Common.InsertHTMLString(inst.dpDiv, Common.InsertType.Append, this._generateHTML(inst));
            this._attachHandlers(inst);

            var origyearshtml,
                numMonths = this._getNumberOfMonths(inst),
                cols = numMonths[1],
                width = 17,
                activeCell = Common.Query('.' + this._dayOverClass + ' a', inst.dpDiv);

            if (activeCell) {
                datepicker_handleMouseover.apply(activeCell);
            }

            Common.RemoveClasses(inst.dpDiv, 'gtc-ui-datepicker-multi-2 gtc-ui-datepicker-multi-3 gtc-ui-datepicker-multi-4');
            inst.dpDiv.style.width = '';
            if (cols > 1) {
                Common.AddClass(inst.dpDiv, 'gtc-ui-datepicker-multi-' + cols);
                inst.dpDiv.styl.width = (width * cols) + 'em';
            }
            if (numMonths[0] !== 1 || numMonths[1] !== 1) {
                Common.AddClass(inst.dpDiv, 'gtc-ui-datepicker-multi');
            }
            else {
                Common.RemoveClass(inst.dpDiv, 'gtc-ui-datepicker-multi');
            }
            if (this._get(inst, 'isRTL')) {
                Common.AddClass(inst.dpDiv, 'gtc-ui-datepicker-rtl');
            }
            else {
                Common.RemoveClass(inst.dpDiv, 'gtc-ui-datepicker-rtl');
            }

            if (inst === Widgets.datepicker._curInst && Widgets.datepicker._datepickerShowing && Widgets.datepicker._shouldFocusInput(inst)) {
                inst.input.focus();
            }

            // Deffered render of the years select (to avoid flashes on Firefox)
            if (inst.yearshtml){
                origyearshtml = inst.yearshtml;
                setTimeout(
                    function () {
                        // Assure that inst.yearshtml didn't change.
                        if (origyearshtml === inst.yearshtml && inst.yearshtml) {
                            var yearSelect = Common.Query('select.gtc-ui-datepicker-year', inst.dpDiv);
                            if (yearSelect) {
                                var newNode = Common.GenerateHTML(inst.yearshtml);
                                yearSelect.parentNode.replaceChild(newNode, yearSelect);
                            }
                        }
                        origyearshtml = inst.yearshtml = null;
                    }, 0
                );
            }

        },

        // #6694 - don't focus the input if it's already focused
        // this breaks the change event in IE
        // Support: IE
        _shouldFocusInput: function (inst) {

            return inst.input && Common.IsVisible(inst.input) && !inst.input.disabled == false && !inst.input != document.activeElement;

        },

        // Check positioning to remain on screen.
        _checkOffset: function (inst, offset, isFixed) {

            var dpWidth = Common.Width(inst.dpDiv, true),
                dpHeight = Common.Height(inst.dpDiv, true),
                inputWidth = inst.input ? Common.Width(inst.input, true) : 0,
                inputHeight = inst.input ? Common.Height(inst.input, true) : 0,
                viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : window.pageXOffset),
                viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : window.pageYOffset);

            var inputOffset = Common.Offset(inst.input);
            offset.left -= (this._get(inst, 'isRTL') ? (dpWidth - inputWidth) : 0);
            offset.left -= (isFixed && offset.left === inputOffset.left) ? window.pageXOffset : 0;
            offset.top -= (isFixed && offset.top === (inputOffset.top + inputHeight)) ? window.pageYOffset : 0;

            // now check if datepicker is showing outside window viewport - move to a better place if so.
            offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight) : 0);

            return offset;

        },

        // Find an object's position on the screen.
        _findPos: function (obj) {

            var position,
                inst = this._getInst(obj),
                isRTL = this._get(inst, 'isRTL');

            while (obj && (obj.type === 'hidden' || obj.nodeType !== 1 || Common.IsHidden(obj))) {
                if (isRTL) {
                    obj = Common.GetSibling(obj, Common.SiblingType.Previous);
                }
                else {
                    obj = Common.GetSibling(obj, Common.SiblingType.Next);
                }
            }

            position = Common.Offset(obj);
            return [position.left, position.top];

        },

        // Hide the date picker from view.
        // @param  input  element - the input field attached to the date picker
        _hideDatepicker: function (input) {

            var postProcess, onClose,
                inst = this._curInst;

            if (!inst || (input && inst !== Cache.Get(input, 'datepicker'))) {
                return;
            }

            if (this._datepickerShowing) {
                postProcess = function () {
                    Widgets.datepicker._tidyDialog(inst);
                };

                Velocity(inst.dpDiv, 'fadeOut', 'fast', postProcess);

                this._datepickerShowing = false;

                onClose = this._get(inst, 'onClose');
                if (onClose) {
                    onClose.apply((inst.input ? inst.input : null), [(inst.input ? inst.input.value : ''), inst]);
                }

                this._lastInput = null;
                if (this._inDialog) {
                    this._dialogInput.style.position = 'absolute';
                    this._dialogInput.style.left = '0';
                    this._dialogInput.style.top = '-100px';
                }
                this._inDialog = false;
            }

        },

        // Tidy up after a dialog display.
        _tidyDialog: function (inst) {

            Common.RemoveClass(inst.dpDiv, this._dialogClass);
            Events.Off(inst.dpDiv, '.gtc-ui-datepicker-calendar');

        },

        // Close date picker if clicked elsewhere.
        _checkExternalClick: function (event) {

            if (!Widgets.datepicker._curInst) {
                return;
            }

            var target = event.target,
                inst = Widgets.datepicker._getInst(target);

            if (((target.id !== Widgets.datepicker._mainDivId &&
                    Common.ParentsUntil(null, target, '#' + Widgets.datepicker._mainDivId).length == 0 &&
                    !Common.HasClass(target, Widgets.datepicker.markerClassName) &&
                    Common.IsNotDefined(Common.Closest('.' + Widgets.datepicker._triggerClass, target)) &&
                    Widgets.datepicker._datepickerShowing)) ||
                (Common.HasClass(target, Widgets.datepicker.markerClassName) && Widgets.datepicker._curInst !== inst)) {
                    Widgets.datepicker._hideDatepicker();
            }

        },

        // Adjust one of the date sub-fields.
        _adjustDate: function (id, offset, period) {

            var target;
            if (Common.IsString(id)) {
                target = Common.Get(id);
            }
            else {
                target = id;
            }
            var inst = this._getInst(target);

            if (this._isDisabledDatepicker(target)) {
                return;
            }
            this._adjustInstDate(inst, offset +
                (period === 'M' ? this._get(inst, 'showCurrentAtPos') : 0), // undo positioning
                period);
            this._updateDatepicker(inst);

        },

        // Action for current link.
        _gotoToday: function (id) {

            var date, target;
            if (Common.IsString(id)) {
                target = Common.Get(id);
            }
            else {
                target = id;
            }
            var inst = this._getInst(target);

            if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
                inst.selectedDay = inst.currentDay;
                inst.drawMonth = inst.selectedMonth = inst.currentMonth;
                inst.drawYear = inst.selectedYear = inst.currentYear;
            }
            else {
                date = new Date();
                inst.selectedDay = date.getDate();
                inst.drawMonth = inst.selectedMonth = date.getMonth();
                inst.drawYear = inst.selectedYear = date.getFullYear();
            }
            this._notifyChange(inst);
            this._adjustDate(target);

        },

        // Action for selecting a new month/year.
        _selectMonthYear: function (id, select, period) {

            var inst, target;
            if (Common.IsString(id)) {
                target = Common.Get(id);
            }
            else {
                target = id;
            }
            inst = this._getInst(target);

            inst['selected' + (period === 'M' ? 'Month' : 'Year')] =
            inst['draw' + (period === 'M' ? 'Month' : 'Year')] =
                parseInt(select.options[select.selectedIndex].value, 10);

            this._notifyChange(inst);
            this._adjustDate(target);

        },

        // Action for selecting a day.
        _selectDay: function(id, month, year, td) {

            var inst, target;
            if (Common.IsString(id)) {
                target = Common.Get(id);
            }
            else {
                target = id;
            }

            if (Common.HasClass(td, this._unselectableClass) || this._isDisabledDatepicker(target)) {
                return;
            }

            inst = this._getInst(target);
            inst.selectedDay = inst.currentDay = Common.Query('a', td).innerHTML;
            inst.selectedMonth = inst.currentMonth = month;
            inst.selectedYear = inst.currentYear = year;
            this._selectDate(id, this._formatDate(inst, inst.currentDay, inst.currentMonth, inst.currentYear));

        },

        // Erase the input field and hide the date picker.
        _clearDate: function (id) {

            var target;
            if (Common.IsString(id)) {
                target = Common.Get(id);
            }
            else {
                target = id;
            }
            this._selectDate(target, '');

        },

        // Update the input field with the selected date.
        _selectDate: function (id, dateStr) {

            var onSelect, target;
            if (Common.IsString(id)) {
                target = Common.Get(id);
            }
            else {
                target = id;
            }
            var inst = this._getInst(target);

            dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
            if (inst.input) {
                inst.input.value = dateStr;
            }
            this._updateAlternate(inst);

            onSelect = this._get(inst, 'onSelect');
            if (onSelect) {
                onSelect.apply((inst.input ? inst.input : null), [dateStr, inst]);  // trigger custom callback
            }
            else if (inst.input) {
                Events.Trigger(inst.input, 'change'); // fire the change event
            }

            if (inst.inline){
                this._updateDatepicker(inst);
            }
            else {
                this._hideDatepicker();
                this._lastInput = inst.input;
                if (!Common.IsObject(inst.input)) {
                    inst.input.focus(); // restore focus
                }
                this._lastInput = null;
            }

        },

        // Update any alternate field to synchronise with the main field.
        _updateAlternate: function (inst) {

            var altFormat, date, dateStr,
                altField = this._get(inst, 'altField');

            if (altField) { // update alternate field too
                altFormat = this._get(inst, 'altFormat') || this._get(inst, 'dateFormat');
                date = this._getDate(inst);
                dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
                altField.value = dateStr;
            }

        },

        // Set as beforeShowDay function to prevent selection of weekends.
        // @param  date  Date - the date to customise
        // @return [boolean, string] - is this date selectable?, what is its CSS class?
        noWeekends: function (date) {

            var day = date.getDay();
            return [(day > 0 && day < 6), ''];

        },

        // Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
        // @param  date  Date - the date to get the week for
        // @return  number - the number of the week within the year that contains this date
        iso8601Week: function (date) {

            var time,
                checkDate = new Date(date.getTime());

            // Find Thursday of this week starting on Monday
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

            time = checkDate.getTime();
            checkDate.setMonth(0); // Compare with Jan 1
            checkDate.setDate(1);
            return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;

        },

        // Parse a string value into a date object.
        // See formatDate below for the possible formats.
        //
        // @param  format string - the expected format of the date
        // @param  value string - the date in the above format
        // @param  settings Object - attributes include:
        //                  shortYearCutoff  number - the cutoff year for determining the century (optional)
        //                  dayNamesShort   string[7] - abbreviated names of the days from Sunday (optional)
        //                  dayNames        string[7] - names of the days from Sunday (optional)
        //                  monthNamesShort string[12] - abbreviated names of the months (optional)
        //                  monthNames      string[12] - names of the months (optional)
        // @return  Date - the extracted date value or null if value is blank
        parseDate: function (format, value, settings) {

            if (format == null || value == null) {
                throw 'Invalid arguments';
            }

            value = (Common.IsObject(value) ? value.toString() : value + '');
            if (value === '') {
                return null;
            }

            var iFormat, dim, extra,
                iValue = 0,
                shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff,
                shortYearCutoff = (!Common.IsString(shortYearCutoffTemp) ? shortYearCutoffTemp :
                    new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
                dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
                monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
                year = -1,
                month = -1,
                day = -1,
                doy = -1,
                literal = false,
                date,
                // Check whether a format character is doubled
                lookAhead = function (match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
                // Extract a number from the string value
                getNumber = function (match) {

                    var isDoubled = lookAhead(match),
                        size = (match === '@' ? 14 : (match === '!' ? 20 :
                        (match === 'y' && isDoubled ? 4 : (match === 'o' ? 3 : 2)))),
                        minSize = (match === 'y' ? size : 1),
                        digits = new RegExp('^\\d{' + minSize + ',' + size + '}'),
                        num = value.substring(iValue).match(digits);
                    if (!num) {
                        throw 'Missing number at position ' + iValue;
                    }
                    iValue += num[0].length;
                    return parseInt(num[0], 10);

                },
                // Extract a name from the string value and convert to an index
                getName = function (match, shortNames, longNames) {

                    var index = -1, names;

                    var namesToMap = lookAhead(match) ? longNames : shortNames;
                    var mappedNames = [];
                    var mapIndex = 0, mapLength = namesToMap.length;
                    for ( ; mapIndex < mapLength; mapIndex++) {
                        mappedNames.push([mapIndex, namesToMap[mapIndex]]);
                    }

                    names = mappedNames.sort(
                        function (a, b) {
                            return -(a[1].length - b[1].length);
                        }
                    );

                    var pair, sortedIndex = 0, sortedLength = names.length;
                    for ( ; sortedIndex < sortedLength; sortedIndex++) {
                        pair = names[sortedIndex];
                        var name = pair[1];
                        if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                            index = pair[0];
                            iValue += name.length;
                            break;
                        }
                    }
                    if (index !== -1) {
                        return index + 1;
                    }
                    else {
                        throw 'Unknown name at position ' + iValue;
                    }

                },
                // Confirm that a literal character matches the string value
                checkLiteral = function () {

                    if (value.charAt(iValue) !== format.charAt(iFormat)) {
                        throw 'Unexpected literal at position ' + iValue;
                    }
                    iValue++;

                };

            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                        literal = false;
                    }
                    else {
                        checkLiteral();
                    }
                }
                else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                            day = getNumber('d');
                            break;
                        case 'D':
                            getName('D', dayNamesShort, dayNames);
                            break;
                        case 'o':
                            doy = getNumber('o');
                            break;
                        case 'm':
                            month = getNumber('m');
                            break;
                        case 'M':
                            month = getName('M', monthNamesShort, monthNames);
                            break;
                        case 'y':
                            year = getNumber('y');
                            break;
                        case '@':
                            date = new Date(getNumber('@'));
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case '!':
                            date = new Date((getNumber('!') - this._ticksTo1970) / 10000);
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case '\'':
                            if (lookAhead('\'')){
                                checkLiteral();
                            }
                            else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            if (iValue < value.length){
                extra = value.substr(iValue);
                if (!/^\s+/.test(extra)) {
                    throw 'Extra/unparsed characters found in date: ' + extra;
                }
            }

            if (year === -1) {
                year = new Date().getFullYear();
            }
            else if (year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                    (year <= shortYearCutoff ? 0 : -100);
            }

            if (doy > -1) {
                month = 1;
                day = doy;
                do {
                    dim = this._getDaysInMonth(year, month - 1);
                    if (day <= dim) {
                        break;
                    }
                    month++;
                    day -= dim;
                } while (true);
            }

            date = this._daylightSavingAdjust(new Date(year, month - 1, day));
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                throw 'Invalid date'; // E.g. 31/02/00
            }
            return date;

        },

        // Standard date formats.
        ATOM: 'yy-mm-dd', // RFC 3339 (ISO 8601)
        COOKIE: 'D, dd M yy',
        ISO_8601: 'yy-mm-dd',
        RFC_822: 'D, d M y',
        RFC_850: 'DD, dd-M-y',
        RFC_1036: 'D, d M y',
        RFC_1123: 'D, d M yy',
        RFC_2822: 'D, d M yy',
        RSS: 'D, d M y', // RFC 822
        TICKS: '!',
        TIMESTAMP: '@',
        W3C: 'yy-mm-dd', // ISO 8601

        _ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) + Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

        // Format a date object into a string value.
        // The format can be combinations of the following:
        // d  - day of month (no leading zero)
        // dd - day of month (two digit)
        // o  - day of year (no leading zeros)
        // oo - day of year (three digit)
        // D  - day name short
        // DD - day name long
        // m  - month of year (no leading zero)
        // mm - month of year (two digit)
        // M  - month name short
        // MM - month name long
        // y  - year (two digit)
        // yy - year (four digit)
        // @ - Unix timestamp (ms since 01/01/1970)
        // ! - Windows ticks (100ns since 01/01/0001)
        // "..." - literal text
        // '' - single quote
        //
        // @param  format string - the desired format of the date
        // @param  date Date - the date value to format
        // @param  settings Object - attributes include:
        //                  dayNamesShort   string[7] - abbreviated names of the days from Sunday (optional)
        //                  dayNames        string[7] - names of the days from Sunday (optional)
        //                  monthNamesShort string[12] - abbreviated names of the months (optional)
        //                  monthNames      string[12] - names of the months (optional)
        // @return  string - the date in the above format
        formatDate: function (format, date, settings) {

            if (!date) {
                return '';
            }

            var iFormat,
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
                dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
                monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
                // Check whether a format character is doubled
                lookAhead = function (match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
                // Format a number, with leading zero if necessary
                formatNumber = function (match, value, len) {
                    var num = '' + value;
                    if (lookAhead(match)) {
                        while (num.length < len) {
                            num = '0' + num;
                        }
                    }
                    return num;
                },
                // Format a name, short or long as requested
                formatName = function (match, value, shortNames, longNames) {
                    return (lookAhead(match) ? longNames[value] : shortNames[value]);
                },
                output = "",
                literal = false;

            if (date) {
                for (iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                            literal = false;
                        }
                        else {
                            output += format.charAt(iFormat);
                        }
                    }
                    else {
                        switch (format.charAt(iFormat)) {
                            case 'd':
                                output += formatNumber('d', date.getDate(), 2);
                                break;
                            case 'D':
                                output += formatName('D', date.getDay(), dayNamesShort, dayNames);
                                break;
                            case 'o':
                                output += formatNumber('o',
                                    Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                                break;
                            case 'm':
                                output += formatNumber('m', date.getMonth() + 1, 2);
                                break;
                            case 'M':
                                output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
                                break;
                            case 'y':
                                output += (lookAhead('y') ? date.getFullYear() :
                                    (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                                break;
                            case '@':
                                output += date.getTime();
                                break;
                            case '!':
                                output += date.getTime() * 10000 + this._ticksTo1970;
                                break;
                            case '\'':
                                if (lookAhead('\'')) {
                                    output += '\'';
                                }
                                else {
                                    literal = true;
                                }
                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;

        },

        // Extract all possible characters from the date format.
        _possibleChars: function (format) {

            var iFormat,
                chars = '',
                literal = false,
                // Check whether a format character is doubled
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                };

            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                        literal = false;
                    }
                    else {
                        chars += format.charAt(iFormat);
                    }
                }
                else {
                    switch (format.charAt(iFormat)) {
                        case 'd': case 'm': case 'y': case '@':
                            chars += '0123456789';
                            break;
                        case 'D': case 'M':
                            return null; // Accept anything
                        case '\'':
                            if (lookAhead('\'')) {
                                chars += '\'';
                            }
                            else {
                                literal = true;
                            }
                            break;
                        default:
                            chars += format.charAt(iFormat);
                    }
                }
            }
            return chars;

        },

        // Get a setting value, defaulting if necessary.
        _get: function (inst, name) {

            return inst.settings[name] !== undefined ? inst.settings[name] : this._defaults[name];

        },

        // Parse existing date and initialise date picker.
        _setDateFromField: function (inst, noDefault) {

            if (inst.input.value === inst.lastVal) {
                return;
            }

            var dateFormat = this._get(inst, 'dateFormat'),
                dates = inst.lastVal = inst.input ? inst.input.value : null,
                defaultDate = this._getDefaultDate(inst),
                date = defaultDate,
                settings = this._getFormatConfig(inst);

            try {
                date = this.parseDate(dateFormat, dates, settings) || defaultDate;
            } catch (event) {
                dates = (noDefault ? '' : dates);
            }
            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            inst.currentDay = (dates ? date.getDate() : 0);
            inst.currentMonth = (dates ? date.getMonth() : 0);
            inst.currentYear = (dates ? date.getFullYear() : 0);
            this._adjustInstDate(inst);

        },

        // Retrieve the default date shown on opening.
        _getDefaultDate: function (inst) {

            return this._restrictMinMax(inst, this._determineDate(inst, this._get(inst, 'defaultDate'), new Date()));

        },

        // A date may be specified as an exact value or a relative one.
        _determineDate: function (inst, date, defaultDate) {

            var offsetNumeric = function (offset) {
                    var date = new Date();
                    date.setDate(date.getDate() + offset);
                    return date;
                },
                offsetString = function (offset) {
                    try {
                        return Widgets.datepicker.parseDate(Widgets.datepicker._get(inst, 'dateFormat'),
                            offset, Widgets.datepicker._getFormatConfig(inst));
                    }
                    catch (e) {
                        // Ignore
                    }

                    var date = (offset.toLowerCase().match(/^c/) ?
                        Widgets.datepicker._getDate(inst) : null) || new Date(),
                        year = date.getFullYear(),
                        month = date.getMonth(),
                        day = date.getDate(),
                        pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
                        matches = pattern.exec(offset);

                    while (matches) {
                        switch (matches[2] || 'd') {
                            case 'd' : case 'D' :
                                day += parseInt(matches[1],10); break;
                            case 'w' : case 'W' :
                                day += parseInt(matches[1],10) * 7; break;
                            case 'm' : case 'M' :
                                month += parseInt(matches[1],10);
                                day = Math.min(day, Widgets.datepicker._getDaysInMonth(year, month));
                                break;
                            case 'y': case 'Y' :
                                year += parseInt(matches[1],10);
                                day = Math.min(day, Widgets.datepicker._getDaysInMonth(year, month));
                                break;
                        }
                        matches = pattern.exec(offset);
                    }
                    return new Date(year, month, day);
                },
                newDate = (date == null || date === '' ? defaultDate : (Common.IsString(date) ? offsetString(date) :
                    (Common.IsNumber(date) ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));

            newDate = (newDate && newDate.toString() === 'Invalid Date' ? defaultDate : newDate);
            if (newDate) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
                newDate.setMilliseconds(0);
            }
            return this._daylightSavingAdjust(newDate);

        },

        // Handle switch to/from daylight saving.
        // Hours may be non-zero on daylight saving cut-over:
        // > 12 when midnight changeover, but then cannot generate
        // midnight datetime, so jump to 1AM, otherwise reset.
        // @param  date  (Date) the date to check
        // @return  (Date) the corrected date
        _daylightSavingAdjust: function (date) {

            if (!date) {
                return null;
            }
            date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
            return date;

        },

        // Set the date(s) directly.
        _setDate: function (inst, date, noChange) {

            var clear = !date,
                origMonth = inst.selectedMonth,
                origYear = inst.selectedYear,
                newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));

            inst.selectedDay = inst.currentDay = newDate.getDate();
            inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
            inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
            if ((origMonth !== inst.selectedMonth || origYear !== inst.selectedYear) && !noChange) {
                this._notifyChange(inst);
            }
            this._adjustInstDate(inst);
            if (inst.input) {
                inst.input.value = (clear ? '' : this._formatDate(inst));
            }

        },

        // Retrieve the date(s) directly.
        _getDate: function (inst) {

            var startDate = (!inst.currentYear || (inst.input && inst.input.value === '') ? null :
                this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
                return startDate;

        },

        // Attach the onxxx handlers.  These are declared statically so
        // they work with static code transformers like Caja.
        _attachHandlers: function (inst) {

            var stepMonths = this._get(inst, 'stepMonths'),
                id = inst.id.replace( /\\\\/g, '\\' );
            var allHandlers = Common.QueryAll('[data-handler]', inst.dpDiv);
            var handler, element, index = 0, length = allHandlers.length;
            for ( ; index < length; index++) {
                element = allHandlers[index];
                handler = {
                    prev: function () {
                        Widgets.datepicker._adjustDate(id, -stepMonths, 'M');
                    },
                    next: function () {
                        Widgets.datepicker._adjustDate(id, +stepMonths, 'M');
                    },
                    hide: function () {
                        Widgets.datepicker._hideDatepicker();
                    },
                    today: function () {
                        Widgets.datepicker._gotoToday(id);
                    },
                    selectDay: function () {
                        Widgets.datepicker._selectDay(id, +this.getAttribute('data-month'), +this.getAttribute('data-year'), this);
                        return false;
                    },
                    selectMonth: function () {
                        Widgets.datepicker._selectMonthYear(id, this, 'M');
                        return false;
                    },
                    selectYear: function () {
                        Widgets.datepicker._selectMonthYear(id, this, 'Y');
                        return false;
                    }
                };
                Events.On(element, element.getAttribute('data-event'), handler[element.getAttribute('data-handler')]);
            }

        },

        // Generate the HTML for the current state of the date picker.
        _generateHTML: function (inst) {

            var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
                controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
                monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
                selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
                cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
                printDate, dRow, tbody, daySettings, otherMonth, unselectable,
                tempDate = new Date(),
                today = this._daylightSavingAdjust(
                    new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())), // clear time
                isRTL = this._get(inst, 'isRTL'),
                showButtonPanel = this._get(inst, 'showButtonPanel'),
                hideIfNoPrevNext = this._get(inst, 'hideIfNoPrevNext'),
                navigationAsDateFormat = this._get(inst, 'navigationAsDateFormat'),
                numMonths = this._getNumberOfMonths(inst),
                showCurrentAtPos = this._get(inst, 'showCurrentAtPos'),
                stepMonths = this._get(inst, 'stepMonths'),
                isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
                currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
                    new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
                minDate = this._getMinMaxDate(inst, 'min'),
                maxDate = this._getMinMaxDate(inst, 'max'),
                drawMonth = inst.drawMonth - showCurrentAtPos,
                drawYear = inst.drawYear;

            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            if (maxDate) {
                maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
                    maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            inst.drawMonth = drawMonth;
            inst.drawYear = drawYear;

            prevText = this._get(inst, 'prevText');
            prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
                this._getFormatConfig(inst)));

            prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
                '<a class="gtc-ui-datepicker-prev gtc-ui-corner-all" data-handler="prev" data-event="click"' +
                ' title="' + prevText + '"><span class="gtc-ui-icon gtc-ui-icon-circle-triangle-' + ( isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>' :
                (hideIfNoPrevNext ? '' : '<a class="gtc-ui-datepicker-prev gtc-ui-corner-all gtc-ui-state-disabled" title="'+ prevText + '"><span class="gtc-ui-icon gtc-ui-icon-circle-triangle-' + ( isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>'));

            nextText = this._get(inst, 'nextText');
            nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
                this._getFormatConfig(inst)));

            next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
                '<a class="gtc-ui-datepicker-next gtc-ui-corner-all" data-handler="next" data-event="click"' +
                ' title="' + nextText + '"><span class="gtc-ui-icon gtc-ui-icon-circle-triangle-' + ( isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>' :
                (hideIfNoPrevNext ? '' : '<a class="gtc-ui-datepicker-next gtc-ui-corner-all gtc-ui-state-disabled" title="'+ nextText + '"><span class="gtc-ui-icon gtc-ui-icon-circle-triangle-' + ( isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>'));

            currentText = this._get(inst, 'currentText');
            gotoDate = (this._get(inst, 'gotoCurrent') && inst.currentDay ? currentDate : today);
            currentText = (!navigationAsDateFormat ? currentText :
                this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));

            controls = (!inst.inline ? '<button type="button" class="gtc-ui-datepicker-close gtc-ui-state-default gtc-ui-priority-primary gtc-ui-corner-all" data-handler="hide" data-event="click">' +
                this._get(inst, 'closeText') + '</button>' : '');

            buttonPanel = (showButtonPanel) ? '<div class="gtc-ui-datepicker-buttonpane gtc-ui-widget-content">' + (isRTL ? controls : '') +
                (this._isInRange(inst, gotoDate) ? '<button type="button" class="gtc-ui-datepicker-current gtc-ui-state-default gtc-ui-priority-secondary gtc-ui-corner-all" data-handler="today" data-event="click"' +
                '>' + currentText + '</button>' : '') + (isRTL ? '' : controls) + '</div>' : '';

            firstDay = parseInt(this._get(inst, 'firstDay'),10);
            firstDay = (isNaN(firstDay) ? 0 : firstDay);

            showWeek = this._get(inst, 'showWeek');
            dayNames = this._get(inst, 'dayNames');
            dayNamesMin = this._get(inst, 'dayNamesMin');
            monthNames = this._get(inst, 'monthNames');
            monthNamesShort = this._get(inst, 'monthNamesShort');
            beforeShowDay = this._get(inst, 'beforeShowDay');
            showOtherMonths = this._get(inst, 'showOtherMonths');
            selectOtherMonths = this._get(inst, 'selectOtherMonths');
            defaultDate = this._getDefaultDate(inst);
            html = '';
            dow;
            for (row = 0; row < numMonths[0]; row++) {
                group = '';
                this.maxRows = 4;
                for (col = 0; col < numMonths[1]; col++) {
                    selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
                    cornerClass = ' gtc-ui-corner-all';
                    calender = '';
                    if (isMultiMonth) {
                        calender += '<div class="gtc-ui-datepicker-group';
                        if (numMonths[1] > 1) {
                            switch (col) {
                                case 0: calender += ' gtc-ui-datepicker-group-first';
                                    cornerClass = ' gtc-ui-corner-' + (isRTL ? 'right' : 'left'); break;
                                case numMonths[1]-1: calender += ' gtc-ui-datepicker-group-last';
                                    cornerClass = ' gtc-ui-corner-' + (isRTL ? 'left' : 'right'); break;
                                default: calender += ' gtc-ui-datepicker-group-middle'; cornerClass = ''; break;
                            }
                        }
                        calender += '">';
                    }
                    calender += '<div class="gtc-ui-datepicker-header gtc-ui-widget-header gtc-ui-helper-clearfix' + cornerClass + '">' +
                        (/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : '') +
                        (/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : '') +
                        this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
                        row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
                        '</div><table class="gtc-ui-datepicker-calendar"><thead>' +
                        '<tr>';
                    thead = (showWeek ? '<th class="gtc-ui-datepicker-week-col">' + this._get(inst, 'weekHeader') + '</th>' : '');
                    for (dow = 0; dow < 7; dow++) { // days of the week
                        day = (dow + firstDay) % 7;
                        thead += '<th scope="col"' + ((dow + firstDay + 6) % 7 >= 5 ? ' class="gtc-ui-datepicker-week-end"' : '') + '>' +
                            '<span title="' + dayNames[day] + '">' + dayNamesMin[day] + '</span></th>';
                    }
                    calender += thead + '</tr></thead><tbody>';
                    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
                        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
                    }
                    leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
                    numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
                    this.maxRows = numRows;
                    printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
                    for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
                        calender += '<tr>';
                        tbody = (!showWeek ? '' : '<td class="gtc-ui-datepicker-week-col">' +
                            this._get(inst, 'calculateWeek')(printDate) + '</td>');
                        for (dow = 0; dow < 7; dow++) { // create date picker days
                            daySettings = (beforeShowDay ?
                                beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
                            otherMonth = (printDate.getMonth() !== drawMonth);
                            unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
                                (minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            tbody += '<td class="' +
                                ((dow + firstDay + 6) % 7 >= 5 ? ' gtc-ui-datepicker-week-end' : '') + // highlight weekends
                                (otherMonth ? ' gtc-ui-datepicker-other-month' : '') + // highlight days from other months
                                ((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || // user pressed key
                                (defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
                                // or defaultDate is current printedDate and defaultDate is selectedDate
                                ' ' + this._dayOverClass : '') + // highlight selected day
                                (unselectable ? ' ' + this._unselectableClass + ' gtc-ui-state-disabled': '') +  // highlight unselectable days
                                (otherMonth && !showOtherMonths ? '' : ' ' + daySettings[1] + // highlight custom dates
                                (printDate.getTime() === currentDate.getTime() ? ' ' + this._currentClass : '') + // highlight selected day
                                (printDate.getTime() === today.getTime() ? ' gtc-ui-datepicker-today' : '')) + '"' + // highlight today (if different)
                                ((!otherMonth || showOtherMonths) && daySettings[2] ? ' title="' + daySettings[2].replace(/'/g, '&#39;') + '"' : '') + // cell title
                                (unselectable ? '' : ' data-handler="selectDay" data-event="click" data-month="' + printDate.getMonth() + '" data-year="' + printDate.getFullYear() + '"') + '>' + // actions
                                (otherMonth && !showOtherMonths ? '&#xa0;' : // display for other months
                                (unselectable ? '<span class="gtc-ui-state-default">' + printDate.getDate() + '</span>' : '<a class="gtc-ui-state-default' +
                                (printDate.getTime() === today.getTime() ? ' gtc-ui-state-highlight' : '') +
                                (printDate.getTime() === currentDate.getTime() ? ' gtc-ui-state-active' : '') + // highlight selected day
                                (otherMonth ? ' gtc-ui-priority-secondary' : '') + // distinguish dates from other months
                                '" href="#">' + printDate.getDate() + '</a>')) + '</td>'; // display selectable date
                            printDate.setDate(printDate.getDate() + 1);
                            printDate = this._daylightSavingAdjust(printDate);
                        }
                        calender += tbody + '</tr>';
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    calender += '</tbody></table>' + (isMultiMonth ? '</div>' +
                                ((numMonths[0] > 0 && col === numMonths[1]-1) ? '<div class="gtc-ui-datepicker-row-break"></div>' : '') : '');
                    group += calender;
                }
                html += group;
            }
            html += buttonPanel;
            inst._keyEvent = false;
            return html;

        },

        // Generate the month and year header.
        _generateMonthYearHeader: function (inst, drawMonth, drawYear, minDate, maxDate, secondary, monthNames, monthNamesShort) {

            var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
                changeMonth = this._get(inst, 'changeMonth'),
                changeYear = this._get(inst, 'changeYear'),
                showMonthAfterYear = this._get(inst, 'showMonthAfterYear'),
                html = '<div class="gtc-ui-datepicker-title">',
                monthHtml = '';

            // month selection
            if (secondary || !changeMonth) {
                monthHtml += '<span class="gtc-ui-datepicker-month">' + monthNames[drawMonth] + '</span>';
            } else {
                inMinYear = (minDate && minDate.getFullYear() === drawYear);
                inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
                monthHtml += '<select class="gtc-ui-datepicker-month" data-handler="selectMonth" data-event="change">';
                for ( month = 0; month < 12; month++) {
                    if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
                        monthHtml += '<option value="' + month + '"' +
                            (month === drawMonth ? ' selected="selected"' : '') +
                            '>' + monthNamesShort[month] + '</option>';
                    }
                }
                monthHtml += '</select>';
            }

            if (!showMonthAfterYear) {
                html += monthHtml + (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '');
            }

            // year selection
            if ( !inst.yearshtml ) {
                inst.yearshtml = '';
                if (secondary || !changeYear) {
                    html += '<span class="gtc-ui-datepicker-year">' + drawYear + '</span>';
                } else {
                    // determine range of years to display
                    years = this._get(inst, 'yearRange').split(':');
                    thisYear = new Date().getFullYear();
                    determineYear = function(value) {
                        var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) :
                            (value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) :
                            parseInt(value, 10)));
                        return (isNaN(year) ? thisYear : year);
                    };
                    year = determineYear(years[0]);
                    endYear = Math.max(year, determineYear(years[1] || ''));
                    year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
                    endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
                    inst.yearshtml += '<select class="gtc-ui-datepicker-year" data-handler="selectYear" data-event="change">';
                    for (; year <= endYear; year++) {
                        inst.yearshtml += '<option value="' + year + '"' +
                            (year === drawYear ? ' selected="selected"' : '') +
                            '>' + year + '</option>';
                    }
                    inst.yearshtml += '</select>';

                    html += inst.yearshtml;
                    inst.yearshtml = null;
                }
            }

            html += this._get(inst, 'yearSuffix');
            if (showMonthAfterYear) {
                html += (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '') + monthHtml;
            }
            html += '</div>'; // Close datepicker_header
            return html;

        },

        // Adjust one of the date sub-fields.
        _adjustInstDate: function (inst, offset, period) {

            var year = inst.drawYear + (period === 'Y' ? offset : 0),
                month = inst.drawMonth + (period === 'M' ? offset : 0),
                day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) + (period === 'D' ? offset : 0),
                date = this._restrictMinMax(inst, this._daylightSavingAdjust(new Date(year, month, day)));

            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            if (period === 'M' || period === 'Y') {
                this._notifyChange(inst);
            }

        },

        // Ensure a date is within any min/max bounds.
        _restrictMinMax: function (inst, date) {

            var minDate = this._getMinMaxDate(inst, 'min'),
                maxDate = this._getMinMaxDate(inst, 'max'),
                newDate = (minDate && date < minDate ? minDate : date);
            return (maxDate && newDate > maxDate ? maxDate : newDate);

        },

        // Notify change of month/year.
        _notifyChange: function (inst) {

            var onChange = this._get(inst, 'onChangeMonthYear');
            if (onChange) {
                onChange.apply((inst.input ? inst.input : null), [inst.selectedYear, inst.selectedMonth + 1, inst]);
            }

        },

        // Determine the number of months to show.
        _getNumberOfMonths: function (inst) {

            var numMonths = this._get(inst, 'numberOfMonths');
            return (numMonths == null ? [1, 1] : (Common.IsNumber(numMonths) ? [1, numMonths] : numMonths));

        },

        // Determine the current maximum date - ensure no time components are set.
        _getMinMaxDate: function (inst, minMax) {

            return this._determineDate(inst, this._get(inst, minMax + 'Date'), null);

        },

        // Find the number of days in a given month.
        _getDaysInMonth: function (year, month) {

            return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();

        },

        // Find the day of the week of the first of a month.
        _getFirstDayOfMonth: function (year, month) {

            return new Date(year, month, 1).getDay();

        },

        // Determines if we should allow a "next/prev" month display change.
        _canAdjustMonth: function (inst, offset, curYear, curMonth) {

            var numMonths = this._getNumberOfMonths(inst),
                date = this._daylightSavingAdjust(new Date(curYear,
                curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));

            if (offset < 0) {
                date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
            }
            return this._isInRange(inst, date);

        },

        // Is the given date in the accepted range?
        _isInRange: function (inst, date) {

            var yearSplit, currentYear,
                minDate = this._getMinMaxDate(inst, 'min'),
                maxDate = this._getMinMaxDate(inst, 'max'),
                minYear = null,
                maxYear = null,
                years = this._get(inst, 'yearRange');
                if (years){
                    yearSplit = years.split(':');
                    currentYear = new Date().getFullYear();
                    minYear = parseInt(yearSplit[0], 10);
                    maxYear = parseInt(yearSplit[1], 10);
                    if (yearSplit[0].match(/[+\-].*/)) {
                        minYear += currentYear;
                    }
                    if (yearSplit[1].match(/[+\-].*/)) {
                        maxYear += currentYear;
                    }
                }

            return ((!minDate || date.getTime() >= minDate.getTime()) &&
                (!maxDate || date.getTime() <= maxDate.getTime()) &&
                (!minYear || date.getFullYear() >= minYear) &&
                (!maxYear || date.getFullYear() <= maxYear));

        },

        // Provide the configuration settings for formatting/parsing.
        _getFormatConfig: function (inst) {

            var shortYearCutoff = this._get(inst, 'shortYearCutoff');
            shortYearCutoff = (!Common.IsString(shortYearCutoff) ? shortYearCutoff :
                new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
            return {shortYearCutoff: shortYearCutoff,
                dayNamesShort: this._get(inst, 'dayNamesShort'), dayNames: this._get(inst, 'dayNames'),
                monthNamesShort: this._get(inst, 'monthNamesShort'), monthNames: this._get(inst, 'monthNames')};

        },

        // Format the given date for display.
        _formatDate: function (inst, day, month, year) {

            if (!day) {
                inst.currentDay = inst.selectedDay;
                inst.currentMonth = inst.selectedMonth;
                inst.currentYear = inst.selectedYear;
            }
            var date = (day ? (Common.IsObject(day) ? day :
                this._daylightSavingAdjust(new Date(year, month, day))) :
                this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
            return this.formatDate(this._get(inst, 'dateFormat'), date, this._getFormatConfig(inst));

        }
    });

    // Bind hover events for datepicker elements.
    // Done via delegate so the binding only occurs once in the lifetime of the parent div.
    // Global datepicker_instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
    function datepicker_bindHover (dpDiv) {

        var selector = 'button, .gtc-ui-datepicker-prev, .gtc-ui-datepicker-next, .gtc-ui-datepicker-calendar td a';
        Events.On(dpDiv, selector, 'mouseout',
            function () {
                Common.RemoveClass(this, 'gtc-ui-state-hover');
                if (this.className.indexOf('gtc-ui-datepicker-prev') !== -1) {
                    Common.RemoveClass('gtc-ui-datepicker-prev-hover');
                }
                if (this.className.indexOf('gtc-ui-datepicker-next') !== -1) {
                    Common.RemoveClass(this, 'gtc-ui-datepicker-next-hover');
                }
            }
        );
        Events.On(dpDiv, selector, 'mouseover', datepicker_handleMouseover);
        return dpDiv;

    }

    function datepicker_handleMouseover () {

        if (!Widgets.datepicker._isDisabledDatepicker(datepicker_instActive.inline? datepicker_instActive.dpDiv.parentNode : datepicker_instActive.input)) {
            var table = Common.Closest('.gtc-ui-datepicker-calendar', this);
            var allAnchors = Common.QueryAll('a', table);
            Common.RemoveClassFromElements(allAnchors, 'gtc-ui-state-hover');
            Common.AddClass(this, 'gtc-ui-state-hover');
            if (this.className.indexOf('gtc-ui-datepicker-prev') !== -1) {
                Common.AddClass(this, 'gtc-ui-datepicker-prev-hover');
            }
            if (this.className.indexOf('gtc-ui-datepicker-next') !== -1) {
                Common.AddClass(this, 'gtc-ui-datepicker-next-hover');
            }
        }

    }

    function datepicker_extendRemove (target, props) {

        Common.MergeObjects(target, props);
        for (var name in props) {
            if (props[name] == null) {
                target[name] = props[name];
            }
        }
        return target;

    };

    // Invoke the datepicker functionality.
    // @param  options  string - a command, optionally followed by additional parameters or
    //                  Object - settings for attaching new datepicker functionality
    // @return  element
    Widgets.monthlydatepicker = function (elements, options) {

        // Verify an empty collection wasn't passed - Fixes #6976
        if (Common.IsNotDefined(elements)) {
            return elements;
        }

        // Initialise the date picker.
        if (!Widgets.datepicker.initialized) {
            Events.On(document, 'mousedown.gtc-ui-datepicker-div', Widgets.datepicker._checkExternalClick);
            Widgets.datepicker.initialized = true;
        }

        // Append datepicker main container to body if not exist.
        if (!Common.Get(Widgets.datepicker._mainDivId)) {
            document.body.appendChild(Widgets.datepicker.dpDiv);
        }

        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (Common.IsString(options) && (options === 'isDisabled' || options === 'getDate' || options === 'widget')) {
            return Widgets.datepicker['_' + options + 'Datepicker'].apply(Widgets.datepicker, [elements].concat(otherArgs));
        }
        if (options === 'option' && arguments.length === 2 && Common.IsString(arguments[1])) {
            return Widgets.datepicker['_' + options + 'Datepicker'].apply(Widgets.datepicker, [elements].concat(otherArgs));
        }

        if (Common.IsString(options)) {
            return Widgets.datepicker['_' + options + 'Datepicker'].apply(Widgets.datepicker, [elements].concat(otherArgs));
        }
        else {
            return Widgets.datepicker._attachDatepicker(elements, options);
        }

    };

    // Singleton instance
    Widgets.datepicker = new Datepicker();
    Widgets.datepicker.initialized = false;
    Widgets.datepicker.uuid = new Date().getTime();
    Widgets.datepicker.version = "1.11.4";

    var datepicker = Widgets.datepicker;

} (window, document, Common, Cache, Events, Velocity));
