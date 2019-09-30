// CloseButton
// Based On: CloseButton -> Link -> ViewElement
(function (CloseButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    CloseButton.Render = function (closeButton) {

        // Anchor<, TabIndex@, Class@, Id@
        var className = Link.RenderClassing(closeButton, 'btn');
        var buttonMarkup = '<button type="button" class="' + className + '" data-namespace="CloseButton"' + ViewElement.RenderAttributes(closeButton) + EventElement.AttachEvent(closeButton.Name, 'close', closeButton.OnClose, CloseButton.OnClose);

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

    CloseButton.Configure = function () {

        var closeButtons = Common.QueryAll('.gtc-btn-closebutton');
        Events.On(closeButtons, 'click',
            function (event) {
                event.preventDefault();
                var closeButton = Common.Closest('.gtc-btn-closebutton', event.target);
                CloseButton.OnClose(closeButton);
            }
        );
    };

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

    CloseButton.UpdateTitle = function (closeButton, newTitle, promises, context) {

        Link.UpdateTitle(closeButton, newTitle, promises, context);

    };

    CloseButton.ShowPinwheel = function (button) {

        SpinKit.Show(button, 'FadingCircle');

    };

    CloseButton.HidePinwheel = function (button) {

        SpinKit.Hide(button);

    };

    // Private Methods
    function HandleOnClose(pageInstructionData, requestingElement) {

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
