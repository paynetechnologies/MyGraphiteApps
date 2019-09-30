// EventButton
// Based On: EventButton -> Button -> Link -> ViewElement
(function (EventButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    EventButton.Render = function (eventButton) {

        // 508 Compliance
        if (Common.IsNotDefined(eventButton.Title)) {
            eventButton.Title = eventButton.Name;
            eventButton.ScreenReaderOnly = true;
        }

        // Button<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var className = Link.RenderClassing(eventButton, 'btn');
        var eventButtonMarkup = '<button class="' + className + '" data-namespace="EventButton"' + ViewElement.RenderAttributes(eventButton) + EventElement.AttachEvent(eventButton.Name, 'click', eventButton.OnClick, EventButton.OnClick);

        // Group Name
        if (Common.IsDefined(eventButton.GroupName)) {
            eventButtonMarkup += ' data-groupname="' + eventButton.GroupName + '"';
        }

        // Translations, Tooltip, 508 Compliance, Confirmation
        eventButtonMarkup += Button.RenderAttributes(eventButton);

        // Button>
        eventButtonMarkup += ' type="button">';

        // Icon
        if (Common.IsDefined(eventButton.Icon)) {
            eventButtonMarkup += Icon.Render(eventButton.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(eventButton.AttachedKey)) {
            GTC.AttachKey(eventButton.Name, eventButton.AttachedKey);
        }

        // Link Text
        eventButtonMarkup += Link.RenderTitle(eventButton, 'button');

        // Button</>
        eventButtonMarkup += '</button>';
        return eventButtonMarkup;

    };

    EventButton.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [
            {
                Name: 'OverriddenValidations',
                Value: null,
                UiParameters: Validation.SerializeArray(false)
            }
        ];

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters);

    };

    EventButton.UpdateTitle = function (eventButton, newTitle, promises, context) {

        Link.UpdateTitle(eventButton, newTitle, promises, context);

    };

    EventButton.ShowPinwheel = function (eventButton) {

        SpinKit.Show(eventButton, 'FadingCircle');

    };

    EventButton.HidePinwheel = function (eventButton) {

        SpinKit.Hide(eventButton);

    };

} (window.EventButton = window.EventButton || {}, window, document, Common, Cache, Events, Velocity));
