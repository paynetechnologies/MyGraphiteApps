// View Security Panel
// Based On: ViewSecurityPanel -> ViewElement
(function (ViewSecurityPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var DataCache = {
        CurrentDepth: 0,
        ActiveColumn: null,
        CurrentCheckboxId: null
    };

    // Public Methods
    ViewSecurityPanel.Render = function (viewSecurityPanel) {

        // Div<, TabIndex@, Class@, Id@
        var viewSecurityPanelMarkup = '<div class="gtc-viewsecuritypanel" data-namespace="ViewSecurityPanel"' + ViewElement.RenderAttributes(viewSecurityPanel);

        // On Click Detail Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clickdetail=\'' + JSON.stringify(viewSecurityPanel.OnClickDetails) + '\'';
        }

        // On Click Save Allowed Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllowedDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksavealloweddetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllowedDetails) + '\'';
        }

        // On Click Save Denied Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveDeniedDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksavedenieddetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveDeniedDetails) + '\'';
        }

        // On Click Save All Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksavealldetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllDetails) + '\'';
        }

        // On Click Save All Views Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllViews)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksaveallviews=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllViews) + '\'';
        }

        // On Click Header Detail Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickHeaderDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clickheaderdetail=\'' + JSON.stringify(viewSecurityPanel.OnClickHeaderDetails) + '\'';
        }

        // On Click Save All Header Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllHeaderDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksaveallheaderdetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllHeaderDetails) + '\'';
        }

        // On Click Content Detail Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickContentDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clickcontentdetail=\'' + JSON.stringify(viewSecurityPanel.OnClickContentDetails) + '\'';
        }

        // On Click Save All Content Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllContentDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksaveallcontentdetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllContentDetails) + '\'';
        }

        // On Click Region Detail Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickRegionDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clickregiondetail=\'' + JSON.stringify(viewSecurityPanel.OnClickRegionDetails) + '\'';
        }

        // On Click Save All Region Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllRegionDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksaveallregiondetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllRegionDetails) + '\'';
        }

        // On Click Footer Detail Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickFooterDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clickfooterdetail=\'' + JSON.stringify(viewSecurityPanel.OnClickFooterDetails) + '\'';
        }

        // On Click Save All Footer Details Event
        if (Common.IsEventViewElementDefined(viewSecurityPanel.OnClickSaveAllFooterDetails)) {
            // Data-ControllerPath/ActionName
            viewSecurityPanelMarkup += ' data-clicksaveallfooterdetails=\'' + JSON.stringify(viewSecurityPanel.OnClickSaveAllFooterDetails) + '\'';
        }

        // Div>
        viewSecurityPanelMarkup += '>';

        // H2<>, Title, H2</>
        viewSecurityPanelMarkup += '<h2 id="' + viewSecurityPanel.Name + 'Title" class="gtc-page-theme-color gtc-viewsecuritypanel-title"';

        // Translations
        viewSecurityPanel.Title = Common.IsDefined(viewSecurityPanel.Title) ? viewSecurityPanel.Title : '';
        viewSecurityPanelMarkup += ' data-originaltitle="' + viewSecurityPanel.Title + '" data-translate="' + viewSecurityPanel.Title + '"';
        viewSecurityPanelMarkup += '>' + Common.TranslateKey(viewSecurityPanel.Title) + '</h2>';

        // Allow/Deny All Views Links
        viewSecurityPanelMarkup += '<span id="' + viewSecurityPanel.Name + 'AllowAllViews" style="display:none;" class="gtc-viewsecuritypanel-saveall"><span data-translate="AllowAllViews">' + Common.TranslateKey('AllowAllViews') + '</span><a id="' + viewSecurityPanel.Name + 'AllowAllViewsLink"><i class="gtc-icon-styles fa fa-check"></i></a><a id="' + viewSecurityPanel.Name + 'DenyAllViewsLink"><i class="gtc-icon-styles fa fa-times"></i></a></span>';
        Events.On(document.body, 'click.' + viewSecurityPanel.Name + 'AllowAllViewsLink', '#' + viewSecurityPanel.Name + 'AllowAllViewsLink', ViewSecurityPanel.OnClickSaveAllViews);
        Events.On(document.body, 'click.' + viewSecurityPanel.Name + 'DenyAllViewsLink', '#' + viewSecurityPanel.Name + 'DenyAllViewsLink', ViewSecurityPanel.OnClickSaveAllViews);

        // Save All Details
        viewSecurityPanelMarkup += '<span id="' + viewSecurityPanel.Name + 'AllowAll" style="display:none;" class="gtc-viewsecuritypanel-saveall"><span data-translate="AllowAll">' + Common.TranslateKey('AllowAll') + '</span><a id="' + viewSecurityPanel.Name + 'AllowAllLink"><i class="gtc-icon-styles fa fa-check"></i></a><a id="' + viewSecurityPanel.Name + 'DenyAllLink"><i class="gtc-icon-styles fa fa-times"></i></a></span>';
        Events.On(document.body, 'click.' + viewSecurityPanel.Name + 'AllowAllLink', '#' + viewSecurityPanel.Name + 'AllowAllLink', ViewSecurityPanel.OnClickSaveAllDetails);
        Events.On(document.body, 'click.' + viewSecurityPanel.Name + 'DenyAllLink', '#' + viewSecurityPanel.Name + 'DenyAllLink', ViewSecurityPanel.OnClickSaveAllDetails);

        // Allow\Deny All Buttons
        // Div<>, View Element Sections, Div</>, // Div</>
        viewSecurityPanelMarkup += '<div id="' + viewSecurityPanel.Name + 'AllowAllViewsDisplay" style="display:none;" class="gtc-viewsecuritypanel-allowdenyall">';
        viewSecurityPanelMarkup += '<div class="gtc-viewsecuritypanel-titlebar gtc-viewsecuritypanel-titlebar-allviews"><h3 data-translate="AllViews">' + Common.TranslateKey('AllViews') + '</h3></div>';
        viewSecurityPanelMarkup += '</div>';

        // Display choose a view
        viewSecurityPanelMarkup += NoItemsToDisplay(false, false);

        // Div<>
        viewSecurityPanelMarkup += '<div style="display:none;" class="gtc-viewsecuritypanel-container"><div class="gtc-viewsecuritypanel-columns">';

        // Div</>, Div</>, Div</>
        viewSecurityPanelMarkup += '</div></div></div>';
        return viewSecurityPanelMarkup;

    };

    ViewSecurityPanel.OnClickTopLevelDetail = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', this);
        Common.RemoveClass(Common.Query('.gtc-active', this.parentNode), 'gtc-active');
        Common.AddClass(this, 'gtc-active');
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-click' + Common.GetAttr(this, 'data-toplevel').toLowerCase() + 'detail'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Set depth
        DataCache.CurrentDepth = 1;

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.OnClickDetail = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', this);
        Common.RemoveClass(Common.Query('.gtc-active', this.parentNode), 'gtc-active');
        Common.AddClass(this, 'gtc-active');
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-clickdetail'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Get ViewElementDetail
        onClickParameters = onClickParameters.concat([
            {
                Name: 'ViewElementDetail',
                Value: Common.GetAttr(this, 'data-id'),
                UiParameters: null
            }
        ]);

        // Set depth
        DataCache.CurrentDepth = Common.GetIndex(Common.Closest('.gtc-viewsecuritypanel-column', this)) + 1;

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.OnClickChildlessDetail = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', this);
        Common.RemoveClass(Common.Query('.gtc-active', this.parentNode), 'gtc-active');

        // Set depth
        DataCache.CurrentDepth = Common.GetIndex(Common.Closest('.gtc-viewsecuritypanel-column', this)) + 1;

        // Clear previous columns and events
        var columns = Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel);
        var previousColumns = Common.GetAllSibling(columns[DataCache.CurrentDepth - 1], Common.SiblingType.Next);
        Common.Remove(previousColumns);
        Events.Off(document.body, 'click.viewsecuritypanelonclickdetails.Depth' + (DataCache.CurrentDepth + 1));

    };

    ViewSecurityPanel.OnClickSaveAllDetails = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', this);
        var viewSecurityPanelId = viewSecurityPanel.id;
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-clicksavealldetails'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Set Allow/Deny
        var allow = '';
        var eventTarget = event.target;
        if (eventTarget.id == viewSecurityPanelId + 'AllowAllLink' || Common.IsDefined(Common.Closest('#' + viewSecurityPanelId + 'AllowAllLink', eventTarget))) {
            allow = 'Yes';
        }
        else {
            allow = 'No';
        }
        onClickParameters = onClickParameters.concat([
            {
                Name: 'Allow',
                Value: allow,
                UiParameters: null
            }
        ]);

        // Set depth, remove previous columns, clear delegated events
        DataCache.CurrentDepth = 0;
        var columns = Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel);
        var previousColumns = Common.GetAllSibling(columns[DataCache.CurrentDepth], Common.SiblingType.Next);
        Common.Remove(previousColumns);
        Events.Off(document.body, 'click.viewsecuritypanelonclickdetails.Depth' + (DataCache.CurrentDepth + 1));

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.OnClickSaveAllViews = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', this);
        var viewSecurityPanelId = viewSecurityPanel.id;
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-clicksaveallviews'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Set Allow/Deny
        var allow = '';
        var eventTarget = event.target;
        if (eventTarget.id == viewSecurityPanelId + 'AllowAllViewsLink' || Common.IsDefined(Common.Closest('#' + viewSecurityPanelId + 'AllowAllViewsLink', eventTarget))) {
            allow = 'Yes';
        }
        else {
            allow = 'No';
        }
        onClickParameters = onClickParameters.concat([
            {
                Name: 'Allow',
                Value: allow,
                UiParameters: null
            }
        ]);

        // Set depth, remove previous columns, clear delegated events
        DataCache.CurrentDepth = 0;
        var columns = Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel);
        var previousColumns = Common.GetAllSibling(columns[DataCache.CurrentDepth], Common.SiblingType.Next);
        Common.Remove(previousColumns);
        Events.Off(document.body, 'click.viewsecuritypanelonclickdetails.Depth' + (DataCache.CurrentDepth + 1));

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.OnClickSaveAllTopLevelDetails = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', this);
        var viewSecurityPanelId = viewSecurityPanel.id;
        var onClickParameters = [];

        // Get OnClickEvent object
        var topLevelValue = Common.GetAttr(Common.Closest('.gtc-viewsecuritypanel-node', this), 'data-toplevel');
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-clicksaveall' + topLevelValue.toLowerCase() + 'details'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Set Allow/Deny
        var allow = '';
        var eventTarget = event.target;
        var linkId = viewSecurityPanelId + topLevelValue + 'AllowAllLink';
        if (eventTarget.id == linkId || Common.IsDefined(Common.Closest('#' + linkId, eventTarget))) {
            allow = 'Yes';
        }
        else {
            allow = 'No';
        }
        onClickParameters = onClickParameters.concat([
            {
                Name: 'Allow',
                Value: allow,
                UiParameters: null
            }
        ]);

        // Set depth, remove previous columns, clear delegated events
        DataCache.CurrentDepth = 0;
        var columns = Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel);
        var previousColumns = Common.GetAllSibling(columns[DataCache.CurrentDepth], Common.SiblingType.Next);
        Common.Remove(previousColumns);
        Events.Off(document.body, 'click.viewsecuritypanelonclickdetails.Depth' + (DataCache.CurrentDepth + 1));

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.OnClickSaveDetails = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();

        // Semaphore to stop bubbling events
        if (DataCache.CurrentCheckboxId == null) {
            if (this.checked == true) {
                ViewSecurityPanel.OnClickSaveAllowedDetails(this);
            }
            else {
                ViewSecurityPanel.OnClickSaveDeniedDetails(this);
            }
        }

    };

    ViewSecurityPanel.OnClickSaveAllowedDetails = function (choice) {

        // Initialize
        DataCache.CurrentCheckboxId = choice.id;
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', choice);
        var node = Common.Closest('.gtc-viewsecuritypanel-node', choice);
        var viewSecurityPanelId = viewSecurityPanel.id;
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-clicksavealloweddetails'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Create list of elements
        var elementDetailList = {
            Name: 'ViewElementDetails',
            Value: null,
            UiParameters: []
        };

        // Properties
        var propertiesUiParameters = [];

        // Id
        propertiesUiParameters.push(
            {
                Name: 'Id',
                Value: Common.GetAttr(node, 'data-id'),
                UiParameters: null
            }
        );

        // Entity
        var entityUiParameter = {
            Name: 'ViewElementDetail',
            Value: null,
            UiParameters: null
        };
        entityUiParameter.UiParameters = propertiesUiParameters;
        elementDetailList.UiParameters.push(entityUiParameter);

        // This finds all selected nodes that are NOT top level (e.g. Header/Content etc..) and are NOT in columns after the node whose checkbox was clicked
        var nodeColumnIndex = Common.GetIndex(Common.Closest('.gtc-viewsecuritypanel-column', node));
        var nodeParents = Common.QueryAll('.gtc-viewsecuritypanel-node.gtc-active:not([data-toplevel]):not(#' + node.id + '):nth-child(-n+' + nodeColumnIndex + ')', viewSecurityPanel);

        // Build list of parents and clicked element
        var index = 0, currentNode, currentChoice, length = nodeParents.length;
        for ( ; index < length; index++) {
            currentNode = nodeParents[index];

            // Check parents
            currentChoice = Common.Query('.gtc-input-checkbox-choice', currentNode);
            if (currentChoice.checked != true) {
                Events.Trigger(currentChoice.parentNode, 'click');
            }

            // Properties
            propertiesUiParameters = [];

            // Id
            propertiesUiParameters.push(
                {
                    Name: 'Id',
                    Value: Common.GetAttr(currentNode, 'data-id'),
                    UiParameters: null
                }
            );

            // Entity
            entityUiParameter = {
                Name: 'ViewElementDetail',
                Value: null,
                UiParameters: null
            };
            entityUiParameter.UiParameters = propertiesUiParameters;
            elementDetailList.UiParameters.push(entityUiParameter);
        }
        onClickParameters = onClickParameters.concat(elementDetailList);

        // Clear semaphore
        DataCache.CurrentCheckboxId = null;

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.OnClickSaveDeniedDetails = function (choice) {

        // Initialize
        var viewSecurityPanel = Common.Closest('.gtc-viewsecuritypanel', choice);
        var viewSecurityPanelId = viewSecurityPanel.id;
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(viewSecurityPanel, 'data-clicksavedenieddetails'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Get ViewElementDetail
        onClickParameters = onClickParameters.concat([
            {
                Name: 'ViewElementDetail',
                Value: Common.GetAttr(Common.Closest('.gtc-viewsecuritypanel-node', choice), 'data-id'),
                UiParameters: null
            }
        ]);

        // Set depth, remove previous columns, clear delegated events
        DataCache.CurrentDepth = Common.GetIndex(Common.Closest('.gtc-viewsecuritypanel-column', choice));
        var columns = Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel);
        var previousColumns = Common.GetAllSibling(columns[DataCache.CurrentDepth], Common.SiblingType.Next);
        Common.Remove(previousColumns);
        Events.Off(document.body, 'click.viewsecuritypanelonclickdetails.Depth' + (DataCache.CurrentDepth + 1));

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, viewSecurityPanel);

    };

    ViewSecurityPanel.ReplaceElement = function (viewSecurityPanel, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var noItemsToDisplay = Common.Query('.gtc-displaydetail-noitems', viewSecurityPanel);
        var viewSecurityPanelId = viewSecurityPanel.id;
        var viewSecurityPanelContainer = Common.Query('.gtc-viewsecuritypanel-container', viewSecurityPanel);

        // Build Markup
        Velocity(viewSecurityPanelContainer, 'slideUp', 'slow',
            function () {
                var viewSecurityPanelMarkup = '';
                if (Common.IsDefined(viewElements) && viewElements.length > 0) {

                    // Remove the nothing to display detail
                    if (Common.IsDefined(noItemsToDisplay)) {
                        var noItemsPromise = Common.Promise();
                        promises.push(noItemsPromise.promise);
                        Velocity(noItemsToDisplay, 'slideUp', 'slow',
                            function () {
                                Common.Remove(noItemsToDisplay);
                                noItemsPromise.resolve();
                            }
                        );
                    }

                    // Remove colums
                    Common.Remove(Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel));
                    var uiViewDetail = viewElements[0];

                    // Clear everything when View.IsAllowed is No
                    if (uiViewDetail.IsAllowed == 'No') {
                        ClearAll(viewSecurityPanel, viewSecurityPanelId);
                        return;
                    }

                    // Update Title
                    var title = Common.Get(viewSecurityPanelId + 'Title');
                    var currentTranslation = Common.GetAttr(title, 'data-translate');
                    if (currentTranslation != uiViewDetail.Display) {
                        var updateTitlePromise = Common.Promise();
                        promises.push(updateTitlePromise.promise);
                        Velocity(title, { 'opacity': 0 }, 'slow',
                            function () {
                                Common.SetAttr(title, 'data-translate', uiViewDetail.Display);
                                title.textContent = Common.TranslateKey(uiViewDetail.Display);
                                Velocity(title, 'reverse');
                                updateTitlePromise.resolve();
                            }
                        );
                    }

                    // Display All?
                    var allowDenyAllDisplay = Common.Get(viewSecurityPanelId + 'AllowAllViewsDisplay');
                    var allowDenyAllLinks = Common.Get(viewSecurityPanelId + 'AllowAllViews');
                    var allowAll = Common.Get(viewSecurityPanelId + 'AllowAll');
                    if (uiViewDetail.Display == 'All') {
                        Velocity(allowDenyAllDisplay, 'slideDown', 'slow');
                        Velocity(allowDenyAllLinks, 'fadeIn', { duration: 'slow', display: '' });
                        Velocity(allowAll, 'fadeOut', 'slow');
                    }
                    else {
                        // Hide All Views
                        Velocity(allowDenyAllDisplay, 'slideUp', 'slow');
                        Velocity(allowDenyAllLinks, 'fadeOut', 'slow');

                        // Show allow all buttons
                        Velocity(allowAll, 'fadeIn', { duration: 'slow', display: '' });

                        // Set depth, clear top level node all events, clear delegated events
                        DataCache.CurrentDepth = 0;
                        Events.Off(document.body, 'click.viewsecuritypanelonclickallowall');
                        Events.Off(document.body, 'click.viewsecuritypanelonclickdetails');

                        // Create top level nodes
                        var topLevelElements = [];
                        if (uiViewDetail.HasHeaderChildren == 'Yes') {
                            var headerNode = {
                                Name: 'HeaderNode',
                                Id: '',
                                Display: 'Header',
                                HasChildren: 'Yes',
                                IsAllowed: 'Yes',
                                TopLevelClickEvent: 'Yes'
                            };
                            topLevelElements.push(headerNode);
                        }
                        if (uiViewDetail.HasContentChildren == 'Yes') {
                            var contentNode = {
                                Name: 'ContentNode',
                                Id: '',
                                Display: 'Content',
                                HasChildren: 'Yes',
                                IsAllowed: 'Yes',
                                TopLevelClickEvent: 'Yes'
                            };
                            topLevelElements.push(contentNode);
                        }
                        if (uiViewDetail.HasRegionChildren == 'Yes') {
                            var regionNode = {
                                Name: 'RegionNode',
                                Id: '',
                                Display: 'Region',
                                HasChildren: 'Yes',
                                IsAllowed: 'Yes',
                                TopLevelClickEvent: 'Yes'
                            };
                            topLevelElements.push(regionNode);
                        }
                        if (uiViewDetail.HasFooterChildren == 'Yes') {
                            var footerNode = {
                                Name: 'FooterNode',
                                Id: '',
                                Display: 'Footer',
                                HasChildren: 'Yes',
                                IsAllowed: 'Yes',
                                TopLevelClickEvent: 'Yes'
                            };
                            topLevelElements.push(footerNode);
                        }

                        // Build markup and insert
                        viewSecurityPanelMarkup += BuildColumns(topLevelElements, viewSecurityPanelId);
                        Common.InsertHTMLString(Common.Query('.gtc-viewsecuritypanel-columns', viewSecurityPanel), Common.InsertType.Append, viewSecurityPanelMarkup);

                        // Update current view id
                        Common.SetAttr(viewSecurityPanel, 'data-id', uiViewDetail.Id);

                        // Show security panel
                        Velocity(viewSecurityPanelContainer, 'slideDown', 'slow',
                            function () {
                                Page.SetPageHeight();
                            }
                        );
                    }
                }
                else {
                    // Display no items?
                    if (Common.IsNotDefined(noItemsToDisplay)) {
                        var noItemsPromise = Common.Promise();
                        promises.push(noItemsPromise.promise);
                        viewSecurityPanelMarkup += NoItemsToDisplay(true, false);
                        Common.InsertHTMLString(viewSecurityPanel, Common.InsertType.Append, viewSecurityPanelMarkup);
                        Velocity(viewSecurityPanelContainer, 'slideUp', 'slow');
                        Velocity(Common.Query('.gtc-displaydetail-noitems', viewSecurityPanel), 'slideDown', 'slow',
                            function () {
                                noItemsPromise.resolve();
                                Page.SetPageHeight();
                            }
                        );
                    }

                    // Update Title
                    var title = Common.Get(viewSecurityPanelId + 'Title');
                    var currentTranslation = Common.GetAttr(title, 'data-translate');
                    var originalTitle = Common.GetAttr(title, 'data-originaltitle');
                    if (currentTranslation != originalTitle) {
                        var updateTitlePromise = Common.Promise();
                        promises.push(updateTitlePromise.promise);
                        Velocity(title, { 'opacity': 0 }, 'slow',
                            function () {
                                Common.SetAttr(title, 'data-translate', originalTitle);
                                title.textContent = Common.TranslateKey(originalTitle);
                                Velocity(title, 'reverse');
                                updateTitlePromise.resolve();
                            }
                        );
                    }

                    // Show allow all buttons
                    var allowAll = Common.Get(viewSecurityPanelId + 'AllowAll');
                    Velocity(allowAll, 'fadeOut', 'slow');

                    // Hide All Views
                    var allowDenyAllDisplay = Common.Get(viewSecurityPanelId + 'AllowAllViewsDisplay');
                    var allowDenyAllLinks = Common.Get(viewSecurityPanelId + 'AllowAllViews');
                    Velocity(allowDenyAllDisplay, 'slideUp', 'slow');
                    Velocity(allowDenyAllLinks, 'fadeOut', 'slow');
                }
                animationPromise.resolve();
            }
        );

    };

    ViewSecurityPanel.AppendContent = function (viewSecurityPanel, viewElements, promises, context) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Build Markup
        var viewSecurityPanelMarkup = '';
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            var noItemsToDisplay = Common.Query('.gtc-displaydetail-noitems', viewSecurityPanel);

            // Remove the nothing to display detail
            if (Common.IsDefined(noItemsToDisplay)) {
                var noItemsPromise = Common.Promise();
                promises.push(noItemsPromise.promise);
                Velocity(noItemsToDisplay, 'slideUp', 'slow',
                    function () {
                        Common.Remove(noItemsToDisplay);
                        noItemsPromise.resolve();
                    }
                );
            }

            // Clear previous columns and events
            var columns = Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel);
            var previousColumns = Common.GetAllSibling(columns[DataCache.CurrentDepth - 1], Common.SiblingType.Next);
            Common.Remove(previousColumns);
            Events.Off(document.body, 'click.viewsecuritypanelonclickdetails.Depth' + DataCache.CurrentDepth);

            // Build markup
            viewSecurityPanelMarkup += BuildColumns(viewElements);

            // Insert new column and show
            var columnsContainer = Common.Query('.gtc-viewsecuritypanel-columns', viewSecurityPanel);
            Common.InsertHTMLString(columnsContainer, Common.InsertType.Append, viewSecurityPanelMarkup);
            var insertedColumn = columnsContainer.lastChild;
            Common.Slide(insertedColumn, 'show', 'left', 200);

            // Setup checkboxes
            var insertedChoices = Common.QueryAll('.gtc-input-checkbox-choice', insertedColumn);
            Widgets.checkbox(insertedChoices, { ClassLabelCheckboxUnchecked: 'gtc-classLabelCheckboxUnchecked', ClassLabelCheckboxUncheckedHover: 'gtc-classLabelCheckboxUncheckedHover', ClassLabelCheckboxChecked: 'gtc-input-checkbox-selected', ClassLabelCheckboxCheckedHover: 'gtc-classLabelCheckboxCheckedHover' });
            Events.On(insertedChoices, 'change', ViewSecurityPanel.OnClickSaveDetails);

            // Setup tooltips
            ConfigureInfoTooltips(Common.QueryAll('.gtc-viewsecuritypanel-infotooltip-icon', insertedColumn));
            animationPromise.resolve();
        }
        else {
            animationPromise.resolve();
        }

    };

    ViewSecurityPanel.ShowPinwheel = function (viewSecurityPanel) {

        Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-pinwheel-overlay gtc-pinwheel-overlay-transparent" id="ViewSecurityPanelPinwheelOverlay"></div>');
        SpinKit.Show(document.body, 'FadingCircle');

    };

    ViewSecurityPanel.HidePinwheel = function (viewSecurityPanel) {

        setTimeout(
            function () {
                SpinKit.Hide(document.body);
                Common.Remove(Common.Get('ViewSecurityPanelPinwheelOverlay'));
            }, 200
        );

    };

    // Private Methods
    function BuildColumns (viewElements, viewSecurityPanelId) {

        // Builds html structure for nodes
        var hasTopLevel = false;
        var columnMarkup = '';
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            var element, elementId, checkboxField, isChecked, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                element = viewElements[index];
                if (Common.IsDefined(element.Name)) {
                    elementId = element.Name + Common.SanitizeToken(element.Id);
                }
                else {
                    elementId = Common.SanitizeToken(element.Id);
                }
                columnMarkup += '<li class="gtc-viewsecuritypanel-node" id="' + elementId + '"';
                if (Common.IsDefined(element.Id)) {
                    columnMarkup += ' data-id="' + element.Id + '"';
                }
                var depthNamespace = BuildDepthNamespace();
                if (element.TopLevelClickEvent == 'Yes') {
                    hasTopLevel = true;
                    columnMarkup += ' data-toplevel="' + element.Display + '">';
                    columnMarkup += '<span id="' + elementId + element.Display + 'AllowAll" class="gtc-viewsecuritypanel-saveall-toplevel"><a id="' + viewSecurityPanelId + element.Display + 'AllowAllLink"><i class="gtc-icon-styles fa fa-check"></i></a><a id="' + viewSecurityPanelId + element.Display + 'DenyAllLink"><i class="gtc-icon-styles fa fa-times"></i></a></span>';
                    Events.On(document.body, 'click.viewsecuritypanelonclickdetails' + depthNamespace + '.' + elementId, '#' + elementId, ViewSecurityPanel.OnClickTopLevelDetail);
                    Events.On(document.body, 'click.viewsecuritypanelonclickallowall' + depthNamespace + '.' + viewSecurityPanelId + element.Display + 'AllowAllLink', '#' + viewSecurityPanelId + element.Display + 'AllowAllLink', ViewSecurityPanel.OnClickSaveAllTopLevelDetails);
                    Events.On(document.body, 'click.viewsecuritypanelonclickallowall' + depthNamespace + '.' + viewSecurityPanelId + element.Display + 'DenyAllLink', '#' + viewSecurityPanelId + element.Display + 'DenyAllLink', ViewSecurityPanel.OnClickSaveAllTopLevelDetails);
                }
                else {
                    columnMarkup += '>';
                    isChecked = (element.IsAllowed == 'Yes') ? 'Yes' : 'No';
                    checkboxField = CreateCheckboxObject(isChecked, elementId + '-Choice', elementId + 'CheckboxField');
                    columnMarkup += CheckboxField.Render(checkboxField);
                    if (element.HasChildren == 'Yes') {
                        Events.On(document.body, 'click.viewsecuritypanelonclickdetails' + depthNamespace + '.' + elementId, '#' + elementId, ViewSecurityPanel.OnClickDetail);
                    }
                    else {
                        Events.On(document.body, 'click.viewsecuritypanelonclickdetails' + depthNamespace + '.' + elementId, '#' + elementId, ViewSecurityPanel.OnClickChildlessDetail);
                    }
                }
                columnMarkup += element.Display;
                if (element.TopLevelClickEvent != 'Yes') {
                    columnMarkup += '<i class="gtc-viewsecuritypanel-infotooltip-icon gtc-icon-styles fa fa-info-circle"';
                    var tooltip = element.Display + '<br>Type:&nbsp;' + element.ElementType;
                    columnMarkup += ' data-tooltip="' + tooltip + '"';
                    columnMarkup += '></i>';
                }
                if (element.HasChildren == 'Yes') {
                    columnMarkup += '<i class="gtc-viewsecuritypanel-haschildren-icon gtc-icon-styles fa fa-caret-right"></i>';
                }
                columnMarkup += '</li>';
            }
        }
        var styleMarkup = '';
        if (hasTopLevel == false) {
            styleMarkup = ' style="display:none;"';
        }
        return '<div' + styleMarkup + ' class="gtc-viewsecuritypanel-column"><ul>' + columnMarkup + '</ul></div>';

    };

    function NoItemsToDisplay (isHidden, displayNotAllowed) {

        // Initialize
        var hiddenStyle = '';
        var textDisplay = 'PleaseChooseASecurityGroupAndView';

        // Start as hidden?
        if (isHidden == true) {
            hiddenStyle = ' style="display: none;"';
        }

        // Security group and view selected but not allowed?
        if (displayNotAllowed == true) {
            textDisplay = 'AllowViewToChangeElementSecurity'
        }
        return '<div class="gtc-displaydetail gtc-displaydetail-noitems"' + hiddenStyle + '><p data-translate="' + textDisplay + '">' + Common.TranslateKey(textDisplay) + '</p></div>';

    };

    function BuildDepthNamespace () {

        var namespace = '';
        var index = 0, length = DataCache.CurrentDepth + 1;
        for ( ; index < length; index++) {
            namespace += '.Depth' + index
        }
        return namespace;

    };

    function CreateCheckboxObject (isChecked, choiceName, checkboxName) {

        var checkboxField = {
            ChoiceDetail: {
                Choices: [
                    {
                        Display: '',
                        IsChecked: isChecked,
                        Name: choiceName
                    }
                ],
            },
            FocusIndex: 0,
            IsSerializable: 'Yes',
            MaximumGrids: 0,
            Name: checkboxName,
            Type: 'CheckboxField'
        };
        return checkboxField;

    };

    function ConfigureInfoTooltips (labelTooltips) {

        Events.On(labelTooltips, 'click',
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                var that = this;
                Widgets.tooltip(that, {
                    tooltipClass: 'gtc-viewsecuritypanel-infotooltip gtc-label-tooltip-style',
                    items: '[data-tooltip]',
                    content: function () {
                        return Common.GetAttr(this, 'data-tooltip');
                    },
                    close: function (event, ui) {
                        Widgets.tooltip(that, 'destroy');
                    },
                    position: {
                        my: 'center bottom-20',
                        at: 'center top',
                        using: function (position, positionData) {
                            var thisStyle = this.style;
                            thisStyle.top = position.top + 'px';
                            thisStyle.left = position.left + 'px';
                            var horizontal = 'center';
                            if (position.left == 0) {
                                horizontal = 'left';
                            }
                            else if (position.left + Common.Width(this) == Common.Width(window)) {
                                horizontal = 'right';
                            }
                            var newDiv = Common.Create('div', null, 'gtc-tooltip-arrow ' + positionData.vertical + ' ' + horizontal);
                            this.appendChild(newDiv);
                        }
                    }
                });
                Widgets.tooltip(that, 'open');
            }
        );

    };

    function ClearAll (viewSecurityPanel, viewSecurityPanelId) {

        // Initialize
        var translatePromises = [];

        // Clear all columns
        Common.Remove(Common.QueryAll('.gtc-viewsecuritypanel-column', viewSecurityPanel));

        // Update Title
        var title = Common.Get(viewSecurityPanelId + 'Title');
        var currentTranslation = Common.GetAttr(title, 'data-translate');
        var originalTitle = Common.GetAttr(title, 'data-originaltitle');
        if (currentTranslation != originalTitle) {
            var updateTitlePromise = Common.Promise();
            translatePromises.push(updateTitlePromise.promise);
            Velocity(title, { 'opacity': 0 }, 'slow',
                function () {
                    Common.SetAttr(title, 'data-translate', originalTitle);
                    title.textContent = Common.TranslateKey(originalTitle);
                    Velocity(title, 'reverse');
                    updateTitlePromise.resolve();
                }
            );
        }

        // Hide allow all buttons
        var allowAll = Common.Get(viewSecurityPanelId + 'AllowAll');
        Velocity(allowAll, 'fadeOut', 'slow');

        // Hide All Views
        var allowDenyAllDisplay = Common.Get(viewSecurityPanelId + 'AllowAllViewsDisplay');
        var allowDenyAllLinks = Common.Get(viewSecurityPanelId + 'AllowAllViews');
        Velocity(allowDenyAllDisplay, 'slideUp', 'slow');
        Velocity(allowDenyAllLinks, 'fadeOut', 'slow');

        // View not allowed, tell user
        var noItemsPromise = Common.Promise();
        translatePromises.push(noItemsPromise.promise);
        var viewSecurityPanelMarkup = NoItemsToDisplay(true, true);
        Common.InsertHTMLString(viewSecurityPanel, Common.InsertType.Append, viewSecurityPanelMarkup);
        Velocity(Common.Query('.gtc-displaydetail-noitems', viewSecurityPanel), 'slideDown', 'slow',
            function () {
                noItemsPromise.resolve();
                Page.SetPageHeight();
            }
        );

        // Retranslate
        if (translatePromises.length > 0) {
            var allPromise = Promise.all(translatePromises);
            allPromise.then(
                function () {
                    Common.RetranslatePage();
                }
            );
        }

    };

} (window.ViewSecurityPanel = window.ViewSecurityPanel || {}, window, document, Common, Cache, Events, Velocity));
