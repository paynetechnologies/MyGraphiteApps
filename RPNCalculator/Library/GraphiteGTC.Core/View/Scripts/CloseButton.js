/** 
 * @class CloseButton
 * @classdesc Supports the CloseButton View Element<br>
 *            Based On: ViewElement > Link
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (CloseButton, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function CloseButton.Render
     * @param {object} closeButton - The CloseButton View Element in JSON format
     * @description Generates the HTML markup for the CloseButton View Element 
     * @returns {string} HTML Markup of the CloseButton View Element
     */
    CloseButton.Render = function (closeButton) {

        // Anchor<, TabIndex@, Class@, Id@
        var className = Link.RenderClassing(closeButton, 'btn');
        var buttonMarkup = '<button type="button" class="' + className + '" data-namespace="CloseButton" data-configure="Pre"' + ViewElement.RenderAttributes(closeButton) + EventElement.AttachEvent(closeButton.Name, 'close', closeButton.OnClose, CloseButton.OnClose);

        // Tooltip
        if (Common.IsDefined(closeButton.Tooltip)) {
            buttonMarkup += ' data-translate="[data-tooltip]' + closeButton.Tooltip + '"';
            buttonMarkup += ' data-tooltip="' + Common.TranslateKey(closeButton.Tooltip) + '"';
        }

        // Serialize Form
        if (Common.IsDefined(closeButton.FormToCheck)) {
            buttonMarkup += ' data-formtocheck="' + closeButton.FormToCheck + '"';
            buttonMarkup += ' data-confirmation=\'' + JSON.stringify(closeButton.Confirmation) + '\'';
        }

        // Anchor>
        buttonMarkup += '>';

        // Icon
        if (Common.IsDefined(closeButton.Icon)) {
            buttonMarkup += Icon.Render(closeButton.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(closeButton.AttachedKey)) {
            GTC.AttachKey(closeButton.Name, closeButton.AttachedKey);
        }

        // Link Text
        if (Common.IsDefined(closeButton.Title)) {
            buttonMarkup += '<span id="' + closeButton.Name + 'Title" data-translate="' + closeButton.Title + '">' + Common.TranslateKey(closeButton.Title) + '</span>';
        }

        // Anchor</>
        buttonMarkup += '</button>';

        // Return markup
        return buttonMarkup;

    };

    /**
     * @function CloseButton.Configure
     * @param {object} closeButton - The CloseButton DOM element
     * @param {string} configureStage - Pre for Configuration before Translations or Post for Configuration after Translations
     * @description Called by Page.Configure after the dynamic HTML markup is added to the DOM
     * @listens click (id = CloseButton)
     */
    CloseButton.Configure = function (closeButton, configureStage) {

        Events.On(closeButton, 'click',
            function (event) {
                event.preventDefault();
                CloseButton.OnClose(Common.Closest('.gtc-btn-closebutton', event.target));
            }
        );
    };

    /**
     * @function CloseButton.OnClick
     * @param {object} closeButton - The CloseButton DOM element
     * @description This method is called when the CloseButton is clicked and subsequently calls CloseButton.CloseView
     */
    CloseButton.OnClose = function (closeButton) {

        // Form to Check
        var formToCheck = Common.GetAttr(closeButton, 'data-formtocheck');
        if (Common.IsDefined(formToCheck)) {
            // Has Form changed?
            if (Form.HasChanged(Common.Get(formToCheck))) {
                var confirmationMessage = JSON.parse(Common.GetAttr(closeButton, 'data-confirmation'));
                confirmationMessage.Type = parseInt(confirmationMessage.Type, 10);
                window.parent.Modals.ShowMessageDialog(confirmationMessage,
                    function (modalResult) {
                        if (modalResult == Modals.ModalResult.Yes) {
                            CloseButton.CloseView(closeButton);
                        }
                    }
                );
            }
            else {
                CloseButton.CloseView(closeButton);
            }
        }
        else {
            CloseButton.CloseView(closeButton);
        }

    };

    /**
     * @function CloseButton.CloseView
     * @param {object} closeButton - The CloseButton DOM element
     * @description Calls the OnClose<i>Button</i> Behavior of the CloseButton on the View ifit exists otherwise closes the View
     */
    CloseButton.CloseView = function (closeButton) {

        // Get OnCloseEvent object
        var onCloseEvent = JSON.parse(Common.GetAttr(closeButton, 'data-close'));
        if (Common.IsDefined(onCloseEvent)) {
            var onCloseParameters = [];
            if (Common.IsDefined(onCloseEvent.UiParameters)) {
                onCloseParameters = onCloseParameters.concat(onCloseEvent.UiParameters);
            }

            // Serialize Form?
            var formToCheck = Common.GetAttr(closeButton, 'data-formtocheck');
            if (Common.IsDefined(formToCheck)) {
                onCloseParameters = onCloseParameters.concat(Form.SerializeArray(Common.Get(formToCheck)));
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onCloseEvent.ControllerPath + onCloseEvent.ActionName, onCloseParameters, HandleOnClose, closeButton);
        }
        else {
            Common.CloseView();
        }

    };

    /**
     * @function CloseButton.UpdateTitle
     * @param {object} closeButton - The CloseButton DOM element
     * @param {string} newTitle - The new Title of the CloseButton
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Title of the CloseButton
     */
    CloseButton.UpdateTitle = function (closeButton, newTitle, promises, context) {

        Link.UpdateTitle(closeButton, newTitle, promises, context);

    };

    /**
     * @function CloseButton.ShowPinwheel
     * @param {object} closeButton - The CloseButton DOM element
     * @description Shows Pinwheel on the View Element
     */
    CloseButton.ShowPinwheel = function (closeButton) {

        SpinKit.Show(closeButton, 'FadingCircle');

    };

    /**
     * @function CloseButton.HidePinwheel
     * @param {object} closeButton - The CloseButton DOM element
     * @description Hides Pinwheel on the View Element
     */
    CloseButton.HidePinwheel = function (closeButton) {

        SpinKit.Hide(closeButton);

    };

    // Private Methods
    function HandleOnClose (pageInstructionData, requestingElement) {

        var closeViewInstruction = {
            Action: 'CloseView',
            Context: 'Current',
            Instruction: null,
            Language: null,
            PropertyName: null,
            Theme: null,
            Type: 'NavigateInstruction',
            UiParameters: null,
            Version: null
        };
        pageInstructionData.PageInstructions = pageInstructionData.PageInstructions.concat(closeViewInstruction);
        Page.RunInstructions(pageInstructionData, requestingElement);

    };

} (window.CloseButton = window.CloseButton || {}, window, document, Common, Cache, Events, Velocity));
