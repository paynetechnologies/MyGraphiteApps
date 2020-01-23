/** 
 * @class Button
 * @classdesc Supports the Button View Element<br>
 *            Based On: ViewElement > Link
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (Button, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function Button.Render
     * @param {object} button - The Button View Element in JSON format
     * @description Generates the HTML markup for the Button View Element 
     * @returns {string} HTML Markup of the Button View Element
     */
    Button.Render = function (button) {

        // 508 Compliance
        if (Common.IsNotDefined(button.Title)) {
            button.Title = button.Name;
            button.ScreenReaderOnly = true;
        }

        // Button<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var className = Link.RenderClassing(button, 'btn');
        var buttonMarkup = '<button data-namespace="Button" class="' + className + '"' + ViewElement.RenderAttributes(button) + EventElement.AttachEvent(button.Name, 'click', button.OnClick, Button.OnClick);

        // Translations, Tooltip, 508 Compliance, Confirmation
        buttonMarkup += Button.RenderAttributes(button);

        // Button>
        buttonMarkup += ' type="button">';

        // Icon
        if (Common.IsDefined(button.Icon)) {
            buttonMarkup += Icon.Render(button.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(button.AttachedKey)) {
            GTC.AttachKey(button.Name, button.AttachedKey);
        }

        // Link Text
        buttonMarkup += Link.RenderTitle(button, 'button');

        // Button</>
        buttonMarkup += '</button>';
        return buttonMarkup;

    };

    /**
     * @function Button.RenderAttributes
     * @param {object} button - The Button View Element in JSON format
     * @description Common function used by elements that inherit from button to render common HTML markup
     */
    Button.RenderAttributes = function (button) {

        // Initialize
        var buttonMarkup = '';

        // Translations, Tooltip, 508 Compliance
        buttonMarkup += Link.RenderAttributes(button);

        // Confirmation
        if (Common.IsDefined(button.Confirmation)) {
            buttonMarkup += ' data-confirmation=\'' + JSON.stringify(button.Confirmation) + '\'';
        }
        return buttonMarkup;

    };

    /**
     * @function Button.OnClick
     * @param {event} event - A DOM click Event
     * @description This method is called when the Button is clicked and subsequently calls Button.CompleteConfirmation
     */
    Button.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [];

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters);

    };

    /**
     * @function Button.CompleteConfirmation
     * @param {object} button - The Button DOM element
     * @param {UiParameter[]} onClickParameters - A list of UiParameters which are Inputs to the OnClick<i>Button</i> Behavior
     * @param {callback} [extraLogic] - Callback function to call before calling the OnClick<i>Button</i> Behavior
     * @description Calls Button.CompleteOnClick
     */
    Button.CompleteConfirmation = function (button, onClickParameters, extraLogic) {

        var confirmationMessage = Common.GetAttr(button, 'data-confirmation');

        // Confirmation?
        if (Common.IsDefined(confirmationMessage)) {
            confirmationMessage = JSON.parse(confirmationMessage);
            confirmationMessage.Type = parseInt(confirmationMessage.Type, 10);
            Modals.ShowMessageDialog(confirmationMessage,
                function (modalResult) {
                    if (modalResult == Modals.ModalResult.Yes || modalResult == Modals.ModalResult.Ok) {
                        Button.CompleteOnClick(button, onClickParameters, extraLogic);
                    }
                }
            );
        }
        else {
            Button.CompleteOnClick(button, onClickParameters, extraLogic);
        }

    };

    /**
     * @function Button.CompleteOnClick
     * @param {object} button - The Button DOM element
     * @param {UiParameter[]} onClickParameters - A list of UiParameters which are Inputs to the OnClick<i>Button</i> Behavior
     * @param {callback} [extraLogic] - Callback function to call before calling the OnClick<i>Button</i> Behavior
     * @description Calls the OnClick<i>Button</i> Behavior of the Button on the View
     */
    Button.CompleteOnClick = function (button, onClickParameters, extraLogic) {

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(button, 'data-click'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Extra Logic?
        if (Common.IsDefined(extraLogic) && Common.IsFunction(extraLogic)) {
            extraLogic();
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, button);

    };

    /**
     * @function Button.UpdateTitle
     * @param {object} button - The Button DOM element
     * @param {string} newTitle - The new Title of the Button
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Title of the Button
     */
    Button.UpdateTitle = function (button, newTitle, promises, context) {

        Link.UpdateTitle(button, newTitle, promises, context);

    };

    /**
     * @function Button.ShowPinwheel
     * @param {object} button - The Button DOM element
     * @description Shows Pinwheel on the View Element
     */
    Button.ShowPinwheel = function (button) {

        SpinKit.Show(button, 'FadingCircle');

    };

    /**
     * @function Button.HidePinwheel
     * @param {object} button - The Button DOM element
     * @description Hides Pinwheel on the View Element
     */
    Button.HidePinwheel = function (button) {

        SpinKit.Hide(button);

    };

} (window.Button = window.Button || {}, window, document, Common, Cache, Events, Velocity));
