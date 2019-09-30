// Hyperlink
// Based On: Hyperlink -> Link -> ViewElement
(function (Hyperlink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Hyperlink.Render = function (hyperlink) {

        // 508 Compliance
        if (Common.IsNotDefined(hyperlink.Title)) {
            hyperlink.Title = hyperlink.Name;
            hyperlink.ScreenReaderOnly = true;
        }

        // Form to send?
        var formToSend = '';
        if (Common.IsDefined(hyperlink.FormToSerialize)) {
            formToSend = ' data-formtoserialize="' + hyperlink.FormToSerialize + '"';
        }

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var className = Link.RenderClassing(hyperlink, 'link');
        var hyperlinkMarkup = '<a data-namespace="Hyperlink"' + formToSend + ' class="' + className + '"' + ViewElement.RenderAttributes(hyperlink) + Navigation.RenderAttributes(hyperlink.Navigation);

        // Translations, Tooltip, 508 Compliance
        hyperlinkMarkup += Link.RenderAttributes(hyperlink);

        // Target
        if (Common.IsDefined(hyperlink.Target)) {
            hyperlinkMarkup += ' target="' + hyperlink.Target + '"';
        }

        // Anchor>
        hyperlinkMarkup += '>';

        // Icon
        if (Common.IsDefined(hyperlink.Icon)) {
            hyperlinkMarkup += Icon.Render(hyperlink.Icon, false);
        }

        // Link Text
        hyperlinkMarkup += Link.RenderTitle(hyperlink, 'link');

        // Wire Click!
        if (Common.IsDefined(hyperlink.Navigation)) {
            Link.WireClick(hyperlink);
        }

        // Anchor</>
        hyperlinkMarkup += '</a>';

        // Return markup
        return hyperlinkMarkup;

    };

    Hyperlink.UpdateTitle = function (hyperlink, newTitle, promises, context) {

        Link.UpdateTitle(hyperlink, newTitle, promises, context);

    };

} (window.Hyperlink = window.Hyperlink || {}, window, document, Common, Cache, Events, Velocity));
