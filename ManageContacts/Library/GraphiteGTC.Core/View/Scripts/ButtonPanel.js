// Button Panel
// Based On: ButtonPanel -> ViewElement
(function (ButtonPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
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
