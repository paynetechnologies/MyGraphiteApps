// Toolbar Panel
// Based On: ToolbarPanel -> ViewElement
(function (ToolbarPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ToolbarPanel.Render = function (toolbarPanel) {

        // Focus Index
        var quickLinksFocusIndex = 0;
        if (toolbarPanel.FocusIndex > 0) {
            quickLinksFocusIndex = toolbarPanel.FocusIndex;
            toolbarPanel.FocusIndex = 0;
        }

        // ToolBarPanel's title
        var toolbarTitle = toolbarPanel.Title || '';

        // Div<, TabIndex@, Class@, Id@, Div>
        var toolbarPanelMarkup = '<div ' + ViewElement.RenderAttributes(toolbarPanel) + ' class="gtc-toolbarpanel" data-namespace="ToolbarPanel" role="toolbar">';

        // Header Menu<>
        toolbarPanelMarkup += '<div class="gtc-toolbarpanel-header">';
        toolbarPanelMarkup += '<nav id="' + toolbarPanel.Name + 'Menu" class="gtc-toolbarpanel-nav" aria-haspopup="true" aria-hidden="false" aria-label="ToolBarPanel navigation menu">';

        // Create ToolBarPanel title
        // HTML depends on if QuickNavigationLinks is defined
        if (Common.IsDefined(toolbarPanel.QuickNavigationLinks)) {
            toolbarPanelMarkup += '<a id="' + toolbarPanel.Name + 'Trigger" class="gtc-toolbarpanel-trigger gtc-page-theme-gradient" href="#' + toolbarPanel.Name + 'QuickLinksList"';
            if (quickLinksFocusIndex > 0) {
                toolbarPanelMarkup += ' tabindex="' + quickLinksFocusIndex + '"';
            }
            toolbarPanelMarkup += '><h1 id="' + toolbarPanel.Name + 'Title" class="gtc-toolbarpanel-trigger-title gtc-page-theme-color"';
            toolbarPanelMarkup += ' data-translate="' + toolbarTitle + '">';
            toolbarPanelMarkup += Common.TranslateKey(toolbarTitle);
            toolbarPanelMarkup += '</h1></a>';
        }
        else {
            // Finish building title when quickLinks are not defined
            toolbarPanelMarkup += '<h1 id="' + toolbarPanel.Name + 'Title" class="gtc-toolbarpanel-title gtc-page-theme-color gtc-page-theme-gradient';
            toolbarPanelMarkup += '" data-translate="' + toolbarTitle + '">';
            toolbarPanelMarkup += Common.TranslateKey(toolbarTitle) + '</h1>';
        }

        // Quick Navigation Links
        if (Common.IsDefined(toolbarPanel.QuickNavigationLinks)) {

            // Ul<>
            toolbarPanelMarkup += '<ul id="' + toolbarPanel.Name + 'QuickLinksList" class="gtc-toolbarpanel-menu" role="menu" aria-hidden="true" aria-expanded="false">';

            // Render Quick Navigation links
            var index = 0, length = toolbarPanel.QuickNavigationLinks.length;
            for ( ; index < length; index++) {
                // Li<>, Anchor, Li </>
                toolbarPanelMarkup += '<li class="gtc-toolbarpanel-menu-item" role="menuitem">';
                if (toolbarPanel.QuickNavigationLinks[index].Type == "Hyperlink") {
                    toolbarPanelMarkup += Hyperlink.Render(toolbarPanel.QuickNavigationLinks[index]);
                }
                else if (toolbarPanel.QuickNavigationLinks[index].Type == "UrlLink") {
                    toolbarPanelMarkup += UrlLink.Render(toolbarPanel.QuickNavigationLinks[index]);
                }
                toolbarPanelMarkup += '</li>';
            }

            // Wire Quick Navigation Click
            Events.On(document.body, 'click.' + toolbarPanel.Name + 'Trigger', '#' + toolbarPanel.Name + 'Trigger',
                function (event) {
                    event.preventDefault();
                    var toolBarMenu = Common.Get(toolbarPanel.Name + 'Menu');
                    var quickLinksList = Common.Get(toolbarPanel.Name + 'QuickLinksList');
                    var anchorWidth = Common.Width(this, true);
                    quickLinksList.style.width = anchorWidth + 'px';
                    if (Common.IsHidden(quickLinksList)) {
                        Common.AddClass(toolBarMenu, 'gtc-toolbarpanel-nav-open');
                        Common.SetAttr(quickLinksList, 'aria-hidden', 'false');
                        Common.SetAttr(quickLinksList, 'aria-expanded', 'true');
                        Velocity(quickLinksList, 'slideDown', 400);
                        Events.On(document, 'keydown.' + toolbarPanel.Name + 'QuickLinksList',
                            function (keydownEvent) {
                                document.activeElement.blur();
                                var quickLink = quickLinksList.children;
                                var quickLinkSelected = Common.Query('.gtc-toolbarpanel-menu-item-active', quickLink);
                                var pressedKeyCode = (keydownEvent.keyCode ? keydownEvent.keyCode : keydownEvent.which);
                                if (pressedKeyCode == GTC.Keyboard.Up || pressedKeyCode == GTC.Keyboard.Down || pressedKeyCode == GTC.Keyboard.Tab || keydownEvent.shiftKey && pressedKeyCode == GTC.Keyboard.Tab) {
                                    keydownEvent.preventDefault();
                                    if (Common.IsNotDefined(quickLinkSelected)) {
                                        Common.AddClass(quickLink[0], 'gtc-toolbarpanel-menu-item-active');
                                        quickLink[0].firstChild.focus();
                                    }
                                    else {
                                        var nextNavLink = null;
                                        if (pressedKeyCode == GTC.Keyboard.Up || keydownEvent.shiftKey && pressedKeyCode == GTC.Keyboard.Tab) {
                                            nextNavLink = Common.GetSibling(quickLinkSelected, Common.SiblingType.Previous);
                                        }
                                        else if (pressedKeyCode == GTC.Keyboard.Down || pressedKeyCode == GTC.Keyboard.Tab) {
                                            nextNavLink = Common.GetSibling(quickLinkSelected, Common.SiblingType.Next);
                                        }
                                        if (Common.IsDefined(nextNavLink)) {
                                            Common.RemoveClass(quickLinkSelected, 'gtc-toolbarpanel-menu-item-active');
                                            Common.AddClass(nextNavLink, 'gtc-toolbarpanel-menu-item-active');
                                        }
                                    }
                                }
                                else if (pressedKeyCode == GTC.Keyboard.Enter) {
                                    if (Common.IsDefined(quickLinkSelected)) {
                                        Events.Trigger(quickLinkSelected.firstChild, 'click');
                                    }
                                }
                                else if (pressedKeyCode == GTC.Keyboard.Escape) {
                                    Common.RemoveClass(toolBarMenu, 'gtc-toolbarpanel-nav-open');
                                    Common.SetAttr(quickLinksList, 'aria-hidden', 'true');
                                    Common.SetAttr(quickLinksList, 'aria-expanded', 'false');
                                    Velocity(quickLinksList, 'slideUp', 400);
                                    Events.Off(document, 'keydown.' + toolbarPanel.Name + 'QuickLinksList');
                                    Common.RemoveClass(quickLinkSelected, 'gtc-toolbarpanel-menu-item-active');
                                }
                            }
                        );
                    }
                    else {
                        Common.RemoveClass(toolBarMenu, 'gtc-toolbarpanel-nav-open');
                        Common.SetAttr(quickLinksList, 'aria-hidden', 'true');
                        Common.SetAttr(quickLinksList, 'aria-expanded', 'false');
                        Velocity(quickLinksList, 'slideUp', 400);
                        Events.Off(document, 'keydown.' + toolbarPanel.Name + 'QuickLinksList');
                        Common.RemoveClass(Common.Query('.gtc-toolbarpanel-menu-item-active', quickLinksList), 'gtc-toolbarpanel-menu-item-active');
                    }
                }
            );

            // Wire Body Click
            Events.On(document.body, 'click.' + toolbarPanel.Name + 'QuickLinksList',
                function () {
                    var toolBarMenu = Common.Get(toolbarPanel.Name + 'Menu');
                    var quickLinksList = Common.Get(toolbarPanel.Name + 'QuickLinksList');
                    var quickLinkSelected = Common.Query('.gtc-toolbarpanel-menu-item-active', quickLinksList);
                    if (Common.IsVisible(quickLinksList)) {
                        Common.RemoveClass(toolBarMenu, 'gtc-toolbarpanel-nav-open');
                        Common.SetAttr(quickLinksList, 'aria-hidden', 'true');
                        Common.SetAttr(quickLinksList, 'aria-expanded', 'false');
                        Velocity(quickLinksList, 'slideUp', 400);
                        Events.Off(document, 'keydown.' + toolbarPanel.Name + 'QuickLinksList');
                        Common.RemoveClass(quickLinkSelected, 'gtc-toolbarpanel-menu-item-active');
                    }
                }
            );

            // Prevent clicks on navigation from reaching the body
            Events.On(document.body, 'click.' + toolbarPanel.Name + 'QuickLinksList', '#' + toolbarPanel.Name + 'QuickLinksList',
                function (event) {
                    event.stopPropagation();
                }
            );
            Events.On(document.body, 'click.' + toolbarPanel.Name + 'QuickLinksAnchor', '#' + toolbarPanel.Name + 'QuickLinksAnchor',
                function (event) {
                    event.stopPropagation();
                }
            );

            // 508 Compliance - Focus In/Focus Out
            Events.On(document.body, 'focusin.' + toolbarPanel.Name + 'QuickLinksAnchor', '#' + toolbarPanel.Name + 'QuickLinksAnchor',
                function (event) {
                    Events.On(document, 'keydown.' + toolbarPanel.Name + 'QuickLinksAnchor',
                        function (keydownEvent) {
                            var pressedKeyCode = (keydownEvent.keyCode ? keydownEvent.keyCode : keydownEvent.which);
                            if (pressedKeyCode == GTC.Keyboard.Enter) {
                                var element = Common.Get(toolbarPanel.Name + 'QuickLinksAnchor');
                                Events.Trigger(element, 'click');
                            }
                        }
                    );
                }
            );
            Events.On(document.body, 'focusout.' + toolbarPanel.Name + 'QuickLinksAnchor', '#' + toolbarPanel.Name + 'QuickLinksAnchor',
                function (event) {
                    Events.Off(document, 'keydown.' + toolbarPanel.Name + 'QuickLinksAnchor');
                }
            );

            // Ul </>
            toolbarPanelMarkup += '</ul>';
        }

        // Nav </>
        toolbarPanelMarkup += '</nav></div>';

        // Search Tool and Links
        if (Common.IsOneDefined([toolbarPanel.SearchTool.Name, toolbarPanel.Links, toolbarPanel.SlidePanel])) {
            toolbarPanelMarkup += '<div class="gtc-toolbarpanel-actions">';

            // Add SlidePanel Link
            if (Common.IsDefined(toolbarPanel.SlidePanel)) {
                var sidePanelLink = {
                    FocusIndex: toolbarPanel.FocusIndex,
                    Tooltip: toolbarPanel.SlidePanel.Tooltip,
                    Icon: {
                        Name: toolbarPanel.SlidePanel.Name + 'MenuLinkIcon',
                        Symbol: 'fa-bars',
                        Type: 'Icon'
                    },
                    Name: toolbarPanel.SlidePanel.Name + 'MenuLink',
                    Title: null,
                    Type: 'Hyperlink'
                };
                if (Common.IsNotDefined(toolbarPanel.Links)) {
                    toolbarPanel.Links = [];
                }
                toolbarPanel.Links.push(sidePanelLink);
            }
            if (Common.IsDefined(toolbarPanel.Links)) {
                // Div<, @Class, Div>
                toolbarPanelMarkup += '<div class="gtc-toolbarpanel-links">';

                // Render Links
                var linkIndex = 0, linkCount = toolbarPanel.Links.length;
                for ( ; linkIndex < linkCount; linkIndex++) {
                    toolbarPanelMarkup += Link.Render(toolbarPanel.Links[linkIndex]);
                }

                // Div</>
                toolbarPanelMarkup += '</div>';
            }
            if (Common.IsDefined(toolbarPanel.SearchTool.Name)) {
                toolbarPanelMarkup += SearchTool.Render(toolbarPanel.SearchTool);
            }
            toolbarPanelMarkup += '</div>';
        }

        // Div</>
        toolbarPanelMarkup += '</div>';

        // Side Panel
        if (Common.IsDefined(toolbarPanel.SlidePanel)) {
            SlidePanel.Render(toolbarPanel.SlidePanel, true);
        }
        return toolbarPanelMarkup;

    };

    ToolbarPanel.UpdateTitle = function (toolbarPanel, updatedTitle, promises, context) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var onParent = context == 'Parent';
        var title = Common.Get(toolbarPanel.id + 'Title', onParent);

        // Animate
        Velocity(title, { 'opacity': 0 }, 'slow',
            function () {
                title.textContent = Common.TranslateKey(updatedTitle);
                Common.SetAttr(title, 'data-translate', updatedTitle);
                Velocity(title, 'reverse',
                    function () {
                        Common.RemoveOpacity(title);
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

} (window.ToolbarPanel = window.ToolbarPanel || {}, window, document, Common, Cache, Events, Velocity));
