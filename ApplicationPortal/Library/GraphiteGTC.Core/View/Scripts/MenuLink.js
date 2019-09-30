// Menu Link
// Based On: MenuLink -> ViewElement
(function (MenuLink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var menuLinkStyles = {
        barstox: '.gtc-barstox:before {-webkit-transform: translateY(-180%);-moz-transform: translateY(-180%);-ms-transform: translateY(-180%);transform: translateY(-180%);} .gtc-barstox:after {-webkit-transform: translateY(180%);-moz-transform: translateY(180%);-ms-transform: translateY(180%);transform: translateY(180%);} .gtc-barstox,.gtc-barstox:before,.gtc-barstox:after {-webkit-transform-origin: 0;-moz-transform-origin: 0;-ms-transform-origin: 0;transform-origin: 0;} .gtc-barstox:after {-webkit-transform-origin: 0;-moz-transform-origin: 0;-ms-transform-origin: 0;transform-origin: 0;} .gtc-barstox:before,.gtc-barstox:after {position: absolute;content: ""} .gtc-nav-show-bars .gtc-barstox:before {-webkit-transform: translate3d(6px, 5px, 0) rotate(-45deg);-moz-transform: translate3d(6px, 5px, 0) rotate(-45deg);-ms-transform: translate3d(6px, 5px, 0) rotate(-45deg);transform: translate3d(6px, 5px, 0) rotate(-45deg);} .gtc-nav-show-bars .gtc-barstox:after {-webkit-transform: translate3d(6px, -8px, 0) rotate(45deg);-moz-transform: translate3d(6px, -8px, 0) rotate(45deg);-ms-transform: translate3d(6px, -8px, 0) rotate(45deg);transform: translate3d(6px, -8px, 0) rotate(45deg);}',
        barstoleftarrow: '.gtc-barstoleftarrow:after {-webkit-transform: translateY(-180%);-moz-transform: translateY(-180%);-ms-transform: translateY(-180%);transform: translateY(-180%);}.gtc-barstoleftarrow:before {-webkit-transform: translateY(180%);-moz-transform: translateY(180%);-ms-transform: translateY(180%);transform: translateY(180%);}.gtc-barstoleftarrow,.gtc-barstoleftarrow:before,.gtc-barstoleftarrow:after {-webkit-transform-origin: 0 100%;-moz-transform-origin: 0 100%;-ms-transform-origin: 0 100%;transform-origin: 0 100%;}.gtc-barstoleftarrow:after {-webkit-transform-origin: 0 0;-moz-transform-origin: 0 0;-ms-transform-origin: 0 0;transform-origin: 0 0;}.gtc-barstoleftarrow:before,.gtc-barstoleftarrow:after {position: absolute;content: ""} .gtc-nav-show-bars .gtc-barstoleftarrow:before {-webkit-transform: rotate(-50deg) translate3d(-1px, 0px, 0);-moz-transform: rotate(-50deg) translate3d(-1px, 0px, 0);-ms-transform: rotate(-50deg) translate3d(-1px, 0px, 0);transform: rotate(-50deg) translate3d(-1px, 0px, 0);} .gtc-nav-show-bars .gtc-barstoleftarrow:after {-webkit-transform: rotate(50deg) translate3d(-1px, 0px, 0);-moz-transform: rotate(50deg) translate3d(-1px, 0px, 0);-ms-transform: rotate(50deg) translate3d(-1px, 0px, 0);transform: rotate(50deg) translate3d(-1px, 0px, 0);}',
        barstorightarrow: '.gtc-barstorightarrow:before {-webkit-transform: translateY(-180%);-moz-transform: translateY(-180%);-ms-transform: translateY(-180%);transform: translateY(-180%);} .gtc-barstorightarrow:after {-webkit-transform: translateY(180%);-moz-transform: translateY(180%);-ms-transform: translateY(180%);transform: translateY(180%);} .gtc-barstorightarrow,.gtc-barstorightarrow:before,.gtc-barstorightarrow:after {-webkit-transform-origin: 100% 0;-moz-transform-origin: 100% 0;-ms-transform-origin: 100% 0;transform-origin: 100% 0;}.gtc-barstorightarrow:after {-webkit-transform-origin: 100% 100%;-moz-transform-origin: 100% 100%;-ms-transform-origin: 100% 100%;transform-origin: 100% 100%;}.gtc-barstorightarrow:before,.gtc-barstorightarrow:after {position: absolute;content: ""}.gtc-nav-show-bars .gtc-barstorightarrow:before {-webkit-transform: rotate(-50deg) translate3d(8px, 9px, 0);-moz-transform: rotate(-50deg) translate3d(8px, 9px, 0);-ms-transform: rotate(-50deg) translate3d(8px, 9px, 0);transform: rotate(-50deg) translate3d(8px, 9px, 0);} .gtc-nav-show-bars .gtc-barstorightarrow:after {-webkit-transform: rotate(50deg) translate3d(8px, -9px, 0);-moz-transform: rotate(50deg) translate3d(8px, -9px, 0);-ms-transform: rotate(50deg) translate3d(8px, -9px, 0);transform: rotate(50deg) translate3d(8px, -9px, 0);}'
    };

    var menuLinkClasses = {
        barstox: {
            Base: '.gtc-barstox',
            Before: '.gtc-barstox:before',
            After: '.gtc-barstox:after'
        },
        barstoleftarrow: {
            Base: '.gtc-barstoleftarrow',
            Before: '.gtc-barstoleftarrow:before',
            After: '.gtc-barstoleftarrow:after'
        },
        barstorightarrow: {
            Base: '.gtc-barstorightarrow',
            Before: '.gtc-barstorightarrow:before',
            After: '.gtc-barstorightarrow:after'
        }
    };

    // Public Methods
    MenuLink.Render = function (menuLink, fromSlidePanel) {

        // Initialize
        var transitionTime = parseInt(menuLink.TransitionTime, 10) * 1000;
        var type = menuLink.MenuLinkType.toLowerCase();

        // Styling
        var menuLinkMarkup = '<style>';
        menuLinkMarkup += menuLinkClasses[type].Base + ',' + menuLinkClasses[type].Before + ',' + menuLinkClasses[type].After + '{-webkit-transition: ' + transitionTime + 'ms;-moz-transition: ' + transitionTime + 'ms;-ms-transition: ' + transitionTime + 'ms;transition: ' + transitionTime + 'ms;}';
        menuLinkMarkup += menuLinkClasses[type].Base + ',' + menuLinkClasses[type].Before + ',' + menuLinkClasses[type].After + '{width: 28px;display: block;height: 5px;background: ' + Colors.ProcessValue(menuLink.Color, false, null) + ';border-radius: 1px;}';
        menuLinkMarkup += menuLinkClasses[type].Base + '-anchor {cursor: pointer;display: inline-block;padding: 9px 0 9px 0;margin: 5px}';
        menuLinkMarkup += '.gtc-nav-show-bars ' + menuLinkClasses[type].Before + ',.gtc-nav-show-bars ' + menuLinkClasses[type].After + '{width: 18px;}';
        menuLinkMarkup += menuLinkStyles[type];
        if (menuLink.MenuLinkType == 'BarsToX') {
            menuLinkMarkup += '.gtc-nav-show-bars .gtc-barstox { background: transparent; }';
        }
        menuLinkMarkup += '</style>';

        // Markup
        var linkMarkup = '';
        var translationAttribute = '';
        var extraClassing = '';

        // Tooltip
        if (Common.IsDefined(menuLink.Tooltip)) {
            translationAttribute += '[data-tooltip]' + menuLink.Tooltip + ';';
            linkMarkup += ' data-tooltip="' + Common.TranslateKey(menuLink.Tooltip) + '"';
            extraClassing += ' gtc-tooltip gtc-link-tooltip'
        }

        // Translations
        if (Common.IsNotEmptyString(translationAttribute)) {
            linkMarkup += ' data-translate="' + translationAttribute + '"';
        }

        // Anchor<, TabIndex@, Class@, Id@, Anchor>
        menuLinkMarkup += '<a role="button" class="gtc-' + type + '-anchor' + extraClassing + '"' + translationAttribute + linkMarkup + ' data-namespace="MenuLink"' + ViewElement.RenderAttributes(menuLink);

        // Slide Panel?
        if (fromSlidePanel) {
            menuLinkMarkup += ' aria-haspopup="true"';
        }

        // Attach Events
        if (!fromSlidePanel) {
            Events.On(document.body, 'click.' + menuLink.Name, '#' + menuLink.Name,
                function () {
                    Common.ToggleClass(Common.Get(menuLink.Name), 'gtc-nav-show-bars');
                }
            );
        }
        else {
            Events.On(document.body, 'menulinkopen' + menuLink.Name + '.' + menuLink.Name,
                function () {
                    Common.AddClass(Common.Get(menuLink.Name), 'gtc-nav-show-bars');
                }
            );
            Events.On(document.body, 'menulinkclose' + menuLink.Name + '.' + menuLink.Name,
                function () {
                    Common.RemoveClass(Common.Get(menuLink.Name), 'gtc-nav-show-bars');
                }
            );
        }

        // Anchor</>
        menuLinkMarkup += '><div class="gtc-' + type + '" id="' + menuLink.Name + '-Div"></div></a>';
        return menuLinkMarkup;

    };

} (window.MenuLink = window.MenuLink || {}, window, document, Common, Cache, Events, Velocity));
