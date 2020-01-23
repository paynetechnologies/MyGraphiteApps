/** 
 * @class AppBar
 * @classdesc Supports the AppBar View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (AppBar, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function AppBar.Render
     * @param {object} appBar - The AppBar View Element in JSON format
     * @description Generates the HTML markup for the AppBar View Element 
     * @returns {string} HTML Markup of the AppBar View Element
     * @listens configureappbars (id = <var>appBarName</var>-userprofile)
     * @listens click (id = <var>appBarName</var>-userprofile)
     */
    AppBar.Render = function (appBar) {

        var appBarMarkup = '';
        var extraClassing = '';

        // Check for Background Color and add style
        if (Common.IsDefined(appBar.BackgroundColor)) {
            // Add element specific class name
            extraClassing += ' gtc-appbar-backgroundcolor-' + appBar.Name;

            // Is custom background light or dark color?
            extraClassing += Colors.IsDarkColor(appBar.BackgroundColor) ? ' gtc-theme-dark' : ' gtc-theme-light';

            // Generate color and styling
            var backgroundColor = Colors.ProcessValue(appBar.BackgroundColor, false, null);
            var backgroundCSS = Colors.BackgroundCSS(backgroundColor);
            appBarMarkup += '<style>';
            appBarMarkup += ' .gtc-appbar-backgroundcolor-' + appBar.Name + ' { ';
            appBarMarkup += backgroundCSS;
            appBarMarkup += ' }';
            appBarMarkup += '</style>';
        }

        // Div<, Class@, Div>
        appBarMarkup += '<div class="gtc-appbar' + extraClassing + '" data-namespace="AppBar" data-configure="Pre"' + ViewElement.RenderAttributes(appBar) + '>';

        // Div<, Class@, Div>
        appBarMarkup += '<div class="gtc-appbar-body' + extraClassing + '">';

        // Check for Slide Panel and Render
        if (Common.IsDefined(appBar.SlidePanel)) {
            // Div<, Class@, Div>
            appBarMarkup += '<div class="gtc-appbar-toggle">';

            // Define Slide Panel Button
            var sidePanelButton = {
                FocusIndex: appBar.FocusIndex,
                Icon: {
                    Name: appBar.SlidePanel.Name + 'MenuLinkIcon',
                    Symbol: 'fa-bars',
                    Type: 'Icon'
                },
                Name: appBar.SlidePanel.Name + 'MenuLink',
                Title: null,
                Type: 'Button'
            };
            appBarMarkup += Button.Render(sidePanelButton);

            // Div</>
            appBarMarkup += '</div>';

            // Render Side Panel Itself
            SlidePanel.Render(appBar.SlidePanel, true);
        }

        // Check for Image Link and Render
        if (Common.IsDefined(appBar.ImageLink)) {
            // Div<, Class@, Div>
            appBarMarkup += '<div class="gtc-appbar-logo">';
            appBarMarkup += ImageLink.Render(appBar.ImageLink);

            // Div</>
            appBarMarkup += '</div>';
        }

        // Check for Search Tool and Render
        if (Common.IsDefined(appBar.SearchTool)) {
            // Div<, Class@, Div>
            appBarMarkup += '<div class="gtc-appbar-search">';
            appBarMarkup += SearchTool.Render(appBar.SearchTool);

            // Div</>
            appBarMarkup += '</div>';
        }

        // Check for Links and Render
        if (Common.IsDefined(appBar.Links) && appBar.Links.length > 0) {
            // Div<, Class@, Div>
            appBarMarkup += '<div class="gtc-appbar-actions" id="' + appBar.Name + 'Links">';
            var i = 0;
            for (; i < appBar.Links.length; i++) {
                appBarMarkup += Link.Render(appBar.Links[i]);
            }

            // Div</>
            appBarMarkup += '</div>';
        }

        // Check for User Information
        if (Common.IsDefined(appBar.UserProfileIsDisplayed) && (appBar.UserProfileIsDisplayed == 'Yes')) {
            // Div<, Class@, Id@, Div>
            appBarMarkup += '<div class="gtc-userprofile" id="' + appBar.Name + '-userprofile">';

            // Button<, Class@, Button>
            appBarMarkup += '<button class="gtc-userprofile-button">';

            // Add User Information to Markup
            if (Common.IsDefined(appBar.UserInformation) && appBar.UserInformation.IsDisplayed == 'Yes') {
                appBarMarkup += HtmlText.Render(appBar.UserInformation);
            }

            // Render User Picture Image
            if (Common.IsDefined(appBar.UserPictureThumbnail)) {
                appBarMarkup += Image.Render(appBar.UserPictureThumbnail);
            }
            else {
                var bodyGroupForThumbnail = Common.GetAttr(document.body, 'data-group');
                var thumbnailSource = bodyGroupForThumbnail + ':Common:Profile_Thumbnail.png'
                appBarMarkup += Image.Render(
						{ Dimension: null,
						    FocusIndex: 0,
						    IsDisplayed: null,
						    IsResponsive: 'No',
						    Name: null,
						    Source: thumbnailSource,
						    Title: null,
						    Type: 'Image'
						});
            }

            // Button</>
            appBarMarkup += '</button>';

            // Wire Click Event for nav menu
            Events.One(document.body, 'configureappbars', '#' + appBar.Name + '-userprofile',
                function () {
                    Events.On(this, 'click',
                        function () {
                            var clickedPanel = Common.Query('#' + appBar.Name + '-menu', this);
                            if (Common.HasClass(clickedPanel, 'gtc-userprofile-menu--is-open')) {
                                Common.RemoveClass(clickedPanel, 'gtc-userprofile-menu--is-open');
                            }
                            else {
                                // Check to see if another appbar's profile is on the page and open
                                var currentlyOpenPanel = Common.Query('.gtc-userprofile-menu--is-open');
                                if (Common.IsDefined(currentlyOpenPanel)) {
                                    Common.RemoveClass(currentlyOpenPanel, 'gtc-userprofile-menu--is-open');
                                }
                                Common.AddClass(clickedPanel, 'gtc-userprofile-menu--is-open');
                            }
                        }
                    );
                }
            );

            // Nav<, Class@, Id@, Nav>
            appBarMarkup += '<nav class="gtc-userprofile-menu" id="' + appBar.Name + '-menu">';

            // Check if `UserPicture`, `UserInfo`, or `UserRole` is defined
            // `UserInfo` and `UserRole` checks if string is defined, Graphite GTC defines it to `true` otherwise
            // If true to any, build account markup
            if (Common.IsDefined(appBar.UserPicture) || Common.IsDefined(appBar.UserInformation) || Common.IsDefined(appBar.UserRole)) {
                // Div<, Class@, Div>
                appBarMarkup += '<div class="gtc-userprofile-account">';

                // Img<, Class@, Render Image, Img</>
                if (Common.IsDefined(appBar.UserPicture)) {
                    appBarMarkup += Image.Render(appBar.UserPicture);
                }
                else {
                    var bodyGroupForProfile = Common.GetAttr(document.body, 'data-group');
                    var profileSource = bodyGroupForProfile + ':Common:Profile_Picture.png'
                    appBarMarkup += Image.Render(
						{ Dimension: null,
						    FocusIndex: 0,
						    IsDisplayed: null,
						    IsResponsive: 'No',
						    Name: null,
						    Source: profileSource,
						    Title: null,
						    Type: 'Image'
						});
                }

                // Check if either `UserInfo` or `UserRole` have a value
                // Build `AccountInfo` markup
                if (Common.IsDefined(appBar.UserInformation) || Common.IsDefined(appBar.UserRole)) {
                    // Div<, Class@, Div>
                    appBarMarkup += '<div class="gtc-userprofile-account-info">';

                    // User Information
                    // Checks for `UserInfo` value and if it's displayed
                    if (Common.IsDefined(appBar.UserInformation) && appBar.UserInformation.IsDisplayed == 'Yes') {
                        appBarMarkup += '<span class="gtc-userprofile-name">';
                        appBarMarkup += HtmlText.Render(appBar.UserInformation);
                        appBarMarkup += '</span>';
                    }

                    // User Role
                    // Checks for `UserRole` value and if it's displayed
                    if (Common.IsDefined(appBar.UserRole) && appBar.UserRole.IsDisplayed == 'Yes') {
                        appBarMarkup += '<span class="gtc-userprofile-role">';
                        appBarMarkup += HtmlText.Render(appBar.UserRole);
                        appBarMarkup += '</span>';
                    }

                    // Div</>
                    appBarMarkup += '</div>';
                }

                // Div</>
                appBarMarkup += '</div>';
            }

            // Check for Navigation links and Render them
            if (Common.IsDefined(appBar.UserProfileLinks) && (appBar.UserProfileLinks.length > 0)) {
                // Div<, Class@, Div>
                appBarMarkup += '<div class="gtc-userprofile-menu-items">';
                var i = 0;
                for (; i < appBar.UserProfileLinks.length; i++) {
                    appBarMarkup += Link.Render(appBar.UserProfileLinks[i]);
                }

                // Div</>
                appBarMarkup += '</div>';
            }

            // Div<, Class@, Div>
            appBarMarkup += '<div class="gtc-userprofile-menu-items-common">';

            // 508 Compliance
            if (Common.IsDefined(appBar.Logoff)) {
                if (Common.IsNotDefined(appBar.Logoff.Title)) {
                    appBar.Logoff.Title = 'Logoff';
                    appBar.Logoff.ScreenReaderOnly = true;
                }
            }
            if (Common.IsDefined(appBar.Settings)) {
                if (Common.IsNotDefined(appBar.Settings.Title)) {
                    appBar.Settings.Title = 'Settings';
                    appBar.Settings.ScreenReaderOnly = true;
                }
            }
            if (Common.IsDefined(appBar.Help)) {
                if (Common.IsNotDefined(appBar.Help.Title)) {
                    appBar.Help.Title = 'Help';
                    appBar.Help.ScreenReaderOnly = true;
                }
            }

            // Logoff Hyperlink
            if (Common.IsDefined(appBar.Logoff.Navigation)) {
                appBarMarkup += Hyperlink.Render(appBar.Logoff);
            }

            // Settings Hyperlink
            if (Common.IsDefined(appBar.Settings.IsDisplayed) && appBar.Settings.IsDisplayed == 'Yes') {
                appBarMarkup += ModalLink.Render(appBar.Settings);
            }

            // Help Hyperlink
            if (Common.IsDefined(appBar.Help.IsDisplayed) && appBar.Help.IsDisplayed == 'Yes') {
                appBarMarkup += Hyperlink.Render(appBar.Help);
            }

            // Div</>, Nav</>, Div</>
            appBarMarkup += '</div></nav></div>';
        }

        // Div</>, Div</>
        appBarMarkup += '</div></div>';

        return appBarMarkup;
    };

    /**
     * @function AppBar.Configure
     * @param {object} appBar - The AppBar DOM element
     * @description Configures the AppBar View Element
     * @fires configureappbars (id = <i>appBarName</i>-userprofile)
     */
    AppBar.Configure = function (appBar, configureStage) {

        var userProfile = Common.Query('.gtc-userprofile', appBar);
        if (Common.IsDefined(userProfile)) {
            Events.Trigger(userProfile, 'configureappbars');
        }

    };

} (window.AppBar = window.AppBar || {}, window, document, Common, Cache, Events, Velocity));
