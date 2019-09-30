// SearchTool
// Based On: SearchTool -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (SearchTool, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SearchTool.Render = function (searchTool) {

        // Save/Swap for later
        var searchToolName = searchTool.Name;
        var searchToolOnClick = searchTool.OnChange;
        if (Common.IsEventViewElementDefined(searchToolOnClick)) {
            searchToolOnClick.FormToSerialize = 'Form' + searchToolName;
        }
        searchTool.OnChange = null;

        // Form<, TabIndex@, Class@, Id@, Form>
        searchTool.Name = 'Form' + searchToolName;
        var searchToolMarkup = '<form data-namespace="SearchTool" class="gtc-searchtool"' + ViewElement.RenderAttributes(searchTool) + '>';

        // Display Advanced?
        if (searchTool.IsAdvancedDisplayed == 'Yes') {
            // Advanced Hyperlink: Anchor<, TabIndex@, Id@, Anchor>
            var advancedHyperlink = {
                Name: 'AnchorAdvanced' + searchToolName,
                Navigation: searchTool.AdvancedNavigation,
                Icon: {
                    Symbol: 'fa-cog',
                    Color: '999999',
                    Size: 15
                },
                ScreenReaderOnly: true,
                Title: 'AdvancedSearch'
            };
            searchToolMarkup += Hyperlink.Render(advancedHyperlink);
        }

        Events.On(document.body, 'mouseenter.AnchorAdvanced' + searchToolName, '#AnchorAdvanced' + searchToolName,
            function () {
                Common.AddClass(Common.Query('i', this), 'fa-spin');
            }
        );
        Events.On(document.body, 'mouseleave.AnchorAdvanced' + searchToolName, '#AnchorAdvanced' + searchToolName,
            function () {
                Common.RemoveClass(Common.Query('i', this), 'fa-spin');
            }
        );

        // Render Search TextField
        searchTool.Name = searchToolName;
        searchToolMarkup += TextField.Render(searchTool);

        // Search Button: Anchor<, TabIndex@, Class@, Id@, Anchor>
        var searchButton = {
            Name: 'AnchorSearch' + searchToolName,
            OnClick: searchToolOnClick,
            Icon: {
                Symbol: 'fa-search',
                Color: '999999',
                Size: 15
            },
            ScreenReaderOnly: true,
            Title: 'Search'
        };

        // Attach "Enter" Key
        if (searchTool.SubmitWithEnterKey == "Yes") {
            Events.On(document.body, 'keyup.' + searchToolName,
                function (event) {
                    var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                    if (pressedKeyCode == "13") {
                        if (SearchTool.IsInContext()) {
                            if (Common.GetAttr(event.target, "data-namespace") == "TextField") {
                                if (document.activeElement.name == searchToolName) {
                                    var element = Common.Get('AnchorSearch' + searchToolName);
                                    Events.Trigger(element, 'click');
                                }
                            }
                        }
                    }
                }
            );
        }

        // Render "Search" Button
        searchToolMarkup += Button.Render(searchButton);

        // HTML 2.0 specification (Section 8.2):
        // When there is only one single-line text input field in a form,
        // the user agent should accept Enter in that field as a request to submit the form.
        // ------------------------------------------
        // This extra hidden (from screen readers too) field will stop the above from happening.
        searchToolMarkup += '<input class="gtc-hide" id="GTC' + Common.GenerateUniqueID() + '" type="text" />';

        // Form</>
        searchToolMarkup += '</form>';
        searchTool.Name = searchToolName;
        return searchToolMarkup;

    };

    SearchTool.IsInContext = function () {

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

} (window.SearchTool = window.SearchTool || {}, window, document, Common, Cache, Events, Velocity));
