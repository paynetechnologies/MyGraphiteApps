// Url Link
// Based On: UrlLink -> Link -> ViewElement
(function (UrlLink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    UrlLink.Render = function (urlLink) {

        // 508 Compliance
        if (Common.IsNotDefined(urlLink.Title)) {
            urlLink.Title = urlLink.Name;
            urlLink.ScreenReaderOnly = true;
        }

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var className = Link.RenderClassing(urlLink, 'link');

        var urlLinkMarkup = '<a data-namespace="UrlLink" class="' + className + '"' + ViewElement.RenderAttributes(urlLink);

        // Translations, Tooltip, 508 Compliance
        urlLinkMarkup += Link.RenderAttributes(urlLink);

        // Target
        var targetInformation = '';
        if (Common.IsDefined(urlLink.Target)) {
            urlLinkMarkup += ' target="' + urlLink.Target + '"';
            if (urlLink.Target == '_blank') {
                targetInformation = 'NewWindow';
            }
            else if (urlLink.Target == '_self') {
                targetInformation = 'SameWindow';
            }
        }

        // Href
        if (Common.IsDefined(urlLink.Url)) {
            var addPrefix = '';
            if (Common.IsDefined(urlLink.Prefix)) {
                if (urlLink.Url.indexOf(urlLink.Prefix) != 0) {
                    addPrefix = urlLink.Prefix;
                }
            }
            urlLinkMarkup += ' href="' + addPrefix + urlLink.Url + '"';
        }

        // Anchor>
        urlLinkMarkup += '>';

        // Icon
        if (Common.IsDefined(urlLink.Icon)) {
            urlLinkMarkup += Icon.Render(urlLink.Icon, false);
        }

        // Title
        var screenReaderClass = '';
        if (urlLink.ScreenReaderOnly == true) {
            screenReaderClass = ' class="gtc-sr-only"';
        }
        urlLinkMarkup += '<span id="' + urlLink.Name + 'Title"' + screenReaderClass + ' data-translate="' + urlLink.Title + '">' + Common.TranslateKey(urlLink.Title) + '</span>';
        if (urlLink.Disable508Message != 'Yes') {
            urlLinkMarkup += '&nbsp;<span>(<span data-translate="' + targetInformation + '">' + Common.TranslateKey(targetInformation) + '</span>)</span>';
        }

        // Anchor</>
        urlLinkMarkup += '</a>';

        // Return markup
        return urlLinkMarkup;

    };

    UrlLink.UpdateLink = function (element, uiParameters, promises, context) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Update Values (Value: Href, Name: Title)
        if (Common.IsDefined(uiParameters) && uiParameters.length > 0) {
            var uiParameter = uiParameters[0];
            var onParent = context == 'Parent';
            var title = Common.Get(element.id + 'Title', onParent);
            if (Common.IsDefined(uiParameter.Value) && Common.IsNotEmptyString(uiParameter.Value)) {
                Common.SetAttr(element, 'href', uiParameter.Value);
            }
            if (Common.IsDefined(uiParameter.Name) && Common.IsNotEmptyString(uiParameter.Name)) {
                Velocity(title, { 'opacity': 0 }, 'slow',
                    function () {
                        Common.SetAttr(title, 'data-translate', uiParameter.Name);
                        title.textContent = Common.TranslateKey(uiParameter.Name);
                        if (Common.HasClass(title, 'sr-only')) {
                            Common.RemoveClass(title, 'sr-only');
                        }
                        Velocity(title, 'reverse',
                            function () {
                                Common.RemoveOpacity(title);
                                animationHidePromise.resolve();
                            }
                        );
                    }
                );
            }
            else {
                animationHidePromise.resolve();
            }
        }
        else {
            animationHidePromise.resolve();
        }

    };

} (window.UrlLink = window.UrlLink || {}, window, document, Common, Cache, Events, Velocity));
