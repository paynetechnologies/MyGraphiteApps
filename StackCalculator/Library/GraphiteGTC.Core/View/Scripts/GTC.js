// GTC
(function (GTC, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    GTC.Keyboard = {
        Alt: 18,
        Backspace: 8,
        CapsLock: 20,
        Control: 17,
        Delete: 46,
        Down: 40,
        End: 35,
        Enter: 13,
        Equal: 187,
        Escape: 27,
        Home: 36,
        Hyphen: 189,
        Left: 37,
        PageDown: 34,
        PageUp: 33,
        Period: 190,
        Right: 39,
        Shift: 16,
        Space: 32,
        Tab: 9,
        Up: 38
    };

    GTC.Numbers = {
        Zero: 48,
        One: 49,
        Two: 50,
        Three: 51,
        Four: 52,
        Five: 53,
        Six: 54,
        Seven: 55,
        Eight: 56,
        Nine: 57
    };

    GTC.Keypad = {
        Zero: 96,
        One: 97,
        Two: 98,
        Three: 99,
        Four: 100,
        Five: 101,
        Six: 102,
        Seven: 103,
        Eight: 104,
        Nine: 105,
        Plus: 107,
        Minus: 109,
        Multiply: 106,
        Divide: 111,
        Decimal: 110
    };

    // Public Methods
    GTC.TriggerEvent = function (eventElement, eventName, eventData) {

        var triggerEvent = Events.Event(eventName);
        triggerEvent.EventData = eventData;

        // Current context?
        if (document.body.contains(eventElement)) {
            Events.Trigger(eventElement, triggerEvent);
        }
        else {
            window.parent.Events.Trigger(eventElement, triggerEvent);
        }

    };

    GTC.IsControlDisabled = function (element) {

        var dataDisabled = Common.GetAttr(element, 'data-disabled');
        if (dataDisabled == 'true') {
            return true;
        }
        return false;

    };

    GTC.AttachKey = function (elementName, attachedKey) {

        var keyNamespace = attachedKey.split('.');
        if (keyNamespace.length == 2) {
            var attachedKeyCode = GTC[keyNamespace[0]][keyNamespace[1]];
            Events.On(document, 'keyup.' + elementName,
                function (event) {
                    var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                    if (pressedKeyCode == attachedKeyCode) {
                        if (!IsSearchToolInContext()) {
                            var element = Common.Get(elementName);
                            if (element != document.activeElement) {
                                document.activeElement.blur();
                                Events.Trigger(element, 'mousedown');
                                setTimeout(
                                    function () {
                                        Events.Trigger(element, 'mouseup');
                                    }, 200
                                );
                                Events.Trigger(element, 'click');
                            }
                        }
                    }
                }
            );
        }

    };

    // Private Methods
    function IsSearchToolInContext () {

        var searchForm = Common.Closest("form", document.activeElement);
        if (Common.IsNotDefined(searchForm)) {
            return false;
        }
        var namespace = Common.GetAttr(searchForm, "data-namespace");
        if (namespace == "SearchTool") {
            return true;
        }
        return false;

    };

} (window.GTC = window.GTC || {}, window, document, Common, Cache, Events, Velocity));
