/** 
 * @class ButtonPanel
 * @classdesc Supports the ButtonPanel View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (ButtonPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function ButtonPanel.Render
     * @param {object} buttonPanel - The ButtonPanel View Element in JSON format
     * @description Generates the HTML markup for the ButtonPanel View Element 
     * @returns {string} HTML Markup of the ButtonPanel View Element
     */
    ButtonPanel.Render = function (buttonPanel) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var buttonPanelMarkup = '<div class="gtc-button-panel gtc-button-panel-' + buttonPanel.Side.toLowerCase() + '" data-namespace="ButtonPanel"' + ViewElement.RenderAttributes(buttonPanel) + '>';

        // Buttons
        if (Common.IsDefined(buttonPanel.Buttons)) {
            var button, index = 0, length = buttonPanel.Buttons.length;
            for ( ; index < length; index++) {
                button = buttonPanel.Buttons[index];

                // Render
                buttonPanelMarkup += Link.Render(button);
            }
        }

        // Div</>
        buttonPanelMarkup += '</div>';

        // Return markup
        return buttonPanelMarkup;

    };

} (window.ButtonPanel = window.ButtonPanel || {}, window, document, Common, Cache, Events, Velocity));
