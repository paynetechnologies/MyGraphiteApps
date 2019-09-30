// Slider Field Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var SliderFieldWidget = {

        // Private Variables
        widgetEventPrefix: "slide",
        // number of pages in a slider
        // (how many times can you page up/down to go through the whole range)
        numPages: 5,

        // Options
        options: {
            animate: false,
            distance: 0,
            max: 100,
            min: 0,
            orientation: "horizontal",
            range: false,
            step: 1,
            value: 0,
            values: null,
            hasManual: false,
            manualFieldId: null,
            manualField: null,

            // callbacks
            change: null,
            slide: null,
            start: null,
            stop: null
        },

        // Public Methods
        EnableControl: function () {

            this._enableControl();

        },

        DisableControl: function () {

            this._disableControl();

        },

        value: function (newValue) {

            var thisWidget = this;
            if (arguments.length) {
                thisWidget.options.value = thisWidget._trimAlignValue(newValue);
                thisWidget._refreshValue();
                thisWidget._change(null, 0);
                return;
            }
            return thisWidget._value();

        },

        updatevalue: function (newValue) {

            var thisWidget = this;
            if (arguments.length) {
                thisWidget.options.value = thisWidget._trimAlignValue(newValue);
                thisWidget._refreshValue();
            }

        },

        values: function (index, newValue) {

            var thisWidget = this;
            var vals, newValues, index;

            if (arguments.length > 1) {
                thisWidget.options.values[index] = thisWidget._trimAlignValue(newValue);
                thisWidget._refreshValue();
                thisWidget._change(null, index);
                return;
            }

            if (arguments.length) {
                if (Common.IsArray(arguments[0])) {
                    vals = thisWidget.options.values;
                    index = 0, newValues = arguments[0];
                    var length = vals.length;
                    for ( ; index < length; index += 1) {
                        vals[index] = thisWidget._trimAlignValue(newValues[index]);
                        thisWidget._change(null, index);
                    }
                    thisWidget._refreshValue();
                }
                else {
                    if (thisWidget.options.values && thisWidget.options.values.length) {
                        return thisWidget._values(index);
                    }
                    else {
                        return thisWidget.value();
                    }
                }
            }
            else {
                return thisWidget._values();
            }

        },

        // Private Methods
        _disableControl: function () {

            var thisWidget = this;
            thisWidget._setOption('disabled', true);
            if (thisWidget.options.hasManual) {
                Widgets.textbox(thisWidget.options.manualField, 'DisableControl');
            }

        },

        _enableControl: function () {

            var thisWidget = this;
            thisWidget._setOption('disabled', false);
            if (thisWidget.options.hasManual) {
                Widgets.textbox(thisWidget.options.manualField, 'EnableControl');
            }

        },

        _refresh: function () {

            var thisWidget = this;
            thisWidget._createRange();
            thisWidget._createHandles();
            thisWidget._setupEvents();
            thisWidget._refreshValue();

        },

        _createHandles: function () {

            var thisWidget = this;
            var i, handleCount,
                options = thisWidget.options,
                existingHandles = Common.QueryAll('.gtc-ui-slider-handle', thisWidget.element),
                handle = '<span class="gtc-ui-slider-handle gtc-ui-state-default gtc-ui-corner-all" tabindex="0"></span>',
                handles = [];
            Common.AddClassesToElements(existingHandles, 'gtc-ui-state-default gtc-ui-corner-all');

            handleCount = (options.values && options.values.length) || 1;

            if (existingHandles.length > handleCount) {
                Common.Remove(existingHandles.slice(handleCount));
                existingHandles = existingHandles.slice(0, handleCount);
            }

            for (i = existingHandles.length; i < handleCount; i++) {
                handles.push(handle);
            }

            var index = 0, length = handles.length;
            for ( ; index < length; index++) {
                var spanHandle = Common.GenerateHTML(handles[index]);
                handles[index] = spanHandle;
                thisWidget.element.appendChild(spanHandle);
                var scaleForHandle = Common.GenerateHTML('<div class="gtc-ui-slider-scale"></div>');
                thisWidget.element.appendChild(scaleForHandle);
            }
            thisWidget.handles = Common.MergeArray([], handles);
            thisWidget.handle = thisWidget.handles[0];
            index = 0, length = thisWidget.handles.length;
            for ( ; index < length; index++) {
                Cache.Set(thisWidget.handles[index], 'gtc-ui-slider-handle-index', index);
            }

        },

        _createRange: function() {

            var thisWidget = this;
            var options = this.options,
                classes = '';

            if (options.range) {
                if (options.range === true) {
                    if (!options.values) {
                        options.values = [thisWidget._valueMin(), thisWidget._valueMin()];
                    }
                    else if (options.values.length && options.values.length !== 2) {
                        options.values = [options.values[0], options.values[0]];
                    }
                    else if (Common.IsArray(options.values)) {
                        options.values = options.values.slice(0);
                    }
                }

                if (!thisWidget.range || !thisWidget.range.length) {
                    thisWidget.range = Common.Create('div');
                    thisWidget.element.appendChild(thisWidget.range);

                    classes = 'gtc-ui-slider-range' +
                    // note: this isn't the most fittingly semantic framework class for this element,
                    // but worked best visually with a variety of themes
                    ' gtc-ui-widget-header gtc-ui-corner-all';
                }
                else {
                    Common.RemoveClasses(thisWidget.range, 'gtc-ui-slider-range-min gtc-ui-slider-range-max');

                    // Handle range switching from true to min/max
                    thisWidget.range.style.left = '';
                    thisWidget.range.style.bottom = '';
                }

                Common.AddClasses(thisWidget.range, classes + (( options.range === 'min' || options.range === 'max') ? ' gtc-ui-slider-range-' + options.range : ''));
            }
            else {
                if (thisWidget.range) {
                    Common.Remove(thisWidget.range);
                }
                thisWidget.range = null;
            }

        },

        _setupEvents: function () {

            var thisWidget = this;
            thisWidget._off( thisWidget.handles );
            thisWidget._on( thisWidget.handles, thisWidget._handleEvents );
            thisWidget._hoverable( thisWidget.handles );
            thisWidget._focusable( thisWidget.handles );

        },

        _destroy: function () {

            var thisWidget = this;
            Common.Remove(thisWidget.handles);
            if (thisWidget.range) {
                Common.Remove(thisWidget.range);
            }
            Common.RemoveClasses(thisWidget.element, 'gtc-ui-slider gtc-ui-slider-horizontal gtc-ui-slider-vertical gtc-ui-widget gtc-ui-widget-content gtc-ui-corner-all');
            thisWidget._mouseDestroy();

        },

        _mouseCapture: function (event) {

            var thisWidget = this;
            var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle;

            if (thisWidget.options.disabled) {
                return false;
            }

            thisWidget.elementSize = {
                width: Common.Width(thisWidget.element, true),
                height: Common.Height(thisWidget.element, true)
            };
            thisWidget.elementOffset = Common.Offset(thisWidget.element);

            position = { x: event.pageX, y: event.pageY };
            normValue = thisWidget._normValueFromMouse(position);
            distance = thisWidget._valueMax() - thisWidget._valueMin() + 1;
            var handle, loopIndex = 0, length = thisWidget.handles.length;
            for ( ; loopIndex < length; loopIndex++) {
                handle = thisWidget.handles[loopIndex];
                var thisDistance = Math.abs(normValue - thisWidget.values(loopIndex));
                if ((distance > thisDistance) || (distance === thisDistance && (loopIndex === thisWidget._lastChangedValue || thisWidget.values(loopIndex) === thisWidget.options.min))) {
                    distance = thisDistance;
                    closestHandle = handle;
                    index = loopIndex;
                }
            }

            allowed = thisWidget._start(event, index);
            if (allowed === false) {
                return false;
            }
            thisWidget._mouseSliding = true;
            thisWidget._handleIndex = index;

            Common.AddClass(closestHandle, 'gtc-ui-state-active');
            closestHandle.focus();

            offset = Common.Offset(closestHandle);
            var allHandleParents = Common.ParentsUntil(null, event.target);
            allHandleParents.push(event.target);
            loopIndex = 0, length = allHandleParents.length;
            for ( ; loopIndex < loopIndex; loopIndex++) {
                if (Common.HasClass(allHandleParents[loopIndex], 'gtc-ui-slider-handle')) {
                    mouseOverHandle = false;
                    break;
                }
            }
            thisWidget._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
                left: event.pageX - offset.left - (Common.Width(closestHandle) / 2),
                top: event.pageY - offset.top -
                    (Common.Height(closestHandle) / 2) -
                    (parseInt(Common.GetStyle(closestHandle, 'borderTopWidth'), 10) || 0 ) -
                    (parseInt(Common.GetStyle(closestHandle, 'borderBottomWidth'), 10) || 0) +
                    (parseInt(Common.GetStyle(closestHandle, 'marginTop'), 10) || 0)
            };

            var handleHasHover;
            loopIndex = 0, length = thisWidget.handles.length;
            for ( ; loopIndex < length; loopIndex++) {
                handleHasHover = !Common.HasClass(thisWidget.handles[loopIndex], 'gtc-ui-state-hover');
            }
            if (handleHasHover) {
                thisWidget._slide(event, index, normValue);
            }
            thisWidget._animateOff = true;
            return true;

        },

        _mouseStart: function () {

            return true;

        },

        _mouseDrag: function (event) {

            var thisWidget = this;
            var position = { x: event.pageX, y: event.pageY },
                normValue = thisWidget._normValueFromMouse(position);

            thisWidget._slide( event, thisWidget._handleIndex, normValue );

            return false;

        },

        _mouseStop: function (event) {

            var thisWidget = this;
            Common.RemoveClassFromElements(thisWidget.handles, 'gtc-ui-state-active');
            thisWidget._mouseSliding = false;

            thisWidget._stop(event, thisWidget._handleIndex);
            thisWidget._change(event, thisWidget._handleIndex);

            thisWidget._handleIndex = null;
            thisWidget._clickOffset = null;
            thisWidget._animateOff = false;

            return false;

        },

        _detectOrientation: function () {

            var thisWidget = this;
            thisWidget.orientation = (thisWidget.options.orientation === 'vertical' ) ? 'vertical' : 'horizontal';

        },

        _normValueFromMouse: function (position) {

            var thisWidget = this;
            var pixelTotal,
                pixelMouse,
                percentMouse,
                valueTotal,
                valueMouse;

            if (thisWidget.orientation === 'horizontal') {
                pixelTotal = thisWidget.elementSize.width;
                pixelMouse = position.x - thisWidget.elementOffset.left - ( thisWidget._clickOffset ? thisWidget._clickOffset.left : 0 );
            }
            else {
                pixelTotal = thisWidget.elementSize.height;
                pixelMouse = position.y - thisWidget.elementOffset.top - ( thisWidget._clickOffset ? thisWidget._clickOffset.top : 0 );
            }

            percentMouse = ( pixelMouse / pixelTotal );
            if (percentMouse > 1) {
                percentMouse = 1;
            }
            if (percentMouse < 0) {
                percentMouse = 0;
            }
            if (thisWidget.orientation === 'vertical') {
                percentMouse = 1 - percentMouse;
            }

            valueTotal = thisWidget._valueMax() - thisWidget._valueMin();
            valueMouse = thisWidget._valueMin() + percentMouse * valueTotal;

            return thisWidget._trimAlignValue( valueMouse );

        },

        _start: function (event, index) {

            var thisWidget = this;
            var uiHash = {
                handle: thisWidget.handles[index],
                value: thisWidget.value()
            };
            if (thisWidget.options.values && thisWidget.options.values.length) {
                uiHash.value = thisWidget.values(index);
                uiHash.values = thisWidget.values();
            }
            return thisWidget._trigger('start', event, uiHash);

        },

        _slide: function (event, index, newVal) {

            var thisWidget = this;
            var otherVal,
                newValues,
                allowed;

            if (thisWidget.options.values && thisWidget.options.values.length) {
                otherVal = thisWidget.values(index ? 0 : 1);

                if ((thisWidget.options.values.length === 2 && thisWidget.options.range === true) && (( index === 0 && newVal > otherVal) || (index === 1 && newVal < otherVal))) {
                    newVal = otherVal;
                }

                if (newVal !== thisWidget.values(index)) {
                    newValues = thisWidget.values();
                    newValues[index] = newVal;
                    // A slide can be canceled by returning false from the slide callback
                    allowed = thisWidget._trigger('slide', event, {
                        handle: thisWidget.handles[index],
                        value: newVal,
                        values: newValues
                    });
                    otherVal = thisWidget.values(index ? 0 : 1);
                    if (allowed !== false) {
                        thisWidget.values(index, newVal);
                    }
                }
            }
            else {
                if (newVal !== thisWidget.value()) {
                    // A slide can be canceled by returning false from the slide callback
                    allowed = thisWidget._trigger('slide', event, {
                        handle: thisWidget.handles[ index ],
                        value: newVal
                    });
                    if (allowed !== false) {
                        thisWidget.value(newVal);
                    }
                }
            }

        },

        _stop: function (event, index) {

            var thisWidget = this;
            var uiHash = {
                handle: thisWidget.handles[index],
                value: thisWidget.value()
            };
            if (thisWidget.options.values && thisWidget.options.values.length) {
                uiHash.value = thisWidget.values(index);
                uiHash.values = thisWidget.values();
            }

            thisWidget._trigger('stop', event, uiHash);

        },

        _change: function (event, index) {

            var thisWidget = this;
            if (!thisWidget._keySliding && !thisWidget._mouseSliding) {
                var uiHash = {
                    handle: thisWidget.handles[index],
                    value: thisWidget.value()
                };
                if (thisWidget.options.values && thisWidget.options.values.length) {
                    uiHash.value = thisWidget.values(index);
                    uiHash.values = thisWidget.values();
                }

                //store the last changed value index for reference when handles overlap
                thisWidget._lastChangedValue = index;

                thisWidget._trigger('change', event, uiHash);
            }

        },

        _setOption: function (key, value) {

            var thisWidget = this;
            var i, valsLength = 0;
            var index, length;

            if (key === 'range' && thisWidget.options.range === true) {
                if (value === 'min') {
                    thisWidget.options.value = thisWidget._values(0);
                    thisWidget.options.values = null;
                }
                else if (value === 'max') {
                    thisWidget.options.value = thisWidget._values(thisWidget.options.values.length - 1);
                    thisWidget.options.values = null;
                }
            }

            if (Common.IsArray(thisWidget.options.values)) {
                valsLength = thisWidget.options.values.length;
            }

            if (key === 'disabled') {
                if (!!value) {
                    Common.AddClass(thisWidget.element, 'gtc-ui-state-disabled');
                }
                else {
                    Common.RemoveClass(thisWidget.element, 'gtc-ui-state-disabled');
                }
            }

            thisWidget._super(key, value);

            switch (key) {
                case 'orientation':
                    thisWidget._detectOrientation();
                    Common.RemoveClasses(thisWidget.element, 'gtc-ui-slider-horizontal gtc-ui-slider-vertical');
                    Common.AddClass(thisWidget.element, 'gtc-ui-slider-' + thisWidget.orientation);
                    thisWidget._refreshValue();

                    // Reset positioning from previous orientation
                    index = 0, length = thisWidget.handles.length;
                    for ( ; index < length; index++) {
                        if (value === 'horizontal') {
                            thisWidget.handles[index].style.bottom = '';
                        }
                        else {
                            thisWidget.handles[index].style.left = '';
                        }
                    }
                    break;
                case "value":
                    thisWidget._animateOff = true;
                    thisWidget._refreshValue();
                    thisWidget._change(null, 0);
                    thisWidget._animateOff = false;
                    break;
                case "values":
                    thisWidget._animateOff = true;
                    thisWidget._refreshValue();
                    for (i = 0; i < valsLength; i += 1) {
                        thisWidget._change(null, i);
                    }
                    thisWidget._animateOff = false;
                    break;
                case "step":
                case "min":
                case "max":
                    thisWidget._animateOff = true;
                    thisWidget._calculateNewMax();
                    thisWidget._refreshValue();
                    thisWidget._animateOff = false;
                    break;
                case "range":
                    thisWidget._animateOff = true;
                    thisWidget._refresh();
                    thisWidget._animateOff = false;
                    break;
            }

        },

        //internal value getter
        // _value() returns value trimmed by min and max, aligned by step
        _value: function () {

            var thisWidget = this;
            var val = thisWidget.options.value;
            val = thisWidget._trimAlignValue(val);
            return val;

        },

        //internal values getter
        // _values() returns array of values trimmed by min and max, aligned by step
        // _values( index ) returns single value trimmed by min and max, aligned by step
        _values: function (index) {

            var thisWidget = this;
            var val, vals, i;

            if (arguments.length) {
                val = thisWidget.options.values[index];
                val = thisWidget._trimAlignValue(val);
                return val;
            }
            else if (thisWidget.options.values && thisWidget.options.values.length) {
                // .slice() creates a copy of the array
                // this copy gets trimmed by min and max and then returned
                vals = thisWidget.options.values.slice();
                for (i = 0; i < vals.length; i += 1) {
                    vals[i] = thisWidget._trimAlignValue(vals[i]);
                }
                return vals;
            }
            else {
                return [];
            }

        },

        // returns the step-aligned value that val is closest to, between (inclusive) min and max
        _trimAlignValue: function (val) {

            var thisWidget = this;
            if (val <= thisWidget._valueMin()) {
                return thisWidget._valueMin();
            }
            if (val >= thisWidget._valueMax()) {
                return thisWidget._valueMax();
            }
            var step = (thisWidget.options.step > 0) ? thisWidget.options.step : 1,
                valModStep = (val - thisWidget._valueMin()) % step,
                alignValue = val - valModStep;

            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += (valModStep > 0) ? step : (-step);
            }

            // Since JavaScript has problems with large floats, round
            // the final value to 5 digits after the decimal point (see #4124)
            return parseFloat(alignValue.toFixed(5));

        },

        _calculateNewMax: function () {

            var thisWidget = this;
            var max = thisWidget.options.max,
                min = thisWidget._valueMin(),
                step = thisWidget.options.step,
                aboveMin = Math.floor((+(max - min).toFixed(thisWidget._precision())) / step) * step;
            max = aboveMin + min;
            thisWidget.max = parseFloat(max.toFixed( thisWidget._precision()));

        },

        _precision: function () {

            var thisWidget = this;
            var precision = thisWidget._precisionOf(thisWidget.options.step);
            if (thisWidget.options.min !== null) {
                precision = Math.max(precision, thisWidget._precisionOf(thisWidget.options.min));
            }
            return precision;

        },

        _precisionOf: function (num) {

            var str = num.toString(),
                decimal = str.indexOf('.');
            return decimal === -1 ? 0 : str.length - decimal - 1;

        },

        _valueMin: function () {

            var thisWidget = this;
            return thisWidget.options.min;

        },

        _valueMax: function () {

            var thisWidget = this;
            return thisWidget.max;

        },

        _refreshValue: function () {

            var thisWidget = this;
            var lastValPercent, valPercent, value, valueMin, valueMax,
                oRange = thisWidget.options.range,
                animate = (!thisWidget._animateOff) ? thisWidget.options.animate : false,
                _set = {};

            if (thisWidget.options.values && thisWidget.options.values.length) {
                var index = 0, length = thisWidget.handles.length;
                for ( ; index < length; index++) {
                    valPercent = (thisWidget.values(index) - thisWidget._valueMin()) / (thisWidget._valueMax() - thisWidget._valueMin()) * 100;
                    _set[thisWidget.orientation === 'horizontal' ? 'left' :'bottom'] = valPercent + '%';
                    Velocity(thisWidget.handles[index], 'stop', true);
                    if (animate) {
                        Velocity(thisWidget.handles[index], _set, thisWidget.options.animate);
                    }
                    else {
                        thisWidget.handles[index].style[thisWidget.orientation === 'horizontal' ? 'left' :'bottom'] = valPercent + '%';
                    }
                    if (thisWidget.options.range === true) {
                        if (thisWidget.orientation === 'horizontal') {
                            if (index === 0) {
                                Velocity(thisWidget.range, 'stop', true);
                                if (animate) {
                                    Velocity(thisWidget.range, { left: valPercent + "%" }, thisWidget.options.animate);
                                }
                                else {
                                    thisWidget.range.style.left = valPercent + '%';
                                }
                            }
                            if (index === 1) {
                                if (animate) {
                                    Velocity(thisWidget.range, { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: thisWidget.options.animate });
                                }
                                else {
                                    thisWidget.range.style.width = (valPercent - lastValPercent) + '%';
                                }
                            }
                        }
                        else {
                            if (index === 0) {
                                Velocity(thisWidget.range, 'stop', true);
                                if (animate) {
                                    Velocity(thisWidget.range, { bottom: valPercent + "%" }, thisWidget.options.animate);
                                }
                                else {
                                    thisWidget.range.style.bottom = valPercent + '%';
                                }
                            }
                            if (index === 1) {
                                if (animate) {
                                    Velocity(thisWidget.range, { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: thisWidget.options.animate });
                                }
                                else {
                                    thisWidget.range.style.height = (valPercent - lastValPercent) + '%';
                                }
                            }
                        }
                    }
                    lastValPercent = valPercent;
                }
            }
            else {
                value = thisWidget.value();
                valueMin = thisWidget._valueMin();
                valueMax = thisWidget._valueMax();
                valPercent = (valueMax !== valueMin) ? (value - valueMin) / (valueMax - valueMin) * 100 : 0;
                _set[thisWidget.orientation === 'horizontal' ? 'left' : 'bottom'] = valPercent + '%';
                Velocity(thisWidget.handle, 'stop', true);
                if (animate) {
                    Velocity(thisWidget.handle, _set, thisWidget.options.animate);
                }
                else {
                    thisWidget.handle.style[thisWidget.orientation === 'horizontal' ? 'left' :'bottom'] = valPercent + '%';
                }

                if (oRange === 'min' && thisWidget.orientation === 'horizontal') {
                    Velocity(thisWidget.range, 'stop', true);
                    if (animate) {
                        Velocity(thisWidget.range, { width: valPercent + "%" }, thisWidget.options.animate);
                    }
                    else {
                        thisWidget.range.style.width = valPercent + '%';
                    }
                }
                if (oRange === 'max' && thisWidget.orientation === 'horizontal') {
                    Velocity(thisWidget.range, 'stop', true);
                    if (animate) {
                        Velocity(thisWidget.range, { width: (100 - valPercent) + "%" }, { queue: false, duration: thisWidget.options.animate });
                    }
                    else {
                        thisWidget.range.style.width = (100 - valPercent) + '%';
                    }
                }
                if (oRange === 'min' && thisWidget.orientation === 'vertical') {
                    Velocity(thisWidget.range, 'stop', true);
                    if (animate) {
                        Velocity(thisWidget.range, { height: valPercent + "%" }, thisWidget.options.animate);
                    }
                    else {
                        thisWidget.range.style.height = valPercent + '%';
                    }
                }
                if (oRange === 'max' && thisWidget.orientation === 'vertical') {
                    Velocity(thisWidget.range, 'stop', true);
                    if (animate) {
                        Velocity(thisWidget.range, { height: (100 - valPercent) + "%" }, { queue: false, duration: thisWidget.options.animate });
                    }
                    else {
                        thisWidget.range.style.height = (100 - valPercent) + '%';
                    }
                }
            }

        },

        _handleEvents: {

            keydown: function (event) {

                var thisWidget = this;
                var allowed, curVal, newVal, step,
                    index = Cache.Get(event.target, 'gtc-ui-slider-handle-index');

                switch (event.keyCode) {
                    case GTC.Keyboard.Home:
                    case GTC.Keyboard.End:
                    case GTC.Keyboard.PageUp:
                    case GTC.Keyboard.PageDown:
                    case GTC.Keyboard.Up:
                    case GTC.Keyboard.Right:
                    case GTC.Keyboard.Down:
                    case GTC.Keyboard.Left:
                        event.preventDefault();
                        if (!thisWidget._keySliding) {
                            thisWidget._keySliding = true;
                            Common.AddClass(event.target, 'gtc-ui-state-active');
                            allowed = thisWidget._start(event, index);
                            if (allowed === false) {
                                return;
                            }
                        }
                        break;
                }

                step = thisWidget.options.step;
                if (thisWidget.options.values && thisWidget.options.values.length) {
                    curVal = newVal = thisWidget.values(index);
                }
                else {
                    curVal = newVal = thisWidget.value();
                }

                switch (event.keyCode) {
                    case GTC.Keyboard.Home:
                        newVal = thisWidget._valueMin();
                        break;
                    case GTC.Keyboard.End:
                        newVal = thisWidget._valueMax();
                        break;
                    case GTC.Keyboard.PageUp:
                        newVal = thisWidget._trimAlignValue(
                            curVal + ((thisWidget._valueMax() - thisWidget._valueMin()) / thisWidget.numPages)
                        );
                        break;
                    case GTC.Keyboard.PageDown:
                        newVal = thisWidget._trimAlignValue(
                            curVal - ((thisWidget._valueMax() - thisWidget._valueMin()) / thisWidget.numPages));
                        break;
                    case GTC.Keyboard.Up:
                    case GTC.Keyboard.Right:
                        if (curVal === thisWidget._valueMax()) {
                            return;
                        }
                        newVal = thisWidget._trimAlignValue(curVal + step);
                        break;
                    case GTC.Keyboard.Down:
                    case GTC.Keyboard.Left:
                        if (curVal === thisWidget._valueMin()) {
                            return;
                        }
                        newVal = thisWidget._trimAlignValue(curVal - step);
                        break;
                }
                thisWidget._slide(event, index, newVal);

            },
            keyup: function (event) {

                var thisWidget = this;
                var index = Cache.Get(event.target, 'gtc-ui-slider-handle-index');

                if (thisWidget._keySliding) {
                    thisWidget._keySliding = false;
                    thisWidget._stop(event, index);
                    thisWidget._change(event, index);
                    Common.RemoveClass(event.target, 'gtc-ui-state-active');
                }

            }

        },

        _create: function () {

            var thisWidget = this;
            thisWidget._keySliding = false;
            thisWidget._mouseSliding = false;
            thisWidget._animateOff = true;
            thisWidget._handleIndex = null;
            thisWidget._detectOrientation();
            thisWidget._mouseInit();
            thisWidget._calculateNewMax();

            Common.AddClasses(thisWidget.element, 'gtc-ui-slider gtc-ui-slider-' + thisWidget.orientation + ' gtc-ui-widget gtc-ui-widget-content gtc-ui-corner-all');

            thisWidget._refresh();
            if (thisWidget.options.hasManual) {
                thisWidget.options.manualField = Common.Get(thisWidget.options.manualFieldId);
            }
            thisWidget._setOption('disabled', thisWidget.options.disabled);
            thisWidget._animateOff = false;

        }

    };

    WidgetFactory.Register('gtc.sliderfield', WidgetFactory.gtc.mouse, SliderFieldWidget);

} (window, document, Common, Cache, Events, Velocity));
