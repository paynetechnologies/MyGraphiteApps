// Touch Namespace
(function (Touch, window, document, Common, Cache, Events, Velocity, undefined) {

    // Declare touch event support variables
    var supportTouch = 'ontouchend' in document;
    var scrollEvent = 'touchmove scroll';
    var touchStartEvent = supportTouch ? 'touchstart' : 'mousedown';
    var touchStopEvent = supportTouch ? 'touchend' : 'mouseup';
    var touchMoveEvent = supportTouch ? 'touchmove' : 'mousemove';
    var touchEventsInitialized = false;

    // Declare variables for mouse touch event handling
    var touchToMouse;
    var touchToMouseHandled;
    var defaultUiMouseInit;
    var touchToMouseInitialized = false;

    // Declare virtual mouse event support variables
    var eventInternal = Events.GetInternal();
    var dataPropertyName = 'virtualMouseBindings';
    var touchTargetPropertyName = 'virtualTouchID';
    var virtualEventNames = 'vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel'.split(' ');
    var touchEventProps = 'clientX clientY pageX pageY screenX screenY'.split(' ');
    var mouseHookProps = {
        props: 'button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement'.split(' '),
        filter: function (event, original) {
            var eventDoc, doc, body,
                button = original.button;

            // Calculate pageX/Y if missing and clientX/Y available
            if (event.pageX == null && original.clientX != null) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = original.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!event.which && button !== undefined) {
                event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
            }
            return event;
        }
    };
    var props = 'altKey bubbles cancelable ctrlKey currentTarget dataTransfer detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' ');
    var mouseEventProps = props.concat(mouseHookProps);
    var activeDocHandlers = {};
    var resetTimerID = 0;
    var startX = 0;
    var startY = 0;
    var didScroll = false;
    var clickBlockList = [];
    var blockMouseTriggers = false;
    var blockTouchTriggers = false;
    var eventCaptureSupported = 'addEventListener' in document;
    var nextTouchID = 1;
    var lastTouchID = 0;
    var threshold;
    var loopIndex;
    var TouchGuid = 0;
    Touch.vmouse = {
        moveDistanceThreshold: 10,
        clickDistanceThreshold: 10,
        resetTimerDuration: 1500
    };

    // Public Methods
    Touch.IsTouchInitialized = function () {

        return touchEventsInitialized;

    };

    Touch.IsTouchToMouseInitialized = function () {

        return touchToMouseInitialized;

    };

    Touch.InitializeVirtualMouseEvents = function () {

        // Expose custom events for jQuery binding
        loopIndex = 0, length = virtualEventNames.length;
        for ( ; loopIndex < length; loopIndex++) {
            eventInternal.special[virtualEventNames[loopIndex]] = getSpecialEventObject(virtualEventNames[loopIndex]);
        }

        // Capture all clicks for mouse event translations and then block them
        if (eventCaptureSupported) {
            document.addEventListener('click',
                function (event) {
                    var clickBlockLength = clickBlockList.length;
                    var target = event.target;
                    var elementClick;
                    var touchID;

                    if (clickBlockLength) {
                        var x = event.clientX;
                        var y = event.clientY;
                        threshold = Touch.vmouse.clickDistanceThreshold;
                        var elements = target;
                        while (elements) {
                            loopIndex = 0;
                            for ( ; loopIndex < clickBlockLength; loopIndex++) {
                                elementClick = clickBlockList[loopIndex];
                                touchID = 0;
                                if ((elements === target && Math.abs(elementClick.x - x) < threshold && Math.abs(elementClick.y - y) < threshold) ||
                                    Cache.Get(elements, touchTargetPropertyName) === elementClick.touchID) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    return;
                                }
                            }
                            elements = elements.parentNode;
                        }
                    }
                }, true
            );
        }

    };

    Touch.InitializeTouchEvents = function () {

        // Only initialize once
        if (touchEventsInitialized) {
            return;
        }
        touchEventsInitialized = true;

        // Initialize Virtual Mouse Events
        Touch.InitializeVirtualMouseEvents();

        eventInternal.special.scrollstart = {
            enabled: true,
            setup: function () {
                var thisObject = this, scrolling, timer;

                function trigger(event, state) {
                    scrolling = state;
                    triggerCustomEvent(thisObject, scrolling ? 'scrollstart' : 'scrollstop', event);
                }

                // iPhone triggers scroll after a small delay; use touchmove instead
                Events.On(this, scrollEvent,
                    function (event) {
                        if (!eventInternal.special.scrollstart.enabled) {
                            return;
                        }
                        if (!scrolling) {
                            trigger(event, true);
                        }
                        clearTimeout(timer);
                        timer = setTimeout(
                            function () {
                                trigger(event, false);
                            }, 50
                        );
                    }
                );
            }
        };

        eventInternal.special.tap = {
            tapholdThreshold: 750,
            emitTapOnTaphold: true,
            setup: function () {
                var thisObject = this,
                isTaphold = false;
                Events.On(this, 'vmousedown',
                    function (event) {
                        isTaphold = false;
                        if (event.which && event.which !== 1) {
                            return false;
                        }

                        var origTarget = event.target, timer;

                        function clearTapTimer () {
                            clearTimeout(timer);
                        }

                        function clearTapHandlers () {
                            clearTapTimer();
                            Events.Off(thisObject, 'vclick', clickHandler);
                            Events.Off(thisObject, 'vmouseup', clearTapTimer);
                            Events.Off(document, 'vmousecancel', clearTapHandlers);
                        }

                        function clickHandler (event) {
                            clearTapHandlers();
                            if (!isTaphold && origTarget === event.target) {
                                triggerCustomEvent(thisObject, 'tap', event);
                            }
                            else if (isTaphold) {
                                event.stopPropagation();
                            }
                        }

                        Events.On(thisObject, 'vmouseup', clearTapTimer);
                        Events.On(thisObject, 'vclick', clickHandler);
                        Events.On(document, 'vmousecancel', clearTapHandlers);

                        timer = setTimeout(
                            function () {
                                if (!eventInternal.special.tap.emitTapOnTaphold) {
                                    isTaphold = true;
                                }
                                triggerCustomEvent(thisObject, 'taphold', Events.Event('taphold', { target: origTarget }));
                            },
                        eventInternal.special.tap.tapholdThreshold);
                    }
                );
            },
            teardown: function () {
                Events.Off(this, 'vmousedown');
                Events.Off(this, 'vclick');
                Events.Off(this, 'vmouseup');
                Events.Off(document, 'vmousecancel');
            }
        };

        eventInternal.special.swipe = {
            scrollSupressionThreshold: 10, // More than this horizontal displacement, and we will suppress scrolling.
            durationThreshold: 1000, // More time than this, and it isn't a swipe.
            horizontalDistanceThreshold: 420,
            verticalDistanceThreshold: 75,
            getLocation: function (event) {
                var winPageX = window.pageXOffset;
                var winPageY = window.pageYOffset;
                var x = event.clientX;
                var y = event.clientY;

                if (event.pageY === 0 && Math.floor(y) > Math.floor(event.pageY) || event.pageX === 0 && Math.floor(x) > Math.floor(event.pageX)) {
                    x = x - winPageX;
                    y = y - winPageY;
                }
                else if (y < (event.pageY - winPageY) || x < (event.pageX - winPageX)) {
                    x = event.pageX - winPageX;
                    y = event.pageY - winPageY;
                }
                return {
                    x: x,
                    y: y
                };
            },
            start: function (event) {
                var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
                var location = eventInternal.special.swipe.getLocation(data);
                return {
                    time: (new Date()).getTime(),
                    coords: [location.x, location.y],
                    origin: event.target
                };
            },
            stop: function (event) {
                var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
                var location = eventInternal.special.swipe.getLocation(data);
                return {
                    time: (new Date()).getTime(),
                    coords: [location.x, location.y]
                };
            },
            handleSwipe: function (start, stop, thisObject, origTarget) {
                var x = Math.abs(start.coords[0] - stop.coords[0]);
                var y = Math.abs(start.coords[1] - stop.coords[1]);
                var direction = '';
                if (stop.time - start.time < eventInternal.special.swipe.durationThreshold) {
                    if (x > eventInternal.special.swipe.horizontalDistanceThreshold && y < eventInternal.special.swipe.verticalDistanceThreshold) {
                        direction = start.coords[0] > stop.coords[ 0 ] ? 'swipeleft' : 'swiperight';
                    }
                    else if (y > eventInternal.special.swipe.verticalDistanceThreshold && x < eventInternal.special.swipe.horizontalDistanceThreshold) {
                        direction = start.coords[1] > stop.coords[1] ? 'swipeup' : 'swipedown';
                    }
                    if (Common.IsNotEmptyString(direction)) {
                        triggerCustomEvent(thisObject, 'swipe', Events.Event('swipe',
                            {
                                target: origTarget,
                                swipestart: start,
                                swipestop: stop
                            }
                        ), true);
                        triggerCustomEvent(thisObject, direction, Events.Event(direction,
                            {
                                target: origTarget,
                                swipestart: start,
                                swipestop: stop
                            }
                        ), true);
                        return true;
                    }
                }
                return false;
            },
            eventInProgress: false,
            setup: function () {
                var events;
                var thisObject = this;
                var context = {};
                events = Cache.Get(this, 'mobile-events');
                if (!events) {
                    events = {
                        length: 0
                    };
                    Cache.Set(this, 'mobile-events', events);
                }
                events.length++;
                events.swipe = context;
                context.start = function (event) {
                    if (eventInternal.special.swipe.eventInProgress) {
                        return;
                    }
                    eventInternal.special.swipe.eventInProgress = true;
                    var stop;
                    var start = eventInternal.special.swipe.start(event);
                    var origTarget = event.target;
                    var emitted = false;
                    context.move = function (event) {
                        if (!start) {
                            return;
                        }
                        stop = eventInternal.special.swipe.stop(event);
                        if (!emitted) {
                            emitted = eventInternal.special.swipe.handleSwipe(start, stop, thisObject, origTarget);
                            if (emitted) {
                                eventInternal.special.swipe.eventInProgress = false;
                            }
                        }
                        if (Math.abs(start.coords[0] - stop.coords[0]) > eventInternal.special.swipe.scrollSupressionThreshold) {
                            event.preventDefault();
                        }
                    };
                    context.stop = function () {
                        emitted = true;
                        eventInternal.special.swipe.eventInProgress = false;
                        Events.Off(document, touchMoveEvent, context.move);
                        context.move = null;
                    };
                    Events.On(document, touchMoveEvent, context.move);
                    Events.One(document, touchStopEvent, context.stop);
                };
                Events.On(thisObject, touchStartEvent, context.start);
            },
            teardown: function () {
                var events;
                var context;
                events = Cache.Get(this, 'mobile-events');
                if (events) {
                    context = events.swipe;
                    delete events.swipe;
                    events.length--;
                    if (events.length === 0) {
                        Cache.Remove(this, 'mobile-events');
                    }
                }
                if (context) {
                    if (context.start) {
                        Events.Off(this, touchStartEvent, context.start);
                    }
                    if (context.move) {
                        Events.Off(document, touchMoveEvent, context.move);
                    }
                    if (context.stop) {
                        Events.Off(document, touchStopEvent, context.stop);
                    }
                }
            }
        };

        var property;
        var touchEvents = {
            scrollstop: 'scrollstart',
            taphold: 'tap',
            swipeleft: 'swipe',
            swiperight: 'swipe',
            swipeup: 'swipe',
            swipedown: 'swipe'
        };
        for (property in touchEvents) {
            var value = touchEvents[property];
            (function (property, value) {
                eventInternal.special[property] = {
                    setup: function () {
                        Events.On(this, value, function () {});
                    },
                    teardown: function () {
                        Events.Off(this, value);
                    }
                };
            }(property, value));
        }

    };

    Touch.InitializeTouchToMouseEventHandling = function () {

        // Only initialize once
        if (touchToMouseInitialized) {
            return;
        }
        touchToMouseInitialized = true;

        touchToMouse = WidgetFactory.gtc.mouse.prototype;
        defaultUiMouseInit = touchToMouse._mouseInit;

        // Override default handling of these events
        touchToMouse._mouseInit = function () {

            // Delegate the touch events to element
            Events.On(this.element, 'touchstart', Common.Proxy(this, '_touchStart'));
            Events.On(this.element, 'touchmove', Common.Proxy(this, '_touchMove'));
            Events.On(this.element, 'touchend', Common.Proxy(this, '_touchEnd'));

            // Initialize mouse
            defaultUiMouseInit.call(this);

        };
        touchToMouse._touchStart = function (event) {

            // Exit if another touch to mouse event is running
            if (touchToMouseHandled || !this._mouseCapture(event.originalEvent.changedTouches[0])) {
                return;
            }
            touchToMouseHandled = true;

            // Set to false to see if it was a click attempt
            this._touchMoved = false;

            // Dispatch touch events as custom mouse events
            dispatchCustomMouseEvent(event, 'mouseover');
            dispatchCustomMouseEvent(event, 'mousemove');
            dispatchCustomMouseEvent(event, 'mousedown');

        };
        touchToMouse._touchEnd = function (event) {

            // Exit if this event should not be handled
            if (!touchToMouseHandled) {
                return;
            }

            // Dispatch touch end as custom mouse mouse events
            dispatchCustomMouseEvent(event, 'mouseup');
            dispatchCustomMouseEvent(event, 'mouseout');

            // If we never entered touch move event this will still be false so it was a click
            if (!this._touchMoved) {
                dispatchCustomMouseEvent(event, 'click');
            }
            touchToMouseHandled = false;

        };
        touchToMouse._touchMove = function (event) {

            // Exit if this event should not be handled
            if (!touchToMouseHandled) {
                return;
            }

            // If we got here is was not an attempted click
            this._touchMoved = true;

            // Dispatch touch move as custom mouse mouse event
            dispatchCustomMouseEvent(event, 'mousemove');

        };

    };

    // Private Methods
    function triggerCustomEvent (obj, eventType, event, bubble) {

        var originalType = event.type;
        event.type = eventType;
        if (bubble) {
            eventInternal.trigger(event, undefined, obj);
        }
        else {
            eventInternal.dispatch.call(obj, event);
        }
        event.type = originalType;

    };

    function dispatchCustomMouseEvent (event, eventType) {

        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }
        event.preventDefault();

        // Get touch coordinates
        var touchData = event.originalEvent.changedTouches[0];

        // Create a custom event
        var customEvent = document.createEvent('MouseEvents');

        // Initialize and dispatch a mouse event using touch data
        customEvent.initMouseEvent(eventType, true, true, window, 1, touchData.screenX, touchData.screenY, touchData.clientX, touchData.clientY, false, false, false, false, 0, null);
        event.target.dispatchEvent(customEvent);

    };

    function getNativeEvent (event) {

        while (Common.IsDefined(event) && Common.IsDefined(event.originalEvent)) {
            event = event.originalEvent;
        }
        return event;

    };

    function createVirtualEvent (event, eventType) {

        var originalEventType = event.type;
        var eventProperty;

        // Create custom jquery event from original event
        event = Events.Event(event);
        event.type = eventType;

        // Copy original event
        var originalEvent = event.originalEvent;
        var eventProperties = props;

        // Copy event properties to new event
        if (originalEventType.search(/^(mouse|click)/) > -1) {
            eventProperties = mouseEventProps;
        }
        if (originalEvent) {
            for (loopIndex = eventProperties.length, eventProperty; loopIndex;) {
                eventProperty = eventProperties[--loopIndex];
                event[eventProperty] = originalEvent[eventProperty];
            }
        }

        // Create which if it doesnt exist
        if (originalEventType.search(/mouse(down|up)|click/) > -1 && !event.which) {
            event.which = 1;
        }

        // Copy touch properties if its a touch event
        if (originalEventType.search(/^touch/) !== -1) {
            var nativeEvent = getNativeEvent(originalEvent);
            originalEventType = nativeEvent.touches;
            var changedTouches = nativeEvent.changedTouches;
            var touch = (originalEventType && originalEventType.length) ? originalEventType[0] : ((changedTouches && changedTouches.length) ? changedTouches[0] : undefined);
            if (touch) {
                var touchPropertiesSize = touchEventProps.length;
                loopIndex = 0;
                for ( ; loopIndex < touchPropertiesSize; loopIndex++) {
                    eventProperty = touchEventProps[loopIndex];
                    event[eventProperty] = touch[eventProperty];
                }
            }
        }
        return event;

    };

    function getVirtualBindingFlags (element) {

        var flags = {};
        var elementData;
        var dataProperty;
        while (element) {
            elementData = Cache.Get(element, dataPropertyName);
            for (dataProperty in elementData) {
                if (elementData[dataProperty]) {
                    flags[dataProperty] = flags.hasVirtualBinding = true;
                }
            }
            element = element.parentNode;
        }
        return flags;

    };

    function getClosestElementWithVirtualBinding (element, eventType) {

        var elementData;
        while (element) {
            elementData = Cache.Get(element, dataPropertyName);
            if (elementData && (!eventType || elementData[eventType])) {
                return element;
            }
            element = element.parentNode;
        }
        return null;

    };

    function enableTouchBindings () {

        blockTouchTriggers = false;

    };

    function disableTouchBindings () {

        blockTouchTriggers = true;

    };

    function enableMouseBindings () {

        lastTouchID = 0;
        clickBlockList.length = 0;
        blockMouseTriggers = false;
        disableTouchBindings();

    };

    function disableMouseBindings () {

        enableTouchBindings();

    };

    function startResetTimer () {

        clearResetTimer();
        resetTimerID = setTimeout(
            function () {
                resetTimerID = 0;
                enableMouseBindings();
            }, Touch.vmouse.resetTimerDuration
        );

    };

    function clearResetTimer () {

        if (resetTimerID) {
            clearTimeout(resetTimerID);
            resetTimerID = 0;
        }

    };

    function triggerVirtualEvent (eventType, event, flags) {

        var virtualEvent;
        if ((flags && flags[eventType]) || (!flags && getClosestElementWithVirtualBinding(event.target, eventType))) {
            virtualEvent = createVirtualEvent(event, eventType);
            Events.Trigger(event.target, virtualEvent);
        }
        return virtualEvent;

    };

    function mouseEventCallback (event) {

        var touchID = Cache.Get(event.target, touchTargetPropertyName);
        var virtualEvent;
        if (!blockMouseTriggers && (!lastTouchID || lastTouchID !== touchID)) {
            virtualEvent = triggerVirtualEvent('v' + event.type, event);
            if (virtualEvent) {
                if (virtualEvent.isDefaultPrevented()) {
                    event.preventDefault();
                }
                if (virtualEvent.isPropagationStopped()) {
                    event.stopPropagation();
                }
                if (virtualEvent.isImmediatePropagationStopped()) {
                    event.stopImmediatePropagation();
                }
            }
        }

    };

    function handleTouchStart (event) {

        var touches = getNativeEvent(event).touches;
        if (touches && touches.length === 1) {
            var target = event.target;
            var flags = getVirtualBindingFlags(target);

            // If vbindings exist, set data, disable mouse and trigger virtual events
            if (flags.hasVirtualBinding) {
                lastTouchID = nextTouchID++;
                Cache.Set(target, touchTargetPropertyName, lastTouchID);
                clearResetTimer();
                disableMouseBindings();
                didScroll = false;
                var touch = getNativeEvent(event).touches[0];
                startX = touch.pageX;
                startY = touch.pageY;
                triggerVirtualEvent('vmouseover', event, flags);
                triggerVirtualEvent('vmousedown', event, flags);
            }
        }

    };

    function handleScroll (event) {

        if (blockTouchTriggers) {
            return;
        }
        if (!didScroll) {
            triggerVirtualEvent('vmousecancel', event, getVirtualBindingFlags(event.target));
        }
        didScroll = true;
        startResetTimer();

    };

    function handleTouchMove (event) {

        if (blockTouchTriggers) {
            return;
        }

        // Intialize
        var touch = getNativeEvent(event).touches[0];
        var didCancel = didScroll,
            moveThreshold = Touch.vmouse.moveDistanceThreshold,
            flags = getVirtualBindingFlags(event.target);

        // Determine if it was really scrolling and canceling is needed
        didScroll = didScroll || (Math.abs(touch.pageX - startX) > moveThreshold || Math.abs(touch.pageY - startY) > moveThreshold);
        if (didScroll && !didCancel) {
            triggerVirtualEvent('vmousecancel', event, flags);
        }
        triggerVirtualEvent('vmousemove', event, flags);
        startResetTimer();

    };

    function handleTouchEnd (event) {

        if (blockTouchTriggers) {
            return;
        }
        disableTouchBindings();
        var flags = getVirtualBindingFlags(event.target);
        triggerVirtualEvent('vmouseup', event, flags);
        if (!didScroll) {
            var virtualEvent = triggerVirtualEvent('vclick', event, flags);
            if (virtualEvent && virtualEvent.isDefaultPrevented()) {
                var touch = getNativeEvent(event).changedTouches[0];
                clickBlockList.push(
                    {
                        touchID: lastTouchID,
                        x: touch.clientX,
                        y: touch.clientY
                    }
                );
                blockMouseTriggers = true;
            }
        }
        triggerVirtualEvent('vmouseout', event, flags);
        didScroll = false;
        startResetTimer();

    };

    function hasVirtualBindings(element) {

        var bindings = Cache.Get(element, dataPropertyName);
        var bindingProperty;
        if (bindings) {
            for (bindingProperty in bindings) {
                if (bindings[bindingProperty]) {
                    return true;
                }
            }
        }
        return false;

    };

    function dummyMouseHandler() {};

    function getSpecialEventObject(eventType) {

        var realType = eventType.substr(1);
        return {
            setup: function () {
                if (!hasVirtualBindings(this)) {
                    Cache.Set(this, dataPropertyName, {});
                }
                var bindings = Cache.Get(this, dataPropertyName);
                bindings[eventType] = true;
                activeDocHandlers[eventType] = (activeDocHandlers[eventType] || 0) + 1;
                if (activeDocHandlers[eventType] === 1) {
                    Events.On(document, realType, mouseEventCallback);
                }
                Events.On(this, realType, dummyMouseHandler);
                if (eventCaptureSupported) {
                    activeDocHandlers['touchstart'] = (activeDocHandlers['touchstart'] || 0) + 1;
                    if (activeDocHandlers['touchstart'] === 1) {
                        Events.On(document, 'touchstart', handleTouchStart);
                        Events.On(document, 'touchend', handleTouchEnd);
                        Events.On(document, 'touchmove', handleTouchMove);
                        Events.On(document, 'scroll', handleScroll);
                    }
                }
            },
            teardown: function () {
                --activeDocHandlers[eventType];
                if (!activeDocHandlers[eventType]) {
                    Events.Off(document, realType, mouseEventCallback);
                }
                if (eventCaptureSupported) {
                    --activeDocHandlers['touchstart'];
                    if (!activeDocHandlers['touchstart']) {
                        Events.Off(document, 'touchstart', handleTouchStart);
                        Events.Off(document, 'touchmove', handleTouchMove);
                        Events.Off(document, 'touchend', handleTouchEnd);
                        Events.Off(document, 'scroll', handleScroll);
                    }
                }
                var bindings = Cache.Get(this, dataPropertyName);
                if (bindings) {
                    bindings[eventType] = false;
                }
                Events.Off(this, realType, dummyMouseHandler);
                if (!hasVirtualBindings(this)) {
                    Cache.Remove(this, dataPropertyName);
                }
            }
        };

    };

} (window.Touch = window.Touch || {}, window, document, Common, Cache, Events, Velocity));
