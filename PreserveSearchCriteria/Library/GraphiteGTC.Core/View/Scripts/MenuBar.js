// MenuBar
// Based On: MenuBar -> ViewElement
(function (MenuBar, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    MenuBar.Render = function (menuBar) {

        // Initialize
        var menuBarMarkup = '';

        // Initialize extraClassing
        var extraClassing = '';

        // Styled?
        if (menuBar.Styled == 'Yes') {
            extraClassing += ' gtc-menubar-styled';
        }

        // Orientation
        extraClassing += ' gtc-menubar-' + menuBar.Orientation.toLowerCase();

        // Alignment
        extraClassing += ' gtc-menubar-align-' + menuBar.Alignment.toLowerCase();

        // Custom Background Color?
        if (Common.IsDefined(menuBar.BackgroundColor)) {
            // Add element specific class name
            var backgroundClassName = 'gtc-menubar-backgroundcolor-' + menuBar.Name.toLowerCase();
            extraClassing += ' ' + backgroundClassName;

            // Is custom background light or dark color?
            extraClassing += Colors.IsDarkColor(menuBar.BackgroundColor) ? ' gtc-theme-dark' : ' gtc-theme-light';

            // Generate color and styling
            var backgroundColor = Colors.ProcessValue(menuBar.BackgroundColor, false, null);
            var backgroundCSS = Colors.BackgroundCSS(backgroundColor);
            menuBarMarkup += '<style>';
            menuBarMarkup += ' .' + backgroundClassName + ' {';
            menuBarMarkup += backgroundCSS;
            menuBarMarkup += '}';
            menuBarMarkup += '</style>';
        }

        // I<>, Div<>
        var menuBarMobileLinkId = menuBar.Name + 'MobileLink';
        menuBarMarkup += '<i id="' + menuBarMobileLinkId +'" class="gtc-mobile-nav gtc-icon-styles fa fa-bars"></i><div class="gtc-menubar' + extraClassing + '" data-namespace="MenuBar"' + ViewElement.RenderAttributes(menuBar) + '>';

        // Links?
        if (Common.IsDefined(menuBar.Links) && menuBar.Links.length > 0) {
            // Links
            var index = 0, length = menuBar.Links.length;
            for ( ; index < length; index++) {
                // Render Link
                menuBarMarkup += Link.Render(menuBar.Links[index]);
            }
        }

        // Div</>
        menuBarMarkup += '</div>';

        // Attach click event
        var eventType = 'click';
        if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
            Touch.InitializeTouchEvents();
            eventType = 'tap';
        }
        Events.On(document.body, eventType, '#' + menuBarMobileLinkId,
            function (event) {
                var menuNode = Common.Get(event.target.getAttribute('Id'));
                if (menuNode.nextSibling.style.display == 'block') {
                    menuNode.nextSibling.style.display = 'none';
                }
                else {
                    menuNode.nextSibling.style.display = 'block';
                }
            }
        );

        // Return markup
        return menuBarMarkup;

    };

} (window.MenuBar = window.MenuBar || {}, window, document, Common, Cache, Events, Velocity));
