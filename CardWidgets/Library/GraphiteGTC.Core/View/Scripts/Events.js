// INFO: This is complete port of jQuery 2.1.1 event code to pure vanilla javascript
// Events
(function (Events, window, document, Common, Cache, Velocity, undefined) {

    // Private Variables
    var EventGUID = 0;
    var CommonGUID = 'GTCEvents' + ('2.1.1' + Math.random()).replace(/\D/g, '');
    var expr = {
        attrHandle: {},
        match: {
            bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,
            needsContext: /^[\x20\t\r\n\f]*[>+~]/
        }
    };
    var FocusinBubbles = 'onfocusin' in window;
    var PlainObject = {};
    var HasOwn = PlainObject.hasOwnProperty;
    var PlainArray = [];
    var slice = PlainArray.slice;
    var concat = PlainArray.concat;
    var push = PlainArray.push;
    var indexOf = PlainArray.indexOf;
    var rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)/,
        rnotwhite = (/\S+/g);
    var eventInternal = {
        global: {},
        add: function (elem, types, handler, data, selector) {

            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType,
                elemData = Cache.Get(elem) || {};

            // Caller can pass in an object of custom data in lieu of the handler
            if (handler.handler) {
                handleObjIn = handler;
                var context = {};
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            // If the selector is invalid, throw any exceptions at attach time
            if (selector) {
                Find(selector, elem);
            }

            // Make sure that the handler has a unique ID, used to find/remove it later
            if (!handler.guid) {
                handler.guid = 'GTCEvents' + EventGUID++;
            }

            // Init the element's event structure and main handler, if this is the first
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function (e) {
                    // Discard the second event of a eventInternal.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof Events !== 'undefined' && eventInternal.triggered !== e.type ? eventInternal.dispatch.apply(elem, arguments) : undefined;
                };
            }

            // Handle multiple events separated by a space
            types = (types || '').match(rnotwhite) || [''];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || '').split('.').sort();

                // There *must* be a type, no attaching namespace-only handlers
                if (!type) {
                    continue;
                }

                // If event changes its type, use the special event handlers for the changed type
                special = eventInternal.special[type] || {};

                // If selector defined, determine special event api type, otherwise given type
                type = (selector ? special.delegateType : special.bindType) || type;

                // Update special based on newly reset type
                special = eventInternal.special[type] || {};

                // handleObj is passed to all event handlers
                handleObj = Common.MergeObjects({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && expr.match.needsContext.test(selector),
                    namespace: namespaces.join('.')
                }, handleObjIn);

                // Init the event handler queue if we're the first
                if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;

                    // Only use addEventListener if the special events handler returns false
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);
                        }
                    }
                }

                if (special.add) {
                    special.add.call(elem, handleObj);

                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add to the element's handler list, delegates in front
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                }
                else {
                    handlers.push(handleObj);
                }

                // Keep track of which events have ever been used, for event optimization
                eventInternal.global[type] = true;
            }

        },

        // Detach an event or set of events from an element
        remove: function (elem, types, handler, selector, mappedTypes) {

            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType,
                elemData = Cache.HasData(elem) && Cache.Get(elem);

            if (!elemData || !(events = elemData.events)) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = (types || '').match(rnotwhite) || [''];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || '').split('.').sort();

                // Unbind all events (on this namespace, if provided) for the element
                if (!type) {
                    for (type in events) {
                        eventInternal.remove(elem, type + types[t], handler, selector, true);
                    }
                    continue;
                }

                special = eventInternal.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                handlers = events[type] || [];
                tmp = tmp[2] && new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)');

                // Remove matching events
                origCount = j = handlers.length;
                while (j--) {
                    handleObj = handlers[j];

                    if ((mappedTypes || origType === handleObj.origType) &&
                        (!handler || handler.guid === handleObj.guid) &&
                        (!tmp || tmp.test(handleObj.namespace)) &&
                        (!selector || selector === handleObj.selector || selector === '**' && handleObj.selector)) {
                        handlers.splice(j, 1);

                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if (origCount && !handlers.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        Events.RemoveEvent(elem, type, elemData.handle);
                    }
                    delete events[type];
                }
            }

            // Remove the CommonGUID if it's no longer used
            if (Common.IsEmptyObject(events)) {
                delete elemData.handle;
                Cache.Remove(elem, 'events');
            }
        },

        trigger: function (event, data, elem, onlyHandlers) {

            var i, cur, tmp, bubbleType, ontype, handle, special, eventPath = [elem || document],
                type = HasOwn.call(event, 'type') ? event.type : event,
                namespaces = HasOwn.call(event, 'namespace') ? event.namespace.split('.') : [];

            cur = tmp = elem = elem || document;

            // Don't do events on text and comment nodes
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            if (rfocusMorph.test(type + eventInternal.triggered)) {
                return;
            }

            if (type.indexOf('.') >= 0) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split('.');
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(':') < 0 && 'on' + type;

            // Caller can pass in a Events.Event object, Object, or just an event type string
            event = event[CommonGUID] ? event : new Events.Event(type, Common.IsObject(event) && event);

            // Trigger bitmask: & 1 for native handlers; & 2 for custom (always true)
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join('.');
            event.namespace_re = event.namespace ? new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)') : null;

            // Clean up the event in case it is being reused
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data == null ? [event] : MakeArray(data, [event]);

            // Allow special events to draw outside the lines
            special = eventInternal.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }

            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            if (!onlyHandlers && !special.noBubble && !Common.IsWindow(elem)) {

                bubbleType = special.delegateType || type;
                if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                }
                for ( ; cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                }

                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                }
            }

            // Fire handlers on the event path
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

                event.type = i > 1 ? bubbleType : special.bindType || type;

                // Custom handler
                handle = (Cache.Get(cur, 'events') || {})[event.type] && Cache.Get(cur, 'handle');
                if (handle) {
                    handle.apply(cur, data);
                }

                // Native handler
                handle = ontype && cur[ontype];
                if (handle && handle.apply && AcceptData(cur)) {
                    event.result = handle.apply(cur, data);
                    if (event.result === false) {
                        event.preventDefault();
                    }
                }
            }
            event.type = type;

            // If nobody prevented the default action, do it now
            if (!onlyHandlers && !event.isDefaultPrevented()) {

                if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && AcceptData(elem)) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    if (ontype && Common.IsFunction(elem[type]) && !Common.IsWindow(elem)) {

                        // Don't re-trigger an onFOO event when we call its FOO() method
                        tmp = elem[ontype];

                        if (tmp) {
                            elem[ontype] = null;
                        }

                        // Prevent re-triggering of the same event, since we already bubbled it above
                        eventInternal.triggered = type;
                        elem[type]();
                        eventInternal.triggered = undefined;

                        if (tmp) {
                            elem[ontype] = tmp;
                        }
                    }
                }
            }
            return event.result;
        },

        dispatch: function (nativeEvent) {

            // Make a writable Events.Event from the native event object
            var event = eventInternal.fix(nativeEvent);

            var i, j, ret, matched, handleObj, handlerQueue,
                args = new Array(arguments.length),
                handlers = (Cache.Get(this, 'events') || {})[event.type] || [],
                special = eventInternal.special[event.type] || {};

            // Use the fix-ed Events.Event rather than the (read-only) native event
            args[0] = event;
            for (i = 1; i < arguments.length; i++) {
                args[i] = arguments[i];
            }
            event.delegateTarget = this;

            // Call the preDispatch hook for the mapped type, and let it bail if desired
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                return;
            }

            // Determine handlers
            handlerQueue = eventInternal.handlers.call(this, event, handlers);

            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;

                j = 0;
                while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {

                    // Triggered event must either 1) have no namespace, or
                    // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                    if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {

                        event.handleObj = handleObj;
                        event.data = handleObj.data;

                        ret = ((eventInternal.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);

                        if (ret !== undefined) {
                            if ((event.result = ret) === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }

            // Call the postDispatch hook for the mapped type
            if (special.postDispatch) {
                special.postDispatch.call(this, event);
            }
            return event.result;
        },

        handlers: function (event, handlers) {
            var i, matches, sel, handleObj,
                handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;

            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if (delegateCount && cur.nodeType && (!event.button || event.type !== 'click')) {

                for ( ; cur !== this; cur = cur.parentNode || this) {

                    // Don't check non-elements (#13208)
                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== 'click')) {
                        matches = [];
                        for ( i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];

                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + ' ';

                            if (matches[sel] === undefined) {
                                matches[sel] = handleObj.needsContext ? Index(Common.QueryAll(sel, this), cur) >= 0 : Find(sel, this, null, [cur]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({ elem: cur, handlers: matches });
                        }
                    }
                }
            }

            // Add the remaining (directly-bound) handlers
            if (delegateCount < handlers.length) {
                handlerQueue.push({ elem: this, handlers: handlers.slice(delegateCount) });
            }
            return handlerQueue;
        },

        addProp: function (name, hook) {
            Object.defineProperty(Events.Event.prototype, name, {
                enumerable: true,
                configurable: true,

                get: Common.IsFunction(hook) ?
                    function () {
                        if (this.originalEvent) {
                            return hook(this.originalEvent);
                        }
                    } :
                    function () {
                        if (this.originalEvent) {
                            return this.originalEvent[name];
                        }
                    },

                set: function (value) {
                    Object.defineProperty(this, name, {
                        enumerable: true,
                        configurable: true,
                        writable: true,
                        value: value
                    });
                }
            });
        },

        fix: function (originalEvent) {
            return originalEvent[CommonGUID] ? originalEvent : new Events.Event(originalEvent);
        },

        special: {
            load: {
                // Prevent triggered image.load events from bubbling to window.load
                noBubble: true
            },
            focus: {
                // Fire native event if possible so blur/focus sequence is correct
                trigger: function () {
                    if (this !== SafeActiveElement() && this.focus) {
                        this.focus();
                        return false;
                    }
                },
                delegateType: 'focusin'
            },
            blur: {
                trigger: function () {
                    if (this === SafeActiveElement() && this.blur) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: 'focusout'
            },
            click: {
                // For checkbox, fire native event so checked state will be right
                trigger: function () {
                    if (this.type === 'checkbox' && this.click && Common.CheckNodeType(this, 'input')) {
                        this.click();
                        return false;
                    }
                },

                // For cross-browser consistency, don't fire native .click() on links
                _default: function (event) {
                    return Common.CheckNodeType(event.target, 'a');
                }
            },

            beforeunload: {
                postDispatch: function (event) {

                    // Support: Firefox 20+
                    // Firefox doesn't alert if the returnValue field is not set.
                    if (event.result !== undefined && event.originalEvent) {
                        event.originalEvent.returnValue = event.result;
                    }
                }
            }
        },

        simulate: function (type, elem, event, bubble) {
            // Piggyback on a donor event to simulate a different one
            // Used only for `focus(in | out)` events
            var e = Common.MergeObjects(
                new Events.Event(),
                event,
                {
                    type: type,
                    isSimulated: true
                }
            );
            eventInternal.trigger(e, null, elem);
        }
    };

    // Events.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    Events.Event = function (src, props) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof Events.Event)) {
            return new Events.Event(src, props);
        }

        // Event object
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            // Support: Android < 4.0
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ? ReturnTrue : ReturnFalse;

            // Create target properties
            // Support: Safari <=6 - 7 only
            // Target should not be a text node (#504, #13143)
            this.target = (src.target && src.target.nodeType === 3) ? src.target.parentNode : src.target;
            this.currentTarget = src.currentTarget;
            this.relatedTarget = src.relatedTarget;

        // Event type
        }
        else {
            this.type = src;
        }

        // Put explicitly provided properties onto the event object
        if (props) {
            Common.MergeObjects(this, props);
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || Date.now();

        // Mark it as fixed
        this[CommonGUID] = true;
    };

    Events.Event.prototype = {
        constructor: Events.Event,
        isDefaultPrevented: ReturnFalse,
        isPropagationStopped: ReturnFalse,
        isImmediatePropagationStopped: ReturnFalse,
        isSimulated: false,
        preventDefault: function () {
            var e = this.originalEvent;
            this.isDefaultPrevented = ReturnTrue;
            if (e && !this.isSimulated) {
                e.preventDefault();
            }
        },
        stopPropagation: function () {
            var e = this.originalEvent;
            this.isPropagationStopped = ReturnTrue;
            if (e && !this.isSimulated) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function () {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = ReturnTrue;
            if (e && !this.isSimulated) {
                e.stopImmediatePropagation();
            }
            this.stopPropagation();
        }
    };

    // Public Methods
    Events.RemoveEvent = function (elem, type, handle) {

        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }

    };

    Events.GetInternal = function (property) {

        if (Common.IsDefined(property) && Common.IsNotEmptyString(property)) {
            return eventInternal[property];
        }
        else {
            return eventInternal;
        }

    };

    Events.On = function (elements, types, selector, data, fn, one) {

        var origFn, type;

        // Types can be a map of types/handlers
        if (Common.IsObject(types)) {
            // (types-Object, selector, data)
            if (Common.IsString(selector)) {
                // (types-Object, data)
                data = data || selector;
                selector = undefined;
            }
            for (type in types) {
                Events.On(elements, type, selector, data, types[type], one);
            }
            return elements;
        }

        if (data == null && fn == null) {
            // (types, fn)
            fn = selector;
            data = selector = undefined;
        }
        else if (fn == null) {
            if (Common.IsString(selector)) {
                // (types, selector, fn)
                fn = data;
                data = undefined;
            }
            else {
                // (types, data, fn)
                fn = data;
                data = selector;
                selector = undefined;
            }
        }
        if (fn === false) {
            fn = ReturnFalse;
        }
        else if (!fn) {
            return elements;
        }

        if (one === 1) {
            origFn = fn;
            fn = function (event) {
                // Can use an empty set, since event contains the info
                Events.Off(event);
                return origFn.apply(this, arguments);
            };

            // Use same guid so caller can remove using origFn
            fn.guid = origFn.guid || (origFn.guid = 'GTCEvents' + EventGUID++);
        }
        if (Common.IsArray(elements)) {
            var index = 0, length = elements.length;
            for ( ; index < length; index++) {
                eventInternal.add(elements[index], types, fn, data, selector);
            }
        }
        else {
            eventInternal.add(elements, types, fn, data, selector);
        }

    };

    Events.One = function (elements, types, selector, data, fn) {

        return Events.On(elements, types, selector, data, fn, 1);

    };

    Events.Off = function (elements, types, selector, fn) {

        var handleObj, type;
        if (elements && elements.preventDefault && elements.handleObj) {
            // (event)  dispatched Events.Event
            handleObj = elements.handleObj;
            Events.Off(elements.delegateTarget,
                handleObj.namespace ? handleObj.origType + '.' + handleObj.namespace : handleObj.origType,
                handleObj.selector,
                handleObj.handler
            );
            return elements;
        }
        if (Common.IsObject(types)) {
            // (types-object [, selector])
            for (type in types) {
                Events.Off(elements, type, selector, types[type]);
            }
            return elements;
        }
        if (selector === false || Common.IsFunction(selector)) {
            // (types [, fn])
            fn = selector;
            selector = undefined;
        }
        if (fn === false) {
            fn = ReturnFalse;
        }
        if (Common.IsArray(elements)) {
            var index = 0, length = elements.length;
            for ( ; index < length; index++) {
                eventInternal.remove(elements[index], types, fn, selector);
            }
        }
        else {
            eventInternal.remove(elements, types, fn, selector);
        }

    };

    Events.Trigger = function (elements, type, data) {

        if (Common.IsArray(elements)) {
            var index = 0, length = elements.length;
            for ( ; index < length; index++) {
                eventInternal.trigger(type, data, elements[index]);
            }
        }
        else {
            eventInternal.trigger(type, data, elements);
        }

    };

    Events.TriggerHandler = function (element, type, data) {

        if (element) {
            return eventInternal.trigger(type, data, element, true);
        }

    };

    Events.GetNextEventGUID = function () {

        return EventGUID++;

    };

    // Private Methods
    // Custom function to support $.find
    function Find (selector, context, results, seed) {

        var elem, nodeType, i = 0;
        results = results || [];
        context = context || document;

        // Same basic safeguard as Sizzle
        if (!selector || !Common.IsString(selector)) {
            return results;
        }

        // Early return if context is not an element or document
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }
        if (seed) {
            while ((elem = seed[i++])) {
                if (elem.matches(selector)) {
                    results.push(elem);
                }
            }
        }
        else {
            Common.MergeArray(results, Common.QueryAll(selector, context));
        }
        return results;

    };

    function Index (elements, elem) {

        // No argument, return index in parent
        if (!elem) {
            return (elements[0] && elements[0].parentNode) ? Common.GetAllSibling(elements[0], Common.SiblingType.Previous).length : -1;
        }

        // index in selector
        if (Common.IsString(elem)) {
            return indexOf.call(elem, elements[0]);
        }

        // Locate the position of the desired element
        return indexOf.call(elements, elem);

    }

    function MakeArray (arr, results) {

        var ret = results || [];
        if (arr != null) {
            if (IsArrayLike(Object(arr))) {
                Common.MergeArray(ret, Common.IsString(arr) ? [arr] : arr);
            }
            else {
                push.call(ret, arr);
            }
        }
        return ret;

    };

    function IsArrayLike (obj) {

        var length = obj.length,
            type = Common.GetType(obj);
        if (Common.IsFunction(type) || Common.IsWindow(obj)) {
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === 'array' || length === 0 || Common.IsNumber(length) && length > 0 && (length - 1) in obj;

    };

    function AcceptData (owner) {

        // Accepts only:
        //  - Node
        //    - Node.ELEMENT_NODE
        //    - Node.DOCUMENT_NODE
        //  - Object
        //    - Any
        return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);

    };

    function Contains (a, b) {

        var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && adown.contains(bup));

    }

    function ReturnTrue () {

        return true;

    };

    function ReturnFalse () {

        return false;

    };

    function SafeActiveElement () {

        try {
            return document.activeElement;
        }
        catch (err) {}

    };

    // Includes all common event props including KeyEvent and MouseEvent specific props
    var property, value;
    var eventProperties = {
        altKey: true,
        bubbles: true,
        cancelable: true,
        changedTouches: true,
        ctrlKey: true,
        detail: true,
        eventPhase: true,
        metaKey: true,
        pageX: true,
        pageY: true,
        shiftKey: true,
        view: true,
        "char": true,
        charCode: true,
        key: true,
        keyCode: true,
        button: true,
        buttons: true,
        clientX: true,
        clientY: true,
        offsetX: true,
        offsetY: true,
        pointerId: true,
        pointerType: true,
        screenX: true,
        screenY: true,
        targetTouches: true,
        toElement: true,
        touches: true,

        which: function (event) {
            var button = event.button;

            // Add which for key events
            if (event.which == null && rkeyEvent.test(event.type)) {
                return event.charCode != null ? event.charCode : event.keyCode;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if (!event.which && button !== undefined && rmouseEvent.test(event.type)) {
                return (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
            }

            return event.which;
        }
    };
    for (property in eventProperties) {
        value = eventProperties[property];
        eventInternal.addProp(property, value)
    }

    // Generate special events
    // Create mouseenter/leave events using mouseover/out and event-time checks
    // Support: Chrome 15+
    var mouseEvents = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout',
        pointerenter: 'pointerover',
        pointerleave: 'pointerout'
    };
    for (property in mouseEvents) {
        value = mouseEvents[property];
        (function (property, value) {
            eventInternal.special[property] = {
                delegateType: value,
                bindType: value,
                handle: function (event) {
                    var ret,
                        target = this,
                        related = event.relatedTarget,
                        handleObj = event.handleObj;

                    // For mousenter/leave call the handler if related is outside the target.
                    // NB: No relatedTarget if the mouse left/entered the browser window
                    if (!related || (related !== target && !Contains(target, related))) {
                        event.type = handleObj.origType;
                        ret = handleObj.handler.apply(this, arguments);
                        event.type = value;
                    }
                    return ret;
                }
            };
        }(property, value));
    }

    // Create 'bubbling' focus and blur events
    // Support: Firefox, Chrome, Safari
    if (!FocusinBubbles) {
        var bubbleEvents = {
            focus: 'focusin',
            blur: 'focusout'
        };
        for (property in bubbleEvents) {
            value = bubbleEvents[property];
            (function (property, value) {
                // Attach a single capturing handler on the document while someone wants focusin/focusout
                var handler = function (event) {
                    eventInternal.simulate(value, event.target, eventInternal.fix(event), true);
                };
                eventInternal.special[value] = {
                    setup: function () {
                        var doc = this.ownerDocument || this, attaches = Cache.Access(doc, value);
                        if (!attaches) {
                            doc.addEventListener(property, handler, true);
                        }
                        Cache.Access(doc, value, (attaches || 0) + 1);
                    },
                    teardown: function () {
                        var doc = this.ownerDocument || this, attaches = Cache.Access(doc, value) - 1;
                        if (!attaches) {
                            doc.removeEventListener(property, handler, true);
                            Cache.Remove(doc, value);

                        }
                        else {
                            Cache.Access(doc, value, attaches);
                        }
                    }
                };
            }(property, value));
        }
    }

} (window.Events = window.Events || {}, window, document, Common, Cache, Velocity));
