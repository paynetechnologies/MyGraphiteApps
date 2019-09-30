// Breadcrumb
// Based On: Breadcrumb -> ViewElement
(function (Breadcrumb, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Breadcrumb.Render = function (breadcrumb) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var breadcrumbMarkup = '<div data-namespace="Breadcrumb" class="gtc-breadcrumb-section gtc-page-theme-border-top gtc-page-theme-background"' + ViewElement.RenderAttributes(breadcrumb) + '>';

        // Ol<>
        breadcrumbMarkup += '<ol class="gtc-breadcrumbs">';

        // Home Breadcrumb
        breadcrumbMarkup += '<li class="gtc-breadcrumb">' + Breadcrumb.RenderLink(breadcrumb.HomeCrumb, 0, true) + '</li>';

        // Handle Past Breadcrumbs
        var breadcrumbData = Common.GetStorage('BreadcrumbData');
        var presentCrumb = null, currentCrumbIndex = 0, title;
        if (Common.IsDefined(breadcrumbData)) {
            var breadcrumbData = JSON.parse(breadcrumbData);
            var pastCrumb, index = 0, crumbLength = breadcrumbData.length;
            for ( ; index < crumbLength; index++) {
                pastCrumb = breadcrumbData[index];

                // Don't reprint Home
                if (Common.IsDefined(breadcrumb.HomeCrumb) && Common.IsDefined(breadcrumb.HomeCrumb.Navigation) && breadcrumb.HomeCrumb.Navigation.View == pastCrumb.Href) {
                    continue;
                }
                currentCrumbIndex++;

                // Save Last crumb for present
                if (crumbLength == index + 1) {
                    presentCrumb = pastCrumb;
                    break;
                }

                // Build Hyperlink Object
                title = pastCrumb.Title;
                if (Common.IsNotDefined(title) || Common.IsEmptyString(title)) {
                    title = pastCrumb.Page;
                }
                var pastCrumbLink = {
                    Name: 'BreadcrumbLink' + pastCrumb.Id,
                    Navigation: {
                        UiParameters: pastCrumb.UiParameters,
                        View: pastCrumb.Href
                    },
                    Title: title,
                    Type: 'Hyperlink'
                };

                // Past Breadcrumb
                breadcrumbMarkup += '<li class="gtc-breadcrumb">' + Breadcrumb.RenderLink(pastCrumbLink, currentCrumbIndex, false) + '</li>';
            }
        }

        // Present Breadcrumb
        if (Common.IsDefined(presentCrumb)) {
            // Figure out best title for page, take what was found before page load if nothing better
            title = '';
            var translateAttr = Common.GetAttr(document.getElementsByTagName('title')[0], 'data-translate');
            if (Common.IsDefined(breadcrumb.Title) && Common.IsNotEmptyString(breadcrumb.Title)) {
                title = breadcrumb.Title;
            }
            else if (Common.IsDefined(translateAttr) && Common.IsNotEmptyString(translateAttr)) {
                title = translateAttr;
            }
            else {
                title = presentCrumb.Title;
            }

            // Update present crumb with best found title
            presentCrumb.Title = title;

            // Remove last crumb, parse cache and push present crumb on
            Breadcrumb.PopBreadcrumbData();
            var breadcrumbUpdateData = JSON.parse(Common.GetStorage('BreadcrumbData'));
            if (Common.IsNotDefined(breadcrumbUpdateData)) {
                breadcrumbUpdateData = [];
            }
            breadcrumbUpdateData.push(presentCrumb);

            // Update cache
            Common.SetStorage('BreadcrumbData', JSON.stringify(breadcrumbUpdateData));

            // Build HtmlText Object
            var presentCrumbText = {
                Name: presentCrumb.Id + 'BreadcrumbPresentText',
                TextString: title,
                Type: 'HtmlText'
            };
            breadcrumbMarkup += '<li data-presentcrumb class="gtc-breadcrumb">' + HtmlText.Render(presentCrumbText) + '</li>';
        }

        // Ol</>
        breadcrumbMarkup += '</ol>';

        // Configure Widget
        Events.One(document.body, 'configurebreadcrumb',
            function () {
                Widgets.breadcrumb(Common.Get(breadcrumb.Name));
                BackButtonDetect.Initialize();
            }
        );

        // Div</>
        breadcrumbMarkup += '</div>';
        return breadcrumbMarkup;

    };

    Breadcrumb.RenderLink = function (link, crumbdex, isHomeView) {

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var hyperlinkMarkup = '<a data-crumbdex="' + crumbdex + '" data-namespace="Hyperlink" class="gtc-link gtc-hyperlink gtc-btn--clear"' + ViewElement.RenderAttributes(link) + Navigation.RenderAttributes(link.Navigation) + '>';

        // Icon
        if (Common.IsDefined(link.Icon)) {
            hyperlinkMarkup += Icon.Render(link.Icon, false);
        }

        // Title
        if (Common.IsDefined(link.Title)) {
            hyperlinkMarkup += '<span data-translate="' + link.Title + '">' + Common.TranslateKey(link.Title) + '</span>';
        }

        // Wire Click!
        if (Common.IsDefined(link.Navigation)) {
            // Save Home View
            if (isHomeView) {
                Common.SetStorage('BreadcrumbHomeView', link.Navigation.View);
            }
            Breadcrumb.WireClick(link);
        }

        // Anchor</>
        hyperlinkMarkup += '</a>';
        return hyperlinkMarkup;

    };

    Breadcrumb.WireClick = function (link) {

        // Wire Click!
        Events.One(document.body, 'click', '#' + link.Name,
            function (event) {
                event.preventDefault();
                var that = this;

                // Clear previous crumbs
                var crumbdex = parseInt(Common.GetAttr(this, 'data-crumbdex'), 10);
                var breadcrumbData = JSON.parse(Common.GetStorage('BreadcrumbData'));
                if (Common.IsNotDefined(breadcrumbData)) {
                    breadcrumbData = [];
                }
                else {
                    breadcrumbData = breadcrumbData.slice(0, crumbdex);
                }
                Common.SetStorage('BreadcrumbData', JSON.stringify(breadcrumbData));

                // Normal link stuff
                Common.SetOnLoadEvent(that, false, true);
                Events.One(document, 'showPinwheelComplete',
                    function () {
                        document.location = Common.GetAttr(that, 'href');
                    }
                );
                Common.ShowPinwheel(null, true);
            }
        );

    };

    Breadcrumb.UpdateBreadcrumbData = function (control, pageHref, pageKey, onLoadEvent) {

        var breadcrumbData = JSON.parse(Common.GetStorage('BreadcrumbData'));
        if (Common.IsNotDefined(breadcrumbData)) {
            breadcrumbData = [];
        }

        // Try to find best translation for present crumb prior to page load
        var title = Common.GetAttr(Common.Query('span[data-translate]', control), 'data-translate');
        if (Common.IsNotDefined(title) || Common.IsEmptyString(title)) {
            title = Common.GetAttr(control, 'data-translate');
        }
        if (Common.IsNotDefined(title) || Common.IsEmptyString(title)) {
            title = pageKey;
        }

        // Build and set crumb
        var currentBreadcrumb = {
            Id: control.id,
            Page: pageKey,
            Title: title,
            Href: pageHref,
            UiParameters: onLoadEvent
        };
        breadcrumbData.push(currentBreadcrumb);

        // Update cache
        Common.SetStorage('BreadcrumbData', JSON.stringify(breadcrumbData));

    };

    Breadcrumb.PopBreadcrumbData = function () {

        var breadcrumbData = JSON.parse(Common.GetStorage('BreadcrumbData'));
        if (Common.IsNotDefined(breadcrumbData)) {
            breadcrumbData = [];
        }
        else if (Common.IsDefined(breadcrumbData) && breadcrumbData.length > 0) {
            breadcrumbData.pop();
        }
        Common.SetStorage('BreadcrumbData', JSON.stringify(breadcrumbData));

    };

    Breadcrumb.ClearBreadcrumbData = function () {

        var breadcrumbData = [];
        Common.SetStorage('BreadcrumbData', JSON.stringify(breadcrumbData));

    };

    Breadcrumb.UpdatePresentCrumb = function (breadcrumb, crumbTitle) {

        // Update Title
        Common.Query('.gtc-breadcrumb:last-child', breadcrumb).textContent = crumbTitle;

    };

} (window.Breadcrumb = window.Breadcrumb || {}, window, document, Common, Cache, Events, Velocity));
