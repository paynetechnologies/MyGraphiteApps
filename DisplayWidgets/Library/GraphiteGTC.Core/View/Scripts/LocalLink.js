// Local Link
// Based On: LocalLink -> Link -> ViewElement
(function (LocalLink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    LocalLink.Render = function (localLink) {

        // 508 Compliance
        if (Common.IsNotDefined(localLink.Title)) {
            localLink.Title = localLink.Name;
            localLink.ScreenReaderOnly = true;
        }

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var className = Link.RenderClassing(localLink, 'link');
        var localLinkMarkup = '<a data-namespace="LocalLink" class="' + className + '"' + ViewElement.RenderAttributes(localLink);

        // Translations, Tooltip, 508 Compliance
        localLinkMarkup += Link.RenderAttributes(localLink);

        // ElementName
        if (Common.IsDefined(localLink.ElementName)) {
            localLinkMarkup += ' data-elementname="' + localLink.ElementName + '"';
        }

        // Add focus?
        localLinkMarkup += ' data-elementfocus="' + localLink.AddElementFocus + '"';

        // Anchor>
        localLinkMarkup += '>';

        // Wire Action!
        Events.On(document.body, 'click' + '.' + localLink.Name, '#' + localLink.Name, LocalLink.OnClick);

        // Icon
        if (Common.IsDefined(localLink.Icon)) {
            localLinkMarkup += Icon.Render(localLink.Icon, false);
        }

        // Link Text
        localLinkMarkup += Link.RenderTitle(localLink, 'link');

        // Anchor</>
        localLinkMarkup += '</a>';

        // Return markup
        return localLinkMarkup;

    };

    LocalLink.OnClick = function (event) {

        event.stopPropagation();
        event.preventDefault();
        var clickedLink = this;
        var elementName = Common.GetAttr(this, 'data-elementname');
        var addFocus = Common.GetAttr(this, 'data-elementfocus') == 'Yes' ? true : false;
        var element = Common.Get(elementName);
        var offsetValue = 0;
        var headerElement = Common.Get('PageHeader');
        if (Common.IsDefined(headerElement) && Common.GetStyle(headerElement, 'position') == 'fixed') {
            // Add an additional 40 just to make sure element is in view
            offsetValue -= Common.Height(headerElement) + 40;
        }

        // Get a promise since scrolling needs to be on html and body, dont want double callbacks
        if (addFocus) {
            var animationDeferred = Common.Promise();
            var animationPromise = animationDeferred.promise;
            animationPromise.then(
                function () {
                    // Additional animation to give user focus on element they jumped to, timeout so transfer from is positioned
                    setTimeout(
                        function () {
                            Common.Transfer(clickedLink, element, 'gtc-modal-border-transfer gtc-page-theme-border', 500);
                            var lastModalBorder = Common.QueryAll('.gtc-modal-border-transfer');
                            lastModalBorder = lastModalBorder[lastModalBorder.length - 1];
                            if (Common.IsDefined(lastModalBorder)) {
                                Common.AddClass(lastModalBorder, 'gtc-modal-border-transfer-background');
                            }
                        }, 300
                    );
                }
            );
            Velocity(element, 'scroll', { duration: 300, offset: offsetValue,
                complete: function () {
                    animationDeferred.resolve();
                }
            });
        }
        else {
            Velocity(element, 'scroll', { duration: 300, offset: offsetValue });
        }

    };

    LocalLink.UpdateTitle = function (localLink, newTitle, promises, context) {

        Link.UpdateTitle(localLink, newTitle, promises, context);

    };

} (window.LocalLink = window.LocalLink || {}, window, document, Common, Cache, Events, Velocity));
