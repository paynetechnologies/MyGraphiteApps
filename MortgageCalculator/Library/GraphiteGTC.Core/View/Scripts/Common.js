// Support jQuery being loaded as a third party library without breaking Velocity
if (window.jQuery) {
    window.Velocity = jQuery.Velocity;
}

// Common Namespace
(function (Common, Velocity, window, document, undefined) {

    // Public Variables
    Common.InsertType = {
        Before: 'beforebegin',
        After: 'afterend',
        Append: 'beforeend',
        Prepend: 'afterbegin'
    };

    Common.SiblingType = {
        Previous: 'Previous',
        Next: 'Next',
        All: 'All'
    };

    // Private Variables
    var mediaView = {
        'Mobile': {
            Match: false,
            Cached: false,
            Size: '(max-width: 640px)'
        },
        'Tablet': {
            Match: false,
            Cached: false,
            Size: '(min-width: 641px) and (max-width: 1024px)'
        },
        'Desktop': {
            Match: false,
            Cached: false,
            Size: '(min-width: 1025px) and (max-width: 1280px)'
        },
        'HighResolution': {
            Match: false,
            Cached: false,
            Size: '(min-width: 1281px)'
        },
        'Custom': {
            Match: false,
            Cached: false,
            Size: ''
        }
    };

    // Public Methods: Media Check
    Common.CheckMedia = function (type, recache, custom) {

        if (type == 'Custom') {
            mediaView[type].Size = custom;
            recache = true;
        }

        // Return cached value
        if (recache != true && mediaView[type].Cached) {
            return mediaView[type].Match;
        }

        // Firefox hidden iframe fix (matchMedia returns null when called from within a hidden iframe)
        var mediaResults = window.matchMedia(mediaView[type].Size);
        if (Common.IsDefined(mediaResults) && mediaResults.matches == true) {
            mediaView[type].Match = true;
            mediaView[type].Cached = true;
            return mediaView[type].Match;
        }

        // Else default and cache (Couldnt determine)
        mediaView[type].Match = false;
        mediaView[type].Cached = true;
        return mediaView[type].Match;

    };

    // Public Methods: Session Storage
    Common.SetStorage = function (key, value) {

        sessionStorage.setItem(key, value);
        return true;

    };

    Common.GetStorage = function (key) {

        var storageValue = sessionStorage.getItem(key);
        if (storageValue == 'null') {
            return null;
        }
        return storageValue;

    };

    Common.RemoveStorage = function (key) {

        sessionStorage.removeItem(key);
        return true;

    };

    Common.ClearStorage = function () {

        sessionStorage.clear();
        return true;

    };

    // Public Methods: SessionToken Storage (Use localStorage so session token is available cross tab for permalinks)
    Common.SetSessionToken = function (value) {

        localStorage.setItem('SessionToken', value);
        return true;

    };

    Common.GetSessionToken = function () {

        var sessionTokenValue = localStorage.getItem('SessionToken');
        if (sessionTokenValue == 'null') {
            return null;
        }
        return sessionTokenValue;

    };

    Common.ClearSessionToken = function () {

        localStorage.clear();
        return true;

    };

    Common.SetOnLoadEvent = function (control, isModalLink, fromBreadcrumb) {

        // Create Page Key
        var pageHref = Common.GetAttr(control, 'href');
        var pageKey = pageHref.replace('/Content/', '').replace('/', '').replace('.html', '');

        // Get OnLoad Event
        var onLoadEvent = Common.GetAttr(control, 'data-load');

        // Form To Send? Hyperlinks, ModalLinks, ImageLinks and Tiles can send current form state to next page OnLoad
        var formToSerialize = Common.GetAttr(control, 'data-formtoserialize');
        if (Common.IsDefined(formToSerialize)) {
            var parsedOnLoad = JSON.parse(onLoadEvent);
            var onLoadParameters = [];
            if (Common.IsDefined(parsedOnLoad)) {
                onLoadParameters = onLoadParameters.concat(parsedOnLoad);
            }
            onLoadParameters = onLoadParameters.concat(Form.SerializeArray(Common.Get(formToSerialize)));
            parsedOnLoad = onLoadParameters;
            onLoadEvent = JSON.stringify(parsedOnLoad);
        }

        // Update Breadcrumb
        var breadcrumbNamespace = window['Breadcrumb'];
        if (Common.IsDefined(breadcrumbNamespace)) {
            if (pageHref == Common.GetStorage('BreadcrumbHomeView')) {
                breadcrumbNamespace.ClearBreadcrumbData();
            }
            else if (!isModalLink && !fromBreadcrumb) {
                breadcrumbNamespace.UpdateBreadcrumbData(control, pageHref, pageKey, JSON.parse(onLoadEvent));
            }
        }

        // Set Session Data
        Common.SetStorage(pageKey, onLoadEvent);
        return true;

    };

    // Watch for element changes
    Common.AttachObservationEvent = function (elementName, onChangeFunction, context, eventNamespace, eventData, options) {

        var element = context.Common.Query('#' + elementName);
        var currentBrowser = context.Common.GetBrowser();

        // Attach custom observechanges event
        if (context.Common.IsDefined(eventNamespace) && context.Common.IsNotEmptyString(eventNamespace)) {
            eventNamespace = '.' + eventNamespace;
        }
        else {
            eventNamespace = '';
        }
        Events.On(element, 'observechanges' + eventNamespace, onChangeFunction);

        // IE10 and lower does not support MutationObservers so fake it
        if (currentBrowser[0] == 'IE' && context.parseInt(currentBrowser[1], 10) < 11) {
            // Setup timer
            var timer = context.setInterval(
                function () {
                    Events.Trigger(element, 'observechanges', { EventData: eventData, isMutationObserver: false, IntervalId: timer });
                }, 500
            );
        }
        else {
            // Watch individual mutations on element and trigger event (Callback needs to properly handle over-processing and stopping observations)
            var observer = new context.MutationObserver(
                function (mutations) {
                    mutations.forEach(
                        function (mutation) {
                            context.Events.Trigger(mutation.target, 'observechanges', { EventData: eventData, isMutationObserver: true, Observer: observer });
                        }
                    );
                }
            );

            // Default watches ALL attributes, subtrees and additions/removals of children along with old value of a changed attribute
            // Pass in options to override these defaults and to save performance
            // Option Descriptions:
            // ====================
            // NOTE: At the very least, childList, attributes, or characterData must be set to true. Otherwise error is thrown.
            // attributes: Set to true if mutations to target's attributes are to be observed.
            // subtree: Set to true if mutations to not just target, but also target's descendants are to be observed.
            // childList: Set to true if additions and removals of the target node's child elements (including text nodes) are to be observed.
            // characterData: Set to true if mutations to target's data are to be observed.
            // attributeOldValue: Set to true if attributes is set to true and target's attribute value before the mutation needs to be recorded.
            // characterDataOldValue: Set to true if characterData is set to true and target's data before the mutation needs to be recorded.
            // attributeFilter: Set to an array of attribute local names (without namespace) if not all attribute mutations need to be observed.
            var config = {
                attributes: true,
                subtree: true,
                childList: true,
                characterData: false,
                attributeOldValue: true,
                characterDataOldValue: false
            };
            if (context.Common.IsDefined(options)) {
                config = options;
            }

            // Begin observing
            observer.observe(element, config);
        }

    };

    // Cleanup observation events
    Common.DetachObservationEvent = function (eventData) {

        if (eventData.isMutationObserver == true) {
            eventData.Observer.disconnect();
        }
        else {
            clearInterval(eventData.IntervalId);
        }

    };

    // Watch for element visibility changes
    var isObserving = false;
    var observedElements = [];
    Common.AttachVisibilityEvent = function (elementName, onVisibilityChangeFunction, eventNamespace, eventData, isDisplayedStartState) {

        var element = Common.Get(elementName);
        var isDisplayed = (isDisplayedStartState == 'No' ? isDisplayedStartState : 'Yes');
        var currentBrowser = Common.GetBrowser();

        // Attach custom visibilitychange event
        if (Common.IsDefined(eventNamespace) && Common.IsNotEmptyString(eventNamespace)) {
            eventNamespace = '.' + eventNamespace;
        }
        else {
            eventNamespace = '';
        }
        Events.On(element, 'visibilitychange' + eventNamespace, onVisibilityChangeFunction);

        // Only allow an element to be attached once
        if (Common.IsInArray(elementName, observedElements) == -1) {
            // IE10 and lower does not support MutationObservers so fake it
            if (currentBrowser[0] == 'IE' && parseInt(currentBrowser[1], 10) < 11) {
                // Add element name to list of elements to observe
                observedElements.push(elementName);

                // Setup timer
                var timer = setInterval(
                    function () {
                        if (Common.IsHidden(element, true) && isDisplayed == 'Yes') {
                            isDisplayed = 'No';
                            Events.Trigger(element, 'visibilitychange', { Visible: false, EventData: eventData, isMutationObserver: false, IntervalId: timer });
                        }
                        else if (Common.IsVisible(element, true) && isDisplayed == 'No') {
                            isDisplayed = 'Yes';
                            Events.Trigger(element, 'visibilitychange', { Visible: true, EventData: eventData, isMutationObserver: false, IntervalId: timer });
                        }
                    }, 500
                );
            }
            else {
                // This monitors entire body and checks each configured element for visibility changes

                // Add element name to list of elements to observe
                observedElements.push(elementName);

                // Save data for each element on the actual element, since mutation observation is only attached once we dont have proper scope
                Cache.Set(element, 'isDisplayed', isDisplayed);
                Cache.Set(element, 'eventData', eventData);

                // Check if observer is already attached to body. It shouldnt attach more than one by default by why work harder than we need to.
                if (!isObserving) {
                    isObserving = true;

                    // Check individual elements on any mutation list and trigger event (Callback needs to properly handle over-processing and stopping observations)
                    // No need to check each mutation. We monitor entire body since we want to know if a parent has made a child hidden.
                    // Since we are monitoring entire body disconnecting only requires removing element from observed list and if IE10 or lower clearing interval
                    var observer = new MutationObserver(
                        function (mutations) {
                            var name, index = 0, length = observedElements.length;
                            for ( ; index < length; index++) {
                                name = observedElements[index];
                                if (Common.IsNotDefined(name)) {
                                    continue;
                                }

                                // Check each element for changed visibility and trigger event if its changed
                                var observedElement = Common.Get(name);
                                var currentIsDisplayed = Cache.Get(observedElement, 'isDisplayed');
                                if (Common.IsHidden(observedElement, true) && currentIsDisplayed == 'Yes') {
                                    Cache.Set(observedElement, 'isDisplayed', 'No');
                                    Events.Trigger(observedElement, 'visibilitychange', { Visible: false, EventData: Cache.Get(observedElement, 'eventData'), isMutationObserver: true, ElementName: name });
                                }
                                else if (Common.IsVisible(observedElement, true) && currentIsDisplayed == 'No') {
                                    Cache.Set(observedElement, 'isDisplayed', 'Yes');
                                    Events.Trigger(observedElement, 'visibilitychange', { Visible: true, EventData: Cache.Get(observedElement, 'eventData'), isMutationObserver: true, ElementName: name });
                                }
                            }
                        }
                    );

                    // Check only style attribute of body and all subtrees. All that really matters for visibility and saves performance
                    var config = {
                        attributes: true,
                        subtree: true,
                        childList: false,
                        characterData: false,
                        attributeOldValue: false,
                        characterDataOldValue: false,
                        attributeFilter: ['style']
                    };

                    // Begin observing
                    observer.observe(document.body, config);
                }
            }
        }

    };

    // Cleanup visibility events
    Common.DetachVisibilityEvent = function (eventData) {

        // Remove element from observe list
        observedElements = Common.FilterArray(observedElements,
            function (value) {
                return value != eventData.ElementName;
            }
        );

        // Cleanup data
        var element = Common.Get(eventData.ElementName);
        Cache.Remove(element, 'isDisplayed');
        Cache.Remove(element, 'eventData');

        // If IE10 or lower clear interval
        if (eventData.isMutationObserver == false) {
            clearInterval(eventData.IntervalId);
        }

    };

    // Watch window for resizing
    Common.AttachWindowResizingEvent = function (onResizeEndFunction, eventNamespace, eventData) {

        // Attach custom resize end event
        Events.On(window, 'resizeend.' + eventNamespace, eventData, onResizeEndFunction);

        // Intialize resize timer
        var resizeTimer = window.setTimeout(function () { }, 0);
        Cache.Set(window, eventNamespace, resizeTimer);

        // Attach window resize event
        Events.On(window, 'resize.' + eventNamespace,
            function () {
                // On resize event clear our custom event timer
                window.clearTimeout(resizeTimer);

                // Reset timer to call custom event if 250ms passes with no resize
                resizeTimer = window.setTimeout(
                    function () {
                        Events.Trigger(window, 'resizeend.' + eventNamespace);
                    }, 250
                );
            }
        );

    };

    Common.DetachWindowResizingEvent = function (eventNamespace) {

        var resizeTimer = Cache.Get(window, eventNamespace);
        window.clearTimeout(resizeTimer);
        Events.Off(window, 'resize.' + eventNamespace);

    };

    // Public Methods: Close/Refresh/Resize View
    Common.CloseView = function () {

        // Is View a Modal?
        if (Common.IsModal()) {
            Modals.CloseModalDialog();
        }
        else {
            // Go back to previous View
            parent.history.back();
        }

    };

    Common.RefreshView = function () {

        // Is View a Modal?
        if (Common.IsModal()) {
            // Modal
            window.parent.Common.Query('.gtc-modal-iframe').contentWindow.location.reload();
        }
        else {
            // View
            location.reload();
        }

    };

    Common.CloseRefreshView = function () {

        // Is View a Modal?
        if (Common.IsModal()) {
            // Modal
            setTimeout(
                function () {
                    top.document.location.reload();
                }, 600
            );
            window.parent.Widgets.modal(window.parent.Common.Query('.gtc-modal-iframe').parentNode, 'close');
        }
        else {
            // View
            parent.history.back();
        }

    };

    Common.ResizeView = function (modalOnly) {

        // Is View a Modal?
        if (modalOnly == true || Common.IsModal()) {
            window.parent.Events.Trigger(window.parent.Common.Query('.gtc-modal-iframe', null, true), 'resizemodal');
        }
        else {
            Page.SetPageHeight();
        }

    };

    // Public Methods: Pinwheel
    Common.ShowPinwheel = function (element, animateIn, noBackground) {

        document.body.style.cursor = 'wait';
        var divPinwheelOverlay = '<div';
        var pinwheelClassing = ' class="gtc-pinwheel-overlay';
        divPinwheelOverlay += ' id="PinwheelOverlay" style="display:';
        if (Common.IsDefined(element)) {
            var namespace = window[Common.GetAttr(element, 'data-namespace')];
            if (Common.IsNotDefined(namespace)) {
                if (Common.IsDefined(window.console)) {
                    console.log('Error[' + namespace + ']: Namespace missing');
                }
            }
            else {
                divPinwheelOverlay += 'block;';
                if (Common.IsModal() || noBackground || Common.IsFunction(namespace.ShowPinwheel)) {
                    pinwheelClassing += ' gtc-pinwheel-overlay-transparent';
                }
                divPinwheelOverlay += '"' + pinwheelClassing + '"></div>';
                if (Common.IsNotDefined(Common.Get('PinwheelOverlay'))) {
                    Common.InsertHTMLString(document.body, Common.InsertType.Append, divPinwheelOverlay);
                }
                if (Common.IsFunction(namespace.ShowPinwheel)) {
                    namespace.ShowPinwheel(element);
                }
            }
        }
        else {
            if (animateIn) {
                divPinwheelOverlay += 'none;';
            }
            else {
                divPinwheelOverlay += 'block;';
            }
            if (noBackground) {
                pinwheelClassing += ' gtc-pinwheel-overlay-transparent';
            }
            divPinwheelOverlay += '"' + pinwheelClassing + '"></div>';
            if (Common.IsNotDefined(Common.Get('PinwheelOverlay'))) {
                Common.InsertHTMLString(document.body, Common.InsertType.Append, divPinwheelOverlay);
                var pinwheelOverlay = Common.Get('PinwheelOverlay');
                SpinKit.Show(pinwheelOverlay);
                if (animateIn) {
                    Velocity(pinwheelOverlay, 'fadeIn', 500,
                        function () {
                            Events.Trigger(document, 'showPinwheelComplete');
                        }
                    );
                }
            }
        }

    };

    Common.HidePinwheel = function (element) {

        if (Common.IsDefined(element)) {
            var namespace = window[Common.GetAttr(element, 'data-namespace')];
            if (Common.IsNotDefined(namespace)) {
                if (Common.IsDefined(window.console)) {
                    console.log('Error[' + namespace + ']: Namespace missing');
                }
            }
            else {
                if (Common.IsFunction(namespace.HidePinwheel)) {
                    namespace.HidePinwheel(element);
                }
                var pinwheelOverlay = Common.Get('PinwheelOverlay');
                if (Common.IsDefined(pinwheelOverlay)) {
                    Common.Remove(pinwheelOverlay);
                }
            }
        }
        else {
            Velocity(Common.Get('PinwheelOverlay'), 'fadeOut', 500,
                function () {
                    Common.Remove(this[0]);
                }
            );
        }
        document.body.style.cursor = 'default';

    };

    // Public Methods: Execute View Behavior
    Common.ExecuteViewBehavior = function (behaviorUrl, behaviorParameters, behaviorDataProcessor, requestingElement, ignoreMaskingValidation) {

        // Show Pinwheel
        Common.ShowPinwheel(requestingElement);

        // Remove LastViewBehaviorReturnedValidations Session Variable
        Common.RemoveStorage("LastViewBehaviorReturnedValidations");

        // Check masking
        var formNamespace = window['Form'];
        if (ignoreMaskingValidation != true && Common.IsDefined(formNamespace)) {
            if (formNamespace.HasMaskingErrors()) {
                Form.DisplayMaskingErrors();
                Common.HidePinwheel(requestingElement);
                return;
            }
        }

        // Add CurrentUser to BehaviorParameters
        var sessionToken = Common.GetSessionToken();
        if (Common.IsDefined(sessionToken)) {
            var currentUserParameter = [
                {
                    "Name": "CurrentUser",
                    "Value": sessionToken
                }
            ];
            if (Common.IsNotDefined(behaviorParameters)) {
                behaviorParameters = [];
            }
            behaviorParameters = behaviorParameters.concat(currentUserParameter);
        }

        // Setup UiParameters
        var uiParameters = { uiParameters: behaviorParameters };

        // Make Ajax Call
        var requestObject = new XMLHttpRequest();
        requestObject.open('POST', behaviorUrl, true);
        requestObject.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        requestObject.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var behaviorData = JSON.parse(this.response);
                behaviorDataProcessor(behaviorData, requestingElement);
                var hidePinwheel = function () {
                    Common.HidePinwheel(requestingElement);
                };
                if (Common.IsModal() && Common.GetBrowser()[0] == 'Firefox') {
                    // This is so terrible but hidden iframe and getComputedStyle on an element inside explodes
                    // and the call is happening in VelocityJS so I can't control it.
                    setTimeout(hidePinwheel, 1000);
                }
                else if (Common.IsDefined(requestingElement)) {
                    hidePinwheel();
                }
                else {
                    setTimeout(hidePinwheel, 200);
                }
            }
            else {
                Common.RequestErrorHandler(this, requestingElement, false);
            }
        };
        requestObject.onerror = function () {
            Common.RequestErrorHandler(this, requestingElement, false);
        };
        requestObject.send(JSON.stringify(uiParameters));

    };

    Common.RequestErrorHandler = function (xhr, requestingElement, ignorePinwheel) {

        if (!ignorePinwheel) {
            Common.HidePinwheel(requestingElement);
        }
        if (xhr.status == Modals.ErrorCodes.AuthorizationError || xhr.status == Modals.ErrorCodes.ConcurrencyError || xhr.status == Modals.ErrorCodes.SessionExpirationError) {
            Modals.ShowExceptionDialog(xhr);
        }
        else {
            Modals.ShowModalErrorDialog(xhr.response);
        }

    };

    Common.IsEventViewElementDefined = function (eventElement) {

        // Check Event
        if (Common.IsDefined(eventElement) && Common.IsDefined(eventElement.ControllerPath) && Common.IsDefined(eventElement.ActionName)) {
            return true;
        }
        return false;

    };

    // Public Methods: Time Zone
    Common.AddTimezone = function (dateObject) {

        return new Date(dateObject.getTime() + dateObject.getTimezoneOffset() * 60000);

    };

    Common.RemoveTimezone = function (milliSecondsFrom1970) {

        return milliSecondsFrom1970 = milliSecondsFrom1970 - (60000 * new Date(milliSecondsFrom1970).getTimezoneOffset());

    };

    Common.GetOrdinalDay = function (day) {

        if ((parseFloat(day) == parseInt(day, 10)) && !isNaN(day)) {
            var suffix = ['th', 'st', 'nd', 'rd'];
            var modulusDay = day % 100;
            return day + (suffix[(modulusDay - 20) % 10] || suffix[modulusDay] || suffix[0]);
        }
        return day;

    };

    // Public Methods: Translate
    Common.GetLanguage = function () {

        // Get Language
        var currentLanguage = Common.GetStorage('CurrentLanguage');
        if (Common.IsNotDefined(currentLanguage) || currentLanguage.length <= 0) {
            currentLanguage = 'en-US';
        }
        return currentLanguage;

    };

    Common.TranslatePage = function (fromSettingsModal, processGraphs, additionalResources) {

        // Get Language
        var language = Common.GetLanguage();

        // Sanity Check: Context
        var currentContext = Common.GetStorage('CurrentContext');
        if (Common.IsNotDefined(currentContext) || currentContext.length <= 0) {
            return;
        }

        // Initialize
        i18n.init(
            {
                lng: language,
                useDataAttrOptions: true,
                useLocalStorage: true,
                localStorageExpirationTime: false,
                selectorAttr: 'data-translate',
                fallbackLng: false,
                load: 'current',
                resGetPath: '/Content/locales/__lng__/__ns__.json',
                defaultValueFromContent: false,
                ns: 'locale',
                setJqueryExt: false
            },
            function () {
                // Graphite GTC Preview Support
                if (Common.IsDefined(additionalResources)) {
                    i18n.addResourceBundle(language, 'locale', additionalResources);
                }

                // Process Graphs
                if (Common.IsFunction(processGraphs)) {
                    processGraphs();
                }

                // Translate Body
                var bodyObject;
                if (fromSettingsModal) {
                    bodyObject = parent.window.document.body;
                }
                else {
                    bodyObject = document.body;
                }
                i18n.translateObject(bodyObject);

                // Translate Title
                var translatedTitle = Common.TranslateKey(document.title);
                if (Common.IsDefined(translatedTitle) && Common.IsNotEmptyString(translatedTitle)) {
                    document.title = translatedTitle;
                }

                // Translate 508 Compliance SkipToMainContent
                var skipToMainContent = Common.Get('SkipToMainContent508');
                if (Common.IsDefined(skipToMainContent)) {
                    skipToMainContent.textContent = Common.TranslateKey('SkipToMainContent');
                }

                // Let anyone waiting know translations loaded
                Events.Trigger(document.body, 'translationsloaded');
            }
        );

        // Setup parent retranslate event
        if (!Common.IsModal()) {
            Events.On(document.body, 'translateparent',
                function () {
                    Common.RetranslatePage();
                }
            );
        }

    };

    Common.RetranslatePage = function () {

        // Get Language
        var language = Common.GetLanguage();

        // Translate
        i18n.setLng(language,
            function () {
                i18n.translateObject(document.body);

                // Translate Title
                var translatedTitle = Common.TranslateKey(document.title);
                if (Common.IsDefined(translatedTitle) && Common.IsNotEmptyString(translatedTitle)) {
                    document.title = translatedTitle;
                }
            }
        );

    };

    Common.GetTranslationEngine = function (context) {

        // If no context passed default it
        if (Common.IsNotDefined(context)) {
            context = window;
        }

        // Did translations load?
        var translate = (context.i18n && context.i18n.t) ? context.i18n.t : null;

        // If not build fake translation function
        if (!Common.IsFunction(translate)) {
            translate = function (key) {
                return key;
            };
        }

        // Return function
        return translate;

    };

    Common.TranslateKey = function (key, context) {

        var translate = Common.GetTranslationEngine(context);
        var translation = translate(key);

        // Between i18next loading the translation file but i18next has itself loaded it
        // returns an empty string instead of the key, this makes sure that doesn't happen
        // TODO: If we upgrade i18next(current: 1.10.1), see if this is no longer required.
        if (Common.IsNotDefined(translation) || Common.IsEmptyString(translation)) {
            translation = key;
        }
        return translation;

    };

    // Public Methods: Theme
    Common.ApplyTheme = function (fromSettingsModal) {

        // Sanity Check
        var theme = Common.GetStorage('CurrentTheme');
        if (Common.IsNotDefined(theme) || theme.length <= 0 || theme == 'null') {
            return;
        }

        // Intialize
        var context, linkList, length, themeLowerCase = theme.toLowerCase();
        if (fromSettingsModal) {
            context = top.document;
        }
        else {
            context = document;
        }

        // Find relevant style sheets and icons
        linkList = Common.QueryAll('link[rel="stylesheet"]:not([media="print"]), link[rel="icon"]', context);
        length = linkList.length;

        // Stop if same theme is already set
        if (length > 0 && linkList[0].href.indexOf('thirdParty') != -1 && linkList[0].href.indexOf(themeLowerCase) > 0) {
            return;
        }

        // Set Theme
        Common.SetAttr(context.body, 'data-theme', theme);

        // Update stylesheets
        var linkItem, href, index = 0, groupName = Common.GetAttr(document.body, 'data-group');
        var newHref, hrefArray, arrayIndex, arrayCount;
        for ( ; index < length; index++) {
            linkItem = linkList[index];
            href = Common.GetAttr(linkItem, 'href');
            if (href.indexOf(groupName) != -1) {
                newHref = '', hrefArray = href.split('/'), arrayIndex = 0, arrayCount = hrefArray.length;
                while (arrayIndex < arrayCount) {
                    if (hrefArray[arrayIndex] == 'skins') {
                        hrefArray[(arrayIndex + 1)] = themeLowerCase;
                    }
                    if (hrefArray[arrayIndex].length > 0) {
                        newHref += '/' + hrefArray[arrayIndex];
                    }
                    arrayIndex++;
                }
                Common.SetAttr(linkItem, 'href', newHref);
            }
        }
        Page.SetPageHeight();

    };

    // Public Methods: Helper Functions
    // Unescape string
    var decodeHtml = null;
    Common.Decode = function (value) {

        if (Common.IsNotDefined(decodeHtml)) {
            decodeHtml = document.createElement('textarea');
        }
        decodeHtml.innerHTML = value;
        return decodeHtml.value;

    };

    // Custom wrapper for Promise/A+
    Common.Promise = function (optionalLogic) {

        var promiseWrapper = {};
        var promise = new Promise(
            function (resolve, reject) {
                promiseWrapper.resolve = resolve;
                promiseWrapper.reject = reject;
                if (Common.IsFunction(optionalLogic)) {
                    promiseWrapper.optionalLogicResponse = optionalLogic(promiseWrapper);
                }
            }
        );
        promiseWrapper.promise = promise;
        return promiseWrapper;

    };

    // Takes a function and returns a new one with passed context applied.
    var proxyGuid = 0;
    Common.Proxy = function (fn, context) {

        var tmp, args, proxy;

        if (Common.IsString(context)) {
            tmp = fn[context];
            context = fn;
            fn = tmp;
        }

        // Quick check to determine if target is callable, in the spec
        // this throws a TypeError, but we will just return undefined.
        if (!Common.IsFunction(fn)) {
            return undefined;
        }

        // Simulated bind
        args = [].slice.call(arguments, 2);
        proxy = function() {
            return fn.apply(context || this, args.concat([].slice.call(arguments)));
        };

        // Set the guid of unique handler to the same of original handler, so it can be removed
        proxy.guid = fn.guid = fn.guid || 'GTCProxy' + proxyGuid++;
        return proxy;

    };

    // Creates element and sets some values if they are passed
    Common.Create = function (type, id, classes, innerHTML) {

        var element = document.createElement(type);

        // Add id?
        if (Common.IsDefined(id)) {
            element.id = id;
        }

        // Add classes?
        if (Common.IsDefined(classes)) {
            Common.AddClasses(element, classes);
        }

        // Add inner HTML string?
        if (Common.IsDefined(innerHTML) && Common.IsString(innerHTML) && Common.IsNotEmptyString(innerHTML)) {
            element.innerHTML = innerHTML;
        }
        return element;

    };

    // Retrieve an element by id
    Common.Get = function (id, fromParent) {

        var context = document;
        if (fromParent) {
            context = parent.document;
        }
        return context.getElementById(id);

    };

    // Retrieve elements by name
    Common.GetByName = function (name, fromParent) {

        var context = document;
        if (fromParent) {
            context = parent.document;
        }
        return Common.NodeListToArray(context.getElementsByName(name));

    };

    // Retrieve elements by tag, optional context
    Common.GetByTagName = function (tag, context, fromParent) {

        if (Common.IsNotDefined(context)) {
            context = document;
        }
        if (fromParent) {
            context = parent.document;
        }
        return Common.NodeListToArray(context.getElementsByTagName(tag));

    };

    // Retrieve an element with a selector, optional context
    Common.Query = function (selector, context, fromParent) {

        if (Common.IsNotDefined(context)) {
            context = document;
        }
        if (fromParent) {
            context = parent.document;
        }
        return context.querySelector(selector);

    };

    // Retrieve elements with a selector, optional context
    Common.QueryAll = function (selector, context, fromParent) {

        if (Common.IsNotDefined(context)) {
            context = document;
        }
        if (fromParent) {
            context = parent.document;
        }
        return Common.NodeListToArray(context.querySelectorAll(selector));

    };

    // Retrieve hidden elements with a selector, optional context
    Common.QueryAllHidden = function (selector, context, fromParent) {

        if (Common.IsNotDefined(context)) {
            context = document;
        }
        if (fromParent) {
            context = parent.document;
        }
        var results = context.querySelectorAll(selector);
        var hiddenElements = [], element, index = 0, length = results.length;
        for ( ; index < length; index++) {
            element = results[index];
            if (Common.IsHidden(element)) {
                hiddenElements.push(element);
            }
        }
        return hiddenElements;

    };

    // Retrieve visible elements with a selector, optional context
    Common.QueryAllVisible = function (selector, context, fromParent) {

        if (Common.IsNotDefined(context)) {
            context = document;
        }
        if (fromParent) {
            context = parent.document;
        }
        var results = context.querySelectorAll(selector);
        var visibleElements = [], element, index = 0, length = results.length;
        for ( ; index < length; index++) {
            element = results[index];
            if (Common.IsVisible(element)) {
                visibleElements.push(element);
            }
        }
        return visibleElements;

    };

    // Converts a node list into an array
    Common.NodeListToArray = function (nodeList) {

        return [].slice.call(nodeList, 0);

    };

    // Retrieve elements by class name, optional context
    Common.GetByClass = function (selector, context, fromParent) {

        if (Common.IsNotDefined(context)) {
            context = document;
        }
        if (fromParent) {
            context = parent.document;
        }
        return Common.NodeListToArray(context.getElementsByClassName(selector));

    };

    // Polyfill if no browser support for matches
    (function () {

        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.msMatchesSelector
                                        || Element.prototype.mozMatchesSelector
                                        || Element.prototype.webkitMatchesSelector;
        }

    }());

    // Retrieve the first element that matches the selector by testing the element itself and traversing up through its ancestors
    Common.Closest = function (selector, context) {

        var matchedElement = null;
        if (Common.IsNotDefined(context)) {
            return matchedElement;
        }
        if (Common.IsFunction(context.closest)) {
            matchedElement = context.closest(selector);
        }
        else {
            // IE is why we can't have nice things
            var matchedElement = context;
            if (!matchedElement.matches(selector)) {
                while ((matchedElement = matchedElement.parentElement) && !matchedElement.matches(selector)) {
                    // Continue
                }
            }
            return matchedElement;
        }
        return matchedElement;

    };

    Common.ClosestAll = function (selector, context) {

        if (context.length) {
            var match = [], index = 0, length = context.length;
            for ( ; index < length; index++) {
                match.push(Common.Closest(selector, context[index]));
            }
            return match;
        }
        else {
            return [Common.Closest(selector, context)];
        }

    };

    // Retrieves an element's parents up to but not including the element matched by the selector, pass null selector for all parents, optional selector to filter
    Common.ParentsUntil = function (selector, context, filterSelector) {

        var match = [];
        var truncate = Common.IsDefined(context);
        var filter = Common.IsDefined(filterSelector);
        while ((context = context.parentNode) && context.nodeType !== 9) {
            if (context.nodeType === 1) {
                if (truncate && context.matches(selector)) {
                    break;
                }
                if (filter && !context.matches(filterSelector)) {
                    continue;
                }
                match.push(context);
            }
        }
        return match;

    };

    // Retrieve an element's previous or next sibling, optional selector to filter
    Common.GetSibling = function (context, type, selector) {

        var match = null;
        if (Common.IsNotDefined(context)) {
            return match;
        }
        if (type == Common.SiblingType.Next) {
            match = context.nextSibling;
        }
        else if (type == Common.SiblingType.Previous) {
            match = context.previousSibling;
        }
        if (Common.IsDefined(selector) && Common.IsNotEmptyString(selector) && Common.IsDefined(match)) {
            if (!match.matches(selector)) {
                match = null;
            }
        }
        return match;

    };

    // Retrieve all previous, all next or all siblings of an element, optional selector to filter
    Common.GetAllSibling = function (context, type, selector) {

        var match = [];
        if (Common.IsNotDefined(context)) {
            return match;
        }
        if (type == Common.SiblingType.Next || type == Common.SiblingType.Previous) {
            var siblingProperty = '';
            if (type == Common.SiblingType.Next) {
                siblingProperty = 'nextSibling';
            }
            else if (type == Common.SiblingType.Previous) {
                siblingProperty = 'previousSibling';
            }
            while (context = context[siblingProperty]) {
                if (Common.IsDefined(selector)) {
                    if (context.matches(selector)) {
                        match.push(context);
                    }
                }
                else {
                    match.push(context);
                }
            }
        }
        else if (type == Common.SiblingType.All) {
            var currentSibling = context.parentNode.firstChild;
            do {
                if (currentSibling == context) {
                    continue;
                }
                if (Common.IsDefined(selector)) {
                    if (currentSibling.matches(selector)) {
                        match.push(currentSibling);
                    }
                }
                else {
                    match.push(currentSibling);
                }
            } while (currentSibling = currentSibling.nextSibling)
        }
        return match;

    };

    // Retrieve an element's children, optional selector to filter
    Common.GetChildren = function (context, selector) {

        var match = [];
        if (Common.IsNotDefined(context)) {
            return match;
        }
        var allChildren = context.children;
        if (Common.IsDefined(selector) && Common.IsNotEmptyString(selector) && Common.IsDefined(match)) {
            var index = 0, length = allChildren.length;
            for ( ; index < length; index++) {
                if (allChildren[index].matches(selector)) {
                    match.push(allChildren[index]);
                }
            }
        }
        else {
            match = allChildren;
        }
        return match;

    };

    // Find an element's index relative to its sibling elements
    Common.GetIndex = function (context) {

        var index = 0;
        while (context = context.previousElementSibling) {
            index++;
        }
        return index;

    };

    // Remove an element or array of elements from the DOM, this will off all events and remove cache
    Common.Remove = function (elements, ignoreData, ignoreDelegatedData) {

        // Initialize and sanity check
        var removedChildren = []
        if (Common.IsNotDefined(elements)) {
            return removedChildren;
        }

        // Convert elements to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }

        // Loop over each element to be removed, cleanup their data and events and remove element
        var removedChild, element, childElements, index = 0, length = elements.length;
        for ( ; index < length; index++) {
            element = elements[index];
            if (ignoreData != true && element.nodeType === 1) {
                // Get all elements inside element to be removed and clean up their data and events as well
                // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
                childElements = element.getElementsByTagName('*');

                // Merge top element back in for clean up
                childElements = Common.MergeArray([element], childElements);
                Cache.CleanElementData(childElements, ignoreDelegatedData);
            }
            if (Common.IsDefined(element.parentNode)) {
                removedChild = element.parentNode.removeChild(element);
                removedChildren.push(removedChild);
            }
        }
        return removedChildren;

    };

    // Removes element or array of elements from DOM but does not clean up events or data associated with them
    Common.Detach = function (elements) {

        return Common.Remove(elements, true);

    };

    // Removes opacity from an element, mostly used to cleanup velocity animations
    Common.RemoveOpacity = function (object) {

        if (Common.IsDefined(object)) {
            if (Common.IsArray(object)) {
                object = object[0];
            }
            object.style.opacity = '';
        }

    };

    // Generates elements from a string of HTML
    Common.GenerateHTML = function (string) {

        // This function assumes a single top level element in the HTML structure.
        // I could expand it later if needed but for now its not necessary for our uses.
        var temporaryDiv = document.createElement('div');
        temporaryDiv.innerHTML = string;
        return temporaryDiv.firstChild;

    };

    // Creates a document fragment from a string of HTML
    Common.GenerateFragment = function (string) {

        var currentChild, temporaryDiv = document.createElement('div'), fragment = document.createDocumentFragment();
        temporaryDiv.innerHTML = string;
        while (currentChild = temporaryDiv.firstChild) {
            fragment.appendChild(currentChild);
        }
        return fragment;

    };

    // Inserts a string of HTML into the DOM before, after, prepended or appended to an element
    Common.InsertHTMLString = function (element, insertType, htmlString, stringParentId) {

        if (Common.IsDefined(element) && Common.IsNotEmptyString(htmlString)) {
            element.insertAdjacentHTML(insertType, htmlString);
            if (Common.IsDefined(stringParentId)) {
                return Common.Get(stringParentId);
            }
        }

    };

    // Wraps an element with a html node
    Common.Wrap = function (elements, wrapper) {

        // Convert elements to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }

        // Loops backwards to prevent having to clone the wrapper on the first element
        var index = elements.length - 1, child, element, parent, sibling;
        for ( ; index >= 0; index--) {
            child = (index > 0) ? wrapper.cloneNode(true) : wrapper;
            element = elements[index];

            // Cache the current parent and sibling.
            parent = element.parentNode;
            sibling = element.nextSibling;

            // Wrap the element which is automatically removed from its current parent).
            child.appendChild(element);

            // If no parent dont bother reinserting, probably element not in DOM yet
            if (parent) {
                // If the element had a sibling, insert the wrapper before the sibling to maintain the HTML structure else just append it to the parent.
                if (sibling) {
                    parent.insertBefore(child, sibling);
                }
                else {
                    parent.appendChild(child);
                }
            }
        }

    };

    // Unwraps an element from its parent and puts it back into DOM
    Common.Unwrap = function (elements) {

        // Convert elements to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }

        // Loop and unwrap elements
        var element, parent, index = 0, length = elements.length;
        for ( ; index < length; index++) {
            element = elements[index];

            // Get the element's parent node
            parent = element.parentNode;

            // Move all children out of the element
            while (parent.firstChild) {
                parent.parentNode.insertBefore(parent.firstChild, parent);
            }

            // Remove the empty element
            Common.Remove(parent);
        }

    };

    // Gets the passed in style for an element
    Common.GetStyle = function (element, styleName) {

        var value = null;
        if (Common.IsDefined(element)) {
            value = element.style[styleName];
            if (Common.IsNotDefined(value) || Common.IsEmptyString(value)) {
                var computedStyle = getComputedStyle(element);
                if (Common.IsDefined(computedStyle)) {
                    value = computedStyle[styleName];
                }
            }
        }
        return value;

    };

    // Retrieves an element's attribute
    Common.GetAttr = function (object, attrName) {

        var value = null;
        if (Common.IsDefined(object)) {
            value = object.getAttribute(attrName);
        }
        return value;

    };

    // Set an element's attribute
    Common.SetAttr = function (object, attrName, value) {

        if (Common.IsDefined(object)) {
            object.setAttribute(attrName, value);
        }

    };

    // Removes an element's attribute
    Common.RemoveAttr = function (object, attrName) {

        if (Common.IsDefined(object)) {
            object.removeAttribute(attrName);
        }

    };

    // Checks existence of an element's attribute
    Common.HasAttr = function (object, attrName) {

        if (Common.IsDefined(object)) {
            return object.hasAttribute(attrName);
        }
        return false;

    };

    // Checks existence of an element's class
    Common.HasClass = function (object, className) {

        if (Common.IsDefined(object)) {
            return object.classList.contains(className);
        }
        return false;

    };

    // Adds class to an element
    Common.AddClass = function (object, className) {

        if (Common.IsDefined(object)) {
            object.classList.add(className);
        }

    };

    // Adds class to an array of elements
    Common.AddClassToElements = function (objects, className) {

        var index = 0, length = objects.length;
        for ( ; index < length; index++) {
            Common.AddClass(objects[index], className);
        }

    };

    // Adds space separated list of classes to an element
    Common.AddClasses = function (object, classes) {

        var index = 0, classArray = classes.split(' '), length = classArray.length;
        for ( ; index < length; index++) {
            Common.AddClass(object, classArray[index]);
        }

    };

    // Adds space separated list of classes to an array of elements
    Common.AddClassesToElements = function (objects, classes) {

        var index = 0, length = objects.length;
        for ( ; index < length; index++) {
            Common.AddClasses(objects[index], classes);
        }

    };

    // Removes class from an element
    Common.RemoveClass = function (object, className) {

        if (Common.IsDefined(object)) {
            object.classList.remove(className);
        }

    };

    // Removes class from an array of elements
    Common.RemoveClassFromElements = function (objects, className) {

        var index = 0, length = objects.length;
        for ( ; index < length; index++) {
            Common.RemoveClass(objects[index], className);
        }

    };

    // Removes space separated list of classes from an element
    Common.RemoveClasses = function (object, classes) {

        var index = 0, classArray = classes.split(' '), length = classArray.length;
        for ( ; index < length; index++) {
            Common.RemoveClass(object, classArray[index]);
        }

    };

    // Removes space separated list of classes from an array of elements
    Common.RemoveClassesFromElements = function (objects, classes) {

        var index = 0, length = objects.length;
        for ( ; index < length; index++) {
            Common.RemoveClasses(objects[index], classes);
        }

    };

    // Adds or removes a class from an element depending on the class's presence
    Common.ToggleClass = function (object, className) {

        if (Common.IsDefined(object)) {
            object.classList.toggle(className);
        }

    };

    // Replaces one class for another on an element
    Common.SwitchClass = function (object, removeClass, addClass) {

        if (Common.IsDefined(object)) {
            Common.RemoveClass(object, removeClass);
            Common.AddClass(object, addClass);
        }

    };

    // Replaces one class for another on an array of elements
    Common.SwitchClassOnElements = function (objects, removeClass, addClass) {

        var index = 0, length = objects.length;
        for ( ; index < length; index++) {
            Common.SwitchClass(objects[index], removeClass, addClass);
        }

    };

    // Determines if an element is hidden, optional boolean to check if element is hidden by a parent
    Common.IsHidden = function (object, checkParents) {

        // Easiest check, is element hidden?
        if (object.style.display == 'none' || getComputedStyle(object).display == 'none') {
            return true;
        }

        // If element isn't hidden lets check for a hidden parent
        if (checkParents == true) {
            while (object.parentNode) {
                if (object.style.display == 'none' || getComputedStyle(object).display == 'none') {
                    return true;
                }
                object = object.parentNode;
            }
        }
        return false;

    };

    // Determines if an element is visible, optional boolean to check if element is hidden by a parent
    Common.IsVisible = function (object, checkParents) {

        return !Common.IsHidden(object, checkParents);

    };

    // Determines if an element is tabbable
    Common.IsTabbable = function (element) {

        var tabIndex = Common.GetAttr(element, 'tabindex');
        tabIndex = Common.IsDefined(tabIndex) ? tabIndex : undefined;
        var isTabIndexNaN = isNaN(tabIndex);
        return (isTabIndexNaN || tabIndex >= 0) && Common.IsFocusable(element, !isTabIndexNaN);

    };

    // Determines if an element is focusable
    Common.IsFocusable = function (element, isTabIndexNotNaN) {

        var nodeName = element.nodeName.toLowerCase();
        return (/^(input|select|textarea|button|object)$/.test(nodeName) ? !element.disabled : 'a' === nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && Common.IsVisible(element, true);

    };

    // Determines if an elements text will overflow its width
    Common.IsTextOverflowing = function (element) {

        if (Common.IsDefined(element)) {
            return (element.offsetWidth < element.scrollWidth);
        }
        else {
            return false;
        }

    };

    // Merge the contents of two or more objects together into the first object
    Common.MergeObjects = function () {

        var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

        // Handle a deep copy situation
        if (Common.IsBoolean(target)) {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (!Common.IsObject(target) && !Common.IsFunction(target)) {
            target = {};
        }

        // Extend object itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for ( ; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (Common.IsPlainObject(copy) || (copyIsArray = Common.IsArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Common.IsArray(src) ? src : [];

                        }
                        else {
                            clone = src && Common.IsPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = Common.MergeObjects(deep, clone, copy);

                    // Don't bring in undefined values
                    }
                    else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;

    };

    // Determines if an object is a plain old javascript object
    var PlainObject = {};
    var HasOwn = PlainObject.hasOwnProperty;
    var ToString = PlainObject.toString;
    Common.IsPlainObject = function (object) {

        if (Common.GetType(object) !== 'object' || object.nodeType || Common.IsWindow(object)) {
            return false;
        }
        if (object.constructor && !HasOwn.call(object.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
        return true;

    };

    // Determines if an element matches passed in type
    Common.CheckNodeType = function (element, name) {

        return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();

    };

    // Returns type of an object
    Common.GetType = function (object) {

        if (object == null) {
            return object + '';
        }

        // Support: Android < 4.0, iOS < 6 (functionish RegExp)
        return Common.IsObject(object) || Common.IsFunction(object) ? PlainObject[ToString.call(object)] || 'object' : typeof object;

    };

    // Determines if value exists in an array, optional index to start search on
    Common.IsInArray = function (value, array, fromIndex) {

        return array == null ? -1 : array.indexOf(value, fromIndex);

    };

    // Merge the contents of two arrays together into the first array, pass empty array as first argument to clone an array
    Common.MergeArray = function (first, second) {

        // Initialize
        var length = +second.length, index = 0, newLength = first.length;

        // Merge
        for ( ; index < length; index++) {
            first[newLength++] = second[index];
        }
        first.length = newLength;

        // Return
        return first;
    };

    // Filters an array based on passed in filter function returning a new array
    Common.FilterArray = function (array, filter) {

        // Go through the array, only saving the items that pass the filter function
        var matches = [], index = 0, length = array.length;
        for ( ; index < length; index++) {
            if (filter(array[index], index)) {
                matches.push(array[index]);
            }
        }
        return matches;

    };

    // Filters an array of elements based on passed in selector returning a new array
    Common.FilterElementArray = function (array, selector) {

        var match = [];
        if (Common.IsNotDefined(array)) {
            return match;
        }
        if (Common.IsDefined(selector) && Common.IsNotEmptyString(selector)) {
            var index = 0, length = array.length;
            for ( ; index < length; index++) {
                if (array[index].matches(selector)) {
                    match.push(array[index]);
                }
            }
        }
        return match;

    };

    // Filters array of elements only if they have a descendant who matches the selector, returns a new array
    Common.FilterElementsOnDescendants = function (elements, selector) {

        var match = [];
        if (Common.IsNotDefined(elements)) {
            return match;
        }
        if (Common.IsDefined(selector) && Common.IsNotEmptyString(selector)) {
            var element, targets, targetsIndex, targetCheck, targetsLength, index = 0, length = elements.length;
            for ( ; index < length; index++) {
                element = elements[index];
                targets = Common.QueryAll(selector, element);
                targetsIndex = 0, targetsLength = targets.length, targetCheck = true;
                for ( ; targetsIndex < targetsLength; targetsIndex++) {
                    if (!element.contains(targets[targetsIndex])) {
                        targetCheck = false;
                    }
                    if (targetsIndex == targetsLength - 1 && targetCheck) {
                        match.push(element);
                    }
                }
            }
        }
        return match;

    };

    // Calculates an elements height, optionally including margins (top and bottom), padding doesnt matter since we use box-sizing
    Common.Height = function (object, includeMargin) {

        var height = null;
        if (Common.IsDefined(object)) {
            if (Common.IsWindow(object)) {
                // Get window height
                height = object.document.documentElement.clientHeight;
            }
            else if (object.nodeType === 9) {
                // Get document height
                var documentElement = object.documentElement;
                var bodyElement = object.body;
                height = Math.max(bodyElement.scrollHeight, documentElement.scrollHeight, bodyElement.offsetHeight, documentElement.offsetHeight, documentElement.clientHeight);
            }
            else {
                // Get element height
                height = object.offsetHeight;
                if (height <= 0 || Common.IsNotDefined(height)) {
                    if (Common.IsHidden(object)) {
                        object.style.visibility = "hidden";
                        object.style.opacity = 0;
                        object.style.display = "block";
                        height = object.offsetHeight;
                        object.style.display = "";
                        object.style.visibility = "";
                        object.style.opacity = "";
                    }
                }
                if (includeMargin == true) {
                    var styles = getComputedStyle(object);
                    if (Common.IsDefined(styles)) {
                        var marginTop = parseFloat(styles.getPropertyValue('margin-top'));
                        var marginBottom = parseFloat(styles.getPropertyValue('margin-bottom'));
                        if (Common.IsNumeric(marginTop)) {
                            height += marginTop;
                        }
                        if (Common.IsNumeric(marginBottom)) {
                            height += marginBottom;
                        }
                    }
                }
            }
        }
        return height;

    };

    // Calculates an elements width, optionally including margins (left and right), padding doesnt matter since we use box-sizing
    Common.Width = function (object, includeMargin) {

        var width = null;
        if (Common.IsDefined(object)) {
            if (Common.IsWindow(object)) {
                // Get window width
                width = object.document.documentElement.clientWidth;
            }
            else if (object.nodeType === 9) {
                // Get document width
                var documentElement = object.documentElement;
                var bodyElement = object.body;
                width = Math.max(bodyElement.scrollWidth, documentElement.scrollWidth, bodyElement.offsetWidth, documentElement.offsetWidth, documentElement.clientWidth);
            }
            else {
                // Get element width
                width = object.offsetWidth;
                if (width <= 0 || Common.IsNotDefined(width)) {
                    if (Common.IsHidden(object)) {
                        object.style.visibility = "hidden";
                        object.style.opacity = 0;
                        object.style.display = "block";
                        width = object.offsetWidth;
                        object.style.display = "";
                        object.style.visibility = "";
                        object.style.opacity = "";
                    }
                }
                if (includeMargin == true) {
                    var styles = getComputedStyle(object);
                    if (Common.IsDefined(styles)) {
                        var marginLeft = parseFloat(styles.getPropertyValue('margin-left'));
                        var marginRight = parseFloat(styles.getPropertyValue('margin-right'));
                        if (Common.IsNumeric(marginLeft)) {
                            width += marginLeft;
                        }
                        if (Common.IsNumeric(marginRight)) {
                            width += marginRight;
                        }
                    }
                }
            }
        }
        return width;

    };

    // Get the closest ancestor element that is positioned
    Common.OffsetParent = function (object) {

        var offsetParent = object.offsetParent || document.documentElement;
        while (offsetParent && (!Common.CheckNodeType(object, 'html') && Common.GetStyle(offsetParent, 'position') === 'static')) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || document.documentElement;

    };

    // Get the current coordinates of the element relative to the document
    Common.Offset = function (object) {

        var defaultValues = {
            top: 0,
            left: 0
        };
        if (Common.IsNotDefined(object) || !Common.IsFunction(object.getBoundingClientRect)) {
            return defaultValues;
        }
        else {
            defaultValues = object.getBoundingClientRect();
        }
        return {
            top: defaultValues.top + window.pageYOffset - document.documentElement.clientTop,
            left: defaultValues.left + window.pageXOffset - document.documentElement.clientLeft
        };

    };

    // Get the current coordinates of the element relative to the offset parent
    Common.Position = function (object) {

        // Initialize
        var offset;
        var parentOffset = {
            top: 0,
            left: 0
        };

        // Fixed elements are offset from window
        if (Common.GetStyle(object, 'position') == 'fixed') {
            offset = object.getBoundingClientRect();
        }
        else {
            // Get offsetParent
            var offsetParent = object.offsetParent || document.documentElement;
            while (offsetParent && (!Common.CheckNodeType(offsetParent, 'html') && Common.GetStyle(offsetParent, 'position') == 'static')) {
                offsetParent = offsetParent.offsetParent;
            }
            offsetParent = offsetParent || document.documentElement;

            // Get offsets
            offset = Common.Offset(object);
            if (!Common.CheckNodeType(offsetParent, 'html')) {
                parentOffset = Common.Offset(offsetParent);
            }

            // Add offsetParent borders
            parentOffset.top += parseFloat(Common.GetStyle(offsetParent, 'borderTopWidth'));
            parentOffset.left += parseFloat(Common.GetStyle(offsetParent, 'borderLeftWidth'));
        }

        // Subtract parent offsets and element margins
        return {
            top: offset.top - parentOffset.top - parseFloat(Common.GetStyle(object, 'marginTop')),
            left: offset.left - parentOffset.left - parseFloat(Common.GetStyle(object, 'marginLeft'))
        };

    };

    // Remove Prefix and Underscore
    Common.RemovePrefix = function(fieldName) {

        if (Common.IsDefined(fieldName)) {
            var itemArray = fieldName.split('_');
            return itemArray[itemArray.length - 1];
        }

    };

    // Cleans up encrypted id string and removes unsafe characters (this function is one way currently, value returned is impossible to get its original value)
    Common.SanitizeToken = function (token) {

        var newToken = '';
        if (Common.IsDefined(token)) {
            var tokenArray = token.split(':');
            if (tokenArray.length == 2) {
                // Prepend with 'GTC' since HTML5 allows IDs starting with numbers but selectors do not allow it
                newToken = 'GTC' + tokenArray[1].replace(/[+]/g, '43').replace(/[=]/g, '61').replace(/[//]/g, '47');
            }
            else {
                return token;
            }
        }
        return newToken;

    };

    // Builds url path for a resource
    Common.BuildResourcePath = function (resourceValue) {

        var resourcePath = '';
        if (Common.IsDefined(resourceValue)) {
            resourcePath = resourceValue;
            var urlImage = (resourceValue.indexOf('http') == 0) ? true : false;
            if (!urlImage) {
                if (resourceValue.indexOf(':') != -1) {
                    var resourceValueArray = resourceValue.split(':');
                    var currentResource = 'common';
                    if (resourceValueArray[1] == 'Theme') {
                        currentResource = Common.GetAttr(document.body, 'data-theme').toLowerCase();
                    }
                    resourcePath = '/Content/thirdParty/' + resourceValueArray[0] + '/skins/' + currentResource + '/resources/' + resourceValueArray[2];
                }
                else {
                    var justGuid = resourceValue.substring(0, 36);
                    if (Common.IsGuid(justGuid)) {
                        resourcePath = '/DocumentFile/' + resourceValue;
                    }
                }
            }
        }
        return resourcePath;

    };

    // Check if GUID
    Common.IsGuid = function (guidValue) {

        return new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(guidValue);

    };

    // Determines if in design mode
    Common.IsPreview = function () {

        if (Common.IsFunction(window['RenderPreview']) || Common.IsFunction(window['RenderPreviewModal'])) {
            return true;
        }
        return false;

    };

    // Determines if object is window object
    Common.IsWindow = function (object) {

        return Common.IsDefined(object) && object === object.window;

    };

    // Determines if object is an object
    Common.IsObject = function (object) {

        return typeof object === 'object';

    };

    // Determines if object is a function
    Common.IsFunction = function (object) {

        return typeof object === 'function';

    };

    // Determines if object is a string
    Common.IsString = function (object) {

        return typeof object === 'string';

    };

    // Determines if object is a number
    Common.IsNumber = function (object) {

        return typeof object === 'number';

    };

    // Determines if a value is numeric
    Common.IsNumeric = function (value) {

        return !Common.IsArray(value) && (value  - parseFloat(value) + 1) >= 0;

    };

    // Determines if object is a boolean
    Common.IsBoolean = function (object) {

        return typeof object === 'boolean';

    };

    // Determines if object is an array
    Common.IsArray = function (object) {

        return Array.isArray(object);

    };

    // Determines if current context is a modal
    Common.IsModal = function () {

        return window.location != window.parent.location;

    };

    // Determines if value defined and not null
    Common.IsDefined = function (value) {

        return typeof value !== 'undefined' && value != null;

    };

    // Determines if value is undefined or null
    Common.IsNotDefined = function (value) {

        return !Common.IsDefined(value);

    };

    // Determines if object is empty
    Common.IsEmptyObject = function (object) {

        var property;
        for (property in object) {
            return false;
        }
        return true;

    };

    // Determines if element is empty
    Common.IsEmptyElement = function (element) {

        if (Common.IsDefined(element)) {
            for (element = element.firstChild; element; element = element.nextSibling) {
                if (element.nodeType < 6) {
                    return false;
                }
            }
            return true;
        }
        return false;

    };

    // Determines if string is empty
    Common.IsEmptyString = function (value) {

        return value === '';

    };

    // Determines if string is not empty
    Common.IsNotEmptyString = function (value) {

        return !Common.IsEmptyString(value);

    };


    // Polyfill if no browser support for stringEndsWith (IE is why we can't have nice things!)
    (function () {

        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function (searchString, position) {
                var subjectString = this.toString();
                if (!position || position > subjectString.length) {
                    position = subjectString.length;
                }
                position -= searchString.length;
                var lastIndex = subjectString.indexOf(searchString, position);
                return lastIndex !== -1 && lastIndex === position;
            };
        }

    }());

    // Determines if a string ends a value
    Common.StringEndsWith = function (string, search, range) {

        return string.endsWith(search, range);

    };

    // Checks if an array of values has one value that is defined and not null
    Common.IsOneDefined = function (array) {

        var isDefined = false;
        if (Common.IsDefined(array)) {
            var object, index = 0, length = array.length;
            for ( ; index < length; index++) {
                object = array[index];
                if (Common.IsDefined(object)) {
                    isDefined = true;
                    break;
                }
            }
        }
        return isDefined;

    };

    // Checks if an array of values are all defined and not null
    Common.AreAllDefined = function (array) {

        var allDefined = false;
        if (Common.IsDefined(array)) {
            var object, index = 0, length = array.length;
            for ( ; index < length; index++) {
                object = array[index];
                if (Common.IsNotDefined(object)) {
                    allDefined = false;
                    break;
                }
                allDefined = true;
            }
        }
        return allDefined;

    };

    // jQueryUI Transfer Animation using Velocity
    Common.Transfer = function (fromElement, toElement, className, duration, callback) {

        if (Common.IsNotDefined(fromElement) || Common.IsNotDefined(toElement)) {
            return;
        }

        // Initialize
        className = (Common.IsNotDefined(className)) ? '' : className;
        var isTargetFixed = Common.GetStyle(toElement, 'position') === 'fixed';
        var bodyObject = document.body;
        var fixedTop = isTargetFixed ? bodyObject.scrollTop : 0;
        var fixedLeft = isTargetFixed ? bodyObject.scrollLeft : 0;
        var endPosition = Common.Offset(toElement);
        var animation = {
            top: endPosition.top - fixedTop,
            left: endPosition.left - fixedLeft,
            height: Common.Height(toElement),
            width: Common.Width(toElement)
        };
        var startPosition = Common.Offset(fromElement);

        // Create and insert transfer element
        var transferMarkup = '<div class="gtc-transfer-effect ' + className + '" style="';
        transferMarkup += 'top:' + (startPosition.top - fixedTop) + 'px;';
        transferMarkup += 'left:' + (startPosition.left - fixedLeft) + 'px;';
        transferMarkup += 'height:' + Common.Height(fromElement) + 'px;';
        transferMarkup += 'width:' + Common.Width(fromElement) + 'px;';
        transferMarkup += 'position:' + (isTargetFixed ? 'fixed' : 'absolute') + ';';
        transferMarkup += '"></div>';
        Common.InsertHTMLString(bodyObject, Common.InsertType.Append, transferMarkup);
        var transferElement = bodyObject.lastChild;

        // Animate
        Velocity(transferElement, animation, duration, function() {
            Common.Remove(transferElement);
            if (Common.IsFunction(callback)) {
                callback();
            }
        });

    };
    // jQueryUI Transfer Animation using Velocity

    // jQueryUI Slide Hide/Show Left/Right/Up/Down Animation using Velocity
    Common.Slide = function (element, displayType, direction, duration, callback) {

        if (Common.IsNotDefined(element)) {
            return;
        }

        // Initialize
        duration = (Common.IsNotDefined(duration) ? 'slow' : duration);
        var properties = ['position', 'top', 'bottom', 'left', 'right', 'width', 'height'];
        var isShowing = (displayType == 'show');
        var positiveMotion = (direction == 'up' || direction == 'left');
        var cssValue = (direction == 'up' || direction == 'down') ? 'top' : 'left';
        var distance, animation = {};

        // Save current properties and adjust for animation
        SaveProperties(element, properties);
        if (element.style.display == 'none') {
            element.style.display = '';
        }
        if (cssValue == 'left') {
            distance = Common.Width(element, true);
        }
        else {
            distance = Common.Height(element, true);
        }

        // Wrap element
        AddWrapper(element);

        // Set element to its starting position when showing
        if (isShowing) {
            element.style[cssValue] = (positiveMotion ? (isNaN(distance) ? '-' + distance : -distance) : distance) + 'px';
        }

        // Initialize animation object with values
        animation[cssValue] = (isShowing ? (positiveMotion ? '+=' : '-=') : (positiveMotion ? '-=' : '+=')) + distance;

        // Animate
        Velocity(element, animation, {
            queue: false,
            duration: duration,
            complete: function () {
                if (displayType == 'hide') {
                    element.style.display = 'none';
                }
                RestoreProperties(element, properties);
                RemoveWrapper(element);
                if (Common.IsFunction(callback)) {
                    callback();
                }
            }
        });

    };

    Common.SlideElements = function (elements, displayType, direction, duration, callback) {

        if (Common.IsNotDefined(elements)) {
            return;
        }

        // Loop and slide
        var index = 0, length = elements.length;
        for ( ; index < length; index++) {
            Common.Slide(elements[index], displayType, direction, duration, callback);
        }

    };

    function AddWrapper (element) {

        // If the element is already wrapped, return
        if (Common.HasClass(element.parentNode, 'gtc-wrapper')) {
            return;
        }

        // Wrap the element
        var elementStyle = element.style;
        var properties = {
            width: Common.Width(element, true),
            height: Common.Height(element, true),
            'float': Common.GetStyle(element, 'float')
        };
        var wrapper = Common.Create('div', null, 'gtc-wrapper');
        var wrapperStyle = wrapper.style;
        wrapperStyle.fontSize = '100%';
        wrapperStyle.background = 'transparent';
        wrapperStyle.border = 'none';
        wrapperStyle.margin = 0;
        wrapperStyle.padding = 0;
        wrapperStyle.overflow = 'hidden';

        // Store the size in case width/height are defined in %
        var size = {
            width: Common.Width(element),
            height: Common.Height(element)
        };
        var active = document.activeElement;

        // Firefox incorrectly exposes anonymous content
        // https://bugzilla.mozilla.org/show_bug.cgi?id=561664
        try {
            active.id;
        }
        catch (e) {
            active = document.body;
        }
        Common.Wrap(element, wrapper);

        // Elements lose focus when wrapped.
        if (element === active || element.contains(active)) {
            active.focus();
        }
        wrapper = element.parentNode;

        // Transfer positioning properties to the wrapper
        if (Common.GetStyle(element, 'position') == 'static') {
            wrapperStyle.position = 'relative';
            elementStyle.position = 'relative';
        }
        else {
            Common.MergeObjects(properties, {
                position: Common.GetStyle(element, 'position'),
                zIndex: Common.GetStyle(element, 'z-index')
            });
            var directional = ['top', 'left', 'bottom', 'right'], index = 0, length = 4;
            for ( ; index < length; index++) {
                var indexValue = directional[index];
                properties[indexValue] = Common.GetStyle(element, indexValue);
                if (isNaN(parseInt(properties[indexValue], 10))) {
                    properties[indexValue] = 'auto';
                }
            }
            elementStyle.position = 'relative';
            elementStyle.top = 0;
            elementStyle.left = 0;
            elementStyle.right = 'auto';
            elementStyle.bottom = 'auto';
        }
        if (Common.IsNumeric(size.width)) {
            size.width += 'px';
        }
        elementStyle.width = size.width;
        if (Common.IsNumeric(size.height)) {
            size.height += 'px';
        }
        elementStyle.height = size.height;
        if (Common.IsDefined(properties.width)) {
            if (Common.IsNumeric(properties.width)) {
                properties.width += 'px';
            }
            wrapperStyle.width = properties.width;
        }
        if (Common.IsDefined(properties.height)) {
            if (Common.IsNumeric(properties.height)) {
                properties.height += 'px';
            }
            wrapperStyle.height = properties.height;
        }
        if (Common.IsDefined(properties.float)) {
            wrapperStyle.float = properties.float;
        }
        if (Common.IsDefined(properties.position)) {
            wrapperStyle.position = properties.position;
        }
        if (Common.IsDefined(properties.zIndex)) {
            wrapperStyle.zIndex = properties.zIndex;
        }
        if (Common.IsDefined(properties.top)) {
            if (Common.IsNumeric(properties.top)) {
                properties.top += 'px';
            }
            wrapperStyle.top = properties.top;
        }
        if (Common.IsDefined(properties.left)) {
            if (Common.IsNumeric(properties.left)) {
                properties.top += 'px';
            }
            wrapperStyle.left = properties.left;
        }
        if (Common.IsDefined(properties.right)) {
            if (Common.IsNumeric(properties.right)) {
                properties.top += 'px';
            }
            wrapperStyle.right = properties.right;
        }
        if (Common.IsDefined(properties.bottom)) {
            if (Common.IsNumeric(properties.bottom)) {
                properties.top += 'px';
            }
            wrapperStyle.bottom = properties.bottom;
        }
        wrapper.style.display = '';

    };

    function RemoveWrapper (element) {

        var active = document.activeElement;
        var wrapper = element.parentNode;
        if (Common.HasClass(wrapper, 'gtc-wrapper')) {
            wrapper.parentNode.replaceChild(element, wrapper);
            if (element === active || element.contains(active)) {
                active.focus();
            }
        }
        return element;

    };

    function SaveProperties (element, properties) {

        var index = 0, length = properties.length;
        for ( ; index < length; index++) {
            if (properties[index] !== null) {
                Cache.Set(element, 'gtc-propertystore-' + properties[index], element.style[properties[index]]);
            }
        }

    };

    function RestoreProperties (element, properties) {

        var value, index = 0, length = properties.length;
        for ( ; index < length; index++) {
            if (properties[ index ] !== null) {
                value = Cache.Get(element, 'gtc-propertystore-' + properties[index]);
                if (value === undefined) {
                    value = '';
                }
                element.style[properties[index]] = value;
                Cache.Remove(element, 'gtc-propertystore-' + properties[index]);
            }
        }

    };
    // jQueryUI Slide Hide/Show Left/Right/Up/Down Animation using Velocity

    var browserCacheData = {
        Cached: false,
        AttributeString: '',
        DataArray: []
    };
    Common.GetBrowser = function (asAttributeString) {

        if (browserCacheData.Cached === false) {
            var userAgent = navigator.userAgent;
            var agentTest = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            var version = '';
            if (/trident/i.test(agentTest[1])) {
                version = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
                browserCacheData.DataArray = ['IE', (version[1] || '')];
                browserCacheData.Cached = true;
            }
            if (browserCacheData.Cached === false && agentTest[1] === 'Chrome') {
                version = userAgent.match(/\bOPR\/(\d+)/);
                if (version != null) {
                    browserCacheData.DataArray = ['Opera', version[1]];
                    browserCacheData.Cached = true;
                }
            }
            if (browserCacheData.Cached === false) {
                agentTest = agentTest[2] ? [agentTest[1], agentTest[2]] : [navigator.appName, navigator.appVersion, '-?'];
                if ((version = userAgent.match(/version\/(\d+)/i)) != null) {
                    agentTest.splice(1, 1, version[1]);
                }
                browserCacheData.DataArray = agentTest;
                browserCacheData.Cached = true;
            }
            browserCacheData.AttributeString = ' data-browsername="' + browserCacheData.DataArray[0] + '" data-browserversion="' + browserCacheData.DataArray[1] + '"';
        }
        if (asAttributeString) {
            return browserCacheData.AttributeString;
        }
        else {
            return browserCacheData.DataArray;
        }

    };

    var BitsCache = [];
    Common.GenerateUniqueID = function () {

        if (BitsCache.length == 0) {
            var bitIndex = 0;
            for ( ; bitIndex < 256; bitIndex++) {
                BitsCache[bitIndex] = (bitIndex < 16 ? '0' : '') + bitIndex.toString(16);
            }
        }
        var generatedUniqueID = '';
        var generatedBits1 = Math.random() * 0xffffffff | 0;
        var generatedBits2 = Math.random() * 0xffffffff | 0;
        var generatedBits3 = Math.random() * 0xffffffff | 0;
        var generatedBits4 = Math.random() * 0xffffffff | 0;
        generatedUniqueID += BitsCache[generatedBits1 & 0xff] + BitsCache[generatedBits1 >> 8 & 0xff] + BitsCache[generatedBits1 >> 16 & 0xff] + BitsCache[generatedBits1 >> 24 & 0xff] + '-';
        generatedUniqueID += BitsCache[generatedBits2 & 0xff] + BitsCache[generatedBits2 >> 8 & 0xff] + '-' + BitsCache[generatedBits2 >> 16 & 0x0f | 0x40] + BitsCache[generatedBits2 >> 24 & 0xff] + '-';
        generatedUniqueID += BitsCache[generatedBits3 & 0x3f | 0x80] + BitsCache[generatedBits3 >> 8 & 0xff] + '-' + BitsCache[generatedBits3 >> 16 & 0xff] + BitsCache[generatedBits3 >> 24 & 0xff];
        generatedUniqueID += BitsCache[generatedBits4 & 0xff] + BitsCache[generatedBits4 >> 8 & 0xff] + BitsCache[generatedBits4 >> 16 & 0xff] + BitsCache[generatedBits4 >> 24 & 0xff];
        return generatedUniqueID;

    };

    // Converts a base6 string to a blob
    Common.Base64ToBlob = function (base64Data, contentType) {

        // Initialize content type, slice size and slice index
        contentType = contentType || '';
        var sliceSize = 1024;
        var sliceIndex = 0;

        // Decode base 64 string
        var byteCharacters = atob(base64Data);

        // Initialize containers and counts
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);

        // Process slices (processing data in smaller chunks increases performance)
        for ( ; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);

            // Create character for each byte of the binary data
            var bytes = new Array(end - begin);
            var offset = begin;
            var index = 0;
            for ( ; offset < end; ++index, ++offset) {
                bytes[index] = byteCharacters[offset].charCodeAt(0);
            }

            // Convert byte values into typed byte array
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }

        // Create and return new blob
        return new Blob(byteArrays, { type: contentType });

    };

    // Creates a URL from a blob and downloads the data or in IE case does something proprietary
    Common.ExecuteBlobDownload = function (blob, fileName) {

        // IE is why we can't have nice things!!
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            // Create download url from blob memory address
            var fileUrl = URL.createObjectURL(blob);

            // Create link, click, remove
            var downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            Common.Remove(downloadLink);
        }

    };

    // Handle Local Timeouts
    var timeoutId, authenticationMode, sessionTokenTimeout, timeoutRedirect;
    Common.CreateTimeout = function (time, redirect, winAuth) {

        authenticationMode = winAuth;
        sessionTokenTimeout = parseInt(time, 10) * 60000;
        timeoutRedirect = redirect;
        timeoutId = window.setTimeout(
            function () {
                LogoutTimeout();
            }, sessionTokenTimeout
        );

    };

    Common.RefreshTimeout = function () {

        if (Common.IsDefined(sessionTokenTimeout)) {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(
                function () {
                    LogoutTimeout();
                }, sessionTokenTimeout
            );
        }

    };

    function LogoutTimeout () {

        Common.Remove(Common.FilterElementArray(document.body.children, 'div'));
        if (authenticationMode == 'Windows') {
            var requestObject = new XMLHttpRequest();
            requestObject.open('POST', '/Base/Logoff', true, 'GTCInvalidUser', 'GTCInvalidPassword');
            requestObject.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            requestObject.onload = function () {
                window.location = timeoutRedirect;
            };
            requestObject.onerror = function () {
                window.location = timeoutRedirect;
            };
            requestObject.send();
        }
        else {
            window.location = timeoutRedirect;
        }

    };
    // Handle Local Timeouts

    // Initialize
    document.addEventListener('DOMContentLoaded',
        function () {
            document.removeEventListener('DOMContentLoaded', arguments.callee);
            window.onerror = function (message, url, line) {
                var currentContext = Common.GetStorage('CurrentContext');
                var errorMessage = {
                    Type: -1,
                    Title: null,
                    Body: null
                };
                Modals.ShowMessageDialog(errorMessage,
                    function (modalResult) {
                        if (currentContext && currentContext.toLowerCase().indexOf('modal') != -1) {
                            parent.location.reload();
                        }
                        else {
                            parent.history.back();
                        }
                    }
                );

                // Cleanup Breadcrumb
                var breadcrumbNamespace = window['Breadcrumb'];
                if (Common.IsDefined(breadcrumbNamespace)) {
                    breadcrumbNamespace.PopBreadcrumbData();
                }

                // Cleanup pinwheels
                Common.Remove(Common.QueryAll('.gtc-pinwheel, .gtc-pinwheel-overlay', null, true));
                Common.Remove(Common.QueryAll('.gtc-pinwheel, .gtc-pinwheel-overlay'));
            };
        }
    );

} (window.Common = window.Common || {}, Velocity, window, document));
