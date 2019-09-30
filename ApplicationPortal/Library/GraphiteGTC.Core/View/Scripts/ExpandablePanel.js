// Expandable Panel
// Based On: ExpandablePanel -> ViewElement
(function (ExpandablePanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ExpandablePanel.Render = function (expandablePanel) {

        // Build class name
        var className = '';
        if (expandablePanel.StackExpandableDisplays == 'Yes') {
            className += ' gtc-expandablepanel-stacked';
        }
        if (expandablePanel.DisplayNoItems == 'Yes') {
            className += ' gtc-expandablepanel-displaynoitems';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var expandablePanelMarkup = '<div data-namespace="ExpandablePanel" class="gtc-expandablepanel' + className + '"' + ViewElement.RenderAttributes(expandablePanel);

        // Div<>
        expandablePanelMarkup += '><div class="gtc-expandablepanel-titlebar">';

        // H2<>, Title, H2</>
        if (Common.IsDefined(expandablePanel.Title)) {
            expandablePanelMarkup += '<h2 id="' + expandablePanel.Name + 'Title" class="gtc-page-theme-color"';

            // Translations
            expandablePanelMarkup += ' data-translate="' + expandablePanel.Title + '"';
            expandablePanelMarkup += '>' + Common.TranslateKey(expandablePanel.Title) + '</h2>';
        }

        // Links
        if (Common.IsDefined(expandablePanel.Links) && expandablePanel.Links.length > 0) {

            // Links
            var link, index = 0, length = expandablePanel.Links.length;
            for ( ; index < length; index++) {
                link = expandablePanel.Links[index];

                // Id?
                if (Common.IsDefined(expandablePanel.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(expandablePanel.Id);
                }

                // Li<>, Anchor, Li</>
                expandablePanelMarkup += Link.Render(link);
            }
        }
        expandablePanelMarkup += '</div>';

        // Expandable Displays
        if (Common.IsDefined(expandablePanel.ExpandableDisplays) && expandablePanel.ExpandableDisplays.length > 0) {
            // Expandable Displays
            var expandableDisplay, index = 0, length = expandablePanel.ExpandableDisplays.length;
            for ( ; index < length; index++) {
                expandableDisplay = expandablePanel.ExpandableDisplays[index];
                var namespace = window[expandableDisplay.Type.toString()];
                expandablePanelMarkup += namespace.Render(expandableDisplay);
            }
        }
        else if (expandablePanel.DisplayNoItems == 'Yes') {
            expandablePanelMarkup += NoItemsToDisplay();
        }

        // Div</>
        expandablePanelMarkup += '</div>';
        return expandablePanelMarkup;

    };

    ExpandablePanel.UpdateTitle = function (expandablePanel, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Get(expandablePanel.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(expandablePanel)) {
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
                    Velocity(title, { 'opacity': 1 }, 'slow',
                        function () {
                            title.style.opacity = '';
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    ExpandablePanel.AppendContent = function (expandablePanel, viewElements) {

        // Build Content
        var displayPanelMarkup = BuildContent(expandablePanel, viewElements);

        // Append
        Common.InsertHTMLString(expandablePanel, Common.InsertType.Append, displayPanelMarkup);
        Common.RetranslatePage();
        var panelChildren = Common.QueryAll('.gtc-expandabledisplay', expandablePanel);
        Velocity(panelChildren, 'slideDown', 'slow');

    };

    ExpandablePanel.PrependContent = function (expandablePanel, viewElements) {

        // Build Content
        var displayPanelMarkup = BuildContent(expandablePanel, viewElements);

        // Prepend
        var title = Common.Query('.gtc-expandablepanel-titlebar', expandablePanel);
        if (Common.IsDefined(title)) {
            Common.InsertHTMLString(title, Common.InsertType.After, displayPanelMarkup);
        }
        else {
            Common.InsertHTMLString(expandablePanel, Common.InsertType.Prepend, displayPanelMarkup);
        }
        Common.RetranslatePage();
        var panelChildren = Common.QueryAll('.gtc-expandabledisplay', expandablePanel);
        Velocity(panelChildren, 'slideDown', 'slow');

    };

    ExpandablePanel.RemoveContent = function (expandablePanel, viewElements, promises) {

        var expandableDisplay, index = 0, length;
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            length = viewElements.length;
            for ( ; index < length; index++) {
                expandableDisplay = viewElements[index];
                var expandableDisplayId = expandableDisplay.Name;
                if (Common.IsDefined(expandableDisplay.Id)) {
                    expandableDisplayId += Common.SanitizeToken(expandableDisplay.Id);
                }
                ExpandableDisplay.RemoveElement(Common.Query('#' + expandableDisplayId, expandablePanel), promises);
            }
        }
        else {
            var expandableDisplays = Common.QueryAll('.gtc-expandabledisplay', expandablePanel);
            length = expandableDisplays.length;
            for ( ; index < length; index++) {
                expandableDisplay = expandableDisplays[index];
                ExpandableDisplay.RemoveElement(expandableDisplay, promises);
            }
        }

    };

    ExpandablePanel.UpdateDisplayNoItems = function (expandablePanel, promises, context) {

        if (Common.HasClass(expandablePanel, 'gtc-expandablepanel-displaynoitems') && Common.QueryAll('.gtc-expandabledisplay', expandablePanel).length == 0) {
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Build and insert no items to display
            var expandablePanelMarkup = NoItemsToDisplay(true);
            Common.InsertHTMLString(expandablePanel, Common.InsertType.Append, expandablePanelMarkup);
            Velocity(Common.Query('.gtc-displaydetail-noitems', expandablePanel), 'slideDown', 'slow',
                function () {
                    animationPromise.resolve();
                }
            );
            Common.RetranslatePage();
        }

    };

    ExpandablePanel.ReplaceContent = function (expandablePanel, viewElements, promises) {

        // Remove delegated events from expandable children before building HTML which will attach delegated events with same id!
        var expandableChildren = Common.QueryAll('.gtc-expandabledisplay, .gtc-displaydetail-noitems', expandablePanel);
        if( expandableChildren.length > 0 ) {
            var expandableChild, childIndex = 0;
            for ( ; (expandableChild = expandableChildren[childIndex]) !== undefined; childIndex++) {
                Cache.CleanDelegatedElementsData(expandableChild);
            }
        }

        // Get promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Replace content
        if (expandableChildren.length > 0) {
            // TODO: Find a way to use promises without jQuery and support IE
            Velocity(expandableChildren, 'slideUp', 'slow').then(
                function (event) {
                    ReplaceExpandableDisplays(expandablePanel, viewElements, promises, animationHidePromise);
                }
            );
        }
        else {
            ReplaceExpandableDisplays(expandablePanel, viewElements, promises, animationHidePromise);
        }

    };

    // Private Methods
    function ReplaceExpandableDisplays (expandablePanel, viewElements, promises, animationHidePromise) {

        // Remove all display details
        var expandableChildren = Common.QueryAll('.gtc-expandabledisplay, .gtc-displaydetail-noitems', expandablePanel);
        Common.Remove(expandableChildren);

        // Get panel Id
        var panelId = expandablePanel.id;

        // Render new display details and append
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            var expandableDisplay, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                expandableDisplay = viewElements[index];
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var expandableDisplayNamespace = window[expandableDisplay.Type.toString()];
                expandableDisplay.IsDisplayed = 'No';
                var expandablePanelMarkup = expandableDisplayNamespace.Render(expandableDisplay);
                var insertedMarkup = Common.InsertHTMLString(expandablePanel, Common.InsertType.Append, expandablePanelMarkup, expandableDisplay.Name);

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
            if (Common.HasClass(expandablePanel, 'gtc-expandablepanel-displaynoitems')) {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var expandablePanelMarkup = NoItemsToDisplay(true);
                Common.InsertHTMLString(expandablePanel, Common.InsertType.Append, expandablePanelMarkup);
                var insertedMarkup = displayPanel.lastChild;
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

    function NoItemsToDisplay (isHidden) {

        var hiddenStyle = '';
        if (isHidden == true) {
            hiddenStyle = ' style="display: none;"';
        }
        return '<div class="gtc-displaydetail gtc-displaydetail-noitems"' + hiddenStyle + '><p data-translate="NoItemsToDisplay">' + Common.TranslateKey('NoItemsToDisplay') + '</p></div>';

    };

    function BuildContent (expandablePanel, viewElements) {

        // Remove no items if it exists
        var noItemsDetail = Common.Query('.gtc-displaydetail-noitems', expandablePanel);
        if (Common.IsDefined(noItemsDetail)) {
            Velocity(noItemsDetail, 'slideUp', 'slow',
                function () {
                    Common.Remove(noItemsDetail);
                }
            );
        }

        // Build Markup
        var expandablePanelMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var expandableDisplay, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                expandableDisplay = viewElements[index];
                expandableDisplay.IsDisplayed = 'No';
                var namespace = window[expandableDisplay.Type.toString()];
                expandablePanelMarkup += namespace.Render(expandableDisplay);
            }
        }
        return expandablePanelMarkup;

    };

} (window.ExpandablePanel = window.ExpandablePanel || {}, window, document, Common, Cache, Events, Velocity));
