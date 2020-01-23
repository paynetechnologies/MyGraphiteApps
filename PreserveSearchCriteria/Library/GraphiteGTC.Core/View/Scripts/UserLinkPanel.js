// User Link Panel
// Based On: UserLinkPanel -> ViewElement
(function (UserLinkPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    UserLinkPanel.Render = function (userLinkPanel) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var userLinkPanelMarkup = '<div data-namespace="UserLinkPanel" class="gtc-userlinkpanel"' + ViewElement.RenderAttributes(userLinkPanel) + '>';

        // Anchor<, Class@, Id@, Anchor>
        userLinkPanelMarkup += '<a class="gtc-mobile-nav-btn gtc-userlinkpanel-nav-btn" id="' + userLinkPanel.Name + 'MobileMenuLink"><i class="gtc-icon-styles fa fa-bars"></i></a>';

        // configuremobilemenu event: Setup configuring of mobile display (triggered from Page.Configure)
        Events.On(document.body, 'configuremobilemenu.' + userLinkPanel.Name + 'MobileMenuLink', '#' + userLinkPanel.Name + 'MobileMenuLink',
            function (event) {
                Widgets.mobilemenu(this, { MenuType: 'DropDown', TargetName: userLinkPanel.Name + 'Menu', ParentName: userLinkPanel.Name });
            }
        );

        // Ul<, Id@, Ul>, Li<>, Text, Li</>
        userLinkPanelMarkup += '<ul id="' + userLinkPanel.Name + 'Menu"><li id="' + userLinkPanel.Name + 'UserInfo" class="gtc-userlinkpanel-item">' + HtmlText.Render(userLinkPanel.UserInformation) + '</li>';

        // 508 Compliance
        if (Common.IsDefined(userLinkPanel.Logoff)) {
            if (Common.IsNotDefined(userLinkPanel.Logoff.Title)) {
                userLinkPanel.Logoff.Title = 'Logoff';
                userLinkPanel.Logoff.ScreenReaderOnly = true;
            }
        }
        if (Common.IsDefined(userLinkPanel.Settings)) {
            if (Common.IsNotDefined(userLinkPanel.Settings.Title)) {
                userLinkPanel.Settings.Title = 'Settings';
                userLinkPanel.Settings.ScreenReaderOnly = true;
            }
        }
        if (Common.IsDefined(userLinkPanel.Help)) {
            if (Common.IsNotDefined(userLinkPanel.Help.Title)) {
                userLinkPanel.Help.Title = 'Help';
                userLinkPanel.Help.ScreenReaderOnly = true;
            }
        }

        // Li<>, Logoff Hylerlink, Li</>
        if (Common.IsDefined(userLinkPanel.Logoff.Navigation)) {
            userLinkPanelMarkup += '<li class="gtc-userlinkpanel-item">' + Hyperlink.Render(userLinkPanel.Logoff) + '</li>';
        }

        // Li<>, Settings Hylerlink, Li</>
        userLinkPanelMarkup += '<li class="gtc-userlinkpanel-item">' + ModalLink.Render(userLinkPanel.Settings) + '</li>';

        // Li<>, Help Hylerlink, Li</>
        userLinkPanelMarkup += '<li class="gtc-userlinkpanel-item">' + Hyperlink.Render(userLinkPanel.Help) + '</li>';

        // Li<>, PageUrlButton, Li</>
        if (Common.IsDefined(userLinkPanel.PageUrlButton)) {
            userLinkPanelMarkup += '<li class="gtc-userlinkpanel-item">' + PageUrlButton.Render(userLinkPanel.PageUrlButton) + '</li>';
        }

        // Ul</>, Div</>
        userLinkPanelMarkup += '</ul></div>';

        // Return markup
        return userLinkPanelMarkup;

    };

    UserLinkPanel.UpdateValue = function (userLinkPanel, value, promises, context) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var onParent = context == 'Parent';
        var userInfo = Common.Query('.gtc-htmltext', Common.Get(userLinkPanel.id + 'UserInfo', onParent));
        var updateValueFunction = function () {
            userInfo.textContent = Common.TranslateKey(value);
            Common.SetAttr(userInfo, 'data-translate', value);
        };
        if (Common.IsHidden(userLinkPanel)) {
            updateValueFunction();
            animationPromise.resolve();
        }
        else {
            // Animate
            Velocity(userInfo, { 'opacity': 0 }, 'slow',
                function () {
                    updateValueFunction();
                    Velocity(userInfo, 'reverse',
                        function () {
                            Common.RemoveOpacity(userInfo);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

} (window.UserLinkPanel = window.UserLinkPanel || {}, window, document, Common, Cache, Events, Velocity));
