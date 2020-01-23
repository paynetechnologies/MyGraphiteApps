// Scroll Namespace
(function (Scroll, window, document, Common, Cache, Events, Velocity, undefined) {

    // Declare scroll event support variables
    var scrollEventsInitialized = false;
    var normalizeEvents  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var bindingEvents = ('onwheel' in document || document.documentMode >= 9) ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta = null;
    var clearLowestDeltaTimeout = null;
    var slice = Array.prototype.slice;
    var onwheelOverride = {
        setup: function () {

            if (Common.IsDefined(this.addEventListener)) {
                for (var loopIndex = bindingEvents.length; loopIndex;) {
                    this.addEventListener(bindingEvents[--loopIndex], NormalizeScrollDeltas, false);
                }
            }
            else {
                this.onmousewheel = NormalizeScrollDeltas;
            }

            // Store line and page height for element in case we need to convert to pixels later (deltaMode)
            Cache.Set(this, 'scrollLineHeight', onwheelOverride.getLineHeight(this));
            Cache.Set(this, 'scrollPageHeight', onwheelOverride.getPageHeight(this));

        },
        teardown: function () {

            if (Common.IsDefined(this.removeEventListener)) {
                for (var loopIndex = bindingEvents.length; loopIndex;) {
                    this.removeEventListener(bindingEvents[--loopIndex], NormalizeScrollDeltas, false);
                }
            }
            else {
                this.onmousewheel = null;
            }

            // Remove data added to the element
            Cache.Remove(this, 'scrollLineHeight');
            Cache.Remove(this, 'scrollPageHeight');

        },
        getLineHeight: function (element) {

            var parent = Common.OffsetParent(element);
            if (Common.IsNotDefined(parent)) {
                parent = document.body;
            }
            return parseInt(Common.GetStyle(parent, 'fontSize'), 10) || parseInt(Common.GetStyle(element, 'fontSize'), 10) || 16;

        },
        getPageHeight: function (element) {

            return Common.Height(element);

        }
    };

    // Public Methods
    Scroll.IsScrollInitialized = function () {

        return scrollEventsInitialized;

    };

    Scroll.InitializeScrollEvents = function () {

        // Only initialize once
        if (scrollEventsInitialized) {
            return;
        }
        scrollEventsInitialized = true;

        // Normalize mouse hooks
        var eventInternal = Events.GetInternal();
        if (Common.IsDefined(eventInternal.fixHooks)) {
            for (var loopIndex = normalizeEvents.length; loopIndex;) {
                eventInternal.fixHooks[normalizeEvents[--loopIndex]] = eventInternal.mouseHooks;
            }
        }

        // Override mousewheel
        eventInternal.special.mousewheel = onwheelOverride;

    };

    Scroll.FindVerticalScrollDistance = function (normalizedEvent) {

        return normalizedEvent.scrollDistanceFactor * normalizedEvent.deltaY;

    };

    Scroll.FindHorizontalScrollDistance = function (normalizedEvent) {

        return normalizedEvent.scrollDistanceFactor * normalizedEvent.deltaX;

    };

    // Private Methods
    function NormalizeScrollDeltas (event) {

        // Initialize
        var originalEvent = event || window.event;
        var eventArguments = slice.call(arguments, 1);
        var absoluteDelta = 0;
        var delta = 0;
        var deltaX = 0;
        var deltaY = 0;

        // Make writable copy of event and normalize properties
        var eventInternal = Events.GetInternal();
        event = eventInternal.fix.call(eventInternal, originalEvent);
        event.type = 'mousewheel';

        // Find old types of scrollwheel delta
        if ('detail' in originalEvent) {
            deltaY = originalEvent.detail * -1;
        }
        if ('wheelDelta' in originalEvent) {
            deltaY = originalEvent.wheelDelta;
        }
        if ('wheelDeltaY' in originalEvent) {
            deltaY = originalEvent.wheelDeltaY;
        }
        if ('wheelDeltaX' in originalEvent) {
            deltaX = originalEvent.wheelDeltaX * -1;
        }

        // Handle Firefox horizontal scrolling
        if ('axis' in originalEvent && originalEvent.axis === originalEvent.HORIZONTAL_AXIS) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // For backwards compatabilitiy set delta to be Y or X if Y is 0
        if (deltaY === 0) {
            delta = deltaX;
        }
        else {
            delta = deltaY;
        }

        // Find new types of scrollwheel delta
        if ('deltaY' in originalEvent) {
            deltaY = originalEvent.deltaY * -1;
            delta = deltaY;
        }
        if ('deltaX' in originalEvent) {
            deltaX = originalEvent.deltaX;
            if (deltaY === 0) {
                delta  = deltaX * -1;
            }
        }

        // No scrolling, return
        if (deltaY === 0 && deltaX === 0) {
            return;
        }

        // Convert lines or pages of text to pixels if not already pixels (deltaMode 0)
        if (originalEvent.deltaMode === 1) {
            var lineHeight = Cache.Get(this, 'scrollLineHeight');
            delta *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        }
        else if (originalEvent.deltaMode === 2) {
            var pageHeight = Cache.Get(this, 'scrollPageHeight');
            delta *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to use for value normalization
        absoluteDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (Common.IsNotDefined(lowestDelta) || absoluteDelta < lowestDelta) {
            lowestDelta = absoluteDelta;
        }

        // Get normalized integer value for each delta
        delta = Math[delta  > 0 ? 'floor' : 'ceil'](delta / lowestDelta);
        deltaX = Math[deltaX > 0 ? 'floor' : 'ceil'](deltaX / lowestDelta);
        deltaY = Math[deltaY > 0 ? 'floor' : 'ceil'](deltaY / lowestDelta);

        // Add normalized values to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.scrollDistanceFactor = lowestDelta;

        // Set to 0 since everything was converted to pixels above
        event.deltaMode = 0;

        // Add custom event and deltas to the front of event arguments
        eventArguments.unshift(event, delta, deltaX, deltaY);

        // Clear lowestDelta to handle multiple device types
        if (Common.IsDefined(clearLowestDeltaTimeout)) {
            clearTimeout(clearLowestDeltaTimeout);
        }
        clearLowestDeltaTimeout = setTimeout(
            function () {
                lowestDelta = null;
            }, 200
        );

        // Dispatch normalized delta event
        return eventInternal.dispatch.apply(this, eventArguments);

    };

} (window.Scroll = window.Scroll || {}, window, document, Common, Cache, Events, Velocity));
