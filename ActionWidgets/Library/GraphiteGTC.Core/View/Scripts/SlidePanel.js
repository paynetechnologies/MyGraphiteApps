// Slide Panel
// Based On: SlidePanel -> ContainerElement -> ViewElement
(function (SlidePanel, window, document, Common, Cache, Events, Velocity, undefined) {

    SlidePanel.Markup = [];

    // Public Methods
    SlidePanel.Render = function (slidePanel, isInToolbarPanel) {

        // Div<, Class@, Id@, Div>, Span<>, Span</>
        var slidePanelMarkup = '<div class="gtc-slidepanel" data-namespace="SlidePanel" data-side="' + slidePanel.Side + '"' + ViewElement.RenderAttributes(slidePanel) + '><span class="gtc-sr-only" data-translate="BeginningOfContent508">' + Common.TranslateKey('BeginningOfContent508') + '</span>';

        // Anchor<, Class@, Id@, Anchor></>
        var menuLinkId = '';
        var menuLinkMarkup = '';
        if (isInToolbarPanel == true) {
            menuLinkId = slidePanel.Name + 'MenuLink';
        }
        else if (Common.IsDefined(slidePanel.MenuLink)) {
            if (Common.IsNotDefined(slidePanel.MenuLink.Name)) {
                slidePanel.MenuLink.Name = slidePanel.Name + 'MenuLink';
            }

            // Tooltip
            if (Common.IsDefined(slidePanel.Tooltip)) {
                slidePanel.MenuLink.Tooltip = slidePanel.Tooltip;
            }
            menuLinkMarkup += '<div>';
            menuLinkMarkup += MenuLink.Render(slidePanel.MenuLink, true);
            menuLinkMarkup += '</div>';
            menuLinkId = slidePanel.MenuLink.Name;
        }
        else {
            menuLinkMarkup += '<div';
            if (slidePanel.HideDefaultButton == 'Yes') {
                menuLinkMarkup += ' style="display:none;"';
            }
            menuLinkMarkup += '>';
            menuLinkMarkup += '<a role="button" aria-haspopup="true" class="gtc-slidepanel-nav-btn';
            var linkMarkup = '';
            var translationAttribute = '';

            // Tooltip
            if (Common.IsDefined(slidePanel.Tooltip)) {
                translationAttribute += '[data-tooltip]' + slidePanel.Tooltip + ';';
                linkMarkup += ' data-tooltip="' + Common.TranslateKey(slidePanel.Tooltip) + '"';
                menuLinkMarkup += ' gtc-tooltip gtc-link-tooltip'
            }

            // Translations
            if (Common.IsNotEmptyString(translationAttribute)) {
                linkMarkup += ' data-translate="' + translationAttribute + '"';
            }
            menuLinkMarkup += '"' + linkMarkup + translationAttribute +  'id="' + slidePanel.Name + 'MenuLink"><i class="gtc-icon-styles fa fa-bars"></i><span class="gtc-sr-only" data-translate="OpensSimulatedDialog508">' + Common.TranslateKey('OpensSimulatedDialog508') + '</span></a>';

            menuLinkMarkup += '</div>';
            menuLinkId = slidePanel.Name + 'MenuLink';
        }

        // Div<, Class@, Id@, Div>
        slidePanelMarkup += '<div aria-expanded="false" data-menulinkid="' + menuLinkId + '" id="' + slidePanel.Name + 'Menu" class="gtc-slidepanel-slide"><div id="' + slidePanel.Name + 'ScrollTarget" class="gtc-scrolltarget gtc-cfscroll-y">';

        // Close Icon
        slidePanelMarkup += '<div class="gtc-slidepanel-close"><a class="gtc-slidepanel-close-btn" id="' + slidePanel.Name + 'ClosePanelLink"><i class="gtc-icon-styles fa fa-times"></i></a></div>';

        // SlidePanel
        slidePanelMarkup += ContainerElement.RenderElements(slidePanel);

        // Attach click event
        var closeOnBodyClick = (slidePanel.CloseOnBodyClick == 'Yes') ? true : false;
        var eventType = 'click';
        if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
            Touch.InitializeTouchEvents();
            eventType = 'tap';
        }
        var scrollTopValue;
        Events.On(document.body, eventType + '.' + menuLinkId, '#' + menuLinkId,
            function () {
                var panelElement = Common.Get(slidePanel.Name);
                if (Common.GetAttr(panelElement, 'data-panelaction') != 'animating') {
                    Common.SetAttr(panelElement, 'data-panelaction', 'animating');
                    var menuElement = Common.Get(slidePanel.Name + 'Menu');
                    var menuLink = this;

                    // If/Hide Else/Show
                    if (Common.HasClass(menuElement, 'gtc-nav-show')) {
                        Events.Trigger(document.body, 'menulinkclose' + menuLinkId);
                        if (closeOnBodyClick) {
                            Events.Off(document.body, eventType + '.closeOnBodyClick.' + slidePanel.Name);
                        }
                        Common.RemoveClass(menuElement, 'gtc-nav-show');
                        Common.RemoveAttr(panelElement, 'data-panelaction');
                        Common.SetAttr(menuElement, 'aria-expanded', 'false');
                        Common.RemoveClass(this, 'gtc-nav-show');

                        // Dont allow page scrolling when over slide panel
                        Events.Off(document.body, 'mouseover.slidepanelscroll');
                        document.body.style.width = '100%';
                        document.body.style.position = '';
                        document.body.style.top = '';
                        window.scrollTo(0, scrollTopValue);
                        Events.Off(window, 'scroll.slidepanelscrollsettop');
                    }
                    else {
                        var scrollTarget = Common.Get(slidePanel.Name + 'ScrollTarget');
                        scrollTarget.style.height = Common.Height(window) + 'px';
                        Events.Trigger(document.body, 'menulinkopen' + menuLinkId);
                        Common.AddClass(menuElement, 'gtc-nav-show');
                        Common.SetAttr(menuElement, 'aria-expanded', 'true');
                        Common.RemoveAttr(panelElement, 'data-panelaction');
                        Common.AddClass(this, 'gtc-nav-show');

                        // Attach body click event
                        if (closeOnBodyClick) {
                            Events.On(document.body, eventType + '.closeOnBodyClick.' + slidePanel.Name,
                                function (event) {
                                    var menuLinkBodyCheck = Common.Get(menuLinkId);
                                    if (Common.IsNotDefined(Common.Closest('#' + slidePanel.Name + 'Menu', event.target)) && (Common.IsNotDefined(menuLinkBodyCheck) || event.target.id != menuLinkBodyCheck.id) && event.target.id != Common.Get(slidePanel.Name + 'Menu').id) {
                                        Events.Off(document.body, eventType + '.closeOnBodyClick.' + slidePanel.Name);
                                        Events.Trigger(menuLink, eventType);
                                    }
                                }
                            );
                        }

                        // Dont allow page scrolling when over slide panel
                        var scrollSet = false;
                        var lastElement = null;
                        Events.On(document.body, 'mouseover.slidepanelscroll.' + slidePanel.Name,
                            function () {
                                lastElement = event.target;
                                Events.On(window, 'scroll.slidepanelscrollsettop.' + slidePanel.Name,
                                    function () {
                                        if (lastElement && Common.IsNotDefined(Common.Closest('.gtc-slidepanel', lastElement)) && !Common.HasClass(lastElement, 'gtc-pinwheel-overlay')) {
                                            // Record last scroll value when scrolling body
                                            scrollTopValue = window.pageYOffset;
                                        }
                                    }
                                );
                                if (Common.IsDefined(Common.Closest('.gtc-slidepanel', event.target)) || Common.HasClass(event.target, 'gtc-pinwheel-overlay')) {
                                    if (!scrollSet) {
                                        scrollTopValue = window.pageYOffset;
                                        scrollSet = true;
                                    }
                                    document.body.style.width = '100%';
                                    document.body.style.position = 'fixed';
                                    document.body.style.top = '-' + scrollTopValue + 'px';
                                }
                                else {
                                    document.body.style.width = '';
                                    document.body.style.position = '';
                                    document.body.style.top = '';
                                    window.scrollTo(0, scrollTopValue);
                                    scrollSet = false;
                                }
                            }
                        );
                    }
                }
            }
        );

        // Attach Close Link Event
        Events.On(document.body, eventType + '.' + slidePanel.Name + 'ClosePanelLink', '#' + slidePanel.Name + 'ClosePanelLink',
            function () {
                if (closeOnBodyClick) {
                    Events.Off(document.body, eventType + '.closeOnBodyClick.' + slidePanel.Name);
                }
                Events.Trigger(Common.Get(menuLinkId), eventType);
            }
        );

        // Div</>, Div</>, Span<>, Span</>, Div</>
        slidePanelMarkup += '</div></div><span class="gtc-sr-only" data-translate="EndOfContent508">' + Common.TranslateKey('EndOfContent508') + '</span></div>';
        SlidePanel.Markup.push(slidePanelMarkup);
        return menuLinkMarkup;

    };

    SlidePanel.ShowHide = function (slidePanel, type) {

        var slidePanelSlide = Common.Query('.gtc-slidepanel-slide', slidePanel);
        var menuLinkId = Common.GetAttr(slidePanelSlide, 'data-menulinkid');
        var menuLink = Common.Get(menuLinkId);
        if (Common.GetAttr(slidePanel, 'data-panelaction') != 'animating') {
            var eventTrigger = 'click';
            if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
                eventTrigger = 'tap';
            }
            var isShowing = Common.HasClass(slidePanelSlide, 'gtc-nav-show');
            if ((isShowing && type == 'Hide') || (!isShowing && type == 'Show')) {
                Events.Trigger(menuLink, eventTrigger);
            }
        }

    };

} (window.SlidePanel = window.SlidePanel || {}, window, document, Common, Cache, Events, Velocity));
