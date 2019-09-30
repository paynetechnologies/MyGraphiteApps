// Tab Group
// Based On: TabGroup -> ViewElement
(function (TabGroup, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    TabGroup.Render = function (tabGroup) {

        // Initialize
        var tabGroupMarkup = '';

        // Render Tabs
        if (Common.IsDefined(tabGroup.Tabs)) {
            var index = 0, length = tabGroup.Tabs.length;
            for ( ; index < length; index++) {
                tabGroupMarkup += Tab.Render(tabGroup.Tabs[index]);
            }
        }

        // Return
        return tabGroupMarkup;

    };

} (window.TabGroup = window.TabGroup || {}, window, document, Common, Cache, Events, Velocity));
