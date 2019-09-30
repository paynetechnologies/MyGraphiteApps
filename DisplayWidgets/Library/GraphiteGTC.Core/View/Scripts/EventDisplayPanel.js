// Event Display Panel
// Based On: EventDisplayPanel -> DisplayPanel -> ViewElement
(function (EventDisplayPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    EventDisplayPanel.Render = function (eventDisplayPanel) {

        // Build class name
        var className = ' gtc-displaypanel-stacked';
        if (eventDisplayPanel.DisplayNoItems == 'Yes') {
            className += ' gtc-displaypanel-displaynoitems';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var eventDisplayPanelMarkup = '<div data-namespace="EventDisplayPanel" class="gtc-displaypanel' + className + '"' + ViewElement.RenderAttributes(eventDisplayPanel);

        // Can do stuff?
        var canProperties = {
            CanDelete: eventDisplayPanel.CanDelete,
            CanUndo: eventDisplayPanel.CanUndo,
            CanRecycle: eventDisplayPanel.CanRecycle,
            CanEdit: eventDisplayPanel.CanEdit,
            CanProcess: eventDisplayPanel.CanProcess,
            CanViewResults: eventDisplayPanel.CanViewResults
        };
        eventDisplayPanelMarkup += ' data-canproperties=\'' + JSON.stringify(canProperties) + '\'';

        // Div>
        eventDisplayPanelMarkup += '>';

        // Header Area
        eventDisplayPanelMarkup += '<div class="gtc-displaypanel-header">';

        // H2<>, Title, H2</>
        if (Common.IsDefined(eventDisplayPanel.Title)) {
            eventDisplayPanelMarkup += '<h2 id="' + eventDisplayPanel.Name + 'Title" class="gtc-displaypanel-title gtc-page-theme-color"';

            // Translations
            eventDisplayPanelMarkup += ' data-translate="' + eventDisplayPanel.Title + '"';
            eventDisplayPanelMarkup += '>' + Common.TranslateKey(eventDisplayPanel.Title) + '</h2>';
        }

        // Links
        if (Common.IsDefined(eventDisplayPanel.Links) && eventDisplayPanel.Links.length > 0) {
            eventDisplayPanelMarkup += '<div class="gtc-displaypanel-links">';

            // Links
            var link, index = 0, length = eventDisplayPanel.Links.length;
            for ( ; index < length; index++) {
                link = eventDisplayPanel.Links[index];

                // Id?
                if (Common.IsDefined(eventDisplayPanel.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(eventDisplayPanel.Id);
                }

                // Li<>, Anchor, Li</>
                eventDisplayPanelMarkup += Link.Render(link);
            }
            eventDisplayPanelMarkup += '</div>';
        }

        // Close Header Area
        eventDisplayPanelMarkup += '</div>';

        // Display details container
        eventDisplayPanelMarkup += '<div id="' + eventDisplayPanel.Name + '-container" class="gtc-displaypanel-body">';

        // Display Details
        if (Common.IsDefined(eventDisplayPanel.DisplayDetails) && eventDisplayPanel.DisplayDetails.length > 0) {
            var displayDetailCount = eventDisplayPanel.DisplayDetails.length;

            // Display Details
            var displayDetail, displayDetailIndex = 0;
            for ( ; displayDetailIndex < displayDetailCount; displayDetailIndex++) {
                displayDetail = eventDisplayPanel.DisplayDetails[displayDetailIndex];
                eventDisplayPanelMarkup += EventDisplayDetail.Render(displayDetail, canProperties);
            }
        }
        else if (eventDisplayPanel.DisplayNoItems == 'Yes') {
            eventDisplayPanelMarkup += NoItemsToDisplay();
        }

        // Div</>, Div</>
        eventDisplayPanelMarkup += '</div></div>';
        return eventDisplayPanelMarkup;

    };

    EventDisplayPanel.ShowPinwheel = function (displayPanel) {

        Common.ShowPinwheel(null, false, true);

    };

    EventDisplayPanel.HidePinwheel = function (displayPanel) {

        Common.HidePinwheel();

    };

    EventDisplayPanel.UpdateTitle = function (displayPanel, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Get(displayPanel.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(displayPanel)) {
            updateTitleFunction();
        }
        else {
            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Animate
            Velocity(title, { 'opacity': 0 }, 'slow',
                function () {
                    updateTitleFunction();
                    Velocity(title, 'reverse',
                        function () {
                            Common.RemoveOpacity(title);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    EventDisplayPanel.ReplaceContent = function (displayPanel, viewElements, promises) {

        // Get Event Panel body
        var body = Common.Query('.gtc-displaypanel-body', displayPanel);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        // INFO: Only remove delegated events from content that is being replaced, e.g. not the panel links!
        Cache.CleanDelegatedElementsData(body);

        // Get a promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Replace content
        var panelChildren = Common.QueryAll('.gtc-eventdisplaydetail', body);
        if (panelChildren.length > 0) {
            Velocity(panelChildren, 'slideUp', 'slow').then(
                function (event) {
                    ReplaceDisplayDetails(displayPanel, body, viewElements, promises, animationHidePromise);
                }
            );
        }
        else {
            ReplaceDisplayDetails(displayPanel, body, viewElements, promises, animationHidePromise);
        }

    };

    EventDisplayPanel.AppendContent = function (displayPanel, viewElements) {

        // Get Event Panel body
        var body = Common.Query('.gtc-displaypanel-body', displayPanel);

        // Build Content
        var displayPanelMarkup = BuildContent(displayPanel, viewElements);

        // Append
        Common.InsertHTMLString(body, Common.InsertType.Append, displayPanelMarkup);
        Common.RetranslatePage();
        var panelChildren = Common.QueryAll('.gtc-eventdisplaydetail', body);
        Velocity(panelChildren, 'slideDown', 'slow');

    };

    EventDisplayPanel.PrependContent = function (displayPanel, viewElements) {

        // Get Event Panel body
        var body = Common.Query('.gtc-displaypanel-body', displayPanel);

        // Build Content
        var displayPanelMarkup = BuildContent(displayPanel, viewElements);

        // Prepend
        Common.InsertHTMLString(body, Common.InsertType.Prepend, displayPanelMarkup);
        Common.RetranslatePage();
        var panelChildren = Common.QueryAll('.gtc-eventdisplaydetail', body);
        Velocity(panelChildren, 'slideDown', 'slow');

    };

    EventDisplayPanel.RemoveContent = function (displayPanel, viewElements, promises) {

        var displayDetail, index = 0, length;
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            length = viewElements.length;
            for ( ; index < length; index++) {
                displayDetail = viewElements[index];
                var displayDetailId = displayDetail.Name;
                if (Common.IsDefined(displayDetail.Id)) {
                    displayDetailId += Common.SanitizeToken(displayDetail.Id);
                }
                EventDisplayDetail.RemoveElement(Common.Query('#' + displayDetailId, displayPanel), promises);
            }
        }
        else {
            var displayDetails = Common.QueryAll('.gtc-eventdisplaydetail', displayPanel);
            length = displayDetails.length;
            for ( ; index < length; index++) {
                displayDetail = displayDetails[index];
                EventDisplayDetail.RemoveElement(displayDetail, promises);
            }
        }

    };

    EventDisplayPanel.UpdateDisplayNoItems = function (displayPanel, promises, context) {

        if (Common.HasClass(displayPanel, 'gtc-displaypanel-displaynoitems') && Common.QueryAll('.gtc-eventdisplaydetail', displayPanel).length == 0) {
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Get Display Panel body
            var body = Common.Query('.gtc-displaypanel-body', displayPanel);

            // Build and insert no items to display
            var displayPanelMarkup = NoItemsToDisplay(true);
            Common.InsertHTMLString(body, Common.InsertType.Append, displayPanelMarkup);
            Velocity(Common.Query('.gtc-eventdisplaydetail-noitems', displayPanel), 'slideDown', 'slow',
                function () {
                    animationPromise.resolve();
                }
            );
            Common.RetranslatePage();
        }

    };

    // Private Methods
    function ReplaceDisplayDetails (displayPanel, body, viewElements, promises, animationHidePromise) {

        // Remove all display details
        var displayDetails = Common.QueryAll('.gtc-eventdisplaydetail', displayPanel);
        Common.Remove(displayDetails);

        // Get panel Id
        var panelId = displayPanel.id;
        var canProperties = JSON.parse(Common.GetAttr(displayPanel, 'data-canproperties'));

        // Render new display details and append
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            var displayDetail, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                displayDetail = viewElements[index];
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                displayDetail.IsDisplayed = 'No';
                var displayPanelMarkup = EventDisplayDetail.Render(displayDetail, canProperties);
                var insertedMarkup = Common.InsertHTMLString(body, Common.InsertType.Append, displayPanelMarkup, displayDetail.Name);

                // For loops have no scope! Give it some. (IIFE)
                (function (insertedMarkup, animationPromise) {

                    Velocity(insertedMarkup, 'slideDown', 'slow',
                        function () {
                            animationPromise.resolve();
                        }
                    );

                }(insertedMarkup, animationPromise));
            }
            animationHidePromise.resolve();
            Common.RetranslatePage();
        }
        else {
            if (Common.HasClass(displayPanel, 'gtc-displaypanel-displaynoitems')) {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var displayPanelMarkup = NoItemsToDisplay(true);
                Common.InsertHTMLString(body, Common.InsertType.Append, displayPanelMarkup);
                var insertedMarkup = body.lastChild;
                Velocity(insertedMarkup, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );
            }
            Common.RetranslatePage();
            animationHidePromise.resolve();
        }

    };

    function BuildContent (displayPanel, viewElements) {

        // Remove no items if it exists
        var noItemsDetail = Common.Query('.gtc-eventdisplaydetail-noitems', displayPanel);
        if (Common.IsDefined(noItemsDetail)) {
            Velocity(noItemsDetail, 'slideUp', 'slow',
                function () {
                    Common.Remove(noItemsDetail);
                }
            );
        }

        // Can Properties
        var canProperties = JSON.parse(Common.GetAttr(displayPanel, 'data-canproperties'));

        // Build Markup
        var displayPanelMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var displayDetail, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                displayDetail = viewElements[index];
                displayDetail.IsDisplayed = 'No';
                displayPanelMarkup += EventDisplayDetail.Render(displayDetail, canProperties);
            }
        }
        return displayPanelMarkup;

    };

    function NoItemsToDisplay (isHidden) {

        var hiddenStyle = '';
        if (isHidden == true) {
            hiddenStyle = ' style="display: none;"';
        }
        return '<div class="gtc-eventdisplaydetail gtc-eventdisplaydetail-noitems"' + hiddenStyle + '><p data-translate="NoItemsToDisplay">' + Common.TranslateKey('NoItemsToDisplay') + '</p></div>';

    };

} (window.EventDisplayPanel = window.EventDisplayPanel || {}, window, document, Common, Cache, Events, Velocity));
