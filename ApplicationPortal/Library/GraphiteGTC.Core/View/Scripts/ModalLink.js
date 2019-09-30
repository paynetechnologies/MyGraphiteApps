// ModalLink
// Based On: ModalLink -> Hyperlink -> Link -> ViewElement
(function (ModalLink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ModalLink.Render = function (modalLink) {

        // 508 Compliance
        if (Common.IsNotDefined(modalLink.Title)) {
            modalLink.Title = modalLink.Name;
            modalLink.ScreenReaderOnly = true;
        }

        // Form to send?
        var formToSend = '';
        if (Common.IsDefined(modalLink.FormToSerialize)) {
            formToSend = ' data-formtoserialize="' + modalLink.FormToSerialize + '"';
        }

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var className = Link.RenderClassing(modalLink, 'link');

        var modalLinkMarkup = '<a aria-haspopup="true"' + formToSend + ' class="' + className + '" data-namespace="ModalLink"' + ViewElement.RenderAttributes(modalLink) + Navigation.RenderAttributes(modalLink.Navigation);

        // Translations, Tooltip, 508 Compliance
        modalLinkMarkup += Link.RenderAttributes(modalLink);

        // Modal Name Attribute
        if (Common.IsDefined(modalLink.ModalName)) {
            modalLinkMarkup += ' data-modalname="' + modalLink.ModalName + '"';
        }
        modalLinkMarkup += '>';

        // Icon
        if (Common.IsDefined(modalLink.Icon)) {
            modalLinkMarkup += Icon.Render(modalLink.Icon, false);
        }

        // Link Text
        modalLinkMarkup += Link.RenderTitle(modalLink, 'link');

        // Wire OnLoad!
        if (Common.IsNotDefined(modalLink.Name) || modalLink.Name.length <= 0) {
            if (Common.IsDefined(window.console)) {
                console.log('Warning[ModalLink - ' + modalLink.Title + ']: Must provide the Name attribute to wire an default action');
            }
        }
        else {

            // Wire
            Events.On(document.body, 'click.' + modalLink.Name, '#' + modalLink.Name,
                function (event) {
                    event.preventDefault();
                    Common.SetOnLoadEvent(this, true, false);
                    var modalName = Common.GetAttr(this, 'data-modalname');
                    Modals.ShowModalDialog(modalName, Common.GetAttr(this, 'href'), modalLink.Name);
                }
            );
        }

        // Status
        if (modalLink.Status == 'Complete' || modalLink.Status == 'Pending' || modalLink.Status == 'Error') {
            modalLinkMarkup += '<span aria-label="' + modalLink.ModalName + ' status: ' + modalLink.Status + '" class="gtc-modallink-status gtc-status-' + modalLink.Status.toLowerCase() + '"></span>';
        }

        // Anchor</>
        modalLinkMarkup += '</a>';
        return modalLinkMarkup;

    };

    ModalLink.UpdateStatus = function (element, status) {

        var modalLinkStatus = Common.Query('.gtc-modallink-status', element);
        if (Common.IsDefined(modalLinkStatus)) {
            Common.RemoveClasses(modalLinkStatus, 'gtc-status-complete gtc-status-pending gtc-status-error');
            Common.AddClass(modalLinkStatus, 'gtc-status-' + status.toLowerCase());
        }
        else {
            Common.InsertHTMLString(element, Common.InsertType.Append, '<div style="display: none;" class="gtc-modallink-status gtc-status-' + status.toLowerCase() + '"></div>');
            Velocity(element.lastChild, 'fadeIn');
        }

    };

    ModalLink.UpdateTitle = function (modalLink, newTitle, promises, context) {

        Link.UpdateTitle(modalLink, newTitle, promises, context);

    };

} (window.ModalLink = window.ModalLink || {}, window, document, Common, Cache, Events, Velocity));
