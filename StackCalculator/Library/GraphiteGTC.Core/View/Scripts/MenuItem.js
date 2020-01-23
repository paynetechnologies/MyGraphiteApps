// MenuItem
// Based On: MenuItem -> Link -> ViewElement
(function (MenuItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    MenuItem.Render = function (menuItem) {

        // Ul<
        var className = Link.RenderClassing(menuItem, 'menuitem');
        var menuItemMarkup = '<div data-namespace="MenuItem" class="' + className + '"' + ViewElement.RenderAttributes(menuItem);

        // Translations, Tooltip, 508 Compliance, Confirmation
        menuItemMarkup += Link.RenderAttributes(menuItem);

        // Ul>
        menuItemMarkup += '>';
        
        // <Span and Translations
        menuItemMarkup += '<span class="gtc-menuitem-title" data-translate="' + menuItem.Title + '">';
        
        // Icon
        if (Common.IsDefined(menuItem.Icon)) {
            menuItemMarkup += Icon.Render(menuItem.Icon, false);
        }
        
        // <>ul
        menuItemMarkup += menuItem.Title +'</span><ul class="gtc-menuitem-submenu">'

        // Links?
        if (Common.IsDefined(menuItem.Links) && menuItem.Links.length > 0) {
            // Links
            var index = 0, length = menuItem.Links.length;
            for ( ; index < length; index++) {
                // Render Link
                menuItemMarkup += '<li>' + Link.Render(menuItem.Links[index]) + '</li>';
            }
        }

        // </>ul
        menuItemMarkup += '</ul></div>';

        // Adjust for Alignment
        var eventType = 'mouseover';
        if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
            Touch.InitializeTouchEvents();
            eventType = 'tap';
        }
        Events.On(document.body, eventType + '.gtc-menuitem', '#' + menuItem.Name,
            function (event) {
                var childNode = Common.Query('.gtc-menuitem-submenu');
                var parentMenu = this.getBoundingClientRect();
                var childMenu = childNode.getBoundingClientRect();
                var childPosition = parentMenu.left + childMenu.width;
                var body = document.body.getBoundingClientRect();
                if(childPosition > body.right){
                    childNode.style.left = 'auto';
                    childNode.style.right = '-1px';
                }
            }
        );
        return menuItemMarkup;

    };

} (window.MenuItem = window.MenuItem || {}, window, document, Common, Cache, Events, Velocity));
