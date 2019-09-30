// Display Panel
// Based On: DisplayPanel -> ViewElement
(function (DisplayPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var scrollSemaphore = false;

    // Public Methods
    DisplayPanel.Render = function (displayPanel) {

        // Build class name
        var className = '';
        if (displayPanel.StackDisplayDetails == 'Yes') {
            className += ' gtc-displaypanel-stacked';
        }
        if (displayPanel.DisplayNoItems == 'Yes') {
            className += ' gtc-displaypanel-displaynoitems';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var displayPanelMarkup = '<div data-namespace="DisplayPanel" class="gtc-displaypanel' + className + '"' + ViewElement.RenderAttributes(displayPanel);

        // Serializable?
        if (displayPanel.IsSerializable == 'Yes') {
            // Data-Serializable@
            displayPanelMarkup += ' data-serializable';
        }

        // List Name
        if (Common.IsDefined(displayPanel.ListName)) {
            displayPanelMarkup += ' data-listname="' + displayPanel.ListName + '"';
        }

        // Paging On Scroll?
        if (Common.IsEventViewElementDefined(displayPanel.OnScroll)) {
            if (Common.IsDefined(displayPanel.FormToSerialize)) {
                displayPanel.OnScroll.FormToSerialize = displayPanel.FormToSerialize;
            }
            displayPanelMarkup += ' data-onscroll=\'' + JSON.stringify(displayPanel.OnScroll) + '\' data-pagenumber="1"';

            // Attach init event
            var spinHtml = '<div class="gtc-loader" id="' + displayPanel.Name + 'LoadingOnScroll"><i class="gtc-icon-styles fa fa-circle-o-notch fa-spin"></i></div>';
            Events.One(document.body, 'configuredisplaypanelonscroll',
                function () {
                    var displayPanelElement = Common.Get(displayPanel.Name);

                    // Attach scroll event
                    Events.On(window, 'scroll.paging' + displayPanel.Name + '.' + displayPanel.Name,
                        function () {
                            if (Math.round(window.pageYOffset) == Common.Height(document) - Common.Height(window) && !scrollSemaphore) {
                                HandleScrollEvent(displayPanelElement, spinHtml);
                            }
                        }
                    );
                }
            );
        }

        // Div>
        displayPanelMarkup += '>';

        // Header Area
        displayPanelMarkup += '<div class="gtc-displaypanel-header">';

        // H2<>, Title, H2</>
        if (Common.IsDefined(displayPanel.Title)) {
            displayPanelMarkup += '<h2 id="' + displayPanel.Name + 'Title" class="gtc-displaypanel-title gtc-page-theme-color"';

            // Translations
            displayPanelMarkup += ' data-translate="' + displayPanel.Title + '"';
            displayPanelMarkup += '>' + Common.TranslateKey(displayPanel.Title) + '</h2>';
        }

        // Links
        if (Common.IsDefined(displayPanel.Links) && displayPanel.Links.length > 0) {
            displayPanelMarkup += '<div class="gtc-displaypanel-links">';

            // Links
            var link, index = 0, length = displayPanel.Links.length;
            for ( ; index < length; index++) {
                link = displayPanel.Links[index];

                // Id?
                if (Common.IsDefined(displayPanel.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(displayPanel.Id);
                }

                // Li<>, Anchor, Li</>
                displayPanelMarkup += Link.Render(link);
            }
            displayPanelMarkup += '</div>';
        }

        // Close Header Area
        displayPanelMarkup += '</div>';

        // Display details container
        displayPanelMarkup += '<div id="' + displayPanel.Name + '-container" class="gtc-displaypanel-body">';

        // Display Details
        if (Common.IsDefined(displayPanel.DisplayDetails) && displayPanel.DisplayDetails.length > 0) {
            // Initialize
            var displayDetailCount = displayPanel.DisplayDetails.length;

            // Display Details
            var displayDetail, displayDetailIndex = 0;
            for ( ; displayDetailIndex < displayDetailCount; displayDetailIndex++) {
                displayDetail = displayPanel.DisplayDetails[displayDetailIndex];
                var displayDetailNamespace = window[displayDetail.Type.toString()];
                displayPanelMarkup += displayDetailNamespace.Render(displayDetail);
            }
        }
        else if (displayPanel.DisplayNoItems == 'Yes') {
            displayPanelMarkup += NoItemsToDisplay();
        }

        // Div</>, Div</>
        displayPanelMarkup += '</div></div>';
        return displayPanelMarkup;

    };

    DisplayPanel.SerializeArray = function (element) {

        var regExpCRLF = /\r?\n/g;
        var uiParameters = {
            Name: Common.GetAttr(element, 'data-listname'),
            Value: null,
            UiParameters: []
        };
        var displayDetails = Common.QueryAll('.gtc-displaydetail', element);
        if (displayDetails.length > 0) {
            var displayDetail, index = 0, length = displayDetails.length;
            for (; index < length; index++) {
                displayDetail = displayDetails[index];

                // Initialize
                var propertiesUiParameters = [];

                // View Model
                var viewModel = JSON.parse(Common.GetAttr(displayDetail, 'data-viewmodel'));
                var viewModelId = null;
                if (Common.IsDefined(viewModel) && Common.IsDefined(viewModel.Value) && Common.IsNotEmptyString(viewModel.Value)) {
                    viewModelId = viewModel.Value;
                }
                else {
                    viewModel = {
                        Name: displayDetail.id
                    };
                }

                // Id
                propertiesUiParameters.push(
                    {
                        Name: 'Id',
                        Value: viewModelId,
                        UiParameters: null
                    }
                );

                // Ui Parameters
                var extraUiParameters = JSON.parse(Common.GetAttr(displayDetail, 'data-uiparameters'));
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

                // Other (Editable) Properties
                var radioNames = [];
                var editableDisplayItems = Common.QueryAll('.gtc-editabledisplayitem', displayDetail);
                if (editableDisplayItems.length > 0) {
                    var editableDisplayItem, editableDisplayItemIndex = 0, editableDisplayItemLength = editableDisplayItems.length;
                    for ( ; editableDisplayItemIndex < editableDisplayItemLength; editableDisplayItemIndex++) {
                        editableDisplayItem = editableDisplayItems[editableDisplayItemIndex];
                        var dataName = Common.GetAttr(editableDisplayItem, 'data-name');
                        var propertyUiParameter = {
                            Name: dataName,
                            Value: null,
                            UiParameters: null
                        };
                        var field = Common.Query('[data-serializabledisplayitem]', editableDisplayItem);
                        var fieldType = Common.GetAttr(field, 'data-namespace');
                        var rawData = null;
                        switch (fieldType) {
                            case 'CurrencyField':
                                rawData = Common.GetAttr(field, 'data-raw');
                                if (rawData.length <= 0) {
                                    rawData = null;
                                }
                                var currencyCode = Common.GetAttr(field, 'data-currencycode');
                                if (Common.IsDefined(currencyCode)) {
                                    propertyUiParameter.UiParameters = [
                                        {
                                            Name: 'Code',
                                            Value: currencyCode,
                                            UiParameters: null
                                        }
                                    ];
                                }
                                break;
                            case 'SelectField':
                                rawData = field.value;
                                break;
                            default:
                                rawData = Common.GetAttr(field, 'data-raw');
                                if (Common.IsNotDefined(rawData)) {
                                    rawData = field.value;
                                }
                                if (rawData.length <= 0) {
                                    rawData = null;
                                }
                                else {
                                    rawData = rawData.replace(regExpCRLF, '\r\n');
                                }
                                break;
                        }
                        propertyUiParameter.Value = rawData;
                        propertiesUiParameters.push(propertyUiParameter);
                    }
                }

                // Entity
                entityUiParameter = {
                    Name: viewModel.Name,
                    Value: null,
                    UiParameters: null
                };
                entityUiParameter.UiParameters = propertiesUiParameters;
                uiParameters.UiParameters.push(entityUiParameter);
            }
        }
        return uiParameters;

    };

    DisplayPanel.OnScroll = function (displayPanel, pageNumber) {

        // Initialize
        var onScrollParameters = [];

        // Get OnScrollEvent object
        var onScrollEvent = JSON.parse(Common.GetAttr(displayPanel, 'data-onscroll'));
        if (Common.IsDefined(onScrollEvent.UiParameters)) {
            onScrollParameters = onScrollParameters.concat(onScrollEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onScrollEvent.FormToSerialize)) {
            onScrollParameters = onScrollParameters.concat(Form.SerializeArray(Common.Get(onScrollEvent.FormToSerialize)));
        }

        // Page Number
        var newPageNumber = parseInt(pageNumber, 10) + 1;
        onScrollParameters.push(
            {
                Name: 'PageNumber',
                Value: newPageNumber,
                UiParameters: null
            }
        );

        // Execute View Behavior
        Common.ExecuteViewBehavior(onScrollEvent.ControllerPath + onScrollEvent.ActionName, onScrollParameters,
            function (pageInstructionData) {
                // Return if no page instructions
                if (Common.IsNotDefined(pageInstructionData.PageInstructions) || pageInstructionData.PageInstructions.length == 0) {
                    RemoveOnScrollLoader(0);
                    return;
                }

                // Remove instruction from list
                var pagingInstruction = null;
                pageInstructionData.PageInstructions = Common.FilterArray(pageInstructionData.PageInstructions,
                    function(pageInstruction) {
                        if (pageInstruction.Instruction != 'Page') {
                            return true;
                        }
                        else {
                            pagingInstruction = pageInstruction;
                            return false;
                        }
                    }
                );

                // Insert new paging data if there are view elements
                var delayValue = 300;
                if (Common.IsDefined(pagingInstruction.ViewElements) && pagingInstruction.ViewElements.length > 0) {
                    Common.SetAttr(displayPanel, 'data-pagenumber', newPageNumber);
                    var displayPanelMarkup = BuildContent(displayPanel, pagingInstruction.ViewElements, true);
                    var displayPanelBody = Common.Query('.gtc-displaypanel-body', displayPanel);
                    displayPanelBody.appendChild(Common.GenerateFragment(displayPanelMarkup));
                    window.Events.Trigger(Common.QueryAll('body'), 'configureprogressdisplayitem');
                    Page.SetPageHeight();
                    Common.RetranslatePage();
                }
                else {
                    delayValue = 0;
                }

                // Remove loader
                RemoveOnScrollLoader(delayValue);

                // Run remaining instructions if they exist
                if (pageInstructionData.PageInstructions.length > 0) {
                    Page.RunInstructions(pageInstructionData);
                }
            }, displayPanel
        );

    };

    DisplayPanel.UpdateTitle = function (displayPanel, updatedTitle, promises, context) {

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

    DisplayPanel.ReplaceContent = function (displayPanel, viewElements, promises, context) {

        // Get Display Panel body
        var body = Common.Query('.gtc-displaypanel-body', displayPanel);

        // Get a promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        // INFO: Only remove delegated events from content that is being replaced, e.g. not the panel links!
        Cache.CleanDelegatedElementsData(body);

        // Has paging?
        if (Common.IsDefined(Common.GetAttr(displayPanel, 'data-pagenumber'))) {
            Common.SetAttr(displayPanel, 'data-pagenumber', '1');
        }

        // Replace content
        var panelChildren = Common.QueryAll('.gtc-displaydetail', body);
        if (panelChildren.length > 0) {
            Velocity(panelChildren, 'slideUp', 'slow').then(
                function (event) {
                    ReplaceDisplayDetails(displayPanel, body, viewElements, promises, animationHidePromise, context);
                }
            );
        }
        else {
            ReplaceDisplayDetails(displayPanel, body, viewElements, promises, animationHidePromise, context);
        }

    };

    DisplayPanel.AppendContent = function (displayPanel, viewElements) {

        // Get Display Panel body
        var body = Common.Query('.gtc-displaypanel-body', displayPanel);

        // Build Content
        var displayPanelMarkup = BuildContent(displayPanel, viewElements);

        // Append
        Common.InsertHTMLString(body, Common.InsertType.Append, displayPanelMarkup);
        Common.RetranslatePage();
        var panelChildren = Common.QueryAll('.gtc-displaydetail', body);
        Velocity(panelChildren, 'slideDown', 'slow');

    };

    DisplayPanel.PrependContent = function (displayPanel, viewElements) {

        // Get Display Panel body
        var body = Common.Query('.gtc-displaypanel-body', displayPanel);

        // Build Content
        var displayPanelMarkup = BuildContent(displayPanel, viewElements);

        // Prepend
        Common.InsertHTMLString(body, Common.InsertType.Prepend, displayPanelMarkup);
        Common.RetranslatePage();
        var panelChildren = Common.QueryAll('.gtc-displaydetail', body);
        Velocity(panelChildren, 'slideDown', 'slow');

    };

    DisplayPanel.RemoveContent = function (displayPanel, viewElements, promises) {

        var displayDetail, index = 0, length;
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            length = viewElements.length;
            for ( ; index < length; index++) {
                displayDetail = viewElements[index];
                var displayDetailId = displayDetail.Name;
                if (Common.IsDefined(displayDetail.Id)) {
                    displayDetailId += Common.SanitizeToken(displayDetail.Id);
                }
                DisplayDetail.RemoveElement(Common.Query('#' + displayDetailId, displayPanel), promises);
            }
        }
        else {
            var displayDetails = Common.QueryAll('.gtc-displaydetail', displayPanel);
            length = displayDetails.length;
            for ( ; index < length; index++) {
                displayDetail = displayDetails[index];
                DisplayDetail.RemoveElement(displayDetail, promises);
            }
        }

    };

    DisplayPanel.UpdateDisplayNoItems = function (displayPanel, promises, context) {

        if (Common.HasClass(displayPanel, 'gtc-displaypanel-displaynoitems') && Common.QueryAll('.gtc-displaydetail', displayPanel).length == 0) {
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Get Display Panel body
            var body = Common.Query('.gtc-displaypanel-body', displayPanel);

            // Build and insert no items to display
            var displayPanelMarkup = NoItemsToDisplay(true);
            Common.InsertHTMLString(body, Common.InsertType.Append, displayPanelMarkup);
            Velocity(Common.Query('.gtc-displaydetail-noitems', displayPanel), 'slideDown', 'slow',
                function () {
                    animationPromise.resolve();
                }
            );
            Common.RetranslatePage();
        }

    };

    DisplayPanel.ShowPinwheel = function (displayPanel) {
    };

    DisplayPanel.HidePinwheel = function (displayPanel) {
    };

    // Private Methods
    function ReplaceDisplayDetails (displayPanel, body, viewElements, promises, animationHidePromise, context) {

        // Remove all display details
        var displayDetails = Common.QueryAll('.gtc-displaydetail', body);
        Common.Remove(displayDetails);

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
            DisplayPanel.UpdateDisplayNoItems(displayPanel, promises, context);
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

    function BuildContent (displayPanel, viewElements, isPaging) {

        // Remove no items if it exists
        var noItemsDetail = Common.Query('.gtc-displaydetail-noitems', displayPanel);
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
                if (isPaging != true) {
                    displayDetail.IsDisplayed = 'No';
                }
                var displayDetailNamespace = window[displayDetail.Type.toString()];
                displayPanelMarkup += displayDetailNamespace.Render(displayDetail);
            }
        }
        return displayPanelMarkup;

    };

    function HandleScrollEvent (displayPanelElement, spinHtml) {

        scrollSemaphore = true;
        Common.InsertHTMLString(displayPanelElement, Common.InsertType.Append, spinHtml);
        DisplayPanel.OnScroll(displayPanelElement, Common.GetAttr(displayPanelElement, 'data-pagenumber'));

    };

    function RemoveOnScrollLoader (delayValue) {

        // Remove loader
        var loaders = Common.QueryAll('.gtc-loader');
        if (loaders.length > 0) {
            Velocity(loaders, 'slideUp',
                {
                    delay: delayValue,
                    duration: 'slow',
                    complete: function () {
                        Common.Remove(this);
                        scrollSemaphore = false;
                    }
                }
            );
        }
        else {
            scrollSemaphore = false;
        }

    };

} (window.DisplayPanel = window.DisplayPanel || {}, window, document, Common, Cache, Events, Velocity));
