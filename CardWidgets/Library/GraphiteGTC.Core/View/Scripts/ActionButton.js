// ActionButton
// Based On: ActionButton -> Link -> ViewElement
(function (ActionButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ActionButton.Render = function (actionButton) {

        // Icon: Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@, Anchor>
        var className = Link.RenderClassing(actionButton, 'btn');
        var actionButtonMarkup = '<a data-namespace="ActionButton" class="' + className + '"' + ViewElement.RenderAttributes(actionButton) + Navigation.RenderAttributes(actionButton.Navigation);

        // Target@
        if (Common.IsDefined(actionButton.Target)) {
            actionButtonMarkup += ' target="' + actionButton.Target + '"';
        }

        // Anchor>
        actionButtonMarkup += '>';

        // Icon
        if (Common.IsDefined(actionButton.Icon)) {
            actionButtonMarkup += Icon.Render(actionButton.Icon);
        }

        // Translations
        actionButtonMarkup += '<span';
        if (Common.IsDefined(actionButton.Title)) {
            actionButtonMarkup += ' data-translate="' + Common.TranslateKey(actionButton.Title) + '"';
        }
        actionButtonMarkup += '>';

        // Title
        if (Common.IsDefined(actionButton.Title)) {
            actionButtonMarkup += actionButton.Title;
        }
        actionButtonMarkup += '</span>';

        // Wire Click!
        Link.WireClick(actionButton);

        // Anchor</>
        actionButtonMarkup += '</a>';
        return actionButtonMarkup;

    };

} (window.ActionButton = window.ActionButton || {}, window, document, Common, Cache, Events, Velocity));
