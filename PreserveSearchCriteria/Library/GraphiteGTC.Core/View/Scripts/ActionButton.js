/** 
 * @class ActionButton
 * @classdesc Supports the ActionButton View Element<br>
 *            Based On: ViewElement > Link
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (ActionButton, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function ActionButton.Render
     * @param {object} actionButton - The ActionButton View Element in JSON format
     * @description Generates the HTML markup for the ActionButton View Element 
     * @returns {string} HTML Markup of the ActionButton View Element
     */
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
