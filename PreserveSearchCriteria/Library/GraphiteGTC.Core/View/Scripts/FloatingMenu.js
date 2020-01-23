// Floating Menu
// Based On: FloatingMenu -> ViewElement
(function (FloatingMenu, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    FloatingMenu.Render = function (floatingMenu) {

        // Build class name
        var className = 'gtc-floatingmenu';
        className += ' gtc-floatingmenu-' + floatingMenu.Side.toLowerCase();
        className += ' gtc-floatingmenu-' + floatingMenu.Orientation.toLowerCase();

        // Div<, TabIndex@, Class@, Id@, Div>
        var floatingMenuMarkup = '<div role="navigation" class="' + className + '" data-namespace="FloatingMenu"' + ViewElement.RenderAttributes(floatingMenu) + '>';
        floatingMenuMarkup += '<ol class="gtc-floatingmenu-ol"><li><a role="button" aria-haspopup="true" id="' + floatingMenu.Name + '-OpenCloseAnchor" data-translate="Open">' + Common.TranslateKey('Open') + '</a></li></ol>';
        floatingMenuMarkup += '<ol aria-expanded="false" style="display: none;" id="' + floatingMenu.Name + '-OpenCloseMenu">';

        // Links
        if (Common.IsDefined(floatingMenu.Links) && floatingMenu.Links.length > 0) {
            // Links
            var index = 0, length = floatingMenu.Links.length;
            for ( ; index < length; index++) {
                // Li<>, Anchor, Li</>
                floatingMenuMarkup += '<li>' + LocalLink.Render(floatingMenu.Links[index]) + '</li>';
            }
        }

        // Configure Scrolling
        Events.One(document.body, 'configurefloatingmenu',
            function (event) {
                var floatingMenuObject = Common.Get(floatingMenu.Name);
                var openCloseAnchor = Common.Get(floatingMenu.Name + '-OpenCloseAnchor');
                var openCloseMenu = Common.Get(floatingMenu.Name + '-OpenCloseMenu');
                var isHorizontal = false;
                var showDirection = 'left';
                if (Common.HasClass(floatingMenuObject, 'gtc-floatingmenu-horizontal')) {
                    isHorizontal = true;
                    var floatingMenuOl = Common.Closest('.gtc-floatingmenu-ol', openCloseAnchor);
                    if (Common.HasClass(floatingMenuObject, 'gtc-floatingmenu-right')) {
                        openCloseMenu.parentNode.insertBefore(floatingMenuOl, openCloseMenu);
                        showDirection = 'right';
                    }
                }
                Events.On(openCloseAnchor, 'click',
                    function () {
                        if (Common.IsHidden(openCloseMenu)) {
                            if (isHorizontal) {
                                Velocity(openCloseMenu, 'fadeIn', { 'display': '' });
                            }
                            else {
                                Velocity(openCloseMenu, 'slideDown', { 'display': '' });
                            }
                            Common.SetAttr(openCloseMenu, 'aria-expanded', 'true');
                            Common.SetAttr(openCloseAnchor, 'data-translate', 'Close');
                            openCloseAnchor.textContent = Common.TranslateKey('Close');
                        }
                        else {
                            if (isHorizontal) {
                                Velocity(openCloseMenu, 'fadeOut');
                            }
                            else {
                                Velocity(openCloseMenu, 'slideUp');
                            }
                            Common.SetAttr(openCloseMenu, 'aria-expanded', 'false');
                            Common.SetAttr(openCloseAnchor, 'data-translate', 'Open');
                            openCloseAnchor.textContent = Common.TranslateKey('Open');
                        }
                    }
                );

                // Get initial offset and configure scroll event
                var menuLocation = Common.Offset(floatingMenuObject).top;
                Events.On(window, 'scroll.' + floatingMenu.Name, { MenuName: floatingMenu.Name, MenuLocation: menuLocation }, MoveFloatMenu);
            }
        );

        // Div</>
        floatingMenuMarkup += '</ol></div>';
        return floatingMenuMarkup;

    };

    // Private Methods
    function MoveFloatMenu (event) {

        var menuElement = Common.Get(event.data.MenuName);
        var menuLocation = event.data.MenuLocation;
        var menuOffset = menuLocation + this.pageYOffset + 'px';
        Velocity(menuElement, { top: menuOffset }, 100);

    };

} (window.FloatingMenu = window.FloatingMenu || {}, window, document, Common, Cache, Events, Velocity));
