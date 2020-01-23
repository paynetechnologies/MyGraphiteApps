// Footer Slide Panel
// Based On: FooterSlidePanel -> ContainerElement -> ViewElement
(function (FooterSlidePanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    FooterSlidePanel.Render = function (footerSlidePanel) {

        // Focus Index
        var openLinkFocusIndex = 0;
        if (footerSlidePanel.FocusIndex > 0) {
            openLinkFocusIndex = footerSlidePanel.FocusIndex;
            footerSlidePanel.FocusIndex = 0;
        }

        // Div<, Class@, Id@, Div>
        var footerSlidePanelMarkup = '<div class="gtc-footerslidepanel" data-namespace="FooterSlidePanel"' + ViewElement.RenderAttributes(footerSlidePanel);

        // Data-MaxHeight@
        if (Common.IsDefined(footerSlidePanel.MaxHeight) && parseInt(footerSlidePanel.MaxHeight, 10) > 0) {
            footerSlidePanelMarkup += ' data-maxheight="' + footerSlidePanel.MaxHeight + '"';
        }

        // Div>
        footerSlidePanelMarkup += '>';

        // Open Anchor
        footerSlidePanelMarkup += '<a role="button" aria-haspopup="true" class="gtc-footerslidepanel-tab" id="Anchor' + footerSlidePanel.Name + '"';
        if (openLinkFocusIndex > 0) {
            footerSlidePanelMarkup += ' tabindex="' + openLinkFocusIndex + '"';
        }
        footerSlidePanelMarkup += '>Open<span class="gtc-sr-only" data-translate="OpensSimulatedDialog508">' + Common.TranslateKey('OpensSimulatedDialog508') + '</span></a>';

        // Mobile Open Anchor<, Class@, Id@, Anchor>
        footerSlidePanelMarkup += '<a role="button" aria-haspopup="true" class="gtc-mobile-nav-btn gtc-footerslidepanel-nav-btn" id="' + footerSlidePanel.Name + 'MobileMenuLink"><span class="gtc-sr-only" data-translate="OpensSimulatedDialog508">' + Common.TranslateKey('OpensSimulatedDialog508') + '</span></a>';

        // Content Div<>
        footerSlidePanelMarkup += '<div aria-expanded="false" id="' + footerSlidePanel.Name + 'Menu" class="gtc-footerslidepanel-slide gtc-cfscroll-y"><span class="gtc-sr-only" data-translate="BeginningOfContent508">' + Common.TranslateKey('BeginningOfContent508') + '</span>';

        // Anchor<, Class@, Id@, Anchor>
        footerSlidePanelMarkup += '<a role="button" class="gtc-mobile-nav-close-btn gtc-footerslidepanel-nav-close-btn" id="' + footerSlidePanel.Name + 'MobileMenuClose"><i class="gtc-icon-styles fa fa-times"></i></a>';

        // configuremobilemenu event: Setup configuring of mobile display (triggered from Page.Configure)
        Events.On(document.body, 'configuremobilemenu.' + footerSlidePanel.Name + 'MobileMenuLink', '#' + footerSlidePanel.Name + 'MobileMenuLink',
            function (event) {
                Widgets.mobilemenu(this, { MenuType: 'SideBar', TargetName: footerSlidePanel.Name + 'Menu', ParentName: footerSlidePanel.Name, CloseButton: footerSlidePanel.Name + 'MobileMenuClose' });
            }
        );

        // Wire Click!
        Events.On(document.body, 'click.' + 'Anchor' + footerSlidePanel.Name, '#Anchor' + footerSlidePanel.Name,
            function (event) {
                var anchor = this;
                var sliderOpenAnchorHeight = Common.Height(this);
                var divSlide = Common.Query('.gtc-footerslidepanel-slide', Common.Get(footerSlidePanel.Name));
                var divSlideHeight = Common.Height(divSlide);
                var setHeight = Common.GetAttr(Common.Closest('.gtc-footerslidepanel', this), 'data-maxheight');

                // Set height?
                var openHeight = null;
                if (Common.IsDefined(setHeight) && parseInt(setHeight, 10) < divSlideHeight) {
                    openHeight = setHeight;
                }
                else {
                    openHeight = divSlideHeight;
                }

                var startingTopOpenAnchor = Common.GetStyle(this, 'top');
                if (Common.GetAttr(this, 'data-open') == 'true') {
                    // Close
                    anchor.style.display = 'block';
                    Common.SetAttr(anchor, 'data-open', 'false');
                    Events.Off(document.body, 'click.footerSlidePanelCloseOnBodyClick' + footerSlidePanel.Name);
                    var totalHeight = parseInt(startingTopOpenAnchor, 10) + parseInt(openHeight, 10);
                    Common.SetAttr(divSlide, 'aria-expanded', 'false');
                    Velocity(divSlide, { 'top': '0px' }, 600);
                    Velocity(anchor, { 'top': totalHeight + 'px' }, 600,
                        function () {
                            Common.Slide(anchor, 'hide-skipdisplaynone', 'down', 'fast',
                                function () {
                                    divSlide.style.height = '';
                                    Common.RemoveClass(anchor, 'gtc-footerslidepanel-tab-open');
                                    Common.Slide(anchor, 'show', 'down', 'fast',
                                        function () {
                                            anchor.focus();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
                else {
                    // Open Slider
                    anchor.style.display = 'block';
                    Common.SetAttr(divSlide, 'aria-expanded', 'true');
                    Common.SetAttr(anchor, 'data-open', 'true');
                    Common.Slide(anchor, 'hide-skipdisplaynone', 'down', 'fast',
                        function () {
                            Common.AddClass(anchor, 'gtc-footerslidepanel-tab-open');
                            divSlide.style.height = openHeight + 'px';
                            Common.Slide(anchor, 'show', 'down', 'fast',
                                function () {
                                    var anchorSlideHeight = parseInt(openHeight, 10) + parseInt(sliderOpenAnchorHeight, 10);
                                    Velocity(anchor, { 'top': '-' + anchorSlideHeight + 'px' }, 600,
                                        function () {
                                            anchor.focus();
                                        }
                                    );
                                    Velocity(divSlide, { 'top': '-' + openHeight + 'px' }, 600);
                                }
                            );

                            // Close FooterSlidePanel on Body click
                            Events.On(document.body, 'click.footerSlidePanelCloseOnBodyClick' + footerSlidePanel.Name,
                                function (event) {
                                    if (Common.IsNotDefined(Common.Closest('.gtc-footerslidepanel', event.target))) {
                                        Events.Off(document.body, 'click.footerSlidePanelCloseOnBodyClick' + footerSlidePanel.Name);
                                        Events.Trigger(anchor, 'click');
                                    }
                                }
                            );
                        }
                    );
                }

            }
        );

        // 508 Compliance - Focus In/Focus Out
        Events.On(document.body, 'focusin.Anchor' + footerSlidePanel.Name, '#Anchor' + footerSlidePanel.Name,
            function () {
                Events.On(document, 'keyup.' + footerSlidePanel.Name,
                    function (event) {
                        var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                        if (pressedKeyCode == GTC.Keyboard.Enter) {
                            var element = Common.Get('Anchor' + footerSlidePanel.Name);
                            Events.Trigger(element, 'click');
                        }
                    }
                );
            }
        );
        Events.On(document.body, 'focusout.Anchor' + footerSlidePanel.Name, '#Anchor' + footerSlidePanel.Name,
            function (event) {
                Events.Off(document, 'keyup.' + footerSlidePanel.Name);
            }
        );

        // FooterSlidePanel
        footerSlidePanelMarkup += ContainerElement.RenderElements(footerSlidePanel);

        // Div</>, Div</>
        footerSlidePanelMarkup += '<span class="gtc-sr-only" data-translate="EndOfContent508">' + Common.TranslateKey('EndOfContent508') + '</span></div></div>';
        return footerSlidePanelMarkup;

    };

    FooterSlidePanel.PostInstructionConfiguration = function (footerSlidePanel) {

        var sliders = Common.QueryAll('.gtc-slider', footerSlidePanel);
        if (sliders.length > 0) {
            var index = 0, length = sliders.length;
            for ( ; index < length; index++) {
                Widgets.sliderbar(sliders[index], 'Reinitialize');
            }
        }

    };

} (window.FooterSlidePanel = window.FooterSlidePanel || {}, window, document, Common, Cache, Events, Velocity));
