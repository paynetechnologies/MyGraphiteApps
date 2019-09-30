// MultiSelect Panel
// Based On: MultiSelectPanel -> DisplayPanel -> ViewElement
(function (MultiSelectPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    MultiSelectPanel.Render = function (multiSelectPanel) {

        // Build class name
        var className = '';
        if (multiSelectPanel.StackDisplayDetails == 'Yes') {
            className += ' gtc-multiselectpanel-stacked';
        }
        if (multiSelectPanel.DisplayNoItems == 'Yes') {
            className += ' gtc-multiselectpanel-displaynoitems';
        }
        if (multiSelectPanel.IsLocked == 'Yes') {
            className += ' gtc-multiselectpanel-locked';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var multiSelectPanelMarkup = '<div data-serializable data-namespace="MultiSelectPanel" class="gtc-multiselectpanel' + className + '"' + ViewElement.RenderAttributes(multiSelectPanel);

        // List Name
        if (Common.IsDefined(multiSelectPanel.ListName)) {
            multiSelectPanelMarkup += ' data-listname="' + multiSelectPanel.ListName + '"';
        }

        // Has height?
        if (Common.IsDefined(multiSelectPanel.Dimension) && Common.IsDefined(multiSelectPanel.Dimension.Height)) {
            multiSelectPanelMarkup += ' data-hasheight="Yes"';
        }

        // Locked Message?
        if (Common.IsDefined(multiSelectPanel.LockedMessage) && Common.IsNotEmptyString(multiSelectPanel.LockedMessage)) {
            multiSelectPanelMarkup += ' data-lockedmessage="' + multiSelectPanel.LockedMessage + '"';
        }

        // Div>
        multiSelectPanelMarkup += '>';

        // Header Area
        multiSelectPanelMarkup += '<div class="gtc-multiselectpanel-header">';

        // H2<>, Title, H2</>
        if (Common.IsDefined(multiSelectPanel.Title)) {
            multiSelectPanelMarkup += '<h2 id="' + multiSelectPanel.Name + 'Title" class="gtc-page-theme-color"';

            // Translations
            multiSelectPanelMarkup += ' data-translate="' + multiSelectPanel.Title + '"';
            multiSelectPanelMarkup += '>' + Common.TranslateKey(multiSelectPanel.Title) + '</h2>';
        }

        // Links Div
        var hasSelectAll = multiSelectPanel.DisplaySelectAll == 'Yes';
        var hasLinks = Common.IsDefined(multiSelectPanel.Links) && multiSelectPanel.Links.length > 0;
        if (hasSelectAll || hasLinks) {
            multiSelectPanelMarkup += '<div class="gtc-multiselectpanel-links">';
        }

        // Select All Button
        if (hasSelectAll) {
            var hideSelectAllClass = '';
            if (Common.IsNotDefined(multiSelectPanel.DisplayDetails) || multiSelectPanel.DisplayDetails.length == 0 || multiSelectPanel.IsLocked == 'Yes') {
                hideSelectAllClass = ' style="display:none;"';
            }
            multiSelectPanelMarkup += '<a data-namespace="Button" class="gtc-multiselectpanel-selectall"' + hideSelectAllClass + ' id="' + multiSelectPanel.Name + 'SelectAllButton"><i class="gtc-icon-styles fa fa-square-o"></i><span data-translate="SelectAll">' + Common.TranslateKey('SelectAll') + '</span></a>';
        }

        // Dimension
        var dimensionStyleClass = '';
        if (Common.IsDefined(multiSelectPanel.Dimension)) {
            dimensionStyleClass = 'gtc-multiselectpanel-' + multiSelectPanel.Name.toLowerCase();
            multiSelectPanelMarkup += '<style>.' + dimensionStyleClass + ' {';
            var dimensionStyle = StyleHelper.BuildDimensionStyle(multiSelectPanel.Dimension);
            if (Common.IsDefined(dimensionStyle.Height)) {
                multiSelectPanelMarkup += 'height:' + dimensionStyle.Height;
            }
            multiSelectPanelMarkup += '}</style>';
            dimensionStyleClass = ' ' + dimensionStyleClass;
        }

        // Links
        if (hasLinks) {
            // Render Links
            var link, index = 0, length = multiSelectPanel.Links.length;
            for (; index < length; index++) {
                link = multiSelectPanel.Links[index];

                // Id?
                if (Common.IsDefined(multiSelectPanel.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(multiSelectPanel.Id);
                }

                // Li<>, Anchor, Li</>
                multiSelectPanelMarkup += Link.Render(link);
            }
        }

        // Close Links Div
        if (hasSelectAll || hasLinks) {
            multiSelectPanelMarkup += '</div>';
        }

        // Close Header Area
        multiSelectPanelMarkup += '</div>';

        // Scroll Target
        multiSelectPanelMarkup += '<div id="' + multiSelectPanel.Name + 'ScrollTarget" class="gtc-multiselectpanel-body gtc-scrolltarget gtc-cfscroll-y' + dimensionStyleClass + '">';

        // Is Locked?
        if (multiSelectPanel.IsLocked == 'Yes') {
            var message = (Common.IsDefined(multiSelectPanel.LockedMessage)) ? multiSelectPanel.LockedMessage : '';
            multiSelectPanelMarkup += '<div id="' + multiSelectPanel.Name + 'Locked" class="gtc-multiselectpanel-lockedoverlay">';
            multiSelectPanelMarkup += '<span data-translate="' + message + '">' + Common.TranslateKey(message) + '</span>';
            multiSelectPanelMarkup += '</div>';
        }

        // Display Details
        if (Common.IsDefined(multiSelectPanel.DisplayDetails) && multiSelectPanel.DisplayDetails.length > 0) {
            // Initialize
            var displayDetailCount = multiSelectPanel.DisplayDetails.length;

            // Display Details
            var displayDetail, displayDetailIndex = 0;
            for (; displayDetailIndex < displayDetailCount; displayDetailIndex++) {
                displayDetail = multiSelectPanel.DisplayDetails[displayDetailIndex];
                var displayDetailNamespace = window[displayDetail.Type.toString()];
                multiSelectPanelMarkup += displayDetailNamespace.Render(displayDetail);
            }
        }
        else if (multiSelectPanel.DisplayNoItems == 'Yes') {
            multiSelectPanelMarkup += NoItemsToDisplay();
        }

        // Div</>, Div</>
        multiSelectPanelMarkup += '</div></div>';
        return multiSelectPanelMarkup;

    };

    MultiSelectPanel.SerializeArray = function (element) {

        var uiParameters = {
            Name: Common.GetAttr(element, 'data-listname'),
            Value: null,
            UiParameters: []
        };
        var selectedDetails = Widgets.multiselect(element, 'GetSelected');
        if (selectedDetails.length > 0) {
            var selectedDetail, index = 0, length = selectedDetails.length;
            for (; index < length; index++) {
                selectedDetail = selectedDetails[index];
                var selectDetailParent = selectedDetail.parentNode;

                // View Model / Entity UiParameter
                var viewModel = JSON.parse(Common.GetAttr(selectDetailParent, 'data-viewmodel'));
                var viewModelId = null;
                if (Common.IsDefined(viewModel.Value) && Common.IsNotEmptyString(viewModel.Value)) {
                    viewModelId = viewModel.Value;
                }
                entityUiParameter = {
                    Name: viewModel.Name,
                    Value: null,
                    UiParameters: null
                };

                // Build Entity UiParameter
                var entityName = Common.GetAttr(selectedDetail, "data-entityname")
                if (entityName == "Text") {
                    entityUiParameter.Value = viewModelId;
                }
                else {
                    // Id
                    var propertiesUiParameters = [];
                    propertiesUiParameters.push(
                        {
                            Name: 'Id',
                            Value: viewModelId,
                            UiParameters: null
                        }
                    );

                    // Ui Parameters
                    var extraUiParameters = JSON.parse(Common.GetAttr(selectDetailParent, 'data-uiparameters'));
                    if (Common.IsDefined(extraUiParameters)) {
                        var uiParameter, extraUiParametersIndex = 0, extraUiParametersLength = extraUiParameters.length;
                        for (; extraUiParametersIndex < extraUiParametersLength; extraUiParametersIndex++) {
                            uiParameter = extraUiParameters[extraUiParametersIndex];
                            propertiesUiParameters.push(
                                {
                                    Name: uiParameter.Name,
                                    Value: uiParameter.Value,
                                    UiParameters: null
                                }
                            );
                        }
                    }
                    entityUiParameter.UiParameters = propertiesUiParameters;
                }
                uiParameters.UiParameters.push(entityUiParameter);
            }
        }
        return uiParameters;

    };

    MultiSelectPanel.UpdateValues = function (multiSelectPanel, uiParameters) {

        // Remove all selected
        var multiSelectDetails = Common.QueryAll('.gtc-multiselectdetail', multiSelectPanel);
        var index = 0, length = multiSelectDetails.length;
        for (; index < length; index++) {
            Common.RemoveClass(Common.Query('.gtc-multiselectdetail-body', multiSelectDetails[index]), 'gtc-ui-selected');
        }

        // Set Checks
        if (Common.IsDefined(uiParameters)) {
            var multiSelectDetail, uiParameter, index = 0, length = uiParameters.length;
            for (; index < length; index++) {
                uiParameter = uiParameters[index];
                multiSelectDetail = Common.Query('[data-selectableid=' + Common.SanitizeToken(uiParameter.Name) + ']', multiSelectPanel);
                if (uiParameter.Value == 'Yes') {
                    Common.AddClass(Common.Query('.gtc-multiselectdetail-body', multiSelectDetail), 'gtc-ui-selected');
                }
            }
            Widgets.multiselect(multiSelectPanel, 'UpdateSelected');
        }

    };

    MultiSelectPanel.Lock = function (multiSelectPanel) {

        if (!Common.HasClass(multiSelectPanel, 'gtc-multiselectpanel-locked')) {
            var panelId = multiSelectPanel.id;
            Common.AddClass(multiSelectPanel, 'gtc-multiselectpanel-locked');
            var lockedMessage = Common.GetAttr(multiSelectPanel, 'data-lockedmessage');
            lockedMessage = (Common.IsDefined(lockedMessage)) ? lockedMessage : '';
            var htmlToInsert = '<div id="' + panelId + 'Locked" class="gtc-multiselectpanel-lockedoverlay">';
            htmlToInsert += '<span data-translate="' + lockedMessage + '">' + Common.TranslateKey(lockedMessage) + '</span>';
            htmlToInsert += '</div>';
            var scrollTarget = Common.Query('#' + panelId + 'ScrollTarget', multiSelectPanel);
            Common.InsertHTMLString(scrollTarget, Common.InsertType.Prepend, htmlToInsert);
            var insertedHtml = scrollTarget.firstChild;
            Velocity(insertedHtml, 'fadeIn', 'slow');

            // Update SelectAll button
            var selectAllButton = Common.Get(panelId + 'SelectAllButton');
            if (Common.IsDefined(selectAllButton) && Common.IsVisible(selectAllButton)) {
                Velocity(selectAllButton, 'fadeOut', 'slow');
            }
        }

    };

    MultiSelectPanel.Unlock = function (multiSelectPanel) {

        if (Common.HasClass(multiSelectPanel, 'gtc-multiselectpanel-locked')) {
            var panelId = multiSelectPanel.id;
            Common.RemoveClass(multiSelectPanel, 'gtc-multiselectpanel-locked');
            Velocity(Common.Query('#' + panelId + 'Locked', multiSelectPanel), 'fadeOut', 'slow',
                function () {
                    Common.Remove(this[0]);
                }
            );

            // Update SelectAll button
            var selectAllButton = Common.Get(panelId + 'SelectAllButton');
            if (Common.IsDefined(selectAllButton) && Common.IsHidden(selectAllButton)) {
                Velocity(selectAllButton, 'fadeIn', 'slow');
            }
        }

    };

    MultiSelectPanel.UpdateTitle = function (multiSelectPanel, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Get(multiSelectPanel.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(multiSelectPanel)) {
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

    MultiSelectPanel.ReplaceContent = function (multiSelectPanel, viewElements, promises) {

        // Remove events
        if (Common.IsDefined(Cache.Get(multiSelectPanel, 'gtc-multiselect'))) {
            Widgets.multiselect(multiSelectPanel, 'destroy');
        }

        // Get content
        var scrollTarget = Common.Query('#' + multiSelectPanel.id + 'ScrollTarget', multiSelectPanel);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        // INFO: Only remove delegated events from content that is being replaced, e.g. not the panel links!
        Cache.CleanDelegatedElementsData(scrollTarget);

        // Get promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Replace content
        var multiSelectDetails = Common.QueryAll('.gtc-multiselectdetail', scrollTarget);
        if (multiSelectDetails.length > 0) {
            Velocity(multiSelectDetails, 'slideUp', 'slow').then(
                function (event) {
                    ReplaceDisplayDetails(multiSelectPanel, viewElements, promises, animationHidePromise);
                }
            );
        }
        else {
            ReplaceDisplayDetails(multiSelectPanel, viewElements, promises, animationHidePromise);
        }

    };

    MultiSelectPanel.AppendContent = function (multiSelectPanel, viewElements) {

        // Build Content
        var displayPanelMarkup = BuildContent(multiSelectPanel, viewElements);

        // Append
        var scrollTarget = Common.Query('.gtc-scrolltarget', multiSelectPanel);
        Common.InsertHTMLString(scrollTarget, Common.InsertType.Append, displayPanelMarkup);
        Widgets.multiselect(multiSelectPanel, 'IntializeNewDetails');
        Common.RetranslatePage();
        var hiddenMultiSelectDetails = Common.QueryAllHidden('.gtc-multiselectdetail', scrollTarget);

        // Show details
        Velocity(hiddenMultiSelectDetails, 'slideDown', 'slow');

        // Update SelectAll button if it was initially empty
        var selectAllButton = Common.Get(multiSelectPanel.id + 'SelectAllButton');
        if (!Common.HasClass(multiSelectPanel, 'gtc-multiselectpanel-locked') && Common.IsDefined(selectAllButton) && Common.IsHidden(selectAllButton)) {
            Velocity(selectAllButton, 'fadeIn', 'slow');
        }

    };

    MultiSelectPanel.PrependContent = function (multiSelectPanel, viewElements) {

        // Build Content
        var displayPanelMarkup = BuildContent(multiSelectPanel, viewElements);

        // Prepend
        var scrollTarget = Common.Query('.gtc-scrolltarget', multiSelectPanel);
        Common.InsertHTMLString(scrollTarget, Common.InsertType.Prepend, displayPanelMarkup);
        Widgets.multiselect(multiSelectPanel, 'IntializeNewDetails');
        Common.RetranslatePage();
        var hiddenMultiSelectDetails = Common.QueryAllHidden('.gtc-multiselectdetail', scrollTarget);

        // Show details
        Velocity(hiddenMultiSelectDetails, 'slideDown', 'slow');

        // Update SelectAll button if it was initially empty
        var selectAllButton = Common.Get(multiSelectPanel.id + 'SelectAllButton');
        if (!Common.HasClass(multiSelectPanel, 'gtc-multiselectpanel-locked') && Common.IsHidden(selectAllButton)) {
            Velocity(selectAllButton, 'fadeIn', 'slow');
        }

    };

    MultiSelectPanel.RemoveContent = function (multiSelectPanel, viewElements, promises) {

        var multiSelectDetail, index = 0, length;
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            length = viewElements.length;
            for ( ; index < length; index++) {
                multiSelectDetail = viewElements[index];
                var multiSelectDetailId = multiSelectDetail.Name;
                if (Common.IsDefined(multiSelectDetail.Id)) {
                    multiSelectDetailId += Common.SanitizeToken(multiSelectDetail.Id);
                }
                MultiSelectDetail.RemoveElement(Common.Query('#' + multiSelectDetailId, multiSelectPanel), promises);
            }
        }
        else {
            var multiSelectDetails = Common.QueryAll('.gtc-multiselectdetail', multiSelectPanel);
            length = multiSelectDetails.length;
            for ( ; index < length; index++) {
                multiSelectDetail = multiSelectDetails[index];
                MultiSelectDetail.RemoveElement(multiSelectDetail, promises);
            }
        }
        DisplayPanel.UpdateDisplayNoItems(multiSelectPanel, promises);

    };

    // Private Methods
    function ReplaceDisplayDetails (multiSelectPanel, viewElements, promises, animationHidePromise) {

        var scrollTarget = Common.Query('#' + multiSelectPanel.id + 'ScrollTarget', multiSelectPanel);

        // Remove all display details
        Common.Remove(Common.QueryAll('.gtc-multiselectdetail', scrollTarget));

        // Render new display details and append
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            var displayDetail, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                displayDetail = viewElements[index];
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var displayDetailNamespace = window[displayDetail.Type.toString()];
                displayDetail.IsDisplayed = 'No';
                var displayPanelMarkup = displayDetailNamespace.Render(displayDetail);
                var insertedMarkup = Common.InsertHTMLString(scrollTarget, Common.InsertType.Append, displayPanelMarkup, displayDetail.Name);

                // For loops have no scope! Give it some. (IIFE)
                (function (insertedMarkup, multiSelectPanel, animationPromise) {

                    Velocity(insertedMarkup, 'slideDown', 'slow',
                        function () {
                            Widgets.multiselect(multiSelectPanel);
                            animationPromise.resolve();
                        }
                    );

                } (insertedMarkup, multiSelectPanel, animationPromise));
            }
            animationHidePromise.resolve();
            Common.RetranslatePage();

            // Update SelectAll button if it was initially empty
            var selectAllButton = Common.Get(multiSelectPanel.id + 'SelectAllButton');
            if (!Common.HasClass(multiSelectPanel, 'gtc-multiselectpanel-locked') && Common.IsDefined(selectAllButton) && Common.IsHidden(selectAllButton)) {
                Velocity(selectAllButton, 'fadeIn', 'slow');
            }
        }
        else {
            if (Common.HasClass(multiSelectPanel, 'gtc-multiselectpanel-displaynoitems')) {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var displayPanelMarkup = NoItemsToDisplay(true);
                Common.InsertHTMLString(scrollTarget, Common.InsertType.Append, displayPanelMarkup);
                var insertedMarkup = scrollTarget.lastChild;
                Velocity(insertedMarkup, 'slideDown', 'slow',
                    function () {
                        Widgets.multiselect(multiSelectPanel);
                        animationPromise.resolve();
                    }
                );
            }
            Common.RetranslatePage();
            animationHidePromise.resolve();

            // Update SelectAll button if it was initially empty
            var selectAllButton = Common.Get(multiSelectPanel.id + 'SelectAllButton');
            if (Common.IsDefined(selectAllButton) && Common.IsVisible(selectAllButton)) {
                Velocity(selectAllButton, 'fadeOut', 'slow');
            }
        }

    };

    function NoItemsToDisplay (isHidden) {

        var hiddenStyle = '';
        if (isHidden == true) {
            hiddenStyle = ' style="display: none;"';
        }
        return '<div class="gtc-multiselectdetail gtc-multiselectdetail-noitems"' + hiddenStyle + '><p data-translate="NoItemsToDisplay">' + Common.TranslateKey('NoItemsToDisplay') + '</p></div>';

    };

    function BuildContent (multiSelectPanel, viewElements) {

        // Remove no items if it exists
        var noItemsDetail = Common.Query('.gtc-multiselectdetail-noitems', multiSelectPanel);
        if (Common.IsDefined(noItemsDetail)) {
            Velocity(noItemsDetail, 'slideUp', 'slow',
                function () {
                    Common.Remove(noItemsDetail);
                }
            );
        }

        // Build Markup
        var displayPanelMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var displayDetail, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                displayDetail = viewElements[index];
                displayDetail.IsDisplayed = 'No';
                var displayDetailNamespace = window[displayDetail.Type.toString()];
                displayPanelMarkup += displayDetailNamespace.Render(displayDetail);
            }
        }
        return displayPanelMarkup;

    };

} (window.MultiSelectPanel = window.MultiSelectPanel || {}, window, document, Common, Cache, Events, Velocity));
