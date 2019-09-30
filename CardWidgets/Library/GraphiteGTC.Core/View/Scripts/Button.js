// Button
// Based On: Button -> Link -> ViewElement
(function (Button, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
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

    Button.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [];

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters);

    };

    Button.UpdateTitle = function (button, newTitle, promises, context) {

        Link.UpdateTitle(button, newTitle, promises, context);

    };

    Button.ShowPinwheel = function (button) {

        SpinKit.Show(button, 'FadingCircle');

    };

    Button.HidePinwheel = function (button) {

        SpinKit.Hide(button);

    };

    // Common function used by most elements that inherit from button
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

    // Common function used by most elements that inherit from button
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

} (window.Button = window.Button || {}, window, document, Common, Cache, Events, Velocity));
