// Event Element
(function (EventElement, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    EventElement.AttachEvent = function (elementName, eventName, eventElement, eventProcessFunction, bindingGroup) {

        // Event
        var eventMarkup = '';
        if (Common.IsEventViewElementDefined(eventElement)) {
            // Data-ControllerPath/ActionName
            eventMarkup = ' data-' + eventName + '=\'' + JSON.stringify(eventElement) + '\'';

            // Wire Action!
            var onEvent = eventName;
            if (Common.IsDefined(bindingGroup)) {
                onEvent += '.' + bindingGroup;
            }
            if (Common.IsDefined(eventProcessFunction)) {
                Events.On(document.body, onEvent + '.' + elementName, '#' + elementName, eventProcessFunction);
            }
        }
        return eventMarkup;

    };

    EventElement.UpdateEventParameters = function (element, eventName, uiParameters) {

        if (element.tagName == 'BODY') {
            var pageName = location.pathname.replace('/Content/', '').replace('/', '').replace('.html', '');
            Common.SetStorage(pageName, JSON.stringify(uiParameters));
        }
        else {
            if (eventName == 'load') {
                Common.SetAttr(element, 'data-' + eventName, JSON.stringify(uiParameters));
            }
            else if (eventName == 'upload') {
                var formElement = Common.Get(element.id + 'Form');
                var dataEvent = JSON.parse(Common.GetAttr(formElement, 'data-' + eventName));
                dataEvent.UiParameters = uiParameters;
                Common.SetAttr(formElement, 'data-' + eventName, JSON.stringify(dataEvent));
                Widgets.uploadfiles(formElement, 'SetParameters', uiParameters);
            }
            else {
                var dataEvent = JSON.parse(Common.GetAttr(element, 'data-' + eventName));
                dataEvent.UiParameters = uiParameters;
                Common.SetAttr(element, 'data-' + eventName, JSON.stringify(dataEvent));
            }
        }

    };

    EventElement.UpdateEventPath = function (element, eventName, uiParameters) {

        var dataEvent = JSON.parse(Common.GetAttr(element, 'data-' + eventName));
        var uiParameter, index = 0, length = uiParameters.length;
        for ( ; index < length; index++) {
            uiParameter = uiParameters[index];
            if (uiParameter.Name == 'ControllerPath') {
                dataEvent.ControllerPath = uiParameter.Value;
            }
            if (uiParameter.Name == 'ActionName') {
                dataEvent.ActionName = uiParameter.Value;
                // TODO: Remove? Why reset event?
                Events.Off(element, eventName);
                Events.On(element, eventName, window[uiParameter.Value.toString()]);
            }
        }
        Common.SetAttr(element, 'data-' + eventName, JSON.stringify(dataEvent));

    };

} (window.EventElement = window.EventElement || {}, window, document, Common, Cache, Events, Velocity));
