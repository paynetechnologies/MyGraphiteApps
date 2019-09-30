// Tab
// Based On: Tab -> ContainerElement -> ViewElement
(function (Tab, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Tab.Render = function (tab) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var tabMarkup = '<div role="tabpanel" data-namespace="Tab" class="gtc-tab"' + ViewElement.RenderAttributes(tab);

        // OnEnter
        tabMarkup += EventElement.AttachEvent(tab.Name, 'enter', tab.OnEnter, Tab.OnEnter);

        // OnLeave
        tabMarkup += EventElement.AttachEvent(tab.Name, 'leave', tab.OnLeave, Tab.OnLeave);

        // OnSave
        tabMarkup += EventElement.AttachEvent(tab.Name, 'save', tab.OnSave, Tab.OnSave);

        // OnReset
        tabMarkup += EventElement.AttachEvent(tab.Name, 'reset', tab.OnReset, Tab.OnReset);

        // OnSubmit
        tabMarkup += EventElement.AttachEvent(tab.Name, 'submit', tab.OnSubmit, Tab.OnSubmit);

        // Div>
        tabMarkup += '>';

        // Render Container ViewElements
        tabMarkup += ContainerElement.RenderElements(tab);

        // Div</>
        tabMarkup += '</div>';
        return tabMarkup;

    };

    Tab.OnLeave = function (event) {

        // Event Data from Event
        var tabHeader;
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
            // Initialize
            var onChangeParameters = [];

            // Merge OnLeave Parameters
            var onLeaveEvent = JSON.parse(Common.GetAttr(this, 'data-leave'));
            if (Common.IsDefined(onLeaveEvent.UiParameters)) {
                onChangeParameters = onChangeParameters.concat(onLeaveEvent.UiParameters);
            }

            // Add Form Parameters
            onChangeParameters = Form.AddFormParameters(onChangeParameters, Common.Query('.gtc-form', Common.Get(fromTab)), true);

            // Execute View Behavior
            Common.ExecuteViewBehavior(onLeaveEvent.ControllerPath + onLeaveEvent.ActionName, onChangeParameters, Page.RunInstructions, tabHeader);
        }

    };

    Tab.OnEnter = function (event) {

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
            // Initialize Tab Parameters
            var onChangeParameters = [
                {
                    Name: 'FromTab',
                    Value: fromTab,
                    UiParameters: null
                }
            ];

            // Merge OnEnter Parameters
            var onEnterEvent = JSON.parse(Common.GetAttr(this, 'data-enter'));
            if (Common.IsDefined(onEnterEvent.UiParameters)) {
                onChangeParameters = onChangeParameters.concat(onEnterEvent.UiParameters);
            }

            // Add Form Parameters
            onChangeParameters = Form.AddFormParameters(onChangeParameters, Common.Query('.gtc-form', Common.Get(fromTab)), true);

            // Execute View Behavior
            Common.ExecuteViewBehavior(onEnterEvent.ControllerPath + onEnterEvent.ActionName, onChangeParameters, Page.RunInstructions, tabHeader);
        }

    };

    Tab.OnReset = function (event) {

        // Get TabHeader
        var tabHeader = event.EventData.DivTabHeader;

        // Initialize Parameters
        var onResetParameters = [];

        // Get OnResetEvent object
        var onResetEvent = JSON.parse(Common.GetAttr(this, 'data-reset'));
        if (Common.IsDefined(onResetEvent.UiParameters)) {
            onResetParameters = onResetParameters.concat(onResetEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onResetEvent.ControllerPath + onResetEvent.ActionName, onResetParameters, Page.RunInstructions, tabHeader);

    };

    Tab.OnSave = function (event) {

        // Get TabHeader
        var tabHeader = event.EventData.DivTabHeader;
        var saveTab = TabHeader.SelectedTab(tabHeader);

        // Initialize Parameters
        var onSaveParameters = [];

        // Get OnSaveEvent object
        var onSaveEvent = JSON.parse(Common.GetAttr(this, 'data-save'));
        if (Common.IsDefined(onSaveEvent.UiParameters)) {
            onSaveParameters = onSaveParameters.concat(onSaveEvent.UiParameters);
        }

        // Add Form Parameters
        onSaveParameters = Form.AddFormParameters(onSaveParameters, Common.Query('.gtc-form', Common.Get(saveTab)), true);

        // Execute View Behavior
        Common.ExecuteViewBehavior(onSaveEvent.ControllerPath + onSaveEvent.ActionName, onSaveParameters, Page.RunInstructions, tabHeader);

    };

    Tab.OnSubmit = function (event) {

        // Event Data from Event
        var tabHeader = event.EventData.DivTabHeader;
        var submitTab = TabHeader.SelectedTab(tabHeader);

        // Initialize Parameters
        var onSubmitParameters = [];

        // Get OnSubmitEvent object
        var onSubmitEvent = JSON.parse(Common.GetAttr(this, 'data-submit'));
        if (Common.IsDefined(onSubmitEvent.UiParameters)) {
            onSubmitParameters = onSubmitParameters.concat(onSubmitEvent.UiParameters);
        }

        // Add Form Parameters
        onSubmitParameters = Form.AddFormParameters(onSubmitParameters, Common.Query('.gtc-form', Common.Get(submitTab)), true);

        // Execute View Behavior
        Common.ExecuteViewBehavior(onSubmitEvent.ControllerPath + onSubmitEvent.ActionName, onSubmitParameters, Page.RunInstructions, tabHeader);

    };

} (window.Tab = window.Tab || {}, window, document, Common, Cache, Events, Velocity));
