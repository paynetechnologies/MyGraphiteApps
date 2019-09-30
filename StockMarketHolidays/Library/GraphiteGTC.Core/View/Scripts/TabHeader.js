// Tab Header
// Based On: TabHeader -> ViewElement
(function (TabHeader, window, document, Common, Cache, Events, Velocity, undefined) {

    TabHeader.Options = {
        // Common
        TabTransition: 'Default',
        TabType: 'Default',
        Footer: false,
        OnChange: false
    };

    // Public Methods
    TabHeader.Render = function (tabHeader) {

        // Set Options
        SetOptions(tabHeader);

        // Div<, TabIndex@, Class@, Id@
        var tabHeaderMarkup = '<div data-namespace="TabHeader" class="gtc-tabheader"' + ViewElement.RenderAttributes(tabHeader);

        if (Common.IsDefined(tabHeader.OnChange)) {
            // OnChange
            tabHeaderMarkup += EventElement.AttachEvent(tabHeader.Name, 'change', tabHeader.OnChange, TabHeader.OnChange);

            // OnReset
            tabHeaderMarkup += EventElement.AttachEvent(tabHeader.Name, 'reset', tabHeader.OnReset, TabHeader.OnReset);

            // OnSave
            tabHeaderMarkup += EventElement.AttachEvent(tabHeader.Name, 'save', tabHeader.OnSave, TabHeader.OnSave);

            // OnSubmit
            tabHeaderMarkup += EventElement.AttachEvent(tabHeader.Name, 'submit', tabHeader.OnSubmit, TabHeader.OnSubmit);
        }
        else {
            // OnLeaveTab
            Events.On(document.body, 'leavetab.' + tabHeader.Name, '#' + tabHeader.Name, TabHeader.OnLeaveTab);

            // OnEnterTab
            Events.On(document.body, 'entertab.' + tabHeader.Name, '#' + tabHeader.Name, TabHeader.OnEnterTab);
        }

        // Div>
        tabHeaderMarkup += '>';

        // Anchor<, Class@, Id@, Anchor>
        tabHeaderMarkup += '<a class="gtc-mobile-nav-btn gtc-tabheader-nav-btn" id="' + tabHeader.Name + 'MobileMenuLink" data-translate="ChangeTabs">' + Common.TranslateKey('ChangeTabs') + '</a>';

        // Anchor<, Class@, Id@, Anchor>
        tabHeaderMarkup += '<a class="gtc-mobile-nav-close-btn gtc-tabheader-nav-close-btn" id="' + tabHeader.Name + 'MobileMenuClose"><i class="gtc-icon-styles fa fa-times"></i></a>';

        // configuremobilemenu event: Setup configuring of mobile display (triggered from Page.Configure)
        Events.On(document.body, 'configuremobilemenu.' + tabHeader.Name + 'MobileMenuLink', '#' + tabHeader.Name + 'MobileMenuLink',
            function (event) {
                Widgets.mobilemenu(this, { MenuType: 'SideBar', TargetName: tabHeader.Name + 'Menu', ParentName: tabHeader.Name, CloseButton: tabHeader.Name + 'MobileMenuClose' });
            }
        );

        // Check for tab alignments
        var classNames = 'gtc-tabbutton-container';
        if (Common.IsDefined(tabHeader.TabButtonStyle)) {
          classNames += ' gtc-tabbutton-container--' + tabHeader.TabButtonStyle.toLowerCase();
        }

        if (Common.IsDefined(tabHeader.TabButtonAlignment)) {
          classNames += ' gtc-tabbutton-container--align-' + tabHeader.TabButtonAlignment.toLowerCase();
        }

        // Ul<>
        tabHeaderMarkup += '<ul role="tablist" id="' + tabHeader.Name + 'Menu" class="' + classNames + '">';

        // Tab Buttons
        if (Common.IsDefined(tabHeader.TabButtons)) {
            var index = 0, length = tabHeader.TabButtons.length;
            for ( ; index < length; index++) {
                tabHeaderMarkup += TabButton.Render(index, tabHeader.TabButtons[index], TabHeader.Options);
            }
        }

        // Ul</>
        tabHeaderMarkup += '</ul>';

        // Div</>
        tabHeaderMarkup += '</div>';

        // Wire close to TabHeader
        Events.On(document.body, 'close.' + tabHeader.Name, '#' + tabHeader.Name, TabHeader.OnClose);

        // Return
        return tabHeaderMarkup;

    };

    TabHeader.OnLeaveTab = function (currentTabSelector, newTabSelector, tabHeaderElement) {

        var currentTab = Common.Query(currentTabSelector);
        var hasEvent = Common.GetAttr(currentTab, 'data-leave');
        if (Common.IsDefined(hasEvent)) {
            GTC.TriggerEvent(currentTab, 'leave',
                {
                    DivTabHeader: tabHeaderElement,
                    FromTab: currentTab.id,
                    ToTab: Common.Query(newTabSelector).id
                }
            );
        }
        else {
            var tabHeaderId = tabHeaderElement.id;
            GTC.TriggerEvent(document.body, 'pageinstructionscomplete.' + tabHeaderId + 'LeaveEnterHandling.' + tabHeaderId);
        }

    };

    TabHeader.OnEnterTab = function (currentTabSelector, newTabSelector, tabHeaderElement) {

        var newTab = Common.Query(newTabSelector);
        var hasEvent = Common.GetAttr(newTab, 'data-enter');
        if (Common.IsDefined(hasEvent)) {
            GTC.TriggerEvent(newTab, 'enter',
                {
                    DivTabHeader: tabHeaderElement,
                    FromTab: Common.Query(currentTabSelector).id,
                    ToTab: newTab.id
                }
            );
        }
        else {
            var tabHeaderId = tabHeaderElement.id;
            GTC.TriggerEvent(document.body, 'pageinstructionscomplete.' + tabHeaderId + 'LeaveEnterHandling.' + tabHeaderId);
        }

    };

    TabHeader.OnChange = function (event) {

        // Event Data from Event
        var tabHeader;
        var fromTab;
        var toTab;
        if (Common.IsDefined(event.EventData)) {
            tabHeader = event.EventData.DivTabHeader;
            fromTab = event.EventData.FromTab;
            toTab = event.EventData.ToTab;
        }
        else {
            tabHeader = event.target;
            fromTab = TabHeader.SelectedTab(tabHeader);
            toTab = fromTab;
        }

        // Check for disabled tab
        if (Common.GetAttr(Common.Query('.gtc-tabbutton-link[href="#' + toTab + '"]', tabHeader).parentNode, 'data-disabled') != 'true') {
            // Setup Tab Parameters
            var onChangeParameters = [
                {
                    Name: 'FromTab',
                    Value: fromTab,
                    UiParameters: null
                },
                {
                    Name: 'ToTab',
                    Value: toTab,
                    UiParameters: null
                }
            ];

            // Merge OnChange Parameters
            var onChangeEvent = JSON.parse(Common.GetAttr(tabHeader, 'data-change'));
            if (Common.IsDefined(onChangeEvent.UiParameters)) {
                onChangeParameters = onChangeParameters.concat(onChangeEvent.UiParameters);
            }

            // Add Form Parameters
            onChangeParameters = Form.AddFormParameters(onChangeParameters, Common.Query('.gtc-form', Common.Get(fromTab)));

            // Execute View Behavior
            Common.ExecuteViewBehavior(onChangeEvent.ControllerPath + onChangeEvent.ActionName, onChangeParameters, Page.RunInstructions, this);
        }

    };

    TabHeader.OnReset = function (event) {

        // Event Data from Event
        var tabHeader = event.target;
        var resetTab = TabHeader.SelectedTab(tabHeader);

        // Tab Reset Parameters
        var onResetParameters = [
            {
                Name: 'ResetTab',
                Value: resetTab,
                UiParameters: null
            }
        ];

        // Get OnResetEvent object
        var onResetEvent = JSON.parse(Common.GetAttr(tabHeader, 'data-reset'));
        if (Common.IsDefined(onResetEvent.UiParameters)) {
            onResetParameters = onResetParameters.concat(onResetEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onResetEvent.ControllerPath + onResetEvent.ActionName, onResetParameters, Page.RunInstructions, this);

    };

    TabHeader.OnSave = function (event) {

        // Event Data from Event
        var tabHeader = event.target;
        var saveTab = TabHeader.SelectedTab(tabHeader);

        // Tab Save Parameters
        var onSaveParameters = [
            {
                Name: 'SaveTab',
                Value: saveTab,
                UiParameters: null
            }
        ];

        // Get OnSaveEvent object
        var onSaveEvent = JSON.parse(Common.GetAttr(tabHeader, 'data-save'));
        if (Common.IsDefined(onSaveEvent.UiParameters)) {
            onSaveParameters = onSaveParameters.concat(onSaveEvent.UiParameters);
        }

        // Add Form Parameters
        onSaveParameters = Form.AddFormParameters(onSaveParameters, Common.Query('.gtc-form', Common.Get(saveTab)));

        // Execute View Behavior
        Common.ExecuteViewBehavior(onSaveEvent.ControllerPath + onSaveEvent.ActionName, onSaveParameters, Page.RunInstructions, this);

    };

    TabHeader.OnSubmit = function (event) {

        // Event Data from Event
        var tabHeader = event.target;
        var submitTab = TabHeader.SelectedTab(tabHeader);

        // Tab Submit Parameters
        var onSubmitParameters = [
            {
                Name: 'SubmitTab',
                Value: submitTab,
                UiParameters: null
            }
        ];

        // Get OnSubmitEvent object
        var onSubmitEvent = JSON.parse(Common.GetAttr(tabHeader, 'data-submit'));
        if (Common.IsDefined(onSubmitEvent.UiParameters)) {
            onSubmitParameters = onSubmitParameters.concat(onSubmitEvent.UiParameters);
        }

        // Add Form Parameters
        onSubmitParameters = Form.AddFormParameters(onSubmitParameters, Common.Query('.gtc-form', Common.Get(submitTab)));

        // Execute View Behavior
        Common.ExecuteViewBehavior(onSubmitEvent.ControllerPath + onSubmitEvent.ActionName, onSubmitParameters, Page.RunInstructions, this);

    };

    TabHeader.OnClose = function (event) {

        // Event Data from Event
        var tabHeader = event.EventData.DivTabHeader;
        var selectedTab = event.EventData.SelectedTab;

        // Form to Check
        var formToCheck = Common.Query('.gtc-form', Common.Get(selectedTab));
        if (Common.IsDefined(formToCheck)) {
            if (formToCheck.length > 0) {
                // Has Form changed?
                var confirmationMessage = JSON.parse(Common.GetAttr(Common.Get('TabFooterCloseButton'), 'data-confirmation'));
                if (Form.HasChanged(formToCheck) && Common.IsDefined(confirmationMessage)) {
                    confirmationMessage.Type = parseInt(confirmationMessage.Type, 10);
                    Modals.ShowMessageDialog(confirmationMessage,
                        function (modalResult) {
                            if (modalResult == Modals.ModalResult.Yes) {
                                Common.CloseView();
                            }
                        }
                    );
                }
                else {
                    Common.CloseView();
                }
            }
            else {
                Common.CloseView();
            }
        }
        else {
            Common.CloseView();
        }

    };

    TabHeader.Configure = function () {

        // Initialize
        var tabHeader = Common.Query('.gtc-tabheader');
        var ulTabHeaders = Common.Get(tabHeader.id + 'Menu');
        Common.Get('PageContent').style.position = 'relative';

        // Hide Tabs
        HideTabs(ulTabHeaders);

        // Configure Tab Swipping
        ConfigureTabSwipping(ulTabHeaders);

        // Configure Footer Buttons
        if (TabHeader.Options.Footer) {
            ConfigureFooterButtons(ulTabHeaders);
        }
        else {
            var tabFooter = Common.Query('[data-namespace="TabFooter"]');
            if (Common.IsDefined(tabFooter)) {
                tabFooter.style.display = 'none';
            }
        }

        // Show selected Tab
        ShowSelectedTab(ulTabHeaders);

        // Click
        BindBadgeTabClick(ulTabHeaders);
        
        // Configure Leave\Enter Handling
        if (!TabHeader.Options.OnChange) {
            ConfigureLeaveEnterHandling(tabHeader);
        }

    };

    TabHeader.ShowPinwheel = function (tabHeader) {
        // Show Pinwheel handled internally to TabHeader during tab transition
    };

    TabHeader.HidePinwheel = function (tabHeader) {

        // TabHeader's with OnChange should transition and hide Pinwheel here
        if (TabHeader.Options.OnChange && Common.IsDefined(Common.GetAttr(tabHeader, 'data-clickedtab'))) {
            setTimeout(
                function () {
                    AnimateTabTransition(tabHeader);
                },
                10
            );
        }

        // Note: Tab's with OnLeave/OnEnter Pinwheel handled internally during tab transition
    };

    TabHeader.UpdateStatus = function (tabHeader, uiParameters) {

        var clickedTab = Common.GetAttr(tabHeader, 'data-clickedtab');
        if (Common.IsDefined(uiParameters)) {
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];
                var liTabHeader = Common.Query('.gtc-tabbutton-link[href="#' + uiParameter.Name + '"]', tabHeader).parentNode;
                var oldStatus = Common.GetAttr(liTabHeader, 'data-status');
                if (oldStatus != uiParameter.Value) {
                    var tabSelected = (clickedTab == Common.Query('.gtc-tabbutton-link', liTabHeader).id);
                    Common.SetAttr(liTabHeader, 'data-status', uiParameter.Value);
                }
            }
        }

    };

    TabHeader.IsCompleted = function (tabHeader) {

        var tabButtons = Common.QueryAll('.gtc-tabbutton', tabHeader);
        var index = 0, length = tabButtons.length;
        for ( ; index < length; index++) {
            if (Common.GetAttr(tabButtons[index], 'data-status') != 'Complete') {
                return false;
            }
        }
        return true;

    };

    TabHeader.SelectedTab = function (tabHeader) {

        var selectedTabButton = Common.Query('.gtc-tabbutton[data-selected="true"]', tabHeader);
        return Common.Query(Common.GetAttr(Common.Query('.gtc-tabbutton-link', selectedTabButton), 'href')).id;

    };

    // Private Methods
    function SetOptions (tabHeader) {

        if (Common.IsDefined(tabHeader.TabTransition)) {
            TabHeader.Options.TabTransition = tabHeader.TabTransition;
        }
        if (Common.IsDefined(tabHeader.TabType)) {
            TabHeader.Options.TabType = tabHeader.TabType;
        }
        if (tabHeader.IsFooterEnabled == 'Yes') {
            TabHeader.Options.Footer = true;
        }
        if (Common.IsDefined(tabHeader.OnChange)) {
            TabHeader.Options.OnChange = true;
        }

    };

    function HideTabs (ulTabHeaders) {

        var tabLinks = Common.QueryAll('.gtc-tabbutton-link', ulTabHeaders);
        var tab, tabId, tabStyle, index = 0, length = tabLinks.length;
        for ( ; index < length; index++) {
            tabId = Common.GetAttr(tabLinks[index], 'href');
            tab = Common.Query(tabId);
            if (Common.IsDefined(tab)) {
                tabStyle = tab.style;
                tabStyle.position = 'absolute';
                tabStyle.display = 'none';
                Common.SetAttr(tab, 'aria-expanded', 'false');
            }
        }

    };

    function ConfigureTabSwipping (ulTabHeaders) {

        Touch.InitializeTouchEvents();
        var tabButtons = Common.QueryAll('.gtc-tabbutton', ulTabHeaders);
        var tabButton, tab, tabButtonLinks = Common.QueryAll('.gtc-tabbutton-link', ulTabHeaders), index = 0, length = tabButtonLinks.length;
        for ( ; index < length; index++) {
            tabButton = tabButtonLinks[index];
            tab = Common.Query(Common.GetAttr(tabButton, 'href'));

            // Previous
            Events.On(tab, 'swiperight',
                function (event) {
                    event.preventDefault();
                    var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
                    var previousTabHeaderIndex = Common.GetIndex(currentTabHeader) - 1;
                    var tabIndex = previousTabHeaderIndex;
                    for ( ; Common.GetAttr(tabButtons[previousTabHeaderIndex], 'data-disabled') == 'true' && tabIndex >= 0; tabIndex--) {
                        previousTabHeaderIndex = tabIndex;
                    }
                    if (previousTabHeaderIndex >= 0 && Common.GetAttr(tabButtons[previousTabHeaderIndex], 'data-disabled') != 'true') {
                        Events.Trigger(Common.Query('.gtc-tabbutton-link', tabButtons[previousTabHeaderIndex]), 'click');
                    }
                }
            );

            // Next
            Events.On(tab, 'swipeleft',
                function (event) {
                    event.preventDefault();
                    var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
                    var nextTabHeaderIndex = Common.GetIndex(currentTabHeader) + 1;
                    var tabIndex = nextTabHeaderIndex, length = tabButtons.length;
                    for ( ; Common.GetAttr(tabButtons[nextTabHeaderIndex], 'data-disabled') == 'true' && tabIndex < length; tabIndex++) {
                        nextTabHeaderIndex = tabIndex;
                    }
                    if (nextTabHeaderIndex < length && Common.GetAttr(tabButtons[nextTabHeaderIndex], 'data-disabled') != 'true') {
                        // Next
                        Events.Trigger(Common.Query('.gtc-tabbutton-link', tabButtons[nextTabHeaderIndex]), 'click');
                    }
                }
            );
        }

    };

    function ConfigureFooterButtons (ulTabHeaders) {

        // Initialize
        var tabHeader = ulTabHeaders.parentNode;

        // Close
        var closeButton = Common.Get('TabFooterCloseButton');
        if (Common.IsDefined(closeButton)) {
            Events.On(closeButton, 'click',
                function (event) {
                    event.preventDefault();
                    if (Common.QueryAll('.velocity-animating').length == 0) {
                        // Trigger close event
                        var tabId = Common.GetAttr(Common.Query('.gtc-tabbutton-link', Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders)), 'href');
                        GTC.TriggerEvent(tabHeader, 'close',
                            {
                                DivTabHeader: tabHeader,
                                SelectedTab: Common.Query(tabId).id
                            }
                        );
                    }
                }
            );
        }

        // Save
        var saveButton = Common.Get('TabFooterSaveButton');
        if (Common.IsDefined(saveButton)) {
            Events.On(saveButton, 'click',
                function (event) {
                    event.preventDefault();
                    if (Common.QueryAll('.velocity-animating').length == 0) {
                        // Trigger save event
                        var tabId = Common.GetAttr(Common.Query('.gtc-tabbutton-link', Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders)), 'href');
                        var tab = Common.Query(tabId);
                        if (TabHeader.Options.OnChange) {
                            GTC.TriggerEvent(tabHeader, 'save',
                                {
                                    DivTabHeader: tabHeader,
                                    SelectedTab: tab.id
                                }
                            );
                        }
                        else {
                            GTC.TriggerEvent(tab, 'save',
                                {
                                    DivTabHeader: tabHeader,
                                    SelectedTab: tab.id
                                }
                            );
                        }
                    }
                }
            );
        }

        // Reset
        var resetButton = Common.Get('TabFooterResetButton');
        if (Common.IsDefined(resetButton)) {
            Events.On(resetButton, 'click',
                function (event) {
                    event.preventDefault();
                    if (Common.QueryAll('.velocity-animating').length == 0) {
                        // Trigger reset event
                        var tabId = Common.GetAttr(Common.Query('.gtc-tabbutton-link', Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders)), 'href');
                        var tab = Common.Query(tabId);
                        if (TabHeader.Options.OnChange) {
                            GTC.TriggerEvent(tabHeader, 'reset',
                                {
                                    DivTabHeader: tabHeader,
                                    SelectedTab: tab.id
                                }
                            );
                        }
                        else {
                            GTC.TriggerEvent(tab, 'reset',
                                {
                                    DivTabHeader: tabHeader,
                                    SelectedTab: tab.id
                                }
                            );
                        }
                    }
                }
            );
        }

        // Previous
        Events.On(Common.Get('TabFooterPreviousButton'), 'click',
            function (event) {
                event.preventDefault();
                if (Common.QueryAll('.velocity-animating').length == 0) {
                    var tabButtons = Common.QueryAll('.gtc-tabbutton', ulTabHeaders);
                    var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
                    var previousTabHeaderIndex = Common.GetIndex(currentTabHeader) - 1;
                    var tabIndex = previousTabHeaderIndex;
                    for ( ; Common.GetAttr(tabButtons[previousTabHeaderIndex], 'data-disabled') == 'true' && tabIndex >= 0; tabIndex--) {
                        previousTabHeaderIndex = tabIndex;
                    }
                    if (previousTabHeaderIndex >= 0 && Common.GetAttr(tabButtons[previousTabHeaderIndex], 'data-disabled') != 'true') {
                        Events.Trigger(Common.Query('.gtc-tabbutton-link', tabButtons[previousTabHeaderIndex]), 'click');
                    }
                }
            }
        );

        // Next
        Events.On(Common.Get('TabFooterNextButton'), 'click',
            function (event) {
                // Handle Next and Submit
                event.preventDefault();
                if (Common.QueryAll('.velocity-animating').length == 0) {
                    var tabButtons = Common.QueryAll('.gtc-tabbutton', ulTabHeaders);
                    var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
                    var nextTabHeaderIndex = Common.GetIndex(currentTabHeader) + 1;
                    var tabIndex = nextTabHeaderIndex, length = tabButtons.length;
                    for ( ; Common.GetAttr(tabButtons[nextTabHeaderIndex], 'data-disabled') == 'true' && tabIndex < length; tabIndex++) {
                        nextTabHeaderIndex = tabIndex;
                    }
                    if (nextTabHeaderIndex < length && Common.GetAttr(tabButtons[nextTabHeaderIndex], 'data-disabled') != 'true') {
                        // Next
                        Events.Trigger(Common.Query('.gtc-tabbutton-link', tabButtons[nextTabHeaderIndex]), 'click');
                    }
                    else if (nextTabHeaderIndex > length || Common.GetAttr(tabButtons[nextTabHeaderIndex], 'data-disabled') == 'true') {
                        return;
                    }
                    else {
                        // Trigger submit event
                        var tabId = Common.GetAttr(Common.Query('.gtc-tabbutton-link', currentTabHeader), 'href');
                        var tab = Common.Query(tabId);
                        if (TabHeader.Options.OnChange) {
                            GTC.TriggerEvent(tabHeader, 'submit',
                                {
                                    DivTabHeader: tabHeader,
                                    SelectedTab: tab.id
                                }
                            );
                        }
                        else {
                            GTC.TriggerEvent(tab, 'submit',
                                {
                                    DivTabHeader: tabHeader,
                                    SelectedTab: tab.id
                                }
                            );
                        }
                    }
                }
            }
        );

    };

    function ShowPinwheel (tabButton) {

        // Show Pinwheel
        SpinKit.Show(tabButton, 'FadingCircle');

    };

    function HidePinwheel (tabHeader, tabButton) {

        // Hide Pinwheel
        SpinKit.Hide(tabButton);

    };

    function ShowSelectedTab (ulTabHeaders) {

        // Selected Tab
        var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
        if (Common.IsNotDefined(currentTabHeader)) {
            return;
        }

        // Show Tab
        var currentTabLink = Common.Query('.gtc-tabbutton-link', currentTabHeader);
        var selectedTab = Common.Query(Common.GetAttr(currentTabLink, 'href'));
        if (Common.IsNotDefined(selectedTab)) {
            return;
        }
        var selectedTabStyle = selectedTab.style;
        selectedTabStyle.display = 'block';
        selectedTabStyle.position = 'relative';
        Common.SetAttr(selectedTab, 'aria-expanded', 'true');

        // Set Tab header status
        var selectedTabStatus = Common.GetAttr(currentTabHeader, 'data-status');

        // Update Footer
        if (TabHeader.Options.Footer) {
            var tabButtons = Common.QueryAll('.gtc-tabbutton', ulTabHeaders);
            var currentTabHeaderIndex = Common.GetIndex(currentTabHeader);
            var beginTabHeaderIndex = 0;
            var lastTabHeaderIndex = tabButtons.length - 1;
            if (currentTabHeaderIndex == beginTabHeaderIndex) {
                Common.Get('TabFooterPreviousButton').style.display = 'none';
            }
            else {
                if (currentTabHeaderIndex == lastTabHeaderIndex) {
                    var tabFooterNextButton = Common.Get('TabFooterNextButton');
                    Common.SetAttr(tabFooterNextButton, 'data-translate', 'Submit');
                    tabFooterNextButton.textContent = Common.TranslateKey('Submit');
                }
            }
        }

    };

    function BindBadgeTabClick (ulTabHeaders) {

        // Bind Click to Tab
        var anchorTabHeader = Common.QueryAll('.gtc-tabbutton-link', ulTabHeaders);
        Events.On(anchorTabHeader, 'click',
            function (event) {
                // Prevent Default
                event.preventDefault();

                // Get old tab prior to switch
                var selectedTabButton = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
                ShowPinwheel(selectedTabButton);
                var removePinwheel = true;

                // Switch if not the same Tab
                if (selectedTabButton.firstChild.id != this.id) {
                    if (Common.QueryAll('.velocity-animating').length == 0) {
                        removePinwheel = false;

                        // Scroll to Top
                        Velocity(Common.QueryAll('html'), 'scroll', 500);

                        // Find current and newly selected tab
                        var currentTab = Common.GetAttr(Common.Query('.gtc-tabbutton-link', selectedTabButton), 'href');
                        var newTab = Common.GetAttr(this, 'href');
                        var tabHeader = ulTabHeaders.parentNode;
                        Common.SetAttr(tabHeader, 'data-clickedtab', this.id);

                        // Trigger change event \ Animate
                        if (TabHeader.Options.OnChange) {
                            GTC.TriggerEvent(tabHeader, 'change',
                                {
                                    DivTabHeader: tabHeader,
                                    FromTab: Common.Query(currentTab).id,
                                    ToTab: Common.Query(newTab).id
                                }
                            );
                        }
                        else if (!TabHeader.Options.OnChange) {
                            TabHeader.OnLeaveTab(currentTab, newTab, tabHeader);
                        }
                        else {
                            AnimateTabTransition(tabHeader);
                        }
                    }
                }
                if (removePinwheel) {
                    HidePinwheel(ulTabHeaders.parentNode, selectedTabButton);
                }
            }
        );

    };
    
    function ConfigureLeaveEnterHandling(tabHeaderElement) {

        // pageinstructionscomplete event: Setup triggering next tabs OnEnter after page instructions complete of current tabs OnLeave
        var tabHeaderId = tabHeaderElement.id;
        Cache.Set(tabHeaderElement, 'enterSemaphore', false);
        Events.On(document.body, 'pageinstructionscomplete.' + tabHeaderId + 'LeaveEnterHandling.' + tabHeaderId,
            function (event) {
                // Different Tab?
                var anchorClicked = Common.Get(Common.GetAttr(tabHeaderElement, 'data-clickedtab'));
                if (anchorClicked) {
                    var enterSemaphore = Cache.Get(tabHeaderElement, 'enterSemaphore');
                    if (!enterSemaphore && Common.IsDefined(Common.GetAttr(tabHeaderElement, 'data-clickedtab'))) {
                        Cache.Set(tabHeaderElement, 'enterSemaphore', true);

                        // Find current and newly selected tab
                        var currentTab = Common.GetAttr(Common.Query('.gtc-tabbutton-link', tabHeaderElement), 'href');
                        var anchorClickedParent = anchorClicked.parentNode;
                        var newTab = Common.GetAttr(anchorClicked, 'href');
                        TabHeader.OnEnterTab(currentTab, newTab, tabHeaderElement);
                    }
                    else {
                        Cache.Set(tabHeaderElement, 'enterSemaphore', false);
                        AnimateTabTransition(tabHeaderElement);
                    }
                }
            }
        );

    };

    function AnimateTabTransition(divTabHeader) {

        // Initialize
        var ulTabHeaders = Common.Query('.gtc-tabbutton-container', divTabHeader);
        var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);

        // Sanity Check
        var lastViewBehaviorReturnedValidations = Common.GetStorage("LastViewBehaviorReturnedValidations");
        if (lastViewBehaviorReturnedValidations) {
            HidePinwheel(divTabHeader, currentTabHeader);
            return;
        }

        // Get deferred object for animation
        var animationPromise = Common.Promise();

        // Deselect current tab header
        Common.RemoveClass(currentTabHeader, 'gtc-tabbutton-selected');
        var currentBadgeStatus = Common.GetAttr(currentTabHeader, 'data-status');
        Common.SetAttr(currentTabHeader, 'data-selected', 'false');
        Common.SetAttr(currentTabHeader, 'aria-selected', 'false');

        // Select new tab header
        var currentTabId = Common.GetAttr(Common.Query('.gtc-tabbutton-link', currentTabHeader), 'href');
        var currentTab = Common.Query(currentTabId);
        Common.SetAttr(currentTab, 'aria-expanded', 'false');
        var anchorClicked = Common.Get(Common.GetAttr(divTabHeader, 'data-clickedtab'));
        var anchorClickedParent = anchorClicked.parentNode;
        var newTabId = Common.GetAttr(anchorClicked, 'href');
        var newTab = Common.Query(newTabId);
        Common.SetAttr(newTab, 'aria-expanded', 'true');
        Common.RemoveAttr(divTabHeader, 'data-clickedtab');
        Common.AddClass(anchorClickedParent, 'gtc-tabbutton-selected');
        var newBadgeStatus = Common.GetAttr(anchorClickedParent, 'data-status');
        Common.SetAttr(anchorClickedParent, 'data-selected', 'true');
        Common.SetAttr(anchorClickedParent, 'aria-selected', 'true');

        // Update mobile menu text
        if (Common.CheckMedia('Mobile')) {
            var newMobileMenuValue = Common.Query('.gtc-tabbutton-title', anchorClicked).textContent;
            Common.Get(divTabHeader.id + 'MobileMenuLink').textContent = newMobileMenuValue;
        }

        // Check for modal tabs, resize and recenter if needed
        var isInIframe = Common.IsModal();
        if (isInIframe) {
            var pageContent = Common.Get('PageContent');
            var currentTab = Common.Query(currentTabId);
            var newTab = Common.Query(newTabId);

            // New tab is most likely hidden so add styling to get real height
            var positionStyle = Common.GetStyle(newTab, 'position');
            if (positionStyle != 'absolute') {
                newTab.style.position = 'absolute';
            }
            newTab.style.zIndex = '-150';
            newTab.style.display = 'block';

            // Get tab heights
            var currentHeight = Common.Height(pageContent, true);
            var oldTabHeight = Common.Height(currentTab, true);
            var newTabHeight = Common.Height(newTab, true);

            // Reset new tabs original styles
            newTab.style.display = 'none';
            newTab.style.zIndex = '';
            if (positionStyle != 'absolute') {
                newTab.style.position = positionStyle;
            }

            // Handle height calculations
            var heightChange = false, heightDifference;
            if (oldTabHeight > newTabHeight) {
                heightDifference = oldTabHeight - newTabHeight;
                Common.Get('PageContent').style.height = (currentHeight - heightDifference) + 'px';
                heightChange = true;
            }
            else if (newTabHeight > oldTabHeight) {
                heightDifference = newTabHeight - oldTabHeight;
                Common.Get('PageContent').style.height = (currentHeight + heightDifference) + 'px';
                heightChange = true;
            }

            // Resize modal if height has changed
            if (heightChange) {
                Common.ResizeView(true);
            }
        }

        // Tab Transaction
        switch (TabHeader.Options.TabTransition) {
            case 'Default':
                ShowTab(currentTab, newTab, animationPromise);
                break;
            case 'Fade':
                FadeTab(currentTab, newTab, animationPromise);
                break;
            case 'Slide':
                var currentTabIndex = Common.GetIndex(currentTabHeader);
                var newTabIndex = Common.GetIndex(anchorClickedParent);
                SlideTab(currentTab, newTab, currentTabIndex, newTabIndex, animationPromise);
                break;
        }

        // Update Footer
        if (TabHeader.Options.Footer) {
            UpdateFooterButtons(ulTabHeaders);
        }

        // Set Page Height (for the new Tab)
        animationPromise.promise.then(
            function () {
                Page.SetPageHeight();
                HidePinwheel(divTabHeader, currentTabHeader);
            }
        );

    };

    function ShowTab(currentTab, newTab, animationPromise) {

        currentTab.style.display = 'none';
        var newTabStyle = newTab.style;
        newTabStyle.display = '';
        newTabStyle.position = 'relative';
        animationPromise.resolve();

    };

    function FadeTab(currentTab, newTab, animationPromise) {

        Velocity(currentTab, 'fadeOut', 700,
            function () {
                Velocity(newTab, 'fadeIn', 700,
                    function () {
                        newTab.style.position = 'relative';
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

    function SlideTab(currentTab, newTab, currentTabIndex, newTabIndex, animationPromise) {

        // Same tab?
        if (newTabIndex == currentTabIndex) {
            return;
        }

        // Slide
        var currentTabParent = Common.Closest(':not(.gtc-grid-container):not(.gtc-tab)', currentTab);
        var contentWidth = Common.Width(currentTabParent);
        currentTabParent.style.overflow = 'hidden';
        var currentTabStyle = currentTab.style;
        currentTabStyle.position = 'absolute';
        var newTabStyle = newTab.style;
        newTabStyle.position = 'absolute';
        if (currentTabIndex < newTabIndex) {
            // Move to new tab right after current tab
            newTabStyle.left = contentWidth + 'px';
            newTabStyle.display = 'block';

            // Animate
            if ((currentTabIndex + 1) != newTabIndex) {
                // Slide and bounce
                Velocity(currentTab, { 'left': '-=' + contentWidth + 'px' }, 'fast',
                    function () {
                        currentTabStyle.display = 'none';
                    }
                );
                Velocity(newTab, { 'left': '-=' + contentWidth + 'px' }, 'fast',
                    function () {
                        Velocity(newTab, 'callout.shake', 'slow',
                            function () {
                                newTabStyle.position = 'relative';
                                newTabStyle.transform = '';
                            }
                        );
                        animationPromise.resolve();
                    }
                );
            }
            else {
                // Slide
                Velocity(currentTab, { 'left': '-=' + contentWidth + 'px' }, 'slow',
                    function () {
                        currentTabStyle.display = 'none';
                    }
                );
                Velocity(newTab, { 'left': '-=' + contentWidth + 'px' }, 'slow',
                    function () {
                        newTabStyle.position = 'relative';
                        animationPromise.resolve();
                    }
                );
            }
        }
        else {
            newTabStyle.left = '-' + contentWidth + 'px';
            newTabStyle.display = 'block';
            if ((newTabIndex + 1) != currentTabIndex) {
                // Slide and bounce
                Velocity(currentTab, { 'left': '+=' + contentWidth + 'px' }, 'fast',
                    function () {
                        currentTabStyle.display = 'none';
                    }
                );
                Velocity(newTab, { 'left': '+=' + contentWidth + 'px' }, 'fast',
                    function () {
                        Velocity(newTab, 'callout.shake', 'slow',
                            function () {
                                newTabStyle.position = 'relative';
                                newTabStyle.transform = '';
                            }
                        );
                        animationPromise.resolve();
                    }
                );
            }
            else {
                // Slide
                Velocity(currentTab, { 'left': '+=' + contentWidth + 'px' }, 'slow',
                    function () {
                        currentTabStyle.display = 'none';
                    }
                );
                Velocity(newTab, { 'left': '+=' + contentWidth + 'px' }, 'slow',
                    function () {
                        newTabStyle.position = 'relative';
                        animationPromise.resolve();
                    }
                );
            }
        }

    };

    function UpdateFooterButtons(ulTabHeaders) {

        var currentTabHeader = Common.Query('.gtc-tabbutton[data-selected="true"]', ulTabHeaders);
        var tabButtons = Common.QueryAll('.gtc-tabbutton', ulTabHeaders);
        var currentTabHeaderIndex = Common.GetIndex(currentTabHeader);
        var beginTabHeaderIndex = 0;
        var lastTabHeaderIndex = tabButtons.length - 1;

        // Show/Hide or Change Buttons
        var previousButton = Common.Get('TabFooterPreviousButton');
        if (currentTabHeaderIndex == beginTabHeaderIndex) {
            // Hide Previous if visible
            if (Common.IsVisible(previousButton)) {
                Velocity(previousButton, 'fadeOut', 700);
            }
        }
        else {
            // Show Previous if hidden
            if (Common.IsHidden(previousButton)) {
                Velocity(previousButton, 'fadeIn', { duration: 700, display: '' });
            }
        }

        // Next/Submit Button
        var nextButton = Common.Get('TabFooterNextButton');
        if (currentTabHeaderIndex < lastTabHeaderIndex) {
            // Change Submit to Next
            Velocity(nextButton, { 'opacity': 0 }, 700,
                function () {
                    var nextTitle = Common.GetAttr(nextButton, 'data-nexttitle');
                    Common.SetAttr(nextButton, 'data-translate', nextTitle);
                    nextButton.textContent = Common.TranslateKey(nextTitle);
                    Velocity(nextButton, 'reverse', Common.RemoveOpacity);
                }
            );
        }
        else {
            // Change Next to Submit
            var nextHtmlText = nextButton.textContent;
            var nextTitle = Common.GetAttr(nextButton, 'data-nexttitle');
            if (nextHtmlText == nextTitle || nextHtmlText == Common.TranslateKey(nextTitle)) {
                Velocity(nextButton, { 'opacity': 0 }, 700,
                    function () {
                        var submitTitle = Common.GetAttr(nextButton, 'data-submittitle');
                        Common.SetAttr(nextButton, 'data-translate', submitTitle);
                        nextButton.textContent = Common.TranslateKey(submitTitle);
                        Velocity(nextButton, 'reverse', Common.RemoveOpacity);
                    }
                );
            }
        }

    };

} (window.TabHeader = window.TabHeader || {}, window, document, Common, Cache, Events, Velocity));
