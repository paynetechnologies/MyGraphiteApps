// Mail To Link
// Based On: MailToLink -> Link -> ViewElement
(function (MailToLink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    MailToLink.Render = function (mailToLink) {

        // 508 Compliance
        if (Common.IsNotDefined(mailToLink.Title)) {
            mailToLink.Title = mailToLink.Name;
            mailToLink.ScreenReaderOnly = true;
        }

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var className = Link.RenderClassing(mailToLink, 'link');

        var mailToLinkMarkup = '<a data-namespace="MailToLink" class="' + className + '"' + ViewElement.RenderAttributes(mailToLink);

        // Translations, Tooltip, 508 Compliance
        mailToLinkMarkup += Link.RenderAttributes(mailToLink);

        // Href
        if (Common.IsDefined(mailToLink.Email)) {
            mailToLinkMarkup += ' href="mailto:' + mailToLink.Email + '"';
        }

        // Anchor>
        mailToLinkMarkup += '>';

        // Icon
        if (Common.IsDefined(mailToLink.Icon)) {
            mailToLinkMarkup += Icon.Render(mailToLink.Icon, false);
        }

        // Title
        mailToLinkMarkup += Link.RenderTitle(mailToLink, 'link');

        // Anchor</>
        mailToLinkMarkup += '</a>';

        // Return markup
        return mailToLinkMarkup;

    };

    MailToLink.UpdateLink = function (element, uiParameters, promises, context) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Update Values (Value: Href, Name: Title)
        if (Common.IsDefined(uiParameters) && uiParameters.length > 0) {
            var uiParameter = uiParameters[0];
            var onParent = context == 'Parent';
            var title = Common.Get(element.id + 'Title', onParent);
            if (Common.IsDefined(uiParameter.Value) && Common.IsNotEmptyString(uiParameter.Value)) {
                Common.SetAttr(element, 'href', 'mailto:' + uiParameter.Value);
            }
            if (Common.IsDefined(uiParameter.Name) && Common.IsNotEmptyString(uiParameter.Name)) {
                Velocity(title, { 'opacity': 0 }, 'slow',
                    function () {
                        Common.SetAttr(title, 'data-translate', uiParameter.Name);
                        title.textContent = Common.TranslateKey(uiParameter.Name);
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

} (window.MailToLink = window.MailToLink || {}, window, document, Common, Cache, Events, Velocity));
